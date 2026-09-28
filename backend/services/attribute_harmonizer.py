import re
from typing import Dict, Any, List, Tuple
from difflib import SequenceMatcher

CANONICAL_FIELDS = {
    "parcel_id": ["parcel_id", "plot_id", "plot_no", "pid", "khasra_no", "cts_no", "gis_id", "id"],
    "survey_number": ["survey_no", "survey_number", "surveyno", "khasra", "sy_no", "dag_no", "khata_no"],
    "property_id": ["property_id", "prop_id", "tax_assessment_no", "upin", "ulpin", "holding_no"],
    "owner_reference": ["owner", "owner_name", "holder_name", "pattedar", "khatedar", "citizen_name", "proprietor"],
    "area": ["area", "area_sqm", "area_sq_m", "plot_area", "rakba", "extent", "gis_area", "carpet_area"],
    "land_use": ["land_use", "landuse", "zoning", "category", "usage", "classification", "type"]
}

class AttributeHarmonizer:
    @staticmethod
    def suggest_mappings(source_columns: List[str]) -> Dict[str, str]:
        """
        Automatically suggests canonical field mapping for a list of source dataset column names.
        """
        mappings = {}
        for col in source_columns:
            clean_col = col.lower().strip().replace("-", "_").replace(" ", "_")
            best_canonical = None
            best_score = 0.0

            for canonical, aliases in CANONICAL_FIELDS.items():
                if clean_col in aliases:
                    best_canonical = canonical
                    best_score = 1.0
                    break
                for alias in aliases:
                    score = SequenceMatcher(None, clean_col, alias).ratio()
                    if score > 0.75 and score > best_score:
                        best_score = score
                        best_canonical = canonical

            if best_canonical and best_canonical not in mappings.values():
                mappings[col] = best_canonical

        return mappings

    @staticmethod
    def normalize_attributes(record_props: Dict[str, Any], field_mapping: Dict[str, str]) -> Dict[str, Any]:
        """
        Transforms source record properties into canonical schema format with area unit conversion.
        """
        canonical_props = {
            "parcel_id": None,
            "survey_number": None,
            "property_id": None,
            "owner_reference": "Citizen Reference Noted",
            "recorded_area": 1000.0,
            "land_use": "Residential"
        }

        # Invert mapping
        for src_col, canon_key in field_mapping.items():
            if src_col in record_props and record_props[src_col] is not None:
                val = record_props[src_col]
                if canon_key == "area":
                    # Convert to float sqm
                    try:
                        # Handle potential string suffixes or units
                        str_val = str(val).lower()
                        num_match = re.search(r"[-+]?\d*\.\d+|\d+", str_val)
                        num_area = float(num_match.group(0)) if num_match else 500.0
                        if "sqft" in str_val or "sq.ft" in str_val or "ft" in str_val:
                            num_area = num_area * 0.092903
                        elif "acre" in str_val:
                            num_area = num_area * 4046.86
                        elif "guntha" in str_val or "guntas" in str_val:
                            num_area = num_area * 101.17
                        elif "hectare" in str_val or "ha" in str_val:
                            num_area = num_area * 10000.0
                        canonical_props["recorded_area"] = round(num_area, 2)
                    except Exception:
                        canonical_props["recorded_area"] = 500.0
                elif canon_key in canonical_props:
                    canonical_props[canon_key] = str(val).strip()

        # Fallbacks if keys are missing
        if not canonical_props["parcel_id"]:
            canonical_props["parcel_id"] = str(record_props.get("id") or record_props.get("ID") or "P-AUTO")
        if not canonical_props["survey_number"]:
            canonical_props["survey_number"] = str(record_props.get("survey_no") or record_props.get("Survey_No") or "UNSPECIFIED")

        return canonical_props
