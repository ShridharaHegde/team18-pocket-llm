import json
from datetime import datetime, timedelta
from fastapi import Request
from sqlalchemy.orm import Session
from models import Log, get_db

class ActivityLogger:
    """Log user activities with metadata"""
    
    @staticmethod
    def log(db: Session, user_id: str, action: str, status_code: int = None, metadata: dict = None, request: Request = None):
        """Log an activity"""
        try:
            log_entry = Log(
                user_id=user_id,
                action=action,
                endpoint=request.url.path if request else None,
                method=request.method if request else None,
                status_code=status_code,
                log_metadata=json.dumps(metadata) if metadata else None,
                ip_address=request.client.host if request else None,
                user_agent=request.headers.get('user-agent') if request else None
            )
            db.add(log_entry)
            db.commit()
        except Exception as e:
            # Don't fail the request if logging fails
            print(f"Error logging activity: {e}")
            db.rollback()
    
    @staticmethod
    def get_logs(db: Session, user_id: str = None, action: str = None, limit: int = 100, offset: int = 0):
        """Retrieve logs with optional filters"""
        query = db.query(Log)
        
        if user_id:
            query = query.filter(Log.user_id == user_id)
        if action:
            query = query.filter(Log.action == action)
        
        query = query.order_by(Log.created_at.desc())
        total = query.count()
        logs = query.limit(limit).offset(offset).all()
        
        return {
            'logs': [log.to_dict() for log in logs],
            'total': total,
            'limit': limit,
            'offset': offset
        }
    
    @staticmethod
    def get_telemetry(db: Session):
        """Get telemetry data for dashboard"""
        from models import User, ChatThread, ChatMessage
        
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        total_chats = db.query(ChatThread).count()
        total_messages = db.query(ChatMessage).count()
        
        # Get logs by action
        action_counts = {}
        logs = db.query(Log).all()
        for log in logs:
            action_counts[log.action] = action_counts.get(log.action, 0) + 1
        
        # Get recent activity (last 24 hours)
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_logs = db.query(Log).filter(Log.created_at >= yesterday).count()
        
        return {
            'total_users': total_users,
            'active_users': active_users,
            'total_chats': total_chats,
            'total_messages': total_messages,
            'action_counts': action_counts,
            'recent_activity_24h': recent_logs
        }
