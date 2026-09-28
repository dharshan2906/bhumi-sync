import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ShieldCheck, CheckCircle2, 
  AlertTriangle, Clock, Eye, Sparkles, Sliders, ArrowRight
} from 'lucide-react';
import { ParcelListItem, ParcelDigitalTwin, api } from '../services/api';

interface ParcelIntelligenceViewProps {
  onSelectParcel: (parcel: ParcelDigitalTwin) => void;
  onNavigateTab: (tab: string) => void;
}

export const ParcelIntelligenceView: React.FC<ParcelIntelligenceViewProps> = ({
  onSelectParcel,
  onNavigateTab
}) => {
  const [parcels, setParcels] = useState<ParcelListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wardFilter, setWardFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Interactive Match Simulator State
  const [simSurveyA, setSimSurveyA] = useState<string>('104/2');
  const [simSurveyB, setSimSurveyB] = useState<string>('104-02');
  const [simAreaA, setSimAreaA] = useState<number>(1250);
  const [simAreaB, setSimAreaB] = useState<number>(1184);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [matchingInProgress, setMatchingInProgress] = useState<boolean>(false);

  const fetchParcels = async () => {
    setLoading(true);
    try {
      const data = await api.getParcels({
        q: searchQuery,
        ward: wardFilter,
        status: statusFilter,
        limit: 100
      });
      setParcels(data);
    } catch (err) {
      console.error('Failed to fetch parcels', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, [wardFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchParcels();
  };

  const handleRunMatchSimulator = async () => {
    setMatchingInProgress(true);
    try {
      // Mock polygon geometry coordinates
      const geomA = {
        type: "Polygon",
        coordinates: [[[73.8520, 18.5280], [73.8524, 18.5280], [73.8524, 18.5283], [73.8520, 18.5283], [73.8520, 18.5280]]]
      };
      const geomB = {
        type: "Polygon",
        coordinates: [[[73.85204, 18.52803], [73.85244, 18.52803], [73.85244, 18.52833], [73.85204, 18.52833], [73.85204, 18.52803]]]
      };

      const result = await api.matchParcels(
        { parcel_id: "P-102", survey_number: simSurveyA, recorded_area: simAreaA, geometry: geomA },
        { parcel_id: "P-102", survey_number: simSurveyB, recorded_area: simAreaB, geometry: geomB }
      );
      setMatchResult(result);
    } catch (err) {
      alert(`Matching simulation failed: ${err}`);
    } finally {
      setMatchingInProgress(false);
    }
  };

  const handleRowClick = async (parcelId: number) => {
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
        <h2>Parcel Intelligence & Probabilistic Matching Engine</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Explore digital twin land parcels and test multi-signal matching algorithms across Cadastral, Municipal, and Drone datasets.
        </p>
      </div>

      {/* Multi-Signal Matching Simulator Tool Card */}
      <div className="card" style={{ marginBottom: '20px', border: '1px solid #bfdbfe', background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)' }}>
        <div className="card-header" style={{ backgroundColor: 'transparent' }}>
          <span className="card-title" style={{ color: '#0369a1' }}>
            <Sparkles size={16} color="#0284c7" />
            Live Multi-Signal Match & Confidence Calculator
          </span>
          <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 600 }}>
            Decision-Support Probabilistic Scorer
          </span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px', alignItems: 'center' }}>
            
            {/* Input Record A (Cadastral) */}
            <div style={{ gridColumn: 'span 3', backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f2942', marginBottom: '8px' }}>
                RECORD A (Cadastral Revenue)
              </div>
              <div style={{ marginBottom: '6px' }}>
                <label style={{ fontSize: '10px', color: '#64748b' }}>Survey No:</label>
                <input 
                  type="text" 
                  value={simSurveyA} 
                  onChange={(e) => setSimSurveyA(e.target.value)}
                  style={{ width: '100%', padding: '4px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#64748b' }}>Recorded Area (m²):</label>
                <input 
                  type="number" 
                  value={simAreaA} 
                  onChange={(e) => setSimAreaA(Number(e.target.value))}
                  style={{ width: '100%', padding: '4px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            {/* Input Record B (Municipal GIS) */}
            <div style={{ gridColumn: 'span 3', backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f2942', marginBottom: '8px' }}>
                RECORD B (Municipal GIS)
              </div>
              <div style={{ marginBottom: '6px' }}>
                <label style={{ fontSize: '10px', color: '#64748b' }}>Survey No:</label>
                <input 
                  type="text" 
                  value={simSurveyB} 
                  onChange={(e) => setSimSurveyB(e.target.value)}
                  style={{ width: '100%', padding: '4px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#64748b' }}>Calculated Area (m²):</label>
                <input 
                  type="number" 
                  value={simAreaB} 
                  onChange={(e) => setSimAreaB(Number(e.target.value))}
                  style={{ width: '100%', padding: '4px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            {/* Action Trigger */}
            <div style={{ gridColumn: 'span 2', textAlign: 'center' }}>
              <button 
                className="btn btn-primary"
                onClick={handleRunMatchSimulator}
                disabled={matchingInProgress}
                style={{ width: '100%', padding: '10px' }}
              >
                {matchingInProgress ? 'Evaluating...' : 'Compute Confidence'}
              </button>
            </div>

            {/* Matching Result Breakdown */}
            <div style={{ gridColumn: 'span 4', backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              {matchResult ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f2942' }}>Data Matching Confidence:</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: matchResult.overall_confidence >= 85 ? '#16a34a' : '#d97706' }}>
                      {matchResult.overall_confidence}%
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px' }}>
                    Status: <b style={{ color: '#0f2942' }}>{matchResult.match_status}</b> • Centroid Offset: <b>{matchResult.signals?.centroid_distance_m}m</b>
                  </div>
                  <div style={{ fontSize: '10px', color: '#334155' }}>
                    {matchResult.explanation?.factors?.map((f: string, i: number) => (
                      <div key={i}>• {f}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', padding: '10px' }}>
                  Click 'Compute Confidence' to run multi-signal evaluation across spatial & attribute vectors.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Filter by Parcel ID (e.g., P-102), Survey #, Owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '7px 12px 7px 32px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
            <button type="submit" className="btn btn-outline">
              Filter
            </button>
          </form>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            >
              <option value="ALL">All Urban Wards</option>
              <option value="Ward 12 - Indira Nagar">Ward 12 - Indira Nagar</option>
              <option value="Ward 14 - Shivaji Nagar">Ward 14 - Shivaji Nagar</option>
              <option value="Ward 17 - Cyber Tech Zone">Ward 17 - Cyber Tech Zone</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            >
              <option value="ALL">All Verification States</option>
              <option value="VERIFIED">Verified & Affirmed</option>
              <option value="PENDING">Pending Verification</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Parcels Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <ShieldCheck size={16} color="#0f2942" />
            Land Record Parcel Registry ({parcels.length} Records)
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Click any row to open the complete Digital Twin</span>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Parcel ID</th>
                <th>Survey / Khasra #</th>
                <th>Ward / Zone</th>
                <th>Recorded Area</th>
                <th>GIS Area</th>
                <th>Area Variance</th>
                <th>Land Use</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Discrepancies</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Loading Land Record Digital Twins...
                  </td>
                </tr>
              ) : parcels.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No parcels match the search query.
                  </td>
                </tr>
              ) : (
                parcels.map((p) => {
                  const isVerified = p.verification_status === 'VERIFIED';
                  const hasConflicts = p.conflict_count > 0;
                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => handleRowClick(p.id)}
                      style={{ cursor: 'pointer' }}
                    >
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
                      <td>{p.land_use}</td>
                      <td>
                        <b style={{ color: p.confidence >= 90 ? '#16a34a' : '#d97706' }}>{p.confidence}%</b>
                      </td>
                      <td>
                        {isVerified ? (
                          <span className="badge badge-verified">Verified</span>
                        ) : hasConflicts ? (
                          <span className="badge badge-conflict">Review Needed</span>
                        ) : (
                          <span className="badge badge-pending">{p.verification_status}</span>
                        )}
                      </td>
                      <td>
                        {p.conflict_count > 0 ? (
                          <span className="badge badge-conflict">{p.conflict_count} Flags</span>
                        ) : (
                          <span className="badge badge-verified">0 Issues</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(p.id);
                          }}
                        >
                          <Eye size={12} />
                          Inspect Twin
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
