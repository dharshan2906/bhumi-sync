import React from 'react';
import { 
  Building2, ShieldCheck, MapPin, Layers, 
  Cpu, CheckCircle2, ArrowRight, Lock, 
  UserCheck, Sparkles, Award, FileText, Globe, Check
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (role?: string) => void;
  onOpenLogin: () => void;
  onOpenPresentation: () => void;
  totalParcels: number;
  verifiedParcels: number;
  conflictsCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenLogin,
  onOpenPresentation,
  totalParcels,
  verifiedParcels,
  conflictsCount
}) => {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Ministry Ribbon */}
      <div className="gov-top-bar">
        <div className="gov-emblem-tag">
          <span className="gov-flag-strip">
            <span className="gov-flag-saffron"></span>
            <span className="gov-flag-white"></span>
            <span className="gov-flag-green"></span>
          </span>
          MINISTRY OF RURAL DEVELOPMENT • GOVERNMENT OF INDIA
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>National Land Record Modernization Programme (NLRMP)</span>
          <span style={{ color: '#38bdf8' }}>Smart India Hackathon • Problem #SIH26013</span>
        </div>
      </div>

      {/* Hero Header */}
      <header style={{
        background: 'linear-gradient(135deg, #08162b 0%, #0f2942 60%, #163a5d 100%)',
        color: '#ffffff',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="logo-badge" style={{ width: '48px', height: '48px' }}>
            <Building2 size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '0.5px' }}>BHUMI-SYNC</span>
              <span className="sih-badge">SIH26013</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              AI-Powered Urban Land Record Harmonization & Intelligence Platform
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn-presentation" onClick={onOpenPresentation}>
            <Award size={14} />
            SIH Presentation Deck
          </button>

          <button 
            className="btn btn-outline" 
            style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.08)' }}
            onClick={onOpenLogin}
          >
            <Lock size={14} />
            Officer Sign In
          </button>

          <button 
            className="btn btn-demo-run"
            onClick={() => onEnterApp('GIS_OFFICER')}
          >
            Enter Dashboard
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section style={{
        background: 'linear-gradient(180deg, #0f2942 0%, #1e3a8a 70%, #172554 100%)',
        color: '#ffffff',
        padding: '60px 40px 70px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid #38bdf8',
            color: '#7dd3fc',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '20px',
            letterSpacing: '0.5px'
          }}>
            <Sparkles size={14} />
            OFFICIAL SMART INDIA HACKATHON 2026 ENTERPRISE SOLUTION
          </div>

          <h1 style={{
            fontSize: '38px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>
            Automated Integration &amp; Intelligent Harmonization of Multi-Source Urban Land Records
          </h1>

          <p style={{
            fontSize: '17px',
            color: '#cbd5e1',
            maxWidth: '780px',
            margin: '0 auto 30px',
            lineHeight: 1.6
          }}>
            Unifying <b>Cadastral Revenue Maps</b>, <b>Municipal GIS Footprints</b>, <b>Property Tax Registries</b>, and <b>0.3m High-Resolution Drone Orthophotos</b> into a single, verifiable <b>Parcel Digital Twin</b>.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-success" 
              style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '8px', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)' }}
              onClick={() => onEnterApp('GIS_OFFICER')}
            >
              <UserCheck size={16} />
              Launch GIS Platform (Officer Access)
            </button>

            <button 
              className="btn btn-outline" 
              style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '8px', color: '#ffffff', borderColor: '#cbd5e1', backgroundColor: 'rgba(255,255,255,0.1)' }}
              onClick={onOpenPresentation}
            >
              <Award size={16} />
              View SIH Jury Pitch Deck
            </button>
          </div>

          {/* Quick Stats Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            maxWidth: '840px',
            margin: '45px auto 0',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8' }}>{totalParcels.toLocaleString()}+</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Parcels Processed</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#4ade80' }}>{verifiedParcels.toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Reconciled &amp; Affirmed</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#f87171' }}>{conflictsCount}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Conflicts Detected</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#facc15' }}>0.3m</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Drone Ortho Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Sign-In Persona Cards Section */}
      <section style={{ maxWidth: '1100px', margin: '-30px auto 40px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          padding: '28px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f2942' }}>
              Select Authorized Officer Role to Enter
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Role-Based Access Control (RBAC) Prototype for Smart India Hackathon
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            
            {/* Role 1: GIS Officer */}
            <div 
              style={{
                border: '2px solid #2563eb',
                borderRadius: '10px',
                padding: '18px',
                backgroundColor: '#eff6ff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onClick={() => onEnterApp('GIS_OFFICER')}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-pending">Primary Persona</span>
                  <span style={{ fontSize: '10px', color: '#1d4ed8', fontWeight: 700 }}>GIS_OFFICER</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f2942' }}>Shri A. K. Sharma</div>
                <div style={{ fontSize: '11px', color: '#475569', marginBottom: '10px' }}>Senior Land Records &amp; GIS Officer</div>
                <p style={{ fontSize: '11px', color: '#334155', lineHeight: 1.5 }}>
                  Full spatial editing, multi-source ingestion, parcel matching, boundary displacement inspection, and conflict resolution.
                </p>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '14px', fontSize: '11px' }}>
                Sign In as GIS Officer
                <ArrowRight size={12} />
              </button>
            </div>

            {/* Role 2: Director / Admin */}
            <div 
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '18px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onClick={() => onEnterApp('ADMIN')}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-verified">Director Access</span>
                  <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>ADMIN</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f2942' }}>Dr. Sunita V. Deshmukh</div>
                <div style={{ fontSize: '11px', color: '#475569', marginBottom: '10px' }}>Director of Urban Land Records (MoRD)</div>
                <p style={{ fontSize: '11px', color: '#334155', lineHeight: 1.5 }}>
                  Executive ward-level KPI monitoring, system policy configuration, user management, and statutory report sign-off.
                </p>
              </div>
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '14px', fontSize: '11px' }}>
                Sign In as Director
                <ArrowRight size={12} />
              </button>
            </div>

            {/* Role 3: Settlement Reviewer */}
            <div 
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '18px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onClick={() => onEnterApp('REVIEWER')}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-neutral">Field Review</span>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>REVIEWER</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f2942' }}>Shri P. C. Raman</div>
                <div style={{ fontSize: '11px', color: '#475569', marginBottom: '10px' }}>Assistant Settlement Reviewer</div>
                <p style={{ fontSize: '11px', color: '#334155', lineHeight: 1.5 }}>
                  Field verification queue examination, inspection remark logging, and ground survey referral workflow.
                </p>
              </div>
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '14px', fontSize: '11px' }}>
                Sign In as Reviewer
                <ArrowRight size={12} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Core Platform Capabilities */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 60px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f2942' }}>
            Built for National Land Governance Standards
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Complete compliance with Survey of India, NLRMP, and ULPIN 14-digit geospatial coding protocols.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Globe size={20} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Real PyProj Geodesy</h3>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
              Automatic reprojection from legacy local grids to EPSG:4326 with metric UTM 43N surface geodesy and Shapely <code>make_valid()</code> topological repairs.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Cpu size={20} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>AI Computer Vision</h3>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
              YOLO-Geo and U-Net building footprint segmentation on 0.3m drone imagery, with structural encroachment checks and dual-epoch NDBI change detection.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Decision Support Governance</h3>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
              The platform never autonomously alters legal titles. AI acts as high-precision decision support with an immutable, cryptographically timestamped audit trail.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#0f2942',
        color: '#94a3b8',
        padding: '24px 40px',
        fontSize: '12px',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <b style={{ color: '#ffffff' }}>BHUMI-SYNC Platform</b> • Developed for Smart India Hackathon (SIH 2026)
            <div style={{ fontSize: '11px', color: '#64748b' }}>Ministry of Rural Development • Government of India</div>
          </div>
          <div>
            ISO 19115 / OGC LandInfra Compliant • National Land Record Modernization Programme
          </div>
        </div>
      </footer>

    </div>
  );
};
