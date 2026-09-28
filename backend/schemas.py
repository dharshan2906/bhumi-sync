from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    username: str
    full_name: str
    email: str
    role: str = "GIS_OFFICER"
    designation: str = "Senior Land Records Officer"

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class QualityReport(BaseModel):
    crs_detected: str
    total_geometries: int
    valid_geometries: int
    invalid_geometries: int
    duplicate_ids: int
    null_attributes_count: int
    geometry_type: str
    area_coverage_sqm: float
    issues_detected: List[str] = []
    recommended_fixes: List[str] = []

class DatasetResponse(BaseModel):
    id: int
    name: str
    filename: str
    data_type: str
    format: str
    record_count: int
    original_crs: str
    target_crs: str
    geometry_type: str
    available_attributes: List[str]
    source_agency: str
    file_size_kb: float
    status: str
    quality_report: Dict[str, Any]
    uploaded_by: str
    created_at: datetime
    class Config:
        from_attributes = True

class BuildingSchema(BaseModel):
    id: int
    building_code: str
    area_sqm: float
    height_m: float
    floors: int
    detected_from: str
    confidence: float
    is_encroaching: bool
    encroachment_area_sqm: float
    geometry: Dict[str, Any]
    status: str
    class Config:
        from_attributes = True

class LandUseChangeSchema(BaseModel):
    id: int
    previous_epoch_year: int
    current_epoch_year: int
    previous_land_use: str
    current_detected_use: str
    change_type: str
    change_area_sqm: float
    confidence: float
    status: str
    geometry: Optional[Dict[str, Any]] = None
    class Config:
        from_attributes = True

class ConflictSchema(BaseModel):
    id: int
    parcel_id: int
    conflict_code: str
    conflict_type: str
    severity: str
    recorded_value: Optional[str] = None
    gis_value: Optional[str] = None
    difference_metric: Optional[str] = None
    displacement_m: float = 0.0
    explanation: str
    status: str
    resolution_strategy: Optional[str] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ParcelSourceSchema(BaseModel):
    id: int
    source_name: str
    source_record_id: Optional[str] = None
    source_survey_no: Optional[str] = None
    source_area: Optional[float] = None
    source_geometry: Optional[Dict[str, Any]] = None
    source_attributes: Dict[str, Any] = {}
    class Config:
        from_attributes = True

class ParcelDigitalTwin(BaseModel):
    id: int
    parcel_id: str
    survey_number: str
    property_id: Optional[str] = None
    ward: str
    zone: str
    owner_reference: str
    recorded_area: float
    gis_area: float
    area_difference_pct: float
    land_use: str
    detected_land_use: str
    geometry: Dict[str, Any]
    centroid_lat: float
    centroid_lon: float
    bounding_box: List[float]
    confidence: float
    confidence_breakdown: Dict[str, Any]
    verification_status: str
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    officer_notes: Optional[str] = None
    sources: List[ParcelSourceSchema] = []
    conflicts: List[ConflictSchema] = []
    buildings: List[BuildingSchema] = []
    changes: List[LandUseChangeSchema] = []
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class ParcelListItem(BaseModel):
    id: int
    parcel_id: str
    survey_number: str
    property_id: Optional[str] = None
    ward: str
    zone: str
    recorded_area: float
    gis_area: float
    area_difference_pct: float
    land_use: str
    detected_land_use: str
    confidence: float
    verification_status: str
    conflict_count: int = 0
    building_count: int = 0
    centroid_lat: float
    centroid_lon: float
    class Config:
        from_attributes = True

class VerificationRequest(BaseModel):
    action: str = Field(..., description="VERIFIED, REJECTED, UNDER_REVIEW, NEEDS_MORE_DATA, REQUEST_SURVEY")
    officer_name: str = "Shri A. K. Sharma (Chief Land Registrar)"
    officer_role: str = "GIS_OFFICER"
    decision_notes: Optional[str] = "Inspected satellite overlay and field ledger; boundaries reconciled."
    resolution_strategy: Optional[str] = "ADOPT_HARMONIZED_BOUNDARY"

class ConflictResolveRequest(BaseModel):
    status: str = "RESOLVED"  # RESOLVED, DISMISSED, UNDER_REVIEW
    resolution_strategy: str = "OFFICIAL_SURVEY_AFFIRMED"
    resolved_by: str = "Shri A. K. Sharma"
    notes: Optional[str] = "Verified against physical cadastral survey record."

class DashboardStats(BaseModel):
    total_parcels: int
    verified_parcels: int
    pending_verification: int
    under_review_parcels: int
    rejected_parcels: int
    boundary_conflicts: int
    area_mismatches: int
    duplicate_records: int
    land_use_changes: int
    buildings_detected: int
    encroachments_detected: int
    data_sources_integrated: int
    average_confidence_pct: float
    ward_breakdown: List[Dict[str, Any]]
    conflict_distribution: List[Dict[str, Any]]
    source_contributions: List[Dict[str, Any]]
    confidence_tiers: Dict[str, int]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[Dict[str, Any]]
