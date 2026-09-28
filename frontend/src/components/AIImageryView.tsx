import React, { useState, useEffect } from 'react';
import { 
  Cpu, Eye, CheckCircle2, AlertTriangle, 
  Layers, ArrowRight, Sparkles, RefreshCw, Calendar, ShieldCheck
} from 'lucide-react';
import { BuildingItem, ChangeItem, api } from '../services/api';

interface AIImageryViewProps {
  onNavigateTab: (tab: string) => void;
}

export const AIImageryView: React.FC<AIImageryViewProps> = ({
  onNavigateTab
}) => {
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [pipelineSuccess, setPipelineSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bldgs, chgs] = await Promise.all([
        api.getDetectedBuildings(false),
        api.getTemporalChanges()
      ]);
      setBuildings(bldgs);
      setChanges(chgs);
    } catch (err) {
      console.error('Failed to load AI imagery data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunVisionScan = async () => {
    setIsRunningPipeline(true);
    try {
      const res = await api.runVisionPipeline("Ward 12 - Indira Nagar");
      setPipelineSuccess(`AI Segmentation Scan Completed: ${res.buildings_detected} new structures analyzed.`);
      setTimeout(() => setPipelineSuccess(null), 3000);
      fetchData();
    } catch (err) {
      alert(`AI scan failed: ${err}`);
    } finally {
      setIsRunningPipeline(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h2>AI Imagery Analysis & Dual-Epoch Temporal Change Detection</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Automated building footprint segmentation (YOLO-Geo + U-Net) and comparative change detection between 2021 Baseline and 2026 Drone Ortho-Mosaics.
        </p>
      </div>

      {/* Governance & Disclaimer Banner */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} color="#0f2942" />
          <div style={{ fontSize: '12px', color: '#334155' }}>
            <b>Statutory Governance Protocol:</b> All computer vision detections and spectral change indices are decision-support indicators and require final field verification by the responsible revenue officer.
          </div>
        </div>

        <button 
          className="btn btn-primary"
          disabled={isRunningPipeline}
          onClick={handleRunVisionScan}
        >
          {isRunningPipeline ? (
            <>
              <RefreshCw size={14} className="spin" />
              Scanning Ortho-Mosaics...
            </>
          ) : (
            <>
              <Cpu size={14} />
              Run AI Segmentation Scan
            </>
          )}
        </button>
      </div>

      {pipelineSuccess && (
        <div style={{
          backgroundColor: '#ecfdf5',
          color: '#16a34a',
          border: '1px solid #a7f3d0',
          borderRadius: '6px',
          padding: '10px 14px',
          marginBottom: '16px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          {pipelineSuccess}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        
        {/* Left Column: AI Detected Building Footprints */}
        <div style={{ gridColumn: 'span 7' }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Cpu size={16} color="#0f2942" />
                Detected Building Footprints ({buildings.length})
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Resolution: 0.3m GSD • Orthorectified
              </span>
            </div>

            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Structure Code</th>
                    <th>Footprint Area</th>
                    <th>Est. Height / Floors</th>
                    <th>Confidence</th>
                    <th>Encroachment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        Loading AI building footprints...
                      </td>
                    </tr>
                  ) : (
                    buildings.slice(0, 15).map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 700, color: '#0f2942', fontFamily: 'monospace' }}>
                          {b.building_code}
                        </td>
                        <td>{b.area_sqm} m²</td>
                        <td>{b.height_m}m ({b.floors} Floors)</td>
                        <td>
                          <b style={{ color: '#16a34a' }}>{b.confidence}%</b>
                        </td>
                        <td>
                          {b.is_encroaching ? (
                            <span className="badge badge-conflict">
                              ⚠ Encroachment: {b.encroachment_area_sqm} m²
                            </span>
                          ) : (
                            <span className="badge badge-verified">
                              ✓ Inside Boundary
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Dual-Epoch Temporal Change Detection */}
        <div style={{ gridColumn: 'span 5' }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Calendar size={16} color="#7c3aed" />
                Temporal Change Detection (2021 → 2026)
              </span>
              <span className="badge badge-neutral">Normalized NDBI Surge</span>
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '16px'
              }}>
                <div style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>EPOCH 1 (BASELINE)</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f2942' }}>2021 Survey Map</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Vacant / Agricultural Register</div>
                </div>

                <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '10px', color: '#1d4ed8', fontWeight: 700 }}>EPOCH 2 (CURRENT)</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1d4ed8' }}>2026 Drone Ortho</div>
                  <div style={{ fontSize: '10px', color: '#1d4ed8' }}>Active Physical Construction</div>
                </div>
              </div>

              {changes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '12px' }}>
                  No unrecorded structural land-use changes detected.
                </div>
              ) : (
                changes.map((chg) => (
                  <div key={chg.id} style={{
                    border: '1px solid #ddd6fe',
                    backgroundColor: '#f5f3ff',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: '#6d28d9', fontSize: '12px' }}>
                        {chg.change_type.replace(/_/g, ' ')}
                      </span>
                      <span className="badge badge-review">AI Conf: {chg.confidence}%</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#4c1d95', marginBottom: '4px' }}>
                      <b>Historical Record:</b> {chg.previous_land_use}<br/>
                      <b>Current Detected Reality:</b> {chg.current_detected_use} (+{chg.change_area_sqm} m² Footprint)
                    </div>
                    <div style={{ fontSize: '10px', color: '#6b21a8' }}>
                      Action: Site visit recommended to verify building permit & tax mutation.
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
