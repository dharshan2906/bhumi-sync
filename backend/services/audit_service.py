import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.models import AuditLog

class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        action: str,
        module: str,
        entity_type: str,
        entity_id: Optional[str] = None,
        details: Optional[str] = None,
        previous_state: Optional[Dict[str, Any]] = None,
        new_state: Optional[Dict[str, Any]] = None,
        user_name: str = "Shri A. K. Sharma (GIS Officer)",
        user_role: str = "GIS_OFFICER",
        ip_address: str = "127.0.0.1"
    ) -> AuditLog:
        """
        Creates an immutable audit log entry.
        """
        log_entry = AuditLog(
            user_name=user_name,
            user_role=user_role,
            action=action,
            module=module,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else None,
            details=details,
            previous_state=previous_state,
            new_state=new_state,
            ip_address=ip_address,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
