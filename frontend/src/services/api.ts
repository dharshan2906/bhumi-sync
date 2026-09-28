const BACKEND_URL = import.meta.env.VITE_API_URL || "https://bhumi-sync-backend.onrender.com";
const API_BASE = `${BACKEND_URL.replace(/\/$/, "")}/api`;

export interface DashboardStats {
  total_parcels: number;
  verified_parcels: number;
  pending_verification: number;
  under_review_parcels: number;
  rejected_parcels: number;
  boundary_conflicts: number;
  area_mismatches: number;
  duplicate_records: number;
  land_use_changes: number;
  buildings_detected: number;
  encroachments_detected: number;
  data_sources_integrated: number;
  average_confidence_pct: number;
  ward_breakdown: Array<{
    ward: string;
    total_parcels: number;
    verified: number;
    pending: number;
    conflicts: number;
  }>;
  conflict_distribution: Array<{
    type: string;
    count: number;
    code: string;
  }>;
  source_contributions: Array<{
    name: string;
    type: string;
    records: number;
    agency: string;
    status: string;
  }>;
  confidence_tiers: {
    high_90_plus: number;
    medium_75_89: number;
    low_below_75: number;
  };
}

export interface DatasetItem {
  id: number;
  name: string;
  filename: string;
  data_type: string;
  format: string;
  record_count: number;
  original_crs: string;
  target_crs: string;
  geometry_type: string;
  available_attributes: string[];
  source_agency: string;
  file_size_kb: number;
  status: string;
  quality_report: any;
  uploaded_by: string;
  created_at: string;
}

export interface ParcelListItem {
  id: number;
  parcel_id: string;
  survey_number: string;
  property_id: string | null;
  ward: string;
  zone: string;
  recorded_area: number;
  gis_area: number;
  area_difference_pct: number;
  land_use: string;
  detected_land_use: string;
  confidence: number;
  verification_status: string;
  conflict_count: number;
  building_count: number;
  centroid_lat: number;
  centroid_lon: number;
}

export interface ParcelDigitalTwin {
  id: number;
  parcel_id: string;
  survey_number: string;
  property_id: string | null;
  ward: string;
  zone: string;
  owner_reference: string;
  recorded_area: number;
  gis_area: number;
  area_difference_pct: number;
  land_use: string;
  detected_land_use: string;
  geometry: any;
  centroid_lat: number;
  centroid_lon: number;
  bounding_box: number[];
  confidence: number;
  confidence_breakdown: any;
  verification_status: string;
  verified_by: string | null;
  verified_at: string | null;
  officer_notes: string | null;
  sources: Array<{
    id: number;
    source_name: string;
    source_record_id: string;
    source_survey_no: string;
    source_area: number;
    source_geometry: any;
    source_attributes: any;
  }>;
  conflicts: Array<ConflictItem>;
  buildings: Array<BuildingItem>;
  changes: Array<ChangeItem>;
  created_at: string;
  updated_at: string;
}

export interface ConflictItem {
  id: number;
  parcel_id: number;
  conflict_code: string;
  conflict_type: string;
  severity: string;
  recorded_value: string | null;
  gis_value: string | null;
  difference_metric: string | null;
  displacement_m: number;
  explanation: string;
  status: string;
  resolution_strategy: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface BuildingItem {
  id: number;
  building_code: string;
  area_sqm: number;
  height_m: number;
  floors: number;
  detected_from: string;
  confidence: number;
  is_encroaching: boolean;
  encroachment_area_sqm: number;
  geometry: any;
  status: string;
}

export interface ChangeItem {
  id: number;
  previous_epoch_year: number;
  current_epoch_year: number;
  previous_land_use: string;
  current_detected_use: string;
  change_type: string;
  change_area_sqm: number;
  confidence: number;
  status: string;
  geometry: any;
}

export interface AuditLogItem {
  id: number;
  user_name: string;
  user_role: string;
  action: string;
  module: string;
  entity_type: string;
  entity_id: string | null;
  details: string | null;
  previous_state: any;
  new_state: any;
  ip_address: string;
  timestamp: string;
}

export const api = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/statistics`);
    if (!res.ok) throw new Error("Failed to fetch dashboard statistics");
    return res.json();
  },

  async getDatasets(): Promise<DatasetItem[]> {
    const res = await fetch(`${API_BASE}/datasets`);
    if (!res.ok) throw new Error("Failed to fetch datasets");
    return res.json();
  },

  async uploadDataset(formData: FormData): Promise<DatasetItem> {
    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Dataset upload failed");
    return res.json();
  },

  async validateDataset(datasetId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/datasets/${datasetId}/validate`, { method: "POST" });
    if (!res.ok) throw new Error("Validation failed");
    return res.json();
  },

  async harmonizeDataset(datasetId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/datasets/${datasetId}/harmonize`, { method: "POST" });
    if (!res.ok) throw new Error("Harmonization failed");
    return res.json();
  },

  async getParcels(params: { q?: string; ward?: string; status?: string; has_conflict?: boolean; limit?: number } = {}): Promise<ParcelListItem[]> {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.ward && params.ward !== "ALL") query.set("ward", params.ward);
    if (params.status && params.status !== "ALL") query.set("status", params.status);
    if (params.has_conflict !== undefined) query.set("has_conflict", String(params.has_conflict));
    if (params.limit) query.set("limit", String(params.limit));

    const res = await fetch(`${API_BASE}/parcels?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch parcels");
    return res.json();
  },

  async getParcelsGeoJSON(params: { ward?: string; status?: string; conflict_type?: string } = {}): Promise<any> {
    const query = new URLSearchParams();
    if (params.ward && params.ward !== "ALL") query.set("ward", params.ward);
    if (params.status && params.status !== "ALL") query.set("status", params.status);
    if (params.conflict_type && params.conflict_type !== "ALL") query.set("conflict_type", params.conflict_type);

    const res = await fetch(`${API_BASE}/parcels/geojson/layer?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch GeoJSON layer");
    return res.json();
  },

  async getParcelDigitalTwin(parcelId: number): Promise<ParcelDigitalTwin> {
    const res = await fetch(`${API_BASE}/parcels/${parcelId}`);
    if (!res.ok) throw new Error("Failed to fetch parcel digital twin");
    return res.json();
  },

  async getParcelByCode(parcelCode: string): Promise<ParcelDigitalTwin> {
    const res = await fetch(`${API_BASE}/parcels/by-code/${parcelCode}`);
    if (!res.ok) throw new Error(`Failed to fetch parcel ${parcelCode}`);
    return res.json();
  },

  async matchParcels(sourceA: any, sourceB: any): Promise<any> {
    const res = await fetch(`${API_BASE}/parcels/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_a: sourceA, source_b: sourceB }),
    });
    if (!res.ok) throw new Error("Parcel match failed");
    return res.json();
  },

  async getConflicts(params: { severity?: string; conflict_type?: string; status?: string } = {}): Promise<ConflictItem[]> {
    const query = new URLSearchParams();
    if (params.severity && params.severity !== "ALL") query.set("severity", params.severity);
    if (params.conflict_type && params.conflict_type !== "ALL") query.set("conflict_type", params.conflict_type);
    if (params.status && params.status !== "ALL") query.set("status", params.status);

    const res = await fetch(`${API_BASE}/conflicts?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch conflicts");
    return res.json();
  },

  async resolveConflict(conflictId: number, data: { status: string; resolution_strategy: string; resolved_by: string; notes?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/conflicts/${conflictId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to resolve conflict");
    return res.json();
  },

  async verifyParcel(parcelId: number, data: { action: string; officer_name: string; decision_notes?: string; resolution_strategy?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/conflicts/parcel/${parcelId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to verify parcel");
    return res.json();
  },

  async getDetectedBuildings(encroachingOnly: boolean = false): Promise<BuildingItem[]> {
    const res = await fetch(`${API_BASE}/ai/buildings?encroaching_only=${encroachingOnly}`);
    if (!res.ok) throw new Error("Failed to fetch buildings");
    return res.json();
  },

  async getTemporalChanges(): Promise<ChangeItem[]> {
    const res = await fetch(`${API_BASE}/ai/changes`);
    if (!res.ok) throw new Error("Failed to fetch changes");
    return res.json();
  },

  async runVisionPipeline(ward?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/run-vision-pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ward }),
    });
    if (!res.ok) throw new Error("Failed to run AI vision pipeline");
    return res.json();
  },

  async getAuditLogs(params: { module?: string; entity_type?: string } = {}): Promise<AuditLogItem[]> {
    const query = new URLSearchParams();
    if (params.module && params.module !== "ALL") query.set("module", params.module);
    if (params.entity_type && params.entity_type !== "ALL") query.set("entity_type", params.entity_type);

    const res = await fetch(`${API_BASE}/audit-logs?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch audit logs");
    return res.json();
  },

  getPdfReportUrl(ward?: string): string {
    return `${API_BASE}/reports/pdf${ward && ward !== 'ALL' ? `?ward=${encodeURIComponent(ward)}` : ''}`;
  },

  getCsvExportUrl(ward?: string): string {
    return `${API_BASE}/reports/csv${ward && ward !== 'ALL' ? `?ward=${encodeURIComponent(ward)}` : ''}`;
  },

  getGeoJsonExportUrl(ward?: string): string {
    return `${API_BASE}/reports/geojson${ward && ward !== 'ALL' ? `?ward=${encodeURIComponent(ward)}` : ''}`;
  },

  async runDemoPipeline(): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/run-pipeline`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to run demo pipeline");
    return res.json();
  },

  async resetDemoDatabase(): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to reset demo database");
    return res.json();
  },
};
