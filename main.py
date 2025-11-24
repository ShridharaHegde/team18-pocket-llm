import logging
import uuid
import os
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Request, status, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from constants import DEFAULT_MODEL, SYSTEM_PROMPT
from models import (
    init_db, get_db, User, ChatThread, ChatMessage, Model, APIKey, Log
)
from auth import (
    generate_token, verify_token, get_current_user, require_auth, require_admin, require_developer
)
from logger import ActivityLogger
from ollama_client import OllamaClient
from caching import CacheManager
from schemas import (
    RegisterRequest, LoginRequest, LoginResponse,
    ChatRequest, ChatResponse,
    CreateAPIKeyRequest, AddModelRequest, UpdateModelRequest,
    UpdateUserRoleRequest, UpdateUserStatusRequest, DatabaseQueryRequest
)

app = FastAPI(title="AI Chat Application", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

cache_manager = CacheManager()
logging.basicConfig(level=logging.INFO)

# Initialize database
init_db()

# Create default admin user and models
def init_default_data():
    db = next(get_db())
    try:
        # Create default admin user if it doesn't exist
        if not db.query(User).filter(User.username == 'admin').first():
            admin = User(
                username='admin',
                email='admin@example.com',
                role='admin'
            )
            admin.set_password('admin123')  # Change this in production!
            db.add(admin)
            db.commit()
            logging.info("Default admin user created: admin/admin123")
        
        # Add default models if they don't exist
        default_models = ['gemma2:2b', 'llama2', 'mistral']
        for model_name in default_models:
            if not db.query(Model).filter(Model.name == model_name).first():
                model = Model(
                    name=model_name,
                    display_name=model_name.replace(':', ' ').title(),
                    provider='ollama',
                    is_enabled=True
                )
                db.add(model)
        db.commit()
    except Exception as e:
        logging.error(f"Error initializing default data: {e}")
        db.rollback()
    finally:
        db.close()

# Initialize on startup
@app.on_event("startup")
async def startup_event():
    init_default_data()


# ==================== AUTHENTICATION ENDPOINTS ====================

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    try:
        # Only allow admin to create admin/developer accounts
        current_user_obj = None
        try:
            # Try to get current user (optional) for role-based registration
            auth_header = request.headers.get('authorization', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                payload = verify_token(token)
                if payload:
                    current_user_obj = db.query(User).filter(User.id == payload['user_id']).first()
        except:
            pass
       
        if data.role in ['admin', 'developer']:
            if not current_user_obj or current_user_obj.role != 'admin':
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only admins can create admin/developer accounts"
                )
       
        # Check if user already exists
        if db.query(User).filter(User.username == data.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        if db.query(User).filter(User.email == data.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
       
        # Create user
        user = User(username=data.username, email=data.email, role=data.role)
        user.set_password(data.password)
        db.add(user)
        db.commit()
        db.refresh(user)
       
        ActivityLogger.log(db, user.id, 'user_registered', 201, {'username': data.username, 'role': data.role}, request)
       
        return {
            'message': 'User registered successfully',
            'user': user.to_dict()
        }
   
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Registration error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(
    data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Login user and return JWT token"""
    try:
        user = db.query(User).filter(User.username == data.username).first()
       
        if not user or not user.check_password(data.password):
            ActivityLogger.log(db, None, 'login_failed', 401, {'username': data.username}, request)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
       
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )
       
        token = generate_token(user.id, user.role)
        ActivityLogger.log(db, user.id, 'login', 200, {'username': data.username}, request)
       
        return LoginResponse(token=token, user=user.to_dict())
   
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@app.post("/api/auth/logout")
async def logout(
    request: Request,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Logout user"""
    ActivityLogger.log(db, current_user.id, 'logout', 200, None, request)
    return {'message': 'Logged out successfully'}

@app.get("/api/auth/me")
async def get_current_user_info(current_user: User = Depends(require_auth)):
    """Get current user information"""
    return current_user.to_dict()

# ==================== CHAT ENDPOINTS ====================

@app.post("/api/chat", response_model=ChatResponse)
async def get_response_from_llm(
    data: ChatRequest,
    current_user: User = Depends(require_auth),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Get response from LLM"""
    try:
        model_name = data.model or DEFAULT_MODEL
        
        if not data.prompt:
            ActivityLogger.log(db, current_user.id, 'chat_request', 400, {'error': 'No prompt'}, request)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prompt is required"
            )
        
        # Verify model exists and is enabled
        model = db.query(Model).filter(Model.name == model_name, Model.is_enabled == True).first()
        if not model:
            ActivityLogger.log(db, current_user.id, 'chat_request', 400, {'error': 'Invalid model', 'model': model_name}, request)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Model not found or disabled"
            )
        
        ollama_client = OllamaClient(model=model_name)
        
        # Try cache first
        cached_response = cache_manager.get(data.prompt)
        if cached_response is not None:
            logging.info("Cache hit! Returning cached response.")
            
            if not data.thread_id:
                thread = ChatThread(user_id=current_user.id, model_used=model_name, title=data.prompt[:50])
                db.add(thread)
                db.flush()
                data.thread_id = thread.id
                
                # Save system message
                system_msg = ChatMessage(thread_id=thread.id, role='system', content=SYSTEM_PROMPT)
                db.add(system_msg)
            
            thread = db.query(ChatThread).filter(ChatThread.id == data.thread_id).first()
            if not thread or thread.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid thread"
                )
            
            # Save user message
            user_msg = ChatMessage(thread_id=data.thread_id, role='user', content=data.prompt)
            db.add(user_msg)
            
            # Save assistant response
            assistant_msg = ChatMessage(thread_id=data.thread_id, role='assistant', content=cached_response)
            db.add(assistant_msg)
            
            thread.updated_at = datetime.utcnow()
            db.commit()
            
            ActivityLogger.log(db, current_user.id, 'chat_request', 200, {'model': model_name, 'cached': True}, request)
            return ChatResponse(response=cached_response, thread_id=data.thread_id)
        
        # Create new thread if needed
        if not data.thread_id:
            thread = ChatThread(user_id=current_user.id, model_used=model_name, title=data.prompt[:50])
            db.add(thread)
            db.flush()
            data.thread_id = thread.id
            
            # Save system message
            system_msg = ChatMessage(thread_id=thread.id, role='system', content=SYSTEM_PROMPT)
            db.add(system_msg)
        else:
            thread = db.query(ChatThread).filter(ChatThread.id == data.thread_id).first()
            if not thread or thread.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid thread"
                )
        
        # Load previous messages
        previous_messages = []
        messages = db.query(ChatMessage).filter(ChatMessage.thread_id == data.thread_id).order_by(ChatMessage.created_at).all()
        for msg in messages:
            previous_messages.append({"role": msg.role, "content": msg.content})
        
        previous_messages.append({"role": "user", "content": data.prompt})
        
        # Get response from LLM
        try:
            response = ollama_client.get_chat_response(previous_messages)
        except Exception as e:
            logging.error(f"Error getting response from OllamaClient: {e}")
            ActivityLogger.log(db, current_user.id, 'chat_request', 500, {'error': str(e), 'model': model_name}, request)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not get response from LLM"
            )
        
        # Save messages
        user_msg = ChatMessage(thread_id=data.thread_id, role='user', content=data.prompt)
        assistant_msg = ChatMessage(thread_id=data.thread_id, role='assistant', content=response)
        db.add(user_msg)
        db.add(assistant_msg)
        thread.updated_at = datetime.utcnow()
        db.commit()
        
        # Save to cache
        cache_manager.set(data.prompt, response)
        
        ActivityLogger.log(db, current_user.id, 'chat_request', 200, {'model': model_name, 'cached': False}, request)
        return ChatResponse(response=response, thread_id=data.thread_id)
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error processing chat request: {e}")
        db.rollback()
        ActivityLogger.log(db, current_user.id, 'chat_request', 500, {'error': str(e)}, request)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@app.get("/api/chat/threads")
async def get_chat_threads(
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Get all chat threads for current user"""
    try:
        threads = db.query(ChatThread).filter(ChatThread.user_id == current_user.id).order_by(ChatThread.updated_at.desc()).all()
        return [thread.to_dict() for thread in threads]
    except Exception as e:
        logging.error(f"Error getting threads: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve threads"
        )

@app.get("/api/chat/threads/{thread_id}")
async def get_chat_thread(
    thread_id: str,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Get a specific chat thread with messages"""
    try:
        thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
        
        if not thread or thread.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Thread not found"
            )
        
        messages = db.query(ChatMessage).filter(ChatMessage.thread_id == thread_id).order_by(ChatMessage.created_at).all()
        thread_dict = thread.to_dict()
        thread_dict['messages'] = [msg.to_dict() for msg in messages]
        
        return thread_dict
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting thread: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve thread"
        )

@app.get("/api/models")
async def get_models(
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Get all enabled models"""
    try:
        models = db.query(Model).filter(Model.is_enabled == True).all()
        return [model.to_dict() for model in models]
    except Exception as e:
        logging.error(f"Error getting models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve models"
        )
    
# ==================== DEVELOPER ENDPOINTS ====================

@app.get("/api/developer/api-keys")
async def get_api_keys(
    current_user: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """Get API keys for enabled models"""
    try:
        api_keys = db.query(APIKey).filter(APIKey.user_id == current_user.id, APIKey.is_active == True).all()
        return [key.to_dict(include_key=True) for key in api_keys]
    except Exception as e:
        logging.error(f"Error getting API keys: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve API keys"
        )

@app.post("/api/developer/api-keys", status_code=status.HTTP_201_CREATED)
async def create_api_key(
    data: CreateAPIKeyRequest,
    current_user: User = Depends(require_developer),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Create API key for a model"""
    try:
        model = db.query(Model).filter(Model.id == data.model_id).first()
        if not model or not model.is_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Model not found or disabled"
            )
        
        # Generate API key (in production, use secure random generation)
        api_key_value = f"{current_user.id}_{data.model_id}_{uuid.uuid4().hex}"
        
        api_key = APIKey(
            user_id=current_user.id,
            model_id=data.model_id,
            key_value=api_key_value
        )
        db.add(api_key)
        db.commit()
        db.refresh(api_key)
        
        ActivityLogger.log(db, current_user.id, 'api_key_created', 201, {'model_id': data.model_id}, request)
        return api_key.to_dict(include_key=True)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating API key: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create API key"
        )

@app.delete("/api/developer/api-keys/{key_id}")
async def delete_api_key(
    key_id: str,
    current_user: User = Depends(require_developer),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Delete an API key"""
    try:
        api_key = db.query(APIKey).filter(APIKey.id == key_id).first()
        
        if not api_key or api_key.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        api_key.is_active = False
        db.commit()
        
        ActivityLogger.log(db, current_user.id, 'api_key_deleted', 200, {'key_id': key_id}, request)
        return {"message": "API key deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting API key: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete API key"
        )

# ==================== ADMIN ENDPOINTS ====================

@app.get("/api/admin/logs")
async def get_logs(
    user_id: str = Query(None),
    action: str = Query(None),
    limit: int = Query(100),
    offset: int = Query(0),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get logs with optional filters"""
    try:
        result = ActivityLogger.get_logs(db, user_id=user_id, action=action, limit=limit, offset=offset)
        return result
    except Exception as e:
        logging.error(f"Error getting logs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve logs"
        )

@app.get("/api/admin/telemetry")
async def get_telemetry(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get telemetry data for dashboard"""
    try:
        telemetry = ActivityLogger.get_telemetry(db)
        return telemetry
    except Exception as e:
        logging.error(f"Error getting telemetry: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve telemetry"
        )

@app.post("/api/admin/models", status_code=status.HTTP_201_CREATED)
async def add_model(
    data: AddModelRequest,
    current_user: User = Depends(require_admin),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Add a new model"""
    try:
        if db.query(Model).filter(Model.name == data.name).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Model already exists"
            )
        
        display_name = data.display_name or data.name
        model = Model(name=data.name, display_name=display_name, provider=data.provider)
        db.add(model)
        db.commit()
        db.refresh(model)
        
        ActivityLogger.log(db, current_user.id, 'model_added', 201, {'model_name': data.name}, request)
        return model.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error adding model: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add model"
        )

@app.put("/api/admin/models/{model_id}")
async def update_model(
    model_id: str,
    data: UpdateModelRequest,
    current_user: User = Depends(require_admin),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Update model (enable/disable)"""
    try:
        model = db.query(Model).filter(Model.id == model_id).first()
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        if data.is_enabled is not None:
            model.is_enabled = data.is_enabled
        if data.display_name is not None:
            model.display_name = data.display_name
        
        db.commit()
        db.refresh(model)
        
        ActivityLogger.log(db, current_user.id, 'model_updated', 200, {'model_id': model_id}, request)
        return model.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating model: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update model"
        )

@app.get("/api/admin/users")
async def get_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all users"""
    try:
        users = db.query(User).all()
        return [user.to_dict() for user in users]
    except Exception as e:
        logging.error(f"Error getting users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )

@app.put("/api/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    data: UpdateUserRoleRequest,
    current_user: User = Depends(require_admin),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Promote/demote user"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if data.role not in ['admin', 'developer', 'user']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role"
            )
        
        old_role = user.role
        user.role = data.role
        db.commit()
        db.refresh(user)
        
        ActivityLogger.log(db, current_user.id, 'user_role_updated', 200, {
            'target_user_id': user_id,
            'old_role': old_role,
            'new_role': data.role
        }, request)
        return user.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating user role: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user role"
        )

@app.put("/api/admin/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    data: UpdateUserStatusRequest,
    current_user: User = Depends(require_admin),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Activate/deactivate user"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.is_active = data.is_active
        db.commit()
        db.refresh(user)
        
        ActivityLogger.log(db, current_user.id, 'user_status_updated', 200, {
            'target_user_id': user_id,
            'is_active': user.is_active
        }, request)
        return user.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating user status: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user status"
        )
# ==================== UTILITY ENDPOINTS ====================

@app.get("/health")
async def health_check():
    return "OK"

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
