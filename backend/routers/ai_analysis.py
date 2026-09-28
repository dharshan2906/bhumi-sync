from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from backend.database import get_db
from backend.models import Building, LandUseChange, Parcel
from backend.schemas import BuildingSchema, LandUseChangeSchema
from backend.services.ai_vision_service import AIVisionService
from backend.services.audit_service import AuditService

router = APIRouter(prefix="/api/ai", tags=["AI Vision & Change Detection"])

@router.get("/buildings", response_model=List[BuildingSchema])
def list_detected_buildings(
    encroaching_only: Optional[bool] = Query(None),
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Building)
    if encroaching_only is True:
        query = query.filter(Building.is_encroaching == True)
    return query.limit(limit).all()

@router.get("/changes", response_model=List[LandUseChangeSchema])
def list_temporal_changes(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return db.query(LandUseChange).limit(limit).all()

@router.post("/run-vision-pipeline")
def run_vision_pipeline_endpoint(
    ward: Optional[str] = Body("Ward 12 - Indira Nagar", embed=True),
    db: Session = Depends(get_db)
):
    """
    Executes AI computer vision building footprint segmentation and change detection.
    """
    parcels = db.query(Parcel).filter(Parcel.ward == ward).all() if ward else db.query(Parcel).limit(50).all()

    new_bldgs = 0
    new_changes = 0

    for p in parcels:
        bldgs = AIVisionService.extract_building_footprints_for_parcel(p.geometry, p.parcel_id, p.land_use)
        for b in bldgs:
            existing = db.query(Building).filter(Building.building_code == b["building_code"]).first()
            if not existing:
                b_obj = Building(
                    parcel_id=p.id,
                    building_code=b["building_code"],
                    area_sqm=b["area_sqm"],
                    height_m=b["height_m"],
                    floors=b["floors"],
                    detected_from=b["detected_from"],
                    confidence=b["confidence"],
                    is_encroaching=b["is_encroaching"],
                    encroachment_area_sqm=b["encroachment_area_sqm"],
                    geometry=b["geometry"],
                    status="DETECTED_PENDING_VERIFICATION"
                )
                db.add(b_obj)
                new_bldgs += 1

    db.commit()

    AuditService.log_action(
        db=db,
        action="RUN_AI_VISION",
        module="AI_VISION",
        entity_type="BUILDING",
        entity_id=ward or "ALL",
        details=f"Processed AI imagery analysis for {len(parcels)} parcels in {ward}."
    )

    return {
        "status": "SUCCESS",
        "ward_processed": ward,
        "parcels_scanned": len(parcels),
        "buildings_detected": new_bldgs,
        "message": "AI Computer Vision & Ortho-Segmentation completed."
    }
