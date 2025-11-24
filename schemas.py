from pydantic import BaseModel, EmailStr
from typing import Optional

# Auth schemas
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = 'user'

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict

# Chat schemas
class ChatRequest(BaseModel):
    prompt: str
    thread_id: Optional[str] = None
    model: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    thread_id: str

# API Key schemas
class CreateAPIKeyRequest(BaseModel):
    model_id: str

# Model schemas
class AddModelRequest(BaseModel):
    name: str
    display_name: Optional[str] = None
    provider: Optional[str] = 'ollama'

class UpdateModelRequest(BaseModel):
    is_enabled: Optional[bool] = None
    display_name: Optional[str] = None

# User management schemas
class UpdateUserRoleRequest(BaseModel):
    role: str

class UpdateUserStatusRequest(BaseModel):
    is_active: bool

# Database query schemas
class DatabaseQueryRequest(BaseModel):
    type: str
    table: str
    limit: Optional[int] = 100
    offset: Optional[int] = 0

