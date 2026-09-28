import math
import random
import datetime
from typing import Dict, Any, List
from shapely.geometry import Polygon, mapping, box
from sqlalchemy.orm import Session
from backend.models import (
    User, Dataset, Parcel, ParcelSource, ParcelMatch,
    Conflict, Building, LandUseChange, VerificationRecord, AuditLog
)
from backend.services.gis_engine import GISEngine
from backend.services.conflict_engine import ConflictEngine
from backend.services.ai_vision_service import AIVisionService
from backend.services.matching_engine import MatchingEngine

# Seed for reproducible realistic synthetic data
random.seed(42)

WARDS_CONFIG = [
    {"name": "Ward 12 - Indira Nagar", "zone": "North Zone", "base_lat": 18.5280, "base_lon": 73.8520, "rows": 8, "cols": 12, "prefix": "W12"},
    {"name": "Ward 14 - Shivaji Nagar", "zone": "Central Zone", "base_lat": 18.5150, "base_lon": 73.8400, "rows": 7, "cols": 10, "prefix": "W14"},
    {"name": "Ward 17 - Cyber Tech Zone", "zone": "East Zone", "base_lat": 18.5020, "base_lon": 73.8650, "rows": 7, "cols": 10, "prefix": "W17"}
]

LAND_USES = ["Residential", "Commercial", "Mixed Urban", "Institutional", "Vacant / Open Plot", "Industrial Light"]
CITIZEN_NAMES = [
    "Smt. Lakshmi Devi", "Shri Rajesh Kumar Sharma", "Dr. Amit Patil", "Smt. Sunita Rao",
    "Shri Suresh M. Goud", "M/s Apex Infrastructure Ltd.", "Shri Anand K. Verma", "Smt. Priyanka Sen",
    "Shri Vikram Rathore", "Smt. Meenakshi Sundaram", "Shri Mohammed Irfan", "Smt. Gurpreet Kaur"
]

class DemoDataGenerator:
    @staticmethod
    def seed_demo_data(db: Session, force_reset: bool = False):
        """
        Populates the system with realistic multi-source urban land datasets.
        """
        if not force_reset and db.query(Parcel).count() > 0:
            return  # Already seeded

        # Clear existing tables if force_reset
        if force_reset:
            db.query(AuditLog).delete()
            db.query(VerificationRecord).delete()
            db.query(LandUseChange).delete()
            db.query(Building).delete()
            db.query(Conflict).delete()
            db.query(ParcelMatch).delete()
            db.query(ParcelSource).delete()
            db.query(Parcel).delete()
            db.query(Dataset).delete()
            db.query(User).delete()
            db.commit()

        # 1. Create Default Users
        users = [
            User(username="gis_officer", full_name="Shri A. K. Sharma", email="ak.sharma@landrecords.gov.in", role="GIS_OFFICER", designation="Senior Land Records & GIS Officer"),
            User(username="admin_officer", full_name="Dr. Sunita V. Deshmukh", email="sunita.deshmukh@rural.gov.in", role="ADMIN", designation="Director of Land Records (Urban)"),
            User(username="reviewer", full_name="Shri P. C. Raman", email="pc.raman@revenue.gov.in", role="REVIEWER", designation="Assistant Land Settlement Reviewer")
        ]
        db.add_all(users)
        db.commit()

        # 2. Create Source Datasets
        datasets = [
            Dataset(
                name="Cadastral Revenue Survey Map (2018)",
                filename="ward_12_cadastral_revenue_2018.geojson",
                data_type="Cadastral Map",
                format="GeoJSON",
                record_count=236,
                original_crs="EPSG:4326",
                target_crs="EPSG:4326",
                geometry_type="Polygon",
                available_attributes=["Survey_No", "Plot_ID", "Area_sq_m", "Khatedar_Name", "Land_Use"],
                source_agency="Department of Revenue & Land Records",
                file_size_kb=420.5,
                status="HARMONIZED",
                quality_report={
                    "crs_detected": "EPSG:4326",
                    "total_geometries": 236,
                    "valid_geometries": 236,
                    "invalid_geometries": 0,
                    "duplicate_ids": 0,
                    "null_attributes_count": 0,
                    "geometry_type": "Polygon",
                    "area_coverage_sqm": 298450.0,
                    "issues_detected": ["Baseline cadastral map validated against geodetic datum."],
                    "recommended_fixes": ["Ready for multi-source cross-referencing."]
                }
            ),
            Dataset(
                name="Municipal GIS Property Master Layer",
                filename="municipal_gis_properties_2024.geojson",
                data_type="Municipal GIS",
                format="GeoJSON",
                record_count=236,
                original_crs="EPSG:4326",
                target_crs="EPSG:4326",
                geometry_type="Polygon",
                available_attributes=["property_id", "khasra_no", "gis_area_m2", "tax_assessment_val", "zoning"],
                source_agency="Municipal Corporation GIS Cell",
                file_size_kb=485.2,
                status="HARMONIZED",
                quality_report={
                    "crs_detected": "EPSG:4326",
                    "total_geometries": 236,
                    "valid_geometries": 234,
                    "invalid_geometries": 2,
                    "duplicate_ids": 1,
                    "null_attributes_count": 0,
                    "geometry_type": "Polygon",
                    "area_coverage_sqm": 294200.0,
                    "issues_detected": ["2 minor slivers auto-repaired via make_valid()", "1 duplicate PID resolved"],
                    "recommended_fixes": ["Aligned with cadastral survey baseline."]
                }
            ),
            Dataset(
                name="Property Tax Assessment Ledger (2025)",
                filename="urban_property_tax_registry_2025.xlsx",
                data_type="Property Tax",
                format="XLSX",
                record_count=236,
                original_crs="EPSG:4326",
                target_crs="EPSG:4326",
                geometry_type="None (Tabular Linked)",
                available_attributes=["Assessment_No", "SurveyNumber", "Owner_Name", "Built_Up_Area_SqFt", "Tax_Status"],
                source_agency="Urban Development & Municipal Taxation Authority",
                file_size_kb=182.0,
                status="HARMONIZED",
                quality_report={
                    "crs_detected": "Non-Spatial (Auto-Linked via ULPIN / Survey Number)",
                    "total_geometries": 236,
                    "valid_geometries": 236,
                    "invalid_geometries": 0,
                    "duplicate_ids": 0,
                    "null_attributes_count": 3,
                    "geometry_type": "Tabular",
                    "area_coverage_sqm": 289100.0,
                    "issues_detected": ["3 records had legacy local Guntha units converted to m²."],
                    "recommended_fixes": ["Tabular linkage matched to spatial parcels."]
                }
            ),
            Dataset(
                name="High-Res Optical Drone & Satellite Orthophoto",
                filename="drone_ortho_0_3m_highres_2026.geotiff",
                data_type="Satellite / Drone AI",
                format="GeoTIFF / AI Vector",
                record_count=185,
                original_crs="EPSG:4326",
                target_crs="EPSG:4326",
                geometry_type="MultiPolygon",
                available_attributes=["Building_ID", "Footprint_Area_m2", "Height_Est_m", "Roof_Type", "AI_Confidence"],
                source_agency="National Remote Sensing Centre (NRSC) / Survey of India Drone Mission",
                file_size_kb=32400.0,
                status="HARMONIZED",
                quality_report={
                    "crs_detected": "EPSG:4326 (Transformed from UTM 43N)",
                    "total_geometries": 185,
                    "valid_geometries": 185,
                    "invalid_geometries": 0,
                    "duplicate_ids": 0,
                    "null_attributes_count": 0,
                    "geometry_type": "MultiPolygon",
                    "area_coverage_sqm": 94250.0,
                    "issues_detected": ["Orthorectification accuracy: +/- 0.15m root mean square error."],
                    "recommended_fixes": ["AI building footprints ready for encroachment overlay."]
                }
            )
        ]
        db.add_all(datasets)
        db.commit()

        # 3. Generate Spatial Parcels for the 3 Wards
        parcel_list = []
        parcel_sources_list = []
        conflicts_list = []
        buildings_list = []
        changes_list = []
        verifications_list = []
        matches_list = []

        global_idx = 100

        # Step size in degrees (~30m x 35m per plot)
        lat_step = 0.00030
        lon_step = 0.00035

        for ward_cfg in WARDS_CONFIG:
            ward_name = ward_cfg["name"]
            zone_name = ward_cfg["zone"]
            b_lat = ward_cfg["base_lat"]
            b_lon = ward_cfg["base_lon"]

            for r in range(ward_cfg["rows"]):
                for c in range(ward_cfg["cols"]):
                    global_idx += 1
                    p_id = f"P-{global_idx}"
                    survey_no = f"{100 + (global_idx % 40)}/{1 + (global_idx % 4)}"
                    prop_id = f"PROP-{ward_cfg['prefix']}-{2024 + (global_idx % 2)}-{global_idx:04d}"
                    citizen = CITIZEN_NAMES[global_idx % len(CITIZEN_NAMES)]
                    land_use = LAND_USES[global_idx % len(LAND_USES)]
                    detected_use = land_use

                    # Create polygon coordinates with slight realistic organic jitter
                    x1 = b_lon + (c * lon_step) + (0.00002 if (r+c)%3==0 else 0)
                    y1 = b_lat + (r * lat_step) + (0.00001 if (r+c)%2==0 else 0)
                    x2 = x1 + (lon_step * 0.88)
                    y2 = y1
                    x3 = x2 + (0.00002 if (r%2==1) else 0)
                    y3 = y1 + (lat_step * 0.85)
                    x4 = x1
                    y4 = y3

                    poly_coords = [[x1, y1], [x2, y2], [x3, y3], [x4, y4], [x1, y1]]
                    polygon = Polygon(poly_coords)
                    geom_dict = mapping(polygon)

                    gis_area = GISEngine.calculate_metric_area(geom_dict)
                    recorded_area = gis_area  # Base exact

                    # Spotlight test cases from requirements
                    is_p102 = (p_id == "P-102" or global_idx == 102)
                    is_area_mismatch = (global_idx % 11 == 0 or is_p102)
                    is_boundary_conflict = (global_idx % 14 == 0 or is_p102 or global_idx == 129)
                    is_lu_change = (global_idx % 17 == 0 or global_idx == 104)
                    is_duplicate_case = (global_idx == 205)

                    if is_p102:
                        p_id = "P-102"
                        survey_no = "104/2"
                        recorded_area = 1250.0
                        gis_area = 1184.0
                        land_use = "Residential"
                        detected_use = "Residential (Commercial Annex)"
                    elif is_area_mismatch:
                        # 6% to 14% area mismatch
                        factor = 1.08 if (global_idx % 2 == 0) else 0.92
                        recorded_area = round(gis_area * factor, 1)

                    if is_lu_change:
                        land_use = "Vacant / Open Plot"
                        detected_use = "Commercial Construction"

                    area_diff_pct = round(abs(recorded_area - gis_area) / recorded_area * 100.0, 2) if recorded_area > 0 else 0.0

                    c_lat, c_lon = GISEngine.calculate_centroid(geom_dict)
                    bbox = GISEngine.calculate_bounding_box(geom_dict)

                    # Compute realistic matching confidence
                    base_conf = 96.0 - (area_diff_pct * 0.8) - (8.0 if is_boundary_conflict else 0.0)
                    confidence = round(max(55.0, min(99.0, base_conf)), 1)

                    # Determine initial verification status
                    if is_p102 or is_area_mismatch or is_boundary_conflict or is_lu_change:
                        v_status = "PENDING"
                    elif global_idx % 4 == 0:
                        v_status = "UNDER_REVIEW"
                    else:
                        v_status = "VERIFIED"

                    verified_by = "Shri A. K. Sharma (GIS Officer)" if v_status == "VERIFIED" else None
                    verified_at = datetime.datetime.utcnow() - datetime.timedelta(days=(global_idx % 10)) if v_status == "VERIFIED" else None
                    officer_notes = "Official verification confirmed against integrated cadastral & drone ortho-mosaic." if v_status == "VERIFIED" else None

                    parcel = Parcel(
                        parcel_id=p_id,
                        survey_number=survey_no,
                        property_id=prop_id,
                        ward=ward_name,
                        zone=zone_name,
                        owner_reference=f"Citizen Ref #{global_idx} - {citizen}",
                        recorded_area=recorded_area,
                        gis_area=gis_area,
                        area_difference_pct=area_diff_pct,
                        land_use=land_use,
                        detected_land_use=detected_use,
                        geometry=geom_dict,
                        centroid_lat=c_lat,
                        centroid_lon=c_lon,
                        bounding_box=bbox,
                        confidence=confidence,
                        confidence_breakdown={
                            "attribute_similarity": 98.0 if not is_duplicate_case else 65.0,
                            "geometry_overlap": 94.0 if not is_boundary_conflict else 78.0,
                            "area_similarity": round(100.0 - area_diff_pct, 1),
                            "centroid_offset_meters": 1.2 if not is_boundary_conflict else 4.7
                        },
                        verification_status=v_status,
                        verified_by=verified_by,
                        verified_at=verified_at,
                        officer_notes=officer_notes,
                        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=30)
                    )
                    parcel_list.append(parcel)

        db.add_all(parcel_list)
        db.commit()

        # Reload parcels to get database IDs
        saved_parcels = db.query(Parcel).all()
        dataset_records = db.query(Dataset).all()
        ds_map = {d.data_type: d.id for d in dataset_records}

        for p in saved_parcels:
            # 1. Add Source Records for each parcel (Cadastral, Municipal GIS, Property Tax, Satellite)
            # Create slight boundary shift in Municipal GIS for conflict parcels
            has_boundary_shift = (p.parcel_id == "P-102" or p.area_difference_pct > 7.0)

            # Cadastral Source
            cadastral_geom = p.geometry
            cadastral_src = ParcelSource(
                parcel_id=p.id,
                dataset_id=ds_map.get("Cadastral Map"),
                source_name="Cadastral Revenue Survey Map",
                source_record_id=f"CAD-{p.parcel_id}",
                source_survey_no=p.survey_number,
                source_area=p.recorded_area,
                source_geometry=cadastral_geom,
                source_attributes={
                    "Khasra_No": p.survey_number,
                    "Khatedar_Name": p.owner_reference,
                    "Recorded_Rakba_sqm": p.recorded_area,
                    "Survey_Year": 2018,
                    "Status": "Settlement Affirmed"
                }
            )
            parcel_sources_list.append(cadastral_src)

            # Municipal GIS Source (Shifted slightly if conflict)
            if has_boundary_shift:
                # Shift coordinates slightly (4.7m displacement)
                poly_orig = Polygon(p.geometry["coordinates"][0])
                poly_shifted = Polygon([[x + 0.00004, y + 0.00003] for x, y in poly_orig.exterior.coords])
                muni_geom = mapping(poly_shifted)
            else:
                muni_geom = p.geometry

            muni_src = ParcelSource(
                parcel_id=p.id,
                dataset_id=ds_map.get("Municipal GIS"),
                source_name="Municipal GIS Property Master",
                source_record_id=p.property_id or f"PROP-{p.parcel_id}",
                source_survey_no=p.survey_number,
                source_area=p.gis_area,
                source_geometry=muni_geom,
                source_attributes={
                    "UPIN": f"ULPIN-IND-{p.id:06d}",
                    "Property_Tax_Assessment": "Active",
                    "Zoning_Code": p.land_use,
                    "GIS_Area_Calculated": p.gis_area
                }
            )
            parcel_sources_list.append(muni_src)

            # Property Tax Ledger Source
            tax_src = ParcelSource(
                parcel_id=p.id,
                dataset_id=ds_map.get("Property Tax"),
                source_name="Urban Property Tax Registry",
                source_record_id=f"TAX-WZ-{p.id:05d}",
                source_survey_no=p.survey_number,
                source_area=p.recorded_area,
                source_geometry=None,
                source_attributes={
                    "Assessment_Cycle": "2025-2026",
                    "Tax_Demand_INR": 14200.0,
                    "Payment_Status": "Clear",
                    "Built_Up_Area_sqm": round(p.recorded_area * 0.65, 1)
                }
            )
            parcel_sources_list.append(tax_src)

            # 2. Generate Buildings via AI Vision Service
            bldgs = AIVisionService.extract_building_footprints_for_parcel(p.geometry, p.parcel_id, p.land_use)
            for b in bldgs:
                bldg_obj = Building(
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
                    status="DETECTED_PENDING_VERIFICATION" if b["is_encroaching"] else "MATCHED_WITH_RECORDS"
                )
                buildings_list.append(bldg_obj)

            # 3. Temporal Changes
            changes = AIVisionService.detect_temporal_changes(p.geometry, p.parcel_id, p.land_use)
            for chg in changes:
                chg_obj = LandUseChange(
                    parcel_id=p.id,
                    previous_epoch_year=chg["previous_epoch_year"],
                    current_epoch_year=chg["current_epoch_year"],
                    previous_land_use=chg["previous_land_use"],
                    current_detected_use=chg["current_detected_use"],
                    change_type=chg["change_type"],
                    change_area_sqm=chg["change_area_sqm"],
                    confidence=chg["confidence"],
                    status=chg["status"],
                    geometry=chg["geometry"]
                )
                changes_list.append(chg_obj)

            # 4. Generate Conflicts
            source_recs = [
                {"source_name": "Cadastral Revenue Survey Map", "source_geometry": cadastral_geom},
                {"source_name": "Municipal GIS Property Master", "source_geometry": muni_geom}
            ]
            detected_conflicts = ConflictEngine.evaluate_parcel_conflicts(
                parcel_data={
                    "parcel_id": p.parcel_id,
                    "geometry": p.geometry,
                    "recorded_area": p.recorded_area,
                    "gis_area": p.gis_area,
                    "land_use": p.land_use,
                    "detected_land_use": p.detected_land_use
                },
                source_records=source_recs,
                detected_buildings=bldgs
            )

            for c in detected_conflicts:
                conf_obj = Conflict(
                    parcel_id=p.id,
                    conflict_code=c["conflict_code"],
                    conflict_type=c["conflict_type"],
                    severity=c["severity"],
                    recorded_value=c["recorded_value"],
                    gis_value=c["gis_value"],
                    difference_metric=c["difference_metric"],
                    displacement_m=c["displacement_m"],
                    explanation=c["explanation"],
                    status="OPEN"
                )
                conflicts_list.append(conf_obj)

            # 5. Verification Records for pre-verified parcels
            if p.verification_status == "VERIFIED":
                v_rec = VerificationRecord(
                    parcel_id=p.id,
                    officer_name=p.verified_by or "Shri A. K. Sharma",
                    officer_role="GIS_OFFICER",
                    action="VERIFY",
                    previous_status="PENDING",
                    new_status="VERIFIED",
                    decision_notes="Harmonization approved. Cross-verified with high-res orthophoto.",
                    resolution_chosen="ADOPT_HARMONIZED_BOUNDARY",
                    timestamp=p.verified_at or datetime.datetime.utcnow()
                )
                verifications_list.append(v_rec)

        db.add_all(parcel_sources_list)
        db.add_all(buildings_list)
        db.add_all(changes_list)
        db.add_all(conflicts_list)
        db.add_all(verifications_list)
        db.commit()

        # 6. Audit Logs
        audit_entries = [
            AuditLog(
                user_name="System Ingestion Engine",
                user_role="SYSTEM",
                action="INGEST_DATASETS",
                module="INGESTION",
                entity_type="DATASET",
                entity_id="ALL_WARDS",
                details="Ingested 4 multi-source land record datasets across 3 Urban Wards.",
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
            ),
            AuditLog(
                user_name="GIS CRS Harmonizer",
                user_role="SYSTEM",
                action="TRANSFORM_CRS",
                module="CRS_TRANSFORM",
                entity_type="DATASET",
                entity_id="EPSG:4326",
                details="Harmonized coordinate reference systems to EPSG:4326 with UTM metric projection.",
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=1, minutes=50)
            ),
            AuditLog(
                user_name="AI Vision Analysis Engine",
                user_role="SYSTEM",
                action="EXTRACT_FOOTPRINTS",
                module="AI_VISION",
                entity_type="BUILDING",
                entity_id="BATCH_RUN",
                details="Extracted building footprints and flagged structural encroachments via high-res drone ortho-mosaic.",
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=1, minutes=40)
            ),
            AuditLog(
                user_name="Conflict Detection Engine",
                user_role="SYSTEM",
                action="DETECT_CONFLICTS",
                module="CONFLICT",
                entity_type="PARCEL",
                entity_id="SUMMARY",
                details=f"Analyzed {len(saved_parcels)} parcels and detected {len(conflicts_list)} discrepancy flags.",
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=1, minutes=30)
            ),
            AuditLog(
                user_name="Shri A. K. Sharma (GIS Officer)",
                user_role="GIS_OFFICER",
                action="VERIFY_PARCEL",
                module="VERIFICATION",
                entity_type="PARCEL",
                entity_id="P-101",
                details="Inspected multi-source overlay for Survey 101/1 and affirmed harmonized digital twin.",
                previous_state={"status": "PENDING"},
                new_state={"status": "VERIFIED"},
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=45)
            )
        ]
        db.add_all(audit_entries)
        db.commit()
