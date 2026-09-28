import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from backend.database import get_db
from backend.models import Conflict, Parcel, VerificationRecord, AuditLog
from backend.schemas import ConflictSchema, VerificationRequest, ConflictResolveRequest
from backend.services.audit_service import AuditService

router = APIRouter(prefix="/api/conflicts", tags=["Conflicts"])

@router.get("", response_model=List[ConflictSchema])
def list_conflicts(
    severity: Optional[str] = Query(None),
    conflict_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Conflict)

    if severity and severity != "ALL":
        query = query.filter(Conflict.severity == severity)

    if conflict_type and conflict_type != "ALL":
        query = query.filter(Conflict.conflict_type == conflict_type)

    if status and status != "ALL":
        query = query.filter(Conflict.status == status)

    return query.order_by(Conflict.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{conflict_id}", response_model=ConflictSchema)
def get_conflict(conflict_id: int, db: Session = Depends(get_db)):
    c = db.query(Conflict).filter(Conflict.id == conflict_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conflict not found")
    return c

@router.post("/{conflict_id}/resolve")
def resolve_conflict(
    conflict_id: int,
    req: ConflictResolveRequest,
    db: Session = Depends(get_db)
):
    """
    Officer resolves or dismisses a conflict flag with decision rationale.
    """
    c = db.query(Conflict).filter(Conflict.id == conflict_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conflict not found")

    parcel = db.query(Parcel).filter(Parcel.id == c.parcel_id).first()
    prev_status = c.status

    c.status = req.status
    c.resolution_strategy = req.resolution_strategy
    c.resolved_by = req.resolved_by
    c.resolved_at = datetime.datetime.utcnow()

    # If all conflicts resolved for this parcel, update parcel verification status
    open_conflicts = db.query(Conflict).filter(Conflict.parcel_id == c.parcel_id, Conflict.status == "OPEN").count()
    if open_conflicts == 0 and parcel:
        parcel.verification_status = "VERIFIED"
        parcel.verified_by = req.resolved_by
        parcel.verified_at = datetime.datetime.utcnow()

    db.commit()

    AuditService.log_action(
        db=db,
        action="RESOLVE_CONFLICT",
        module="VERIFICATION",
        entity_type="CONFLICT",
        entity_id=c.conflict_code,
        details=f"Conflict {c.conflict_code} resolved by {req.resolved_by} using strategy {req.resolution_strategy}.",
        previous_state={"status": prev_status},
        new_state={"status": req.status, "resolution": req.resolution_strategy}
    )

    return {"message": "Conflict resolved successfully", "conflict": c.conflict_code, "status": c.status}

@router.post("/parcel/{parcel_id}/verify")
def verify_parcel_workflow(
    parcel_id: int,
    req: VerificationRequest,
    db: Session = Depends(get_db)
):
    """
    Human-in-the-Loop Officer Verification workflow for a land parcel.
    """
    parcel = db.query(Parcel).filter(Parcel.id == parcel_id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    prev_status = parcel.verification_status
    parcel.verification_status = req.action  # VERIFIED, REJECTED, UNDER_REVIEW, NEEDS_MORE_DATA
    parcel.verified_by = req.officer_name
    parcel.verified_at = datetime.datetime.utcnow()
    parcel.officer_notes = req.decision_notes

    # Add verification record
    v_rec = VerificationRecord(
        parcel_id=parcel.id,
        officer_name=req.officer_name,
        officer_role=req.officer_role,
        action=req.action,
        previous_status=prev_status,
        new_status=req.action,
        decision_notes=req.decision_notes,
        resolution_chosen=req.resolution_strategy,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(v_rec)

    # If verified, mark open conflicts as RESOLVED
    if req.action == "VERIFIED":
        for conf in parcel.conflicts:
            conf.status = "RESOLVED"
            conf.resolved_by = req.officer_name
            conf.resolved_at = datetime.datetime.utcnow()
            conf.resolution_strategy = req.resolution_strategy

    db.commit()

    AuditService.log_action(
        db=db,
        action=f"PARCEL_{req.action}",
        module="VERIFICATION",
        entity_type="PARCEL",
        entity_id=parcel.parcel_id,
        details=f"Officer {req.officer_name} transitioned parcel from {prev_status} to {req.action}. Notes: {req.decision_notes}",
        previous_state={"status": prev_status},
        new_state={"status": req.action, "strategy": req.resolution_strategy}
    )

    return {
        "message": f"Parcel {parcel.parcel_id} successfully marked as {req.action}",
        "parcel_id": parcel.parcel_id,
        "verification_status": parcel.verification_status,
        "verified_by": parcel.verified_by,
        "verified_at": parcel.verified_at
    }
