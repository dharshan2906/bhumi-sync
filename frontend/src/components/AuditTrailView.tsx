import React, { useState, useEffect } from 'react';
import { 
  History, ShieldCheck, Filter, Search, 
  Calendar, ArrowRight, User, Terminal, Database, CheckCircle2
} from 'lucide-react';
import { AuditLogItem, api } from '../services/api';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs({
        module: moduleFilter
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter]);

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Statutory Immutable Audit Trail & Decision Lineage</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Cryptographically verifiable, time-stamped activity log documenting all data ingestion, CRS transforms, AI runs, and officer verifications.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>FILTER BY MODULE:</span>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            >
              <option value="ALL">All System Modules</option>
              <option value="INGESTION">Ingestion Engine</option>
              <option value="CRS_TRANSFORM">CRS & Coordinate Harmonization</option>
              <option value="CONFLICT">Conflict Detection</option>
              <option value="AI_VISION">AI Imagery & Change Detection</option>
              <option value="VERIFICATION">Officer Human Verification</option>
              <option value="REPORT">Reports & Exports</option>
            </select>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Total Audit Entries: <b>{logs.length}</b>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <History size={16} color="#0f2942" />
            System Event & Action Chronicle
          </span>
          <span className="badge badge-verified">
            <ShieldCheck size={12} />
            Append-Only Protected
          </span>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>User / Agent</th>
                <th>Module</th>
                <th>Action Executed</th>
                <th>Target Entity</th>
                <th>Action Details & Notes</th>
                <th>State Transition</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Loading Audit Ledger...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No audit records match the filter.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontSize: '11px', fontFamily: 'monospace', color: '#475569', whiteSpace: 'nowrap' }}>
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f2942', fontSize: '11px' }}>
                        {l.user_name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        {l.user_role} • {l.ip_address}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">
                        {l.module}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f2942', fontSize: '11px' }}>
                      {l.action}
                    </td>
                    <td>
                      <b style={{ color: '#2563eb', fontSize: '11px' }}>
                        {l.entity_type}: {l.entity_id || 'SYSTEM'}
                      </b>
                    </td>
                    <td style={{ fontSize: '11px', color: '#334155', maxWidth: '280px' }}>
                      {l.details}
                    </td>
                    <td>
                      {l.previous_state || l.new_state ? (
                        <div style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                          {l.previous_state && (
                            <span style={{ color: '#dc2626' }}>{JSON.stringify(l.previous_state)} → </span>
                          )}
                          {l.new_state && (
                            <span style={{ color: '#16a34a', fontWeight: 600 }}>{JSON.stringify(l.new_state)}</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '10px' }}>N/A</span>
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
  );
};
