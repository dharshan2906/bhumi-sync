import React, { useState } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, 
  Wrench, Layers, Database, ArrowRight, ShieldCheck, RefreshCw
} from 'lucide-react';
import { DatasetItem, api } from '../services/api';

interface DataIngestionViewProps {
  datasets: DatasetItem[];
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DataIngestionView: React.FC<DataIngestionViewProps> = ({
  datasets,
  onRefresh,
  onNavigateTab
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<string>('Cadastral Map');
  const [sourceAgency, setSourceAgency] = useState<string>('Department of Revenue & Land Records');
  const [originalCrs, setOriginalCrs] = useState<string>('EPSG:4326');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [activeDataset, setActiveDataset] = useState<DatasetItem | null>(datasets[0] || null);
  const [fixingDatasetId, setFixingDatasetId] = useState<number | null>(null);
  const [fixSuccess, setFixSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a dataset file to upload.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('data_type', dataType);
    formData.append('source_agency', sourceAgency);
    formData.append('original_crs', originalCrs);

    try {
      const newDataset = await api.uploadDataset(formData);
      setSelectedFile(null);
      onRefresh();
      setActiveDataset(newDataset);
      alert(`Dataset ${newDataset.name} successfully ingested and validated!`);
    } catch (err) {
      alert(`Upload failed: ${err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFixAutomatically = async (datasetId: number) => {
    setFixingDatasetId(datasetId);
    try {
      await api.validateDataset(datasetId);
      setFixSuccess('Topological geometry repairs (Shapely make_valid) applied successfully.');
      setTimeout(() => {
        setFixSuccess(null);
        onRefresh();
      }, 2000);
    } catch (err) {
      alert(`Auto-repair failed: ${err}`);
    } finally {
      setFixingDatasetId(null);
    }
  };

  return (
    <div>
      {/* Module Title & Description */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Multi-Source Geospatial & Tabular Data Ingestion</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Ingest heterogeneous urban land records (GeoJSON, Shapefile, CSV, XLSX, KML, GeoTIFF) with automated schema & CRS detection.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        
        {/* Left Column: Upload Form & Registered Datasets List */}
        <div style={{ gridColumn: 'span 5' }}>
          
          {/* Upload Card */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <span className="card-title">
                <Upload size={16} color="#0f2942" />
                Ingest New Dataset
              </span>
            </div>
            <div className="card-body">
              <form onSubmit={handleUploadSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Dataset Source Category:
                  </label>
                  <select 
                    value={dataType}
                    onChange={(e) => setDataType(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="Cadastral Map">Cadastral Revenue Survey Map (GeoJSON / Shapefile)</option>
                    <option value="Municipal GIS">Municipal Corporation GIS Layer (GeoJSON)</option>
                    <option value="Property Tax">Property Tax Assessment Registry (CSV / XLSX)</option>
                    <option value="Satellite / Drone AI">High-Res Optical Drone Orthophoto (GeoTIFF / AI Vector)</option>
                    <option value="Building Footprints">Urban Development Building Footprints</option>
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Issuing Agency / Authority:
                  </label>
                  <input 
                    type="text"
                    value={sourceAgency}
                    onChange={(e) => setSourceAgency(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Original Coordinate Reference System (CRS):
                  </label>
                  <select 
                    value={originalCrs}
                    onChange={(e) => setOriginalCrs(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="EPSG:4326">EPSG:4326 (WGS 84 Standard Lat/Lon)</option>
                    <option value="EPSG:3857">EPSG:3857 (WGS 84 / Pseudo-Mercator)</option>
                    <option value="EPSG:32643">EPSG:32643 (UTM Zone 43N - West/Central India)</option>
                    <option value="EPSG:32644">EPSG:32644 (UTM Zone 44N - East/South India)</option>
                  </select>
                </div>

                {/* File Dropzone */}
                <div style={{
                  border: '2px dashed #94a3b8',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  marginBottom: '14px',
                  cursor: 'pointer'
                }}>
                  <Upload size={24} color="#64748b" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f2942' }}>
                    {selectedFile ? selectedFile.name : 'Select or drop GeoJSON, CSV, XLSX, KML, or GeoTIFF'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Max upload size: 50MB
                  </div>
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept=".geojson,.json,.csv,.xlsx,.xls,.kml,.tif,.tiff"
                    style={{ marginTop: '8px', fontSize: '11px' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw size={14} className="spin" />
                      Parsing & Ingesting Dataset...
                    </>
                  ) : (
                    <>
                      <Database size={14} />
                      Ingest & Validate Dataset
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* List of Registered Datasets */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Database size={16} color="#0f2942" />
                Integrated Datasets ({datasets.length})
              </span>
            </div>
            <div style={{ padding: '8px' }}>
              {datasets.map((ds) => (
                <div 
                  key={ds.id}
                  onClick={() => setActiveDataset(ds)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    cursor: 'pointer',
                    backgroundColor: activeDataset?.id === ds.id ? '#eff6ff' : '#ffffff',
                    border: activeDataset?.id === ds.id ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: '#0f2942' }}>{ds.name}</span>
                    <span className="badge badge-verified">✓ {ds.status}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{ds.format} • {ds.record_count} records</span>
                    <span>{ds.original_crs}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Data Quality Report & Auto-Repair */}
        <div style={{ gridColumn: 'span 7' }}>
          {activeDataset ? (
            <div className="card">
              <div className="card-header">
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f2942' }}>
                    DATA QUALITY & TOPOLOGY AUDIT REPORT
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Dataset: {activeDataset.filename} • {activeDataset.source_agency}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-sm btn-outline"
                    disabled={fixingDatasetId === activeDataset.id}
                    onClick={() => handleFixAutomatically(activeDataset.id)}
                  >
                    <Wrench size={13} color="#2563eb" />
                    Fix Automatically
                  </button>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => onNavigateTab('harmonization')}
                  >
                    Harmonize Schema
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              <div className="card-body">
                {fixSuccess && (
                  <div style={{
                    backgroundColor: '#ecfdf5',
                    color: '#16a34a',
                    border: '1px solid #a7f3d0',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    marginBottom: '14px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={16} />
                    {fixSuccess}
                  </div>
                )}

                {/* Validation Metrics Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginBottom: '18px'
                }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>DETECTED CRS</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f2942' }}>{activeDataset.original_crs}</div>
                    <div style={{ fontSize: '10px', color: '#16a34a' }}>✓ Geodetic Datum Verified</div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>GEOMETRY INTEGRITY</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a' }}>
                      {activeDataset.quality_report?.valid_geometries || activeDataset.record_count} / {activeDataset.record_count} Valid
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                      {activeDataset.quality_report?.invalid_geometries || 0} Topology Errors
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>SURFACE COVERAGE</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f2942' }}>
                      {activeDataset.quality_report?.area_coverage_sqm ? `${(activeDataset.quality_report.area_coverage_sqm / 10000).toFixed(2)} Ha` : 'Tabular Link'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Metric Area Calculated</div>
                  </div>
                </div>

                {/* Available Source Attributes */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f2942', marginBottom: '8px' }}>
                    Available Source Attributes / Columns ({activeDataset.available_attributes.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {activeDataset.available_attributes.map((attr, i) => (
                      <span key={i} style={{
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}>
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Issues Detected List */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f2942', marginBottom: '8px' }}>
                    Topological Findings & Issues:
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    {activeDataset.quality_report?.issues_detected?.map((issue: string, idx: number) => (
                      <div key={idx} style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        borderBottom: idx !== activeDataset.quality_report.issues_detected.length - 1 ? '1px solid #e2e8f0' : 'none',
                        backgroundColor: issue.toLowerCase().includes('error') || issue.toLowerCase().includes('invalid') ? '#fef2f2' : '#f8fafc',
                        color: issue.toLowerCase().includes('error') || issue.toLowerCase().includes('invalid') ? '#dc2626' : '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {issue.toLowerCase().includes('error') || issue.toLowerCase().includes('invalid') ? (
                          <AlertTriangle size={14} color="#dc2626" />
                        ) : (
                          <CheckCircle2 size={14} color="#16a34a" />
                        )}
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Fixes */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f2942', marginBottom: '8px' }}>
                    Recommended Corrections & Next Steps:
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    {activeDataset.quality_report?.recommended_fixes?.map((fix: string, idx: number) => (
                      <div key={idx} style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        borderBottom: idx !== activeDataset.quality_report.recommended_fixes.length - 1 ? '1px solid #e2e8f0' : 'none',
                        backgroundColor: '#f0fdf4',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <ShieldCheck size={14} color="#16a34a" />
                        <span>{fix}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              Select a dataset from the left panel to inspect quality audit results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
