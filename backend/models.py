import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)
    role = Column(String(50), default="GIS_OFFICER")  # ADMIN, GIS_OFFICER, REVIEWER
    designation = Column(String(200), default="Senior Land Records Officer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    data_type = Column(String(100), nullable=False)  # Cadastral, Property Tax, Municipal GIS, Satellite, Drone
    format = Column(String(50), nullable=False)  # GeoJSON, Shapefile, CSV, XLSX, KML, GeoTIFF
    record_count = Column(Integer, default=0)
    original_crs = Column(String(50), default="EPSG:4326")
    target_crs = Column(String(50), default="EPSG:4326")
    geometry_type = Column(String(50), default="Polygon")
    available_attributes = Column(JSON, default=list)
    source_agency = Column(String(255), default="Department of Revenue & Land Records")
    file_size_kb = Column(Float, default=0.0)
    status = Column(String(50), default="VALIDATED")  # UPLOADED, VALIDATED, HARMONIZED, ERROR
    quality_report = Column(JSON, default=dict)
    uploaded_by = Column(String(100), default="Admin Officer")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    sources = relationship("ParcelSource", back_populates="dataset", cascade="all, delete-orphan")

class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(String(100), unique=True, index=True, nullable=False)  # e.g., P-102
    survey_number = Column(String(100), index=True, nullable=False)  # e.g., 104/2
    property_id = Column(String(100), index=True, nullable=True)     # e.g., PROP-WZ-2024-89
    ward = Column(String(100), index=True, default="Ward 12")
    zone = Column(String(100), index=True, default="North Zone")
    owner_reference = Column(String(255), default="Verified Citizen Reference")
    recorded_area = Column(Float, nullable=False)  # in sq. meters (from official ledger)
    gis_area = Column(Float, nullable=False)       # computed from GIS geometry
    area_difference_pct = Column(Float, default=0.0)
    land_use = Column(String(100), default="Residential")
    detected_land_use = Column(String(100), default="Residential")
    geometry = Column(JSON, nullable=False)        # GeoJSON geometry object
    centroid_lat = Column(Float, nullable=False)
    centroid_lon = Column(Float, nullable=False)
    bounding_box = Column(JSON, default=list)      # [minLon, minLat, maxLon, maxLat]
    confidence = Column(Float, default=95.0)       # Data Matching Confidence (%)
    confidence_breakdown = Column(JSON, default=dict)
    verification_status = Column(String(50), index=True, default="PENDING") # PENDING, UNDER_REVIEW, VERIFIED, REJECTED, NEEDS_MORE_DATA
    verified_by = Column(String(100), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    officer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    sources = relationship("ParcelSource", back_populates="parcel", cascade="all, delete-orphan")
    conflicts = relationship("Conflict", back_populates="parcel", cascade="all, delete-orphan")
    buildings = relationship("Building", back_populates="parcel", cascade="all, delete-orphan")
    changes = relationship("LandUseChange", back_populates="parcel", cascade="all, delete-orphan")
    verifications = relationship("VerificationRecord", back_populates="parcel", cascade="all, delete-orphan")

class ParcelSource(Base):
    __tablename__ = "parcel_sources"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id"), nullable=False)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    source_name = Column(String(100), nullable=False)  # Cadastral Map, Property Tax, Municipal GIS, Satellite AI
    source_record_id = Column(String(100), nullable=True)
    source_survey_no = Column(String(100), nullable=True)
    source_area = Column(Float, nullable=True)
    source_geometry = Column(JSON, nullable=True)
    source_attributes = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    parcel = relationship("Parcel", back_populates="sources")
    dataset = relationship("Dataset", back_populates="sources")

class ParcelMatch(Base):
    __tablename__ = "parcel_matches"

    id = Column(Integer, primary_key=True, index=True)
    target_parcel_id = Column(String(100), index=True, nullable=False)
    source_a_name = Column(String(100), nullable=False)
    source_b_name = Column(String(100), nullable=False)
    id_similarity_pct = Column(Float, default=0.0)
    survey_similarity_pct = Column(Float, default=0.0)
    spatial_overlap_pct = Column(Float, default=0.0)
    centroid_distance_m = Column(Float, default=0.0)
    area_similarity_pct = Column(Float, default=0.0)
    shape_similarity_pct = Column(Float, default=0.0)
    overall_confidence = Column(Float, default=0.0)
    match_status = Column(String(50), default="AUTO_MATCHED")  # AUTO_MATCHED, CANDIDATE, AMBIGUOUS
    explanation = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Conflict(Base):
    __tablename__ = "conflicts"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id"), nullable=False)
    conflict_code = Column(String(50), unique=True, index=True, nullable=False)  # e.g., CONF-1042
    conflict_type = Column(String(100), index=True, nullable=False)
    # BOUNDARY_MISMATCH, PARCEL_OVERLAP, AREA_MISMATCH, DUPLICATE_PARCEL,
    # MISSING_PARCEL, ATTRIBUTE_CONFLICT, LAND_USE_INCONSISTENCY, BUILDING_OUTSIDE_PARCEL, GEOMETRY_CORRUPTION
    severity = Column(String(50), index=True, default="REVIEW_REQUIRED")  # CRITICAL, REVIEW_REQUIRED, MINOR
    recorded_value = Column(String(255), nullable=True)
    gis_value = Column(String(255), nullable=True)
    difference_metric = Column(String(100), nullable=True)
    displacement_m = Column(Float, default=0.0)
    explanation = Column(Text, nullable=False)
    status = Column(String(50), index=True, default="OPEN")  # OPEN, UNDER_REVIEW, RESOLVED, DISMISSED
    resolution_strategy = Column(String(100), nullable=True)
    resolved_by = Column(String(100), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    parcel = relationship("Parcel", back_populates="conflicts")

class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id"), nullable=False)
    building_code = Column(String(50), index=True, nullable=False)
    area_sqm = Column(Float, nullable=False)
    height_m = Column(Float, default=6.5)
    floors = Column(Integer, default=2)
    detected_from = Column(String(100), default="High-Res Drone / Satellite AI")
    confidence = Column(Float, default=92.0)
    is_encroaching = Column(Boolean, default=False)
    encroachment_area_sqm = Column(Float, default=0.0)
    geometry = Column(JSON, nullable=False)
    status = Column(String(50), default="DETECTED_PENDING_VERIFICATION")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    parcel = relationship("Parcel", back_populates="buildings")

class LandUseChange(Base):
    __tablename__ = "land_use_changes"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id"), nullable=False)
    previous_epoch_year = Column(Integer, default=2021)
    current_epoch_year = Column(Integer, default=2026)
    previous_land_use = Column(String(100), default="Vacant / Open Plot")
    current_detected_use = Column(String(100), default="Commercial Construction")
    change_type = Column(String(100), default="NEW_CONSTRUCTION") # NEW_CONSTRUCTION, EXTENSION, DEMOLITION, VEGETATION_LOSS
    change_area_sqm = Column(Float, default=0.0)
    confidence = Column(Float, default=89.0)
    status = Column(String(50), default="UNVERIFIED_CHANGE")
    geometry = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    parcel = relationship("Parcel", back_populates="changes")

class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id"), nullable=False)
    conflict_id = Column(Integer, ForeignKey("conflicts.id"), nullable=True)
    officer_name = Column(String(100), nullable=False)
    officer_role = Column(String(50), default="GIS_OFFICER")
    action = Column(String(50), nullable=False) # VERIFY, REJECT, REQUEST_SURVEY, UPDATE_RECORD, MERGE
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    decision_notes = Column(Text, nullable=True)
    resolution_chosen = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    parcel = relationship("Parcel", back_populates="verifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(100), default="System")
    user_role = Column(String(50), default="SYSTEM")
    action = Column(String(100), nullable=False)
    module = Column(String(100), nullable=False)  # INGESTION, CRS_TRANSFORM, HARMONIZATION, MATCHING, CONFLICT, AI_VISION, VERIFICATION
    entity_type = Column(String(100), nullable=False) # DATASET, PARCEL, CONFLICT, BUILDING, REPORT
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(100), primary_key=True, index=True)
    job_type = Column(String(100), nullable=False)
    status = Column(String(50), default="QUEUED")  # QUEUED, RUNNING, COMPLETED, FAILED
    progress_pct = Column(Float, default=0.0)
    message = Column(String(255), default="Job initialized")
    result_summary = Column(JSON, default=dict)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
