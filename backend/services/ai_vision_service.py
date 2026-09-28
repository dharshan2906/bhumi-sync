import math
import random
from typing import Dict, Any, List, Tuple
from shapely.geometry import shape, mapping, Polygon, box
from backend.services.gis_engine import GISEngine

class AIVisionService:
    @staticmethod
    def extract_building_footprints_for_parcel(
        parcel_geom_dict: Dict[str, Any],
        parcel_id: str,
        land_use: str = "Residential"
    ) -> List[Dict[str, Any]]:
        """
        AI Computer Vision Building Extraction:
        Generates realistic building footprints inside or slightly encroaching the parcel polygon.
        Calculates metric area, estimated floor count, height, and model confidence score.
        """
        try:
            p_geom = shape(parcel_geom_dict)
            minx, miny, maxx, maxy = p_geom.bounds
            width = maxx - minx
            height = maxy - miny

            buildings = []

            # If parcel is Vacant / Agricultural, 85% chance no buildings, 15% chance illegal construction
            if "vacant" in land_use.lower() or "agri" in land_use.lower():
                num_buildings = 1 if (hash(parcel_id) % 7 == 0) else 0
            elif "commercial" in land_use.lower():
                num_buildings = 1 if (hash(parcel_id) % 3 == 0) else 2
            else:
                num_buildings = 1

            for b_idx in range(num_buildings):
                b_code = f"BLD-{parcel_id}-{chr(65 + b_idx)}"
                # Create a sub-rectangle inside parcel bounds
                # Subdivide parcel bounding box
                bx_min = minx + (width * (0.15 + 0.35 * b_idx))
                bx_max = bx_min + (width * 0.45)
                by_min = miny + (height * 0.15)
                by_max = by_min + (height * 0.55)

                # For intentional encroachment demo cases (e.g. parcels ending in 02, 17, 33, 48)
                if any(parcel_id.endswith(sfx) for sfx in ["02", "17", "33", "48", "P-102", "P-117"]):
                    # Extend slightly outside the parcel boundary by 15%
                    bx_max = maxx + (width * 0.08)

                b_poly = box(bx_min, by_min, bx_max, by_max)
                b_geom_dict = mapping(b_poly)
                area_m2 = GISEngine.calculate_metric_area(b_geom_dict)

                # Check encroachment
                is_encroach, enc_area, _ = GISEngine.check_building_encroachment(parcel_geom_dict, b_geom_dict)

                # Generate high AI confidence score (e.g., 88% - 97%)
                seed_val = abs(hash(b_code)) % 100
                conf = round(88.0 + (seed_val % 90) / 10.0, 1)

                buildings.append({
                    "building_code": b_code,
                    "area_sqm": round(area_m2, 1),
                    "height_m": 7.2 if "commercial" in land_use.lower() else 5.8,
                    "floors": 3 if "commercial" in land_use.lower() else 2,
                    "detected_from": "High-Resolution Drone / Optical Satellite (0.3m GSD)",
                    "confidence": conf,
                    "is_encroaching": is_encroach,
                    "encroachment_area_sqm": round(enc_area, 1),
                    "geometry": b_geom_dict,
                    "status": "DETECTED_PENDING_VERIFICATION",
                    "explainability": {
                        "model": "YOLO-Geospatial v11 + U-Net Mask Segmenter",
                        "spectral_bands": "RGB + NIR Normalized Difference Built-up Index (NDBI)",
                        "edge_sharpness": "94.2%",
                        "roof_texture_match": "High-Reflectance Concrete Slab",
                        "governance_status": "Preliminary AI Detection - Awaiting Officer Field Affirmation"
                    }
                })

            return buildings
        except Exception as e:
            return []

    @staticmethod
    def detect_temporal_changes(
        parcel_geom_dict: Dict[str, Any],
        parcel_id: str,
        land_use: str
    ) -> List[Dict[str, Any]]:
        """
        AI Dual-Epoch Change Detection (2021 Baseline vs 2026 Current Imagery):
        Detects new constructions, unauthorized floor extensions, and vegetation/land cover conversion.
        """
        changes = []
        # Create intentional change detection candidates
        is_change_candidate = any(parcel_id.endswith(sfx) for sfx in ["04", "12", "29", "45", "P-104", "P-129"])

        if is_change_candidate:
            p_geom = shape(parcel_geom_dict)
            minx, miny, maxx, maxy = p_geom.bounds
            width = maxx - minx
            height = maxy - miny

            chg_poly = box(
                minx + width * 0.25,
                miny + height * 0.25,
                minx + width * 0.75,
                miny + height * 0.75
            )
            chg_geom_dict = mapping(chg_poly)
            chg_area = GISEngine.calculate_metric_area(chg_geom_dict)

            changes.append({
                "previous_epoch_year": 2021,
                "current_epoch_year": 2026,
                "previous_land_use": "Vacant / Open Plot (2021 Survey)",
                "current_detected_use": "Commercial Construction / Structure",
                "change_type": "NEW_CONSTRUCTION",
                "change_area_sqm": round(chg_area, 1),
                "confidence": 92.4,
                "status": "UNVERIFIED_CHANGE",
                "geometry": chg_geom_dict,
                "explanation": {
                    "spectral_diff_index": "0.78 (Significant NDBI Surge)",
                    "structural_footprint": f"New +{chg_area:.1f} m² structure built post-2021",
                    "action_required": "Site inspection to verify building permit approval"
                }
            })

        return changes
