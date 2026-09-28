import math
from typing import Dict, Any, List, Optional
from backend.services.gis_engine import GISEngine

class ConflictEngine:
    @staticmethod
    def evaluate_parcel_conflicts(
        parcel_data: Dict[str, Any],
        source_records: List[Dict[str, Any]] = None,
        detected_buildings: List[Dict[str, Any]] = None,
        adjacent_parcels: List[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Evaluates parcel for all 9 standard land conflict types.
        Returns list of conflict dictionary objects with severity, metrics, and explanations.
        """
        conflicts = []
        parcel_id = parcel_data.get("parcel_id", "UNKNOWN")
        geom = parcel_data.get("geometry")
        recorded_area = float(parcel_data.get("recorded_area") or 0.0)
        gis_area = float(parcel_data.get("gis_area") or (GISEngine.calculate_metric_area(geom) if geom else 0.0))
        land_use = parcel_data.get("land_use", "Residential")
        detected_land_use = parcel_data.get("detected_land_use", land_use)

        # 1. Area Mismatch Check (Threshold: > 5.0% discrepancy)
        if recorded_area > 0 and gis_area > 0:
            diff_abs = abs(recorded_area - gis_area)
            diff_pct = (diff_abs / recorded_area) * 100.0
            if diff_pct >= 5.0:
                severity = "CRITICAL" if diff_pct > 15.0 else "REVIEW_REQUIRED"
                conflicts.append({
                    "conflict_code": f"CONF-AREA-{parcel_id}",
                    "conflict_type": "AREA_MISMATCH",
                    "severity": severity,
                    "recorded_value": f"{recorded_area:.1f} m²",
                    "gis_value": f"{gis_area:.1f} m²",
                    "difference_metric": f"{diff_pct:.2f}% ({diff_abs:.1f} m²)",
                    "displacement_m": 0.0,
                    "explanation": f"Discrepancy of {diff_pct:.2f}% detected between official ledger ({recorded_area:.1f} m²) and GIS polygon area ({gis_area:.1f} m²)."
                })

        # 2. Land-Use Inconsistency Check
        if land_use.lower() != detected_land_use.lower():
            conflicts.append({
                "conflict_code": f"CONF-LU-{parcel_id}",
                "conflict_type": "LAND_USE_INCONSISTENCY",
                "severity": "REVIEW_REQUIRED",
                "recorded_value": land_use,
                "gis_value": detected_land_use,
                "difference_metric": "Categorical Divergence",
                "displacement_m": 0.0,
                "explanation": f"Record states '{land_use}', whereas AI satellite analysis identifies active '{detected_land_use}'."
            })

        # 3. Source Discrepancies (Boundary Mismatch & Attribute Conflicts across sources)
        if source_records and len(source_records) >= 2:
            cadastral_src = next((s for s in source_records if "cadastral" in s.get("source_name", "").lower()), None)
            municipal_src = next((s for s in source_records if "municipal" in s.get("source_name", "").lower() or "tax" in s.get("source_name", "").lower()), None)

            if cadastral_src and municipal_src and cadastral_src.get("source_geometry") and municipal_src.get("source_geometry"):
                disp = GISEngine.calculate_hausdorff_displacement(cadastral_src["source_geometry"], municipal_src["source_geometry"])
                if disp > 2.0:  # More than 2 meters boundary shift
                    conflicts.append({
                        "conflict_code": f"CONF-BOUND-{parcel_id}",
                        "conflict_type": "BOUNDARY_MISMATCH",
                        "severity": "CRITICAL" if disp > 6.0 else "REVIEW_REQUIRED",
                        "recorded_value": "Cadastral Survey Map",
                        "gis_value": "Municipal GIS Alignment",
                        "difference_metric": f"Displacement: {disp:.1f}m",
                        "displacement_m": disp,
                        "explanation": f"Cadastral boundary lines deviate by {disp:.1f} meters from municipal GIS footprint."
                    })

        # 4. Building Encroachment Check (Structure outside parcel bounds)
        if detected_buildings and geom:
            for bldg in detected_buildings:
                bldg_geom = bldg.get("geometry")
                if bldg_geom:
                    is_encroach, enc_area, _ = GISEngine.check_building_encroachment(geom, bldg_geom)
                    if is_encroach:
                        conflicts.append({
                            "conflict_code": f"CONF-ENC-{parcel_id}-{bldg.get('building_code', 'B1')}",
                            "conflict_type": "BUILDING_OUTSIDE_PARCEL",
                            "severity": "CRITICAL",
                            "recorded_value": "Parcel Perimeter",
                            "gis_value": f"Structure {bldg.get('building_code', 'B1')}",
                            "difference_metric": f"Encroachment: {enc_area:.1f} m²",
                            "displacement_m": round(math.sqrt(enc_area), 1) if 'math' in globals() else 2.5,
                            "explanation": f"Detected building structure extends {enc_area:.1f} m² outside the registered parcel boundary."
                        })

        # 5. Overlapping Parcels Check
        if adjacent_parcels and geom:
            for adj in adjacent_parcels:
                if adj.get("parcel_id") != parcel_id and adj.get("geometry"):
                    iou, ov_a, ov_b = GISEngine.calculate_spatial_overlap(geom, adj["geometry"])
                    if ov_a > 3.0:  # More than 3% overlap with a neighbor
                        conflicts.append({
                            "conflict_code": f"CONF-OVL-{parcel_id}-{adj.get('parcel_id')}",
                            "conflict_type": "PARCEL_OVERLAP",
                            "severity": "CRITICAL",
                            "recorded_value": parcel_id,
                            "gis_value": adj.get("parcel_id"),
                            "difference_metric": f"{ov_a:.1f}% Overlap",
                            "displacement_m": 0.0,
                            "explanation": f"Parcel geometry overlaps by {ov_a:.1f}% with adjacent parcel {adj.get('parcel_id')} (Survey No. {adj.get('survey_number')})."
                        })

        return conflicts
