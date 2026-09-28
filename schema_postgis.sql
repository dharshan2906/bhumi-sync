-- ==============================================================================
-- BHUMI-SYNC PostGIS Enterprise Database Schema
-- Ministry of Rural Development • Problem Statement #SIH26013
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & Roles
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    role VARCHAR(50) DEFAULT 'GIS_OFFICER', -- ADMIN, GIS_OFFICER, REVIEWER
    designation VARCHAR(200) DEFAULT 'Senior Land Records Officer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Heterogeneous Source Datasets
CREATE TABLE IF NOT EXISTS datasets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    data_type VARCHAR(100) NOT NULL,
    format VARCHAR(50) NOT NULL,
    record_count INTEGER DEFAULT 0,
    original_crs VARCHAR(50) DEFAULT 'EPSG:4326',
    target_crs VARCHAR(50) DEFAULT 'EPSG:4326',
    geometry_type VARCHAR(50) DEFAULT 'Polygon',
    available_attributes JSONB DEFAULT '[]'::jsonb,
    source_agency VARCHAR(255) DEFAULT 'Department of Revenue & Land Records',
    file_size_kb FLOAT DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'VALIDATED',
    quality_report JSONB DEFAULT '{}'::jsonb,
    uploaded_by VARCHAR(100) DEFAULT 'Admin Officer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Harmonized Land Record Digital Twins (Parcels)
CREATE TABLE IF NOT EXISTS parcels (
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR(100) UNIQUE NOT NULL,
    survey_number VARCHAR(100) NOT NULL,
    property_id VARCHAR(100),
    ward VARCHAR(100) DEFAULT 'Ward 12',
    zone VARCHAR(100) DEFAULT 'North Zone',
    owner_reference VARCHAR(255) DEFAULT 'Citizen Reference',
    recorded_area FLOAT NOT NULL,
    gis_area FLOAT NOT NULL,
    area_difference_pct FLOAT DEFAULT 0.0,
    land_use VARCHAR(100) DEFAULT 'Residential',
    detected_land_use VARCHAR(100) DEFAULT 'Residential',
    geometry JSONB NOT NULL,
    geom GEOMETRY(Geometry, 4326),
    centroid_lat FLOAT NOT NULL,
    centroid_lon FLOAT NOT NULL,
    bounding_box JSONB DEFAULT '[]'::jsonb,
    confidence FLOAT DEFAULT 95.0,
    confidence_breakdown JSONB DEFAULT '{}'::jsonb,
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    verified_by VARCHAR(100),
    verified_at TIMESTAMP WITH TIME ZONE,
    officer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial and Attribute Indexes
CREATE INDEX IF NOT EXISTS idx_parcels_geom ON parcels USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_parcels_parcel_id ON parcels(parcel_id);
CREATE INDEX IF NOT EXISTS idx_parcels_survey ON parcels(survey_number);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON parcels(verification_status);
CREATE INDEX IF NOT EXISTS idx_parcels_ward ON parcels(ward);

-- 4. Multi-Source Lineage
CREATE TABLE IF NOT EXISTS parcel_sources (
    id SERIAL PRIMARY KEY,
    parcel_id INTEGER REFERENCES parcels(id) ON DELETE CASCADE,
    dataset_id INTEGER REFERENCES datasets(id) ON DELETE SET NULL,
    source_name VARCHAR(100) NOT NULL,
    source_record_id VARCHAR(100),
    source_survey_no VARCHAR(100),
    source_area FLOAT,
    source_geometry JSONB,
    geom GEOMETRY(Geometry, 4326),
    source_attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Intelligent Conflicts Register
CREATE TABLE IF NOT EXISTS conflicts (
    id SERIAL PRIMARY KEY,
    parcel_id INTEGER REFERENCES parcels(id) ON DELETE CASCADE,
    conflict_code VARCHAR(50) UNIQUE NOT NULL,
    conflict_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'REVIEW_REQUIRED',
    recorded_value VARCHAR(255),
    gis_value VARCHAR(255),
    difference_metric VARCHAR(100),
    displacement_m FLOAT DEFAULT 0.0,
    explanation TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    resolution_strategy VARCHAR(100),
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. AI Detected Building Footprints
CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY,
    parcel_id INTEGER REFERENCES parcels(id) ON DELETE CASCADE,
    building_code VARCHAR(50) NOT NULL,
    area_sqm FLOAT NOT NULL,
    height_m FLOAT DEFAULT 6.5,
    floors INTEGER DEFAULT 2,
    detected_from VARCHAR(100) DEFAULT 'High-Res Drone / Satellite AI',
    confidence FLOAT DEFAULT 92.0,
    is_encroaching BOOLEAN DEFAULT FALSE,
    encroachment_area_sqm FLOAT DEFAULT 0.0,
    geometry JSONB NOT NULL,
    geom GEOMETRY(Polygon, 4326),
    status VARCHAR(50) DEFAULT 'DETECTED_PENDING_VERIFICATION',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Temporal Change Detection
CREATE TABLE IF NOT EXISTS land_use_changes (
    id SERIAL PRIMARY KEY,
    parcel_id INTEGER REFERENCES parcels(id) ON DELETE CASCADE,
    previous_epoch_year INTEGER DEFAULT 2021,
    current_epoch_year INTEGER DEFAULT 2026,
    previous_land_use VARCHAR(100) DEFAULT 'Vacant / Open Plot',
    current_detected_use VARCHAR(100) DEFAULT 'Commercial Construction',
    change_type VARCHAR(100) DEFAULT 'NEW_CONSTRUCTION',
    change_area_sqm FLOAT DEFAULT 0.0,
    confidence FLOAT DEFAULT 89.0,
    status VARCHAR(50) DEFAULT 'UNVERIFIED_CHANGE',
    geometry JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Immutable Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) DEFAULT 'System',
    user_role VARCHAR(50) DEFAULT 'SYSTEM',
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details TEXT,
    previous_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
