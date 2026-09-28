import math
from typing import Dict, Any, List, Tuple, Optional
from shapely.geometry import shape, mapping, Polygon, MultiPolygon, box
from shapely.validation import make_valid, explain_validity
from shapely.ops import transform
import pyproj

# Cache transformers for performance
_TRANSFORMERS = {}

def get_transformer(from_crs: str, to_crs: str) -> pyproj.Transformer:
    key = f"{from_crs}->{to_crs}"
    if key not in _TRANSFORMERS:
        _TRANSFORMERS[key] = pyproj.Transformer.from_crs(
            from_crs, to_crs, always_xy=True
        )
    return _TRANSFORMERS[key]

class GISEngine:
    @staticmethod
    def validate_and_repair_geometry(geom_dict: Dict[str, Any]) -> Tuple[Dict[str, Any], bool, str]:
        """
        Validates GeoJSON geometry and fixes self-intersections, slivers, or orientation errors.
        Returns: (repaired_geom_dict, is_valid_original, issue_explanation)
        """
        try:
            geom = shape(geom_dict)
            is_valid_orig = geom.is_valid
            reason = "Valid geometry" if is_valid_orig else explain_validity(geom)

            if not is_valid_orig:
                repaired = make_valid(geom)
                # Keep Polygon or MultiPolygon only if possible
                if repaired.geom_type in ["Polygon", "MultiPolygon"]:
                    geom = repaired
                elif hasattr(repaired, "geoms"):
                    polys = [g for g in repaired.geoms if g.geom_type in ["Polygon", "MultiPolygon"]]
                    if polys:
                        geom = MultiPolygon(polys) if len(polys) > 1 else polys[0]
                    else:
                        geom = geom.buffer(0)
                else:
                    geom = geom.buffer(0)

            # Ensure valid polygon geometry
            return mapping(geom), is_valid_orig, reason
        except Exception as e:
            return geom_dict, False, f"Geometry parsing error: {str(e)}"

    @staticmethod
    def transform_geometry(geom_dict: Dict[str, Any], from_crs: str, to_crs: str) -> Dict[str, Any]:
        """
        Transforms GeoJSON geometry from one CRS to another using pyproj.
        """
        if from_crs.upper() == to_crs.upper():
            return geom_dict
        
        try:
            transformer = get_transformer(from_crs, to_crs)
            geom = shape(geom_dict)
            transformed = transform(transformer.transform, geom)
            return mapping(transformed)
        except Exception as e:
            # Fallback if transform fails
            return geom_dict

    @staticmethod
    def calculate_metric_area(geom_dict: Dict[str, Any], source_crs: str = "EPSG:4326") -> float:
        """
        Calculates exact surface area in square meters.
        Projects to Indian UTM Zone (EPSG:32643) for precise metric area.
        """
        try:
            geom = shape(geom_dict)
            # If coordinates are in lat/lon degrees, reproject to UTM (EPSG:32643) for area in m^2
            if source_crs == "EPSG:4326":
                # Find appropriate UTM zone based on centroid lon
                centroid = geom.centroid
                utm_zone = int((centroid.x + 180) / 6) + 1
                utm_crs = f"EPSG:326{utm_zone:02d}" if centroid.y >= 0 else f"EPSG:327{utm_zone:02d}"
                transformer = get_transformer("EPSG:4326", utm_crs)
                projected_geom = transform(transformer.transform, geom)
                return round(float(projected_geom.area), 2)
            else:
                return round(float(geom.area), 2)
        except Exception:
            return 0.0

    @staticmethod
    def calculate_centroid(geom_dict: Dict[str, Any]) -> Tuple[float, float]:
        """
        Returns (latitude, longitude) of geometry centroid.
        """
        try:
            geom = shape(geom_dict)
            centroid = geom.centroid
            return round(centroid.y, 6), round(centroid.x, 6)
        except Exception:
            return 0.0, 0.0

    @staticmethod
    def calculate_bounding_box(geom_dict: Dict[str, Any]) -> List[float]:
        """
        Returns [minLon, minLat, maxLon, maxLat]
        """
        try:
            geom = shape(geom_dict)
            bounds = geom.bounds
            return [round(b, 6) for b in bounds]
        except Exception:
            return [0.0, 0.0, 0.0, 0.0]

    @staticmethod
    def calculate_spatial_overlap(geom_dict_a: Dict[str, Any], geom_dict_b: Dict[str, Any]) -> Tuple[float, float, float]:
        """
        Computes Spatial Overlap:
        - IoU (Intersection over Union) %
        - Overlap percentage relative to Geom A %
        - Overlap percentage relative to Geom B %
        """
        try:
            geom_a = shape(geom_dict_a)
            geom_b = shape(geom_dict_b)

            if not geom_a.intersects(geom_b):
                return 0.0, 0.0, 0.0

            intersection = geom_a.intersection(geom_b)
            union = geom_a.union(geom_b)

            inter_area = intersection.area
            union_area = union.area

            iou = (inter_area / union_area * 100.0) if union_area > 0 else 0.0
            overlap_a = (inter_area / geom_a.area * 100.0) if geom_a.area > 0 else 0.0
            overlap_b = (inter_area / geom_b.area * 100.0) if geom_b.area > 0 else 0.0

            return round(iou, 2), round(overlap_a, 2), round(overlap_b, 2)
        except Exception:
            return 0.0, 0.0, 0.0

    @staticmethod
    def calculate_centroid_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Haversine formula to compute ground distance in meters between two coordinates.
        """
        r = 6371000  # Earth radius in meters
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(r * c, 2)

    @staticmethod
    def calculate_hausdorff_displacement(geom_dict_a: Dict[str, Any], geom_dict_b: Dict[str, Any]) -> float:
        """
        Calculates boundary displacement in meters between two polygon boundaries.
        Reprojects to metric UTM for real ground distance.
        """
        try:
            geom_a = shape(geom_dict_a)
            geom_b = shape(geom_dict_b)
            
            centroid = geom_a.centroid
            utm_zone = int((centroid.x + 180) / 6) + 1
            utm_crs = f"EPSG:326{utm_zone:02d}"
            transformer = get_transformer("EPSG:4326", utm_crs)

            proj_a = transform(transformer.transform, geom_a)
            proj_b = transform(transformer.transform, geom_b)

            # Hausdorff distance in meters
            dist = proj_a.boundary.hausdorff_distance(proj_b.boundary)
            return round(float(dist), 2)
        except Exception:
            return 0.0

    @staticmethod
    def check_building_encroachment(parcel_geom_dict: Dict[str, Any], building_geom_dict: Dict[str, Any]) -> Tuple[bool, float, Optional[Dict[str, Any]]]:
        """
        Checks if building extends beyond parcel boundaries.
        Returns: (is_encroaching, encroachment_area_sqm, encroachment_geom_dict)
        """
        try:
            parcel_geom = shape(parcel_geom_dict)
            bldg_geom = shape(building_geom_dict)

            # Difference is the part of building outside parcel
            outside = bldg_geom.difference(parcel_geom)
            if outside.is_empty or outside.area <= 1e-9:
                return False, 0.0, None

            # Compute metric area of encroachment
            encroach_area = GISEngine.calculate_metric_area(mapping(outside), source_crs="EPSG:4326")
            if encroach_area > 1.0:  # More than 1 sq. meter
                return True, encroach_area, mapping(outside)
            return False, 0.0, None
        except Exception:
            return False, 0.0, None
