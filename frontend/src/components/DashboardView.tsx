import React from 'react';
import { 
  Building, CheckCircle2, Clock, AlertTriangle, 
  Layers, ShieldAlert, Cpu, ArrowUpRight, Database, 
  MapPin, Sparkles, TrendingUp
} from 'lucide-react';
import { DashboardStats } from '../services/api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

interface DashboardViewProps {
  stats: DashboardStats | null;
  onNavigateTab: (tab: string) => void;
  onSelectWard: (ward: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onNavigateTab,
  onSelectWard
}) => {
  if (!stats) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: '#64748b' }}>Loading Land Record Intelligence Statistics...</div>
      </div>
    );
  }

  // Verification Status Doughnut Chart Data
  const verificationChartData = {
    labels: ['Verified & Affirmed', 'Pending Review', 'Under Field Inquiry', 'Rejected'],
    datasets: [
      {
        data: [
          stats.verified_parcels,
          stats.pending_verification,
          stats.under_review_parcels,
          stats.rejected_parcels
        ],
        backgroundColor: ['#16a34a', '#2563eb', '#d97706', '#dc2626'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  // Conflict Breakdown Bar Chart
  const conflictChartData = {
    labels: stats.conflict_distribution.map(c => c.type),
    datasets: [
      {
        label: 'Active Discrepancies',
        data: stats.conflict_distribution.map(c => c.count),
        backgroundColor: '#ef4444',
        borderRadius: 4,
      },
    ],
  };

  // Confidence Tiers Chart
  const confidenceChartData = {
    labels: ['High Confidence (>90%)', 'Medium Concordance (75-89%)', 'Low / Ambiguous (<75%)'],
    datasets: [
      {
        label: 'Parcels',
        data: [
          stats.confidence_tiers?.high_90_plus || 180,
          stats.confidence_tiers?.medium_75_89 || 42,
          stats.confidence_tiers?.low_below_75 || 14
        ],
        backgroundColor: ['#16a34a', '#f59e0b', '#dc2626'],
        borderRadius: 4,
      },
    ],
  };

  return (
    <div>
      {/* Synthetic Demo Notification Banner */}
      <div className="demo-banner">
        <div className="demo-banner-title">
          <Sparkles size={16} />
          <span>BHUMI-SYNC Multi-Source Land Harmonization Engine Active</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="demo-banner-tag">DEMO / SYNTHETIC DATA</span>
          <span>Pune Urban Metropolitan Area • Wards 12, 14 & 17</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card info" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('intelligence')}>
          <div className="kpi-info">
            <span className="kpi-label">Total Parcels Ingested</span>
            <span className="kpi-value">{stats.total_parcels.toLocaleString()}</span>
            <span className="kpi-subtext">Across 3 Urban Wards</span>
          </div>
          <div className="kpi-icon-box">
            <Building size={20} />
          </div>
        </div>

        <div className="kpi-card verified" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('verification')}>
          <div className="kpi-info">
            <span className="kpi-label">Verified Parcels</span>
            <span className="kpi-value">{stats.verified_parcels.toLocaleString()}</span>
            <span className="kpi-subtext" style={{ color: '#16a34a', fontWeight: 600 }}>
              {Math.round((stats.verified_parcels / Math.max(1, stats.total_parcels)) * 100)}% Reconciled
            </span>
          </div>
          <div className="kpi-icon-box">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="kpi-card warning" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('verification')}>
          <div className="kpi-info">
            <span className="kpi-label">Pending Verification</span>
            <span className="kpi-value">{stats.pending_verification.toLocaleString()}</span>
            <span className="kpi-subtext">Requires Officer Action</span>
          </div>
          <div className="kpi-icon-box">
            <Clock size={20} />
          </div>
        </div>

        <div className="kpi-card danger" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('conflicts')}>
          <div className="kpi-info">
            <span className="kpi-label">Boundary Conflicts</span>
            <span className="kpi-value">{stats.boundary_conflicts}</span>
            <span className="kpi-subtext">Displacement &gt; 2.0m</span>
          </div>
          <div className="kpi-icon-box">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="kpi-card warning" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('conflicts')}>
          <div className="kpi-info">
            <span className="kpi-label">Area Mismatches (&gt;5%)</span>
            <span className="kpi-value">{stats.area_mismatches}</span>
            <span className="kpi-subtext">Ledger vs GIS Divergence</span>
          </div>
          <div className="kpi-icon-box">
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className="kpi-card purple" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('ai-vision')}>
          <div className="kpi-info">
            <span className="kpi-label">Buildings Detected (AI)</span>
            <span className="kpi-value">{stats.buildings_detected}</span>
            <span className="kpi-subtext" style={{ color: '#dc2626', fontWeight: 600 }}>
              {stats.encroachments_detected} Encroachments Flagged
            </span>
          </div>
          <div className="kpi-icon-box">
            <Cpu size={20} />
          </div>
        </div>

        <div className="kpi-card info" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('ingestion')}>
          <div className="kpi-info">
            <span className="kpi-label">Data Sources Integrated</span>
            <span className="kpi-value">{stats.data_sources_integrated}</span>
            <span className="kpi-subtext">Cadastral, Tax, Municipal, AI</span>
          </div>
          <div className="kpi-icon-box">
            <Database size={20} />
          </div>
        </div>

        <div className="kpi-card verified">
          <div className="kpi-info">
            <span className="kpi-label">Avg Matching Confidence</span>
            <span className="kpi-value">{stats.average_confidence_pct}%</span>
            <span className="kpi-subtext">Multi-Signal Probabilistic</span>
          </div>
          <div className="kpi-icon-box">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px', marginBottom: '20px' }}>
        
        {/* Verification Doughnut Chart */}
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <div className="card-header">
            <span className="card-title">
              <CheckCircle2 size={16} color="#16a34a" />
              Harmonization Status Breakdown
            </span>
          </div>
          <div className="card-body" style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '100%', maxWidth: '240px' }}>
              <Doughnut 
                data={verificationChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Conflict Distribution Chart */}
        <div className="card" style={{ gridColumn: 'span 5' }}>
          <div className="card-header">
            <span className="card-title">
              <AlertTriangle size={16} color="#dc2626" />
              Conflict & Discrepancy Distribution
            </span>
            <button className="btn btn-sm btn-outline" onClick={() => onNavigateTab('conflicts')}>
              Review All
              <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="card-body" style={{ height: '260px' }}>
            <Bar 
              data={conflictChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 0 } },
                  y: { beginAtZero: true, ticks: { font: { size: 10 } } }
                }
              }} 
            />
          </div>
        </div>

        {/* Confidence Distribution Chart */}
        <div className="card" style={{ gridColumn: 'span 3' }}>
          <div className="card-header">
            <span className="card-title">
              <ShieldAlert size={16} color="#0284c7" />
              Confidence Stratification
            </span>
          </div>
          <div className="card-body" style={{ height: '260px' }}>
            <Bar 
              data={confidenceChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { font: { size: 9 } } },
                  y: { beginAtZero: true, ticks: { font: { size: 10 } } }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Ward Breakdown Table & Data Sources Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
        
        {/* Ward Comparison Table */}
        <div className="card" style={{ gridColumn: 'span 7' }}>
          <div className="card-header">
            <span className="card-title">
              <MapPin size={16} color="#0f2942" />
              Ward-Level Land Record Harmonization Progress
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Click a ward to explore GIS layers</span>
          </div>
          <div className="table-responsive">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Ward / Urban Jurisdiction</th>
                  <th>Total Parcels</th>
                  <th>Verified</th>
                  <th>Pending Review</th>
                  <th>Conflicts</th>
                  <th>Harmonization Rate</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.ward_breakdown.map((w) => {
                  const rate = Math.round((w.verified / Math.max(1, w.total_parcels)) * 100);
                  return (
                    <tr key={w.ward}>
                      <td style={{ fontWeight: 600, color: '#0f2942' }}>{w.ward}</td>
                      <td>{w.total_parcels}</td>
                      <td>
                        <span className="badge badge-verified">{w.verified}</span>
                      </td>
                      <td>
                        <span className="badge badge-pending">{w.pending}</span>
                      </td>
                      <td>
                        {w.conflicts > 0 ? (
                          <span className="badge badge-conflict">{w.conflicts} Issues</span>
                        ) : (
                          <span className="badge badge-verified">Clean</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${rate}%`, height: '100%', backgroundColor: rate > 75 ? '#16a34a' : '#f59e0b' }}></div>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 600 }}>{rate}%</span>
                        </div>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline" 
                          onClick={() => {
                            onSelectWard(w.ward);
                            onNavigateTab('map');
                          }}
                        >
                          View Map
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integrated Data Sources */}
        <div className="card" style={{ gridColumn: 'span 5' }}>
          <div className="card-header">
            <span className="card-title">
              <Database size={16} color="#0f2942" />
              Integrated Multi-Source Registries
            </span>
            <button className="btn btn-sm btn-outline" onClick={() => onNavigateTab('ingestion')}>
              Add Dataset
            </button>
          </div>
          <div className="table-responsive">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Registry Source</th>
                  <th>Category</th>
                  <th>Records</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.source_contributions.map((s, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#0f2942' }}>{s.name}</td>
                    <td>
                      <span className="badge badge-neutral">{s.type}</span>
                    </td>
                    <td>{s.records.toLocaleString()}</td>
                    <td>
                      <span className="badge badge-verified">✓ {s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
