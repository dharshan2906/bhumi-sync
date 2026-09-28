import React, { useState } from 'react';
import { 
  Layers, ArrowRight, CheckCircle2, RefreshCw, 
  Database, ShieldCheck, Cpu, ArrowDown, Check, Globe
} from 'lucide-react';
import { DatasetItem, api } from '../services/api';

interface HarmonizationViewProps {
  datasets: DatasetItem[];
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
}

export const HarmonizationView: React.FC<HarmonizationViewProps> = ({
  datasets,
  onRefresh,
  onNavigateTab
}) => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<number>(datasets[0]?.id || 1);
  const [targetCrs, setTargetCrs] = useState<string>('EPSG:4326');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [harmonizeResult, setHarmonizeResult] = useState<any>(null);

  // Canonical Schema Fields Definition
  const canonicalFields = [
    { key: 'parcel_id', label: 'Parcel Identifier (parcel_id)', type: 'String (Unique Key)', required: true },
    { key: 'survey_number', label: 'Survey / Khasra No (survey_number)', type: 'String (Revenue Index)', required: true },
    { key: 'property_id', label: 'Property Tax / ULPIN (property_id)', type: 'String (Municipal UPIN)', required: false },
    { key: 'owner_reference', label: 'Citizen / Khatedar (owner_reference)', type: 'String (Encrypted ID)', required: true },
    { key: 'area', label: 'Surface Extent (area_sqm)', type: 'Float (Square Meters)', required: true },
    { key: 'land_use', label: 'Zoning / Land Use (land_use)', type: 'String (Classification)', required: true },
  ];

  // Current field mappings
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({
    'Survey_No': 'survey_number',
    'Plot_ID': 'parcel_id',
    'Khatedar_Name': 'owner_reference',
    'Area_sq_m': 'area',
    'Land_Use': 'land_use'
  });

  const activeDataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0];

  const handleRunHarmonization = async () => {
    if (!activeDataset) return;
    setIsProcessing(true);
    try {
      const res = await api.harmonizeDataset(activeDataset.id);
      setHarmonizeResult(res);
      if (res.suggested_mappings) {
        setFieldMappings(res.suggested_mappings);
      }
      onRefresh();
    } catch (err) {
      alert(`Harmonization failed: ${err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Georeferencing, CRS & Attribute Schema Harmonization</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Standardize disparate spatial datums (PROJ PyProj transform) and map heterogeneous column schemas to the National Canonical Standard.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        
        {/* Left Column: CRS Pipeline Visualization & Config */}
        <div style={{ gridColumn: 'span 5' }}>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <span className="card-title">
                <Globe size={16} color="#0f2942" />
                Coordinate Reference System (CRS) Pipeline
              </span>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Select Target Dataset:
                </label>
                <select
                  value={selectedDatasetId}
                  onChange={(e) => setSelectedDatasetId(Number(e.target.value))}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  {datasets.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.format})</option>
                  ))}
                </select>
              </div>

              {/* Real Transform Flowchart */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'inline-block', fontSize: '12px', fontWeight: 700, color: '#0f2942' }}>
                    Source CRS: {activeDataset?.original_crs || 'EPSG:4326'}
                  </div>
                  <div style={{ margin: '6px 0', color: '#64748b' }}>
                    <ArrowDown size={16} style={{ margin: '0 auto' }} />
                  </div>
                  <div style={{ backgroundColor: '#eff6ff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #3b82f6', display: 'inline-block', fontSize: '11px', fontWeight: 600, color: '#1d4ed8' }}>
                    ⚡ PyProj Transform + UTM 43N Metric Geodesy
                  </div>
                  <div style={{ margin: '6px 0', color: '#64748b' }}>
                    <ArrowDown size={16} style={{ margin: '0 auto' }} />
                  </div>
                  <div style={{ backgroundColor: '#f0fdf4', padding: '8px 12px', borderRadius: '6px', border: '1px solid #16a34a', display: 'inline-block', fontSize: '12px', fontWeight: 700, color: '#15803d' }}>
                    Canonical Target CRS: {targetCrs} (WGS 84)
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={isProcessing}
                onClick={handleRunHarmonization}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={14} className="spin" />
                    Executing Coordinate Reprojection...
                  </>
                ) : (
                  <>
                    <Globe size={14} />
                    Execute CRS & Schema Harmonization
                  </>
                )}
              </button>

              {harmonizeResult && (
                <div style={{
                  backgroundColor: '#ecfdf5',
                  color: '#16a34a',
                  border: '1px solid #a7f3d0',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  marginTop: '14px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{harmonizeResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Canonical Schema Specification Reference */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <ShieldCheck size={16} color="#0f2942" />
                National Canonical Land Schema (NLRMP)
              </span>
            </div>
            <div style={{ padding: '12px' }}>
              <table className="gov-table" style={{ fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th>Canonical Field</th>
                    <th>Data Type</th>
                  </tr>
                </thead>
                <tbody>
                  {canonicalFields.map((f) => (
                    <tr key={f.key}>
                      <td>
                        <b style={{ color: '#0f2942' }}>{f.key}</b>
                        {f.required && <span style={{ color: '#dc2626', marginLeft: '4px' }}>*</span>}
                      </td>
                      <td style={{ color: '#64748b' }}>{f.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Attribute Mapping Interface */}
        <div style={{ gridColumn: 'span 7' }}>
          <div className="card">
            <div className="card-header">
              <div>
                <span className="card-title">
                  <Layers size={16} color="#0f2942" />
                  Attribute Field Mapping & Unit Normalization
                </span>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Map source dataset column headers to standard canonical attributes.
                </div>
              </div>

              <button className="btn btn-sm btn-primary" onClick={() => onNavigateTab('intelligence')}>
                Proceed to Parcel Matching
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="card-body">
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#334155'
              }}>
                <b>Fuzzy Heuristics Active:</b> Automatic column match suggestions powered by Levenshtein distance & semantic aliases (e.g., <i>Khasra_No → survey_number</i>, <i>Rakba / Extent → area_sqm</i>).
              </div>

              <div className="table-responsive">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>SOURCE FIELD (From Upload)</th>
                      <th style={{ width: '10%', textAlign: 'center' }}></th>
                      <th style={{ width: '50%' }}>CANONICAL SCHEMA FIELD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeDataset?.available_attributes || ['Survey_No', 'Plot_ID', 'Area_sq_m', 'Khatedar_Name', 'Land_Use']).map((col) => {
                      const currentMapped = fieldMappings[col] || '';
                      return (
                        <tr key={col}>
                          <td style={{ fontWeight: 600, color: '#0f2942', fontFamily: 'monospace' }}>
                            {col}
                          </td>
                          <td style={{ textAlign: 'center', color: '#64748b' }}>
                            <ArrowRight size={14} />
                          </td>
                          <td>
                            <select
                              value={currentMapped}
                              onChange={(e) => setFieldMappings({ ...fieldMappings, [col]: e.target.value })}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', color: currentMapped ? '#16a34a' : '#64748b', fontWeight: currentMapped ? 600 : 400 }}
                            >
                              <option value="">-- Ignore / Unmapped --</option>
                              {canonicalFields.map(f => (
                                <option key={f.key} value={f.key}>{f.key} ({f.label})</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Unit Conversion Notice */}
              <div style={{ marginTop: '16px', padding: '10px 14px', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '11px', color: '#1e40af' }}>
                <b>Automatic Unit Standardizer:</b> Legacy area metrics (Acres, Hectares, Gunthas, Sq. Ft) are automatically converted into SI Metric Square Meters (m²) during harmonization.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
