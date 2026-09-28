from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from backend.database import get_db
from backend.models import AuditLog

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Trail"])

@router.get("")
def list_audit_logs(
    module: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if module and module != "ALL":
        query = query.filter(AuditLog.module == module)
    if entity_type and entity_type != "ALL":
        query = query.filter(AuditLog.entity_type == entity_type)

    logs = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

    return [
        {
            "id": l.id,
            "user_name": l.user_name,
            "user_role": l.user_role,
            "action": l.action,
            "module": l.module,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "details": l.details,
            "previous_state": l.previous_state,
            "new_state": l.new_state,
            "ip_address": l.ip_address,
            "timestamp": l.timestamp.isoformat()
        }
        for l in logs
    ]
