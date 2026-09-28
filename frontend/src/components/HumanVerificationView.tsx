import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, AlertTriangle, ShieldCheck, 
  Eye, FileText, Check, X, RefreshCw, ArrowRight
} from 'lucide-react';
import { ParcelListItem, ParcelDigitalTwin, api } from '../services/api';

interface HumanVerificationViewProps {
  onSelectParcel: (parcel: ParcelDigitalTwin) => void;
  onRefresh: () => void;
}

export const HumanVerificationView: React.FC<HumanVerificationViewProps> = ({
  onSelectParcel,
  onRefresh
}) => {
  const [parcels, setParcels] = useState<ParcelListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('PENDING');

  // Quick Action Modal State
  const [selectedParcelId, setSelectedParcelId] = useState<number | null>(null);
  const [selectedParcelCode, setSelectedParcelCode] = useState<string>('');
  const [actionType, setActionType] = useState<string>('VERIFIED');
  const [officerNote, setOfficerNote] = useState<string>('');
  const [resolutionStrategy, setResolutionStrategy] = useState<string>('ADOPT_HARMONIZED_BOUNDARY');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await api.getParcels({
        status: activeFilter,
        limit: 100
      });
      setParcels(data);
    } catch (err) {
      console.error('Failed to load verification queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [activeFilter]);

  const handleOpenActionModal = (p: ParcelListItem, action: string) => {
    setSelectedParcelId(p.id);
    setSelectedParcelCode(p.parcel_id);
    setActionType(action);
    setOfficerNote(`Verification decision executed by Shri A. K. Sharma following multi-source spatial review.`);
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcelId) return;

    setIsSubmitting(true);
    try {
      await api.verifyParcel(selectedParcelId, {
        action: actionType,
        officer_name: "Shri A. K. Sharma (Senior GIS Officer)",
        decision_notes: officerNote,
        resolution_strategy: resolutionStrategy
      });
      alert(`Parcel ${selectedParcelCode} updated to ${actionType}. Audit log committed.`);
      setSelectedParcelId(null);
      fetchQueue();
      onRefresh();
    } catch (err) {
      alert(`Verification action failed: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInspect = async (parcelId: number) => {
    try {
      const dt = await api.getParcelDigitalTwin(parcelId);
      onSelectParcel(dt);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Human-in-the-Loop Officer Verification & Decision Workflow</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Authorized revenue officer review queue. Affirm harmonized boundaries, reconcile discrepancies, or commission field re-surveys.
        </p>
      </div>

      {/* Verification Queue Filters */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'PENDING', label: 'Pending Verification', icon: Clock },
              { id: 'UNDER_REVIEW', label: 'Under Active Review', icon: AlertTriangle },
              { id: 'VERIFIED', label: 'Verified & Affirmed', icon: CheckCircle2 },
              { id: 'REJECTED', label: 'Rejected Records', icon: X }
            ].map(f => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  className={`btn btn-sm ${activeFilter === f.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveFilter(f.id)}
                >
                  <Icon size={13} />
                  {f.label}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '12px', color: '#64748b' }}>
            <b>{parcels.length}</b> parcels in selected queue
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <ShieldCheck size={16} color="#0f2942" />
            Officer Decision Action List
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Statutory standard: All determinations are logged to an immutable audit trail
          </span>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Parcel ID</th>
                <th>Survey #</th>
                <th>Ward / Zone</th>
                <th>Recorded Area</th>
                <th>GIS Area</th>
                <th>Variance</th>
                <th>Confidence</th>
                <th>Active Conflicts</th>
                <th>Officer Decisions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Loading Verification Queue...
                  </td>
                </tr>
              ) : parcels.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#16a34a' }}>
                    ✓ No parcels pending in this verification queue.
                  </td>
                </tr>
              ) : (
                parcels.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: '#0f2942' }}>{p.parcel_id}</td>
                    <td style={{ fontWeight: 600 }}>{p.survey_number}</td>
                    <td>{p.ward}</td>
                    <td>{p.recorded_area} m²</td>
                    <td>{p.gis_area} m²</td>
                    <td>
                      <span style={{ color: p.area_difference_pct > 5 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                        {p.area_difference_pct}%
                      </span>
                    </td>
                    <td>
                      <b style={{ color: p.confidence >= 90 ? '#16a34a' : '#d97706' }}>{p.confidence}%</b>
                    </td>
                    <td>
                      {p.conflict_count > 0 ? (
                        <span className="badge badge-conflict">{p.conflict_count} Conflicts</span>
                      ) : (
                        <span className="badge badge-verified">Clean</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleInspect(p.id)}
                        >
                          <Eye size={12} />
                          Inspect
                        </button>
                        {activeFilter !== 'VERIFIED' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleOpenActionModal(p, 'VERIFIED')}
                          >
                            <Check size={12} />
                            Verify
                          </button>
                        )}
                        {activeFilter !== 'REJECTED' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleOpenActionModal(p, 'REJECTED')}
                          >
                            <X size={12} />
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Officer Decision Confirmation Modal */}
      {selectedParcelId && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <span className="modal-title">
                <ShieldCheck size={18} />
                Confirm Verification Decision: Parcel {selectedParcelCode}
              </span>
              <button onClick={() => setSelectedParcelId(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleActionSubmit}>
              <div className="modal-body">
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Target Verification Action:
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 700 }}
                  >
                    <option value="VERIFIED">VERIFY & AFFIRM HARMONIZED RECORD</option>
                    <option value="UNDER_REVIEW">MARK FOR DETAILED FIELD INQUIRY</option>
                    <option value="REJECTED">REJECT PROPOSED HARMONIZATION</option>
                    <option value="NEEDS_MORE_DATA">REQUEST SUPPLEMENTARY DATA FROM MUNICIPALITY</option>
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Adopted Legal & Spatial Strategy:
                  </label>
                  <select
                    value={resolutionStrategy}
                    onChange={(e) => setResolutionStrategy(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="ADOPT_HARMONIZED_BOUNDARY">Adopt Multi-Source Harmonized Composite Boundary</option>
                    <option value="AFFIRM_REVENUE_CADASTRAL">Affirm Historical Revenue Survey (Datum 2018)</option>
                    <option value="ADOPT_DRONE_ORTHOPHOTO">Adopt High-Res Drone Ortho-Mosaic Footprint</option>
                    <option value="REQUEST_GROUND_DGPS">Order DGPS / Total Station Ground Survey</option>
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Officer Endorsement Remarks:
                  </label>
                  <textarea
                    rows={3}
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSelectedParcelId(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  <Check size={14} />
                  Record Statutory Determination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
