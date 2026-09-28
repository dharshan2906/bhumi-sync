import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, 
  Eye, Filter, Check, X, ArrowRight, ShieldCheck
} from 'lucide-react';
import { ConflictItem, api, ParcelDigitalTwin } from '../services/api';

interface ConflictResolutionViewProps {
  onSelectParcel: (parcel: ParcelDigitalTwin) => void;
  onNavigateTab: (tab: string) => void;
}

export const ConflictResolutionView: React.FC<ConflictResolutionViewProps> = ({
  onSelectParcel,
  onNavigateTab
}) => {
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Resolution Modal State
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);
  const [resolutionStrategy, setResolutionStrategy] = useState<string>('OFFICIAL_SURVEY_AFFIRMED');
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchConflicts = async () => {
    setLoading(true);
    try {
      const data = await api.getConflicts({
        severity: severityFilter,
        conflict_type: typeFilter,
        status: statusFilter
      });
      setConflicts(data);
    } catch (err) {
      console.error('Failed to load conflicts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, [severityFilter, typeFilter, statusFilter]);

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConflict) return;

    setIsSubmitting(true);
    try {
      await api.resolveConflict(selectedConflict.id, {
        status: "RESOLVED",
        resolution_strategy: resolutionStrategy,
        resolved_by: "Shri A. K. Sharma (GIS Officer)",
        notes: officerNotes || "Discrepancy reconciled against physical field survey records."
      });
      alert(`Conflict ${selectedConflict.conflict_code} marked as RESOLVED.`);
      setSelectedConflict(null);
      fetchConflicts();
    } catch (err) {
      alert(`Resolution failed: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInspectParcel = async (parcelId: number) => {
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
        <h2>Intelligent Conflict Detection & Resolution Engine</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Automated multi-criteria detection of boundary shifts, area discrepancies, structural encroachments, and land-use divergences.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'block' }}>SEVERITY:</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical (High Priority)</option>
                <option value="REVIEW_REQUIRED">Review Required</option>
                <option value="MINOR">Minor Divergence</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'block' }}>DISCREPANCY TYPE:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="ALL">All Types (9 Categories)</option>
                <option value="BOUNDARY_MISMATCH">Boundary Mismatch</option>
                <option value="AREA_MISMATCH">Area Mismatch (&gt;5%)</option>
                <option value="BUILDING_OUTSIDE_PARCEL">Building Outside Parcel / Encroachment</option>
                <option value="PARCEL_OVERLAP">Parcel Overlap</option>
                <option value="LAND_USE_INCONSISTENCY">Land-Use Inconsistency</option>
                <option value="DUPLICATE_PARCEL">Duplicate Record</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'block' }}>STATUS:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open (Action Required)</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DISMISSED">Dismissed</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Showing <b>{conflicts.length}</b> flagged discrepancies
          </div>
        </div>
      </div>

      {/* Conflicts Register Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <AlertTriangle size={16} color="#dc2626" />
            Detected Land Record Conflicts Register
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Click 'Resolve / Action' to record an authorized officer decision
          </span>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Conflict ID</th>
                <th>Conflict Type</th>
                <th>Severity</th>
                <th>Recorded vs GIS Value</th>
                <th>Displacement / Metric</th>
                <th>AI / GIS Explanation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Loading Conflict Register...
                  </td>
                </tr>
              ) : conflicts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#16a34a' }}>
                    ✓ No active conflicts matching the selected filters.
                  </td>
                </tr>
              ) : (
                conflicts.map((c) => {
                  const isCritical = c.severity === 'CRITICAL';
                  const isResolved = c.status === 'RESOLVED';
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: '#0f2942', fontFamily: 'monospace' }}>
                        {c.conflict_code}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {c.conflict_type.replace(/_/g, ' ')}
                      </td>
                      <td>
                        <span className={`badge ${isCritical ? 'badge-critical' : 'badge-review'}`}>
                          {c.severity}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '11px' }}>
                          <span style={{ color: '#64748b' }}>Rec:</span> <b>{c.recorded_value || 'N/A'}</b><br/>
                          <span style={{ color: '#64748b' }}>GIS:</span> <b>{c.gis_value || 'N/A'}</b>
                        </div>
                      </td>
                      <td style={{ color: '#dc2626', fontWeight: 600 }}>
                        {c.difference_metric || `${c.displacement_m}m`}
                      </td>
                      <td style={{ maxWidth: '300px', fontSize: '11px', color: '#334155' }}>
                        {c.explanation}
                      </td>
                      <td>
                        <span className={`badge ${isResolved ? 'badge-verified' : 'badge-pending'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleInspectParcel(c.parcel_id)}
                            title="Inspect Parcel Digital Twin"
                          >
                            <Eye size={12} />
                            Inspect
                          </button>
                          {!isResolved && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => setSelectedConflict(c)}
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conflict Resolution Action Modal */}
      {selectedConflict && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <span className="modal-title">
                <ShieldCheck size={18} />
                Officer Conflict Resolution: {selectedConflict.conflict_code}
              </span>
              <button onClick={() => setSelectedConflict(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleResolveSubmit}>
              <div className="modal-body">
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '14px',
                  fontSize: '12px',
                  color: '#7f1d1d'
                }}>
                  <b>Issue Type:</b> {selectedConflict.conflict_type.replace(/_/g, ' ')}<br/>
                  <b>Explanation:</b> {selectedConflict.explanation}
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Statutory Resolution Strategy:
                  </label>
                  <select
                    value={resolutionStrategy}
                    onChange={(e) => setResolutionStrategy(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    <option value="OFFICIAL_SURVEY_AFFIRMED">Affirm Official Revenue Survey (Overrule Secondary GIS)</option>
                    <option value="ADOPT_DRONE_ORTHOPHOTO">Adopt High-Res Drone Orthophoto Boundary</option>
                    <option value="MUTATION_RECONCILED">Update Registry Ledger (Area Variance Approved)</option>
                    <option value="COMMISSION_FIELD_SURVEY">Refer to Tehsildar / ETS Field Survey</option>
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Officer Justification / File Reference:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter official rationale, document reference number, or field survey date..."
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSelectedConflict(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                  <Check size={14} />
                  Affirm & Resolve Discrepancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
