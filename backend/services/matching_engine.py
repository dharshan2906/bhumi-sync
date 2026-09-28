import math
from typing import Dict, Any, Tuple
from difflib import SequenceMatcher
from backend.services.gis_engine import GISEngine

class MatchingEngine:
    @staticmethod
    def calculate_string_similarity(str_a: str, str_b: str) -> float:
        """
        Computes normalized string similarity (0.0 to 100.0%)
        """
        if not str_a or not str_b:
            return 0.0
        sa, sb = str(str_a).strip().lower(), str(str_b).strip().lower()
        if sa == sb:
            return 100.0
        # Normalize slashes e.g. 104/2 vs 104-2 or 104/02
        sa_clean = sa.replace("-", "/").replace(" ", "")
        sb_clean = sb.replace("-", "/").replace(" ", "")
        if sa_clean == sb_clean:
            return 98.0
        ratio = SequenceMatcher(None, sa_clean, sb_clean).ratio()
        return round(ratio * 100.0, 2)

    @staticmethod
    def match_parcel_records(
        source_a: Dict[str, Any],
        source_b: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Multi-signal probabilistic and geometric matching engine:
        - Parcel ID Similarity (20%)
        - Survey Number Similarity (25%)
        - Spatial Overlap / IoU (30%)
        - Centroid Distance in Meters (10%)
        - Area Ratio Similarity (10%)
        - Shape Ratio Similarity (5%)

        Returns overall Data Matching Confidence (%) and explainable breakdown.
        """
        # 1. Attribute signals
        id_a = source_a.get("parcel_id", "")
        id_b = source_b.get("parcel_id", "")
        id_sim = MatchingEngine.calculate_string_similarity(id_a, id_b)

        sy_a = source_a.get("survey_number", "")
        sy_b = source_b.get("survey_number", "")
        sy_sim = MatchingEngine.calculate_string_similarity(sy_a, sy_b)

        # 2. Geometry signals
        geom_a = source_a.get("geometry")
        geom_b = source_b.get("geometry")

        iou, overlap_a, overlap_b = 0.0, 0.0, 0.0
        centroid_dist = 999.0
        dist_score = 0.0
        hausdorff_disp = 0.0

        if geom_a and geom_b:
            iou, overlap_a, overlap_b = GISEngine.calculate_spatial_overlap(geom_a, geom_b)
            lat_a, lon_a = GISEngine.calculate_centroid(geom_a)
            lat_b, lon_b = GISEngine.calculate_centroid(geom_b)
            centroid_dist = GISEngine.calculate_centroid_distance_meters(lat_a, lon_a, lat_b, lon_b)
            hausdorff_disp = GISEngine.calculate_hausdorff_displacement(geom_a, geom_b)

            # Centroid score: 100% if < 1m, decays to 0% beyond 50m
            dist_score = max(0.0, min(100.0, 100.0 - (centroid_dist * 2.0)))

        # 3. Area similarity
        area_a = float(source_a.get("recorded_area") or source_a.get("area") or 1.0)
        area_b = float(source_b.get("recorded_area") or source_b.get("area") or 1.0)
        min_area, max_area = min(area_a, area_b), max(area_a, area_b)
        area_sim = round((min_area / max_area) * 100.0, 2) if max_area > 0 else 0.0

        # 4. Shape similarity (approximation based on overlap vs centroid alignment)
        shape_sim = min(100.0, max(0.0, (iou * 0.7) + (dist_score * 0.3)))

        # 5. Composite Data Matching Confidence
        # Weights: survey_no: 0.25, spatial_iou: 0.30, id: 0.20, centroid: 0.10, area: 0.10, shape: 0.05
        weights = {
            "survey": 0.25,
            "iou": 0.30,
            "id": 0.20,
            "centroid": 0.10,
            "area": 0.10,
            "shape": 0.05
        }

        overall_conf = (
            (sy_sim * weights["survey"]) +
            (iou * weights["iou"]) +
            (id_sim * weights["id"]) +
            (dist_score * weights["centroid"]) +
            (area_sim * weights["area"]) +
            (shape_sim * weights["shape"])
        )
        overall_conf = round(min(99.9, max(5.0, overall_conf)), 1)

        # Status determination
        if overall_conf >= 85.0:
            status = "AUTO_MATCHED"
        elif overall_conf >= 60.0:
            status = "CANDIDATE"
        else:
            status = "AMBIGUOUS"

        # Generate human-readable explanation
        reasons = []
        if sy_sim >= 90:
            reasons.append(f"Survey number match: {sy_a} matches {sy_b} ({sy_sim}%).")
        if iou >= 80:
            reasons.append(f"High geometric concordance: {iou}% spatial IoU overlap.")
        elif iou > 30:
            reasons.append(f"Partial geometric overlap: {iou}% IoU (boundary shift detected).")
        if centroid_dist < 5.0:
            reasons.append(f"Centroid proximity is close ({centroid_dist}m offset).")
        else:
            reasons.append(f"Centroid displacement is {centroid_dist}m.")
        if area_sim >= 95:
            reasons.append(f"Recorded area values are highly consistent ({area_sim}% similarity).")
        else:
            reasons.append(f"Area variance observed: {area_a} m² vs {area_b} m² ({area_sim}% match).")

        return {
            "overall_confidence": overall_conf,
            "match_status": status,
            "signals": {
                "id_similarity_pct": id_sim,
                "survey_similarity_pct": sy_sim,
                "spatial_overlap_pct": iou,
                "centroid_distance_m": centroid_dist,
                "hausdorff_displacement_m": hausdorff_disp,
                "area_similarity_pct": area_sim,
                "shape_similarity_pct": round(shape_sim, 2)
            },
            "explanation": {
                "summary": f"Data Matching Confidence: {overall_conf}% ({status})",
                "factors": reasons,
                "governance_note": "Probabilistic matching indicator for decision support. Official authority retains final verification."
            }
        }
