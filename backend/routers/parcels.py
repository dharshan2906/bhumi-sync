from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional, Dict, Any
from backend.database import get_db
from backend.models import Parcel, Conflict, ParcelSource, Building, LandUseChange, VerificationRecord
from backend.schemas import ParcelListItem, ParcelDigitalTwin, GeoJSONFeatureCollection
from backend.services.matching_engine import MatchingEngine

router = APIRouter(prefix="/api/parcels", tags=["Parcels"])

@router.get("", response_model=List[ParcelListItem])
def list_parcels(
    q: Optional[str] = Query(None, description="Search by parcel_id, survey_no, property_id"),
    ward: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    has_conflict: Optional[bool] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Parcel)

    if q:
        search_fmt = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Parcel.parcel_id.ilike(search_fmt),
                Parcel.survey_number.ilike(search_fmt),
                Parcel.property_id.ilike(search_fmt),
                Parcel.owner_reference.ilike(search_fmt)
            )
        )

    if ward and ward != "ALL":
        query = query.filter(Parcel.ward == ward)

    if status and status != "ALL":
        query = query.filter(Parcel.verification_status == status)

    if has_conflict is True:
        query = query.join(Parcel.conflicts).distinct()

    parcels = query.offset(skip).limit(limit).all()

    result = []
    for p in parcels:
        result.append(ParcelListItem(
            id=p.id,
            parcel_id=p.parcel_id,
            survey_number=p.survey_number,
            property_id=p.property_id,
            ward=p.ward,
            zone=p.zone,
            recorded_area=p.recorded_area,
            gis_area=p.gis_area,
            area_difference_pct=p.area_difference_pct,
            land_use=p.land_use,
            detected_land_use=p.detected_land_use,
            confidence=p.confidence,
            verification_status=p.verification_status,
            conflict_count=len(p.conflicts),
            building_count=len(p.buildings),
            centroid_lat=p.centroid_lat,
            centroid_lon=p.centroid_lon
        ))

    return result

@router.get("/geojson/layer")
def get_parcels_geojson(
    ward: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    conflict_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns GeoJSON FeatureCollection with rich styling properties for map rendering.
    """
    query = db.query(Parcel)

    if ward and ward != "ALL":
        query = query.filter(Parcel.ward == ward)

    if status and status != "ALL":
        query = query.filter(Parcel.verification_status == status)

    parcels = query.all()
    features = []

    for p in parcels:
        conflicts = p.conflicts
        if conflict_type and conflict_type != "ALL":
            if not any(c.conflict_type == conflict_type for c in conflicts):
                continue

        primary_conflict = conflicts[0].conflict_type if conflicts else None
        severity = conflicts[0].severity if conflicts else "NORMAL"

        features.append({
            "type": "Feature",
            "id": p.id,
            "geometry": p.geometry,
            "properties": {
                "id": p.id,
                "parcel_id": p.parcel_id,
                "survey_number": p.survey_number,
                "property_id": p.property_id,
                "ward": p.ward,
                "zone": p.zone,
                "owner": p.owner_reference,
                "recorded_area": p.recorded_area,
                "gis_area": p.gis_area,
                "area_diff_pct": p.area_difference_pct,
                "land_use": p.land_use,
                "detected_land_use": p.detected_land_use,
                "confidence": p.confidence,
                "verification_status": p.verification_status,
                "has_conflict": len(conflicts) > 0,
                "conflict_count": len(conflicts),
                "primary_conflict": primary_conflict,
                "severity": severity,
                "building_count": len(p.buildings),
                "centroid": [p.centroid_lat, p.centroid_lon]
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/by-code/{parcel_id}", response_model=ParcelDigitalTwin)
def get_parcel_by_code(parcel_id: str, db: Session = Depends(get_db)):
    p = db.query(Parcel).filter(Parcel.parcel_id == parcel_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return p

@router.get("/{parcel_id_num}", response_model=ParcelDigitalTwin)
def get_parcel_digital_twin(parcel_id_num: int, db: Session = Depends(get_db)):
    """
    Returns the complete Land Record Digital Twin for a given parcel.
    """
    p = db.query(Parcel).filter(Parcel.id == parcel_id_num).first()
    if not p:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return p

@router.post("/match")
def match_parcels_endpoint(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Computes transparent multi-signal Data Matching Confidence between two parcel records.
    """
    source_a = payload.get("source_a", {})
    source_b = payload.get("source_b", {})

    match_result = MatchingEngine.match_parcel_records(source_a, source_b)
    return match_result
