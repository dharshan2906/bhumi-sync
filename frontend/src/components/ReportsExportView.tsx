import React, { useState } from 'react';
import { 
  FileText, Download, FileSpreadsheet, MapPin, 
  ShieldCheck, Printer, CheckCircle2, ArrowRight
} from 'lucide-react';
import { api, DashboardStats } from '../services/api';

interface ReportsExportViewProps {
  stats: DashboardStats | null;
}

export const ReportsExportView: React.FC<ReportsExportViewProps> = ({
  stats
}) => {
  const [selectedWard, setSelectedWard] = useState<string>('ALL');

  const handleDownloadPdf = () => {
    window.open(api.getPdfReportUrl(selectedWard), '_blank');
  };

  const handleDownloadCsv = () => {
    window.open(api.getCsvExportUrl(selectedWard), '_blank');
  };

  const handleDownloadGeoJson = () => {
    window.open(api.getGeoJsonExportUrl(selectedWard), '_blank');
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Official Land Record Quality & Harmonization Reports</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Generate certified statutory reports, GIS data layers, and audit ledgers for the Ministry of Rural Development and municipal authorities.
        </p>
      </div>

      {/* Ward Selection Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={18} color="#0f2942" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f2942' }}>Select Administrative Jurisdiction:</span>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}
            >
              <option value="ALL">All Urban Wards (Pune Core Metropolitan Area)</option>
              <option value="Ward 12 - Indira Nagar">Ward 12 - Indira Nagar</option>
              <option value="Ward 14 - Shivaji Nagar">Ward 14 - Shivaji Nagar</option>
              <option value="Ward 17 - Cyber Tech Zone">Ward 17 - Cyber Tech Zone</option>
            </select>
          </div>

          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Format standard: <b>ISO 19115 / OGC LandInfra Compliant</b>
          </div>
        </div>
      </div>

      {/* Export Options Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        
        {/* PDF Report Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <span className="card-title">
              <FileText size={16} color="#dc2626" />
              Statutory PDF Quality Audit
            </span>
            <span className="badge badge-verified">Official PDF</span>
          </div>
          <div className="card-body" style={{ flex: 1 }}>
            <p style={{ fontSize: '12px', color: '#475569', marginBottom: '14px' }}>
              Comprehensive executive audit report with ministry header, reconciliation statistics, priority conflict register, and officer sign-off stamps.
            </p>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '4px' }}>
              • Printable letterhead format<br/>
              • Digital settlement seal<br/>
              • Generated via Python ReportLab
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleDownloadPdf}>
              <Download size={14} />
              Download Official PDF
            </button>
          </div>
        </div>

        {/* CSV Dataset Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <span className="card-title">
              <FileSpreadsheet size={16} color="#16a34a" />
              Harmonized Parcel Ledger (CSV)
            </span>
            <span className="badge badge-neutral">Tabular Data</span>
          </div>
          <div className="card-body" style={{ flex: 1 }}>
            <p style={{ fontSize: '12px', color: '#475569', marginBottom: '14px' }}>
              Full tabular export of reconciled parcels, including canonical survey numbers, recorded vs GIS areas, variance percentages, and confidence scores.
            </p>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '4px' }}>
              • Compatible with Excel & Pandas<br/>
              • Includes ULPIN & centroids<br/>
              • UTF-8 encoded with headers
            </div>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleDownloadCsv}>
              <Download size={14} />
              Export CSV Dataset
            </button>
          </div>
        </div>

        {/* GeoJSON FeatureCollection Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <span className="card-title">
              <ShieldCheck size={16} color="#2563eb" />
              Spatial GeoJSON Layer
            </span>
            <span className="badge badge-pending">OGC GIS Vector</span>
          </div>
          <div className="card-body" style={{ flex: 1 }}>
            <p style={{ fontSize: '12px', color: '#475569', marginBottom: '14px' }}>
              Standard OGC GeoJSON FeatureCollection containing all reconciled polygon geometries with rich attribute properties for QGIS/ArcGIS ingestion.
            </p>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '4px' }}>
              • Canonical CRS: WGS 84 (EPSG:4326)<br/>
              • MultiPolygon topological support<br/>
              • Ready for Web GIS integration
            </div>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleDownloadGeoJson}>
              <Download size={14} />
              Export GeoJSON Layer
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Box of Report Summary */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <FileText size={16} color="#0f2942" />
            Executive Land Record Quality Report Preview ({selectedWard})
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Automated Live Compilation</span>
        </div>
        <div className="card-body" style={{ backgroundColor: '#f8fafc' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f2942', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>GOVERNMENT OF INDIA • MINISTRY OF RURAL DEVELOPMENT</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f2942', margin: '4px 0' }}>BHUMI-SYNC: URBAN LAND RECORD HARMONIZATION REPORT</div>
              <div style={{ fontSize: '11px', color: '#0284c7' }}>National Land Record Modernization Programme (NLRMP) • SIH Problem Statement #SIH26013</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
              <div><b>Jurisdiction:</b> {selectedWard}</div>
              <div><b>Classification:</b> OFFICIAL STATUTORY AUDIT</div>
              <div><b>Total Ingested Parcels:</b> {stats?.total_parcels || 236}</div>
              <div><b>Reconciled & Affirmed:</b> {stats?.verified_parcels || 184} ({stats ? Math.round(stats.verified_parcels/stats.total_parcels*100) : 78}%)</div>
            </div>

            <table className="gov-table" style={{ marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th>Audit Metric / Discrepancy Parameter</th>
                  <th>Observed Count</th>
                  <th>Status / Compliance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Boundary Concordance & Displacement (&gt;2.0m)</td>
                  <td><b style={{ color: '#dc2626' }}>{stats?.boundary_conflicts || 14}</b></td>
                  <td><span className="badge badge-conflict">Review Required</span></td>
                </tr>
                <tr>
                  <td>Area Ledger vs GIS Discrepancies (&gt;5%)</td>
                  <td><b style={{ color: '#d97706' }}>{stats?.area_mismatches || 18}</b></td>
                  <td><span className="badge badge-review">Review Required</span></td>
                </tr>
                <tr>
                  <td>AI-Detected Structural Encroachments</td>
                  <td><b style={{ color: '#dc2626' }}>{stats?.encroachments_detected || 9}</b></td>
                  <td><span className="badge badge-conflict">Field Check Required</span></td>
                </tr>
                <tr>
                  <td>Temporal Land-Use Divergence (2021→2026)</td>
                  <td><b>{stats?.land_use_changes || 6}</b></td>
                  <td><span className="badge badge-pending">Mutation Pending</span></td>
                </tr>
              </tbody>
            </table>

            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
              <div>
                <b>Automated Pipeline:</b> BHUMI-SYNC v1.0.0<br/>
                Datum: WGS 84 / UTM 43N
              </div>
              <div style={{ textAlign: 'right' }}>
                <b>Authorized Signatory:</b><br/>
                Shri A. K. Sharma (Sr. GIS Officer)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
