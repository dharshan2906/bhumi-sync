import React, { useState } from 'react';
import { 
  X, CheckCircle2, AlertTriangle, ShieldCheck, 
  Layers, Building2, Clock, SplitSquareVertical, 
  MapPin, Check, FileCheck, HelpCircle, Send
} from 'lucide-react';
import { ParcelDigitalTwin, api } from '../services/api';

interface DigitalTwinDrawerProps {
  parcel: ParcelDigitalTwin | null;
  onClose: () => void;
  onRefresh: () => void;
  onOpenComparison: (parcel: ParcelDigitalTwin) => void;
}

export const DigitalTwinDrawer: React.FC<DigitalTwinDrawerProps> = ({
  parcel,
  onClose,
  onRefresh,
  onOpenComparison
}) => {
  if (!parcel) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'conflicts' | 'buildings' | 'verify'>('overview');
  const [officerNote, setOfficerNote] = useState<string>('');
  const [resolutionStrategy, setResolutionStrategy] = useState<string>('ADOPT_HARMONIZED_BOUNDARY');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleVerifyAction = async (action: string) => {
    setIsSubmitting(true);
    try {
      await api.verifyParcel(parcel.id, {
        action: action,
        officer_name: "Shri A. K. Sharma (Chief Land Registrar)",
        decision_notes: officerNote || `Action ${action} executed by officer after multi-source inspection.`,
        resolution_strategy: resolutionStrategy
      });
      setActionSuccessMsg(`Parcel successfully updated to ${action}`);
      setTimeout(() => {
        setActionSuccessMsg(null);
        onRefresh();
      }, 1500);
    } catch (err) {
      alert(`Failed to execute verification: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVerified = parcel.verification_status === 'VERIFIED';
  const hasConflicts = parcel.conflicts.length > 0;

  return (
    <div style={{
      position: 'fixed',
      top: '90px',
      right: '20px',
      width: '460px',
      maxHeight: 'calc(100vh - 110px)',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid #cbd5e1',
      zIndex: 1500,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'slideInRight 0.2s ease-out'
    }}>
      {/* Drawer Header */}
      <div style={{
        backgroundColor: '#0f2942',
        color: '#ffffff',
        padding: '14px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#1e3a8a',
            border: '1px solid #38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8'
          }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.5px' }}>
              PARCEL DIGITAL TWIN: {parcel.parcel_id}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Survey No. {parcel.survey_number} • {parcel.ward}
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Quick Status Sub-header */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: '10px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>STATUS:</span>
          {isVerified ? (
            <span className="badge badge-verified">
              <CheckCircle2 size={12} />
              Verified & Affirmed
            </span>
          ) : hasConflicts ? (
            <span className="badge badge-conflict">
              <AlertTriangle size={12} />
              {parcel.conflicts.length} Active Conflicts
            </span>
          ) : (
            <span className="badge badge-pending">
              <Clock size={12} />
              {parcel.verification_status}
            </span>
          )}
        </div>

        <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f2942' }}>
          Confidence: <span style={{ color: parcel.confidence >= 90 ? '#16a34a' : '#d97706' }}>{parcel.confidence}%</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f1f5f9',
        fontSize: '11px',
        fontWeight: 600
      }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'sources', label: `Sources (${parcel.sources.length})` },
          { id: 'conflicts', label: `Conflicts (${parcel.conflicts.length})` },
          { id: 'buildings', label: `AI Vision (${parcel.buildings.length})` },
          { id: 'verify', label: 'Verification' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              flex: 1,
              padding: '8px 4px',
              border: 'none',
              background: activeTab === t.id ? '#ffffff' : 'transparent',
              color: activeTab === t.id ? '#0f2942' : '#64748b',
              borderBottom: activeTab === t.id ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === t.id ? 700 : 500
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Drawer Body Content */}
      <div style={{ padding: '16px 18px', overflowY: 'auto', flex: 1 }}>
        {actionSuccessMsg && (
          <div style={{
            backgroundColor: '#ecfdf5',
            color: '#16a34a',
            border: '1px solid #a7f3d0',
            borderRadius: '6px',
            padding: '8px 12px',
            marginBottom: '12px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={16} />
            {actionSuccessMsg}
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* Core Metrics Comparison Table */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '14px'
            }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>OFFICIAL RECORDED AREA</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f2942' }}>{parcel.recorded_area} m²</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>From Revenue Ledger</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>GIS CALCULATED AREA</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f2942' }}>{parcel.gis_area} m²</div>
                <div style={{ fontSize: '10px', color: parcel.area_difference_pct > 5 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                  Variance: {parcel.area_difference_pct}% ({Math.abs(parcel.recorded_area - parcel.gis_area).toFixed(1)} m²)
                </div>
              </div>
            </div>

            {/* General Information List */}
            <div style={{ fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', marginBottom: '14px' }}>
              <div style={{ display: 'flex', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <span style={{ width: '130px', color: '#64748b', fontWeight: 600 }}>Owner / Citizen Ref:</span>
                <span style={{ color: '#0f2942', fontWeight: 600 }}>{parcel.owner_reference}</span>
              </div>
              <div style={{ display: 'flex', padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ width: '130px', color: '#64748b', fontWeight: 600 }}>Property Tax ID:</span>
                <span style={{ color: '#0f2942' }}>{parcel.property_id || 'Not Assigned'}</span>
              </div>
              <div style={{ display: 'flex', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <span style={{ width: '130px', color: '#64748b', fontWeight: 600 }}>Zoning / Land Use:</span>
                <span style={{ color: '#0f2942' }}>{parcel.land_use}</span>
              </div>
              <div style={{ display: 'flex', padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ width: '130px', color: '#64748b', fontWeight: 600 }}>AI Detected Use:</span>
                <span style={{ color: parcel.land_use !== parcel.detected_land_use ? '#d97706' : '#0f2942', fontWeight: 600 }}>
                  {parcel.detected_land_use}
                </span>
              </div>
              <div style={{ display: 'flex', padding: '8px 12px' }}>
                <span style={{ width: '130px', color: '#64748b', fontWeight: 600 }}>Centroid Coordinates:</span>
                <span style={{ color: '#0f2942', fontFamily: 'monospace' }}>
                  {parcel.centroid_lat.toFixed(5)}°N, {parcel.centroid_lon.toFixed(5)}°E
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1 }}
                onClick={() => onOpenComparison(parcel)}
              >
                <SplitSquareVertical size={14} />
                Compare Sources Side-by-Side
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SOURCES LINEAGE */}
        {activeTab === 'sources' && (
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
              Heterogeneous datasets linked to this parcel geometry:
            </div>
            {parcel.sources.map((src) => (
              <div key={src.id} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '10px 12px',
                marginBottom: '10px',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#0f2942', fontSize: '12px' }}>{src.source_name}</span>
                  <span className="badge badge-neutral">{src.source_record_id || 'Linked'}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  <div><b>Recorded Survey #:</b> {src.source_survey_no || 'N/A'}</div>
                  <div><b>Registered Area:</b> {src.source_area ? `${src.source_area} m²` : 'Tabular Reference'}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: CONFLICTS & DISCREPANCIES */}
        {activeTab === 'conflicts' && (
          <div>
            {parcel.conflicts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 10px', color: '#16a34a' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, fontSize: '13px' }}>No Active Conflicts</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Cadastral and municipal records match ground reality.</div>
              </div>
            ) : (
              parcel.conflicts.map((conf) => (
                <div key={conf.id} style={{
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  marginBottom: '10px',
                  backgroundColor: '#fef2f2'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '12px' }}>{conf.conflict_type.replace(/_/g, ' ')}</span>
                    <span className="badge badge-conflict">{conf.severity}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#7f1d1d', marginBottom: '6px' }}>
                    {conf.explanation}
                  </div>
                  <div style={{ fontSize: '10px', color: '#991b1b', backgroundColor: '#fee2e2', padding: '4px 8px', borderRadius: '4px' }}>
                    <b>Displacement / Metric:</b> {conf.difference_metric || `${conf.displacement_m}m`}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: AI COMPUTER VISION & BUILDINGS */}
        {activeTab === 'buildings' && (
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
              Detected physical structures from high-res optical imagery (0.3m GSD):
            </div>
            {parcel.buildings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '12px' }}>
                No structures detected inside parcel bounding box (Open / Vacant Plot).
              </div>
            ) : (
              parcel.buildings.map((b) => (
                <div key={b.id} style={{
                  border: b.is_encroaching ? '1px solid #fecaca' : '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  marginBottom: '10px',
                  backgroundColor: b.is_encroaching ? '#fef2f2' : '#f8fafc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#0f2942', fontSize: '12px' }}>{b.building_code}</span>
                    <span className={`badge ${b.is_encroaching ? 'badge-conflict' : 'badge-verified'}`}>
                      {b.is_encroaching ? 'Encroachment Flag' : 'Inside Bounds'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    <div><b>Footprint Area:</b> {b.area_sqm} m² ({b.floors} Floors, ~{b.height_m}m Height)</div>
                    <div><b>AI Model Confidence:</b> {b.confidence}% (YOLO-Geo + U-Net)</div>
                    {b.is_encroaching && (
                      <div style={{ color: '#dc2626', fontWeight: 600, marginTop: '4px' }}>
                        ⚠ Encroachment Extent: {b.encroachment_area_sqm} m² outside registered plot boundary
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: HUMAN VERIFICATION WORKFLOW */}
        {activeTab === 'verify' && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f2942', marginBottom: '6px' }}>
              Statutory Officer Decision Support
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>
              Final affirmation requires review against spatial evidence.
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Resolution Strategy:
              </label>
              <select
                value={resolutionStrategy}
                onChange={(e) => setResolutionStrategy(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="ADOPT_HARMONIZED_BOUNDARY">Adopt Harmonized Unified Boundary (Recommended)</option>
                <option value="AFFIRM_REVENUE_CADASTRAL">Affirm Historical Revenue Cadastral Survey</option>
                <option value="ADOPT_DRONE_ORTHOPHOTO">Adopt High-Res Drone Ortho-Mosaic Footprint</option>
                <option value="REQUEST_FIELD_RE_SURVEY">Commission Physical ETS / DGPS Re-Survey</option>
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Officer Examination Remarks:
              </label>
              <textarea
                rows={3}
                placeholder="Enter field notes, survey reconciliation remarks, or justification..."
                value={officerNote}
                onChange={(e) => setOfficerNote(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-success" 
                style={{ flex: 1 }}
                disabled={isSubmitting}
                onClick={() => handleVerifyAction('VERIFIED')}
              >
                <CheckCircle2 size={14} />
                Verify & Affirm
              </button>
              <button 
                className="btn btn-danger" 
                style={{ flex: 1 }}
                disabled={isSubmitting}
                onClick={() => handleVerifyAction('REJECTED')}
              >
                <AlertTriangle size={14} />
                Reject Record
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
