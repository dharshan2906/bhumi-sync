import React, { useState } from 'react';
import { 
  Award, X, ArrowLeft, ArrowRight, ShieldCheck, 
  AlertTriangle, Layers, Cpu, CheckCircle2, TrendingUp, Sparkles, Building2
} from 'lucide-react';

interface PresentationModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDemo: () => void;
}

export const PresentationModeModal: React.FC<PresentationModeModalProps> = ({
  isOpen,
  onClose,
  onStartDemo
}) => {
  if (!isOpen) return null;

  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slides = [
    // Slide 1: Title & Problem Context
    {
      title: "Smart India Hackathon 2026 • Problem Statement SIH26013",
      subtitle: "Ministry of Rural Development • National Land Record Modernization Programme",
      render: () => (
        <div>
          <div style={{ textAlign: 'center', padding: '20px 0 30px' }}>
            <div style={{ display: 'inline-flex', padding: '6px 14px', borderRadius: '20px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 700, marginBottom: '12px', border: '1px solid #bfdbfe' }}>
              PROBLEM STATEMENT SIH26013 • SOFTWARE / SMART AUTOMATION
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f2942', lineHeight: 1.2, marginBottom: '8px' }}>
              Automated Integration and Intelligent Harmonization of Multi-Source Geospatial Data for Urban Land Record Management
            </h1>
            <div style={{ fontSize: '16px', color: '#0284c7', fontWeight: 600 }}>
              "BHUMI-SYNC: One Map. One Truth. Smarter Land Records."
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} />
                Fragmented Data Silos
              </div>
              <p style={{ fontSize: '11px', color: '#7f1d1d' }}>
                Revenue Cadastral maps, Municipal GIS layers, Property Tax ledgers, and Satellite imagery operate in disconnected schemas and legacy datums.
              </p>
            </div>

            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#d97706', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} />
                Geometric & Area Clashes
              </div>
              <p style={{ fontSize: '11px', color: '#78350f' }}>
                Overlapping parcel boundaries, severe ledger area mismatches (&gt;5%), and unauthorized structural encroachments cause protracted litigation.
              </p>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} />
                The BHUMI-SYNC Answer
              </div>
              <p style={{ fontSize: '11px', color: '#14532d' }}>
                Automated ingestion, PyProj CRS harmonization, multi-signal probabilistic matching, AI vision building extraction, and human-in-the-loop decision support.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: 4-Tier Architecture Blueprint
    {
      title: "BHUMI-SYNC: End-to-End Enterprise Architecture",
      subtitle: "Robust Full-Stack Geospatial Engineering Stack",
      render: () => (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', margin: '20px 0' }}>
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f2942', borderBottom: '2px solid #2563eb', paddingBottom: '4px', marginBottom: '8px' }}>
                1. INGESTION &amp; CRS
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                • GeoJSON, Shapefile, CSV, GeoTIFF<br/>
                • Automated make_valid() repairs<br/>
                • PyProj Geodesy (EPSG:4326/UTM43N)<br/>
                • Canonical Schema Normalization
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f2942', borderBottom: '2px solid #16a34a', paddingBottom: '4px', marginBottom: '8px' }}>
                2. MATCHING ENGINE
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                • Multi-Signal Scorer (IoU, Distance)<br/>
                • String Levenshtein Similarity<br/>
                • Hausdorff Boundary Displacement<br/>
                • Transparent Confidence Index
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f2942', borderBottom: '2px solid #7c3aed', paddingBottom: '4px', marginBottom: '8px' }}>
                3. AI VISION &amp; CHANGE
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                • YOLO-Geo &amp; U-Net Segmentation<br/>
                • 0.3m High-Res Drone Ortho Extraction<br/>
                • Structural Encroachment Check<br/>
                • Dual-Epoch (2021→2026) NDBI Shift
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f2942', borderBottom: '2px solid #ea580c', paddingBottom: '4px', marginBottom: '8px' }}>
                4. GOVERNANCE &amp; AUDIT
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                • Human-in-the-Loop Officer Queue<br/>
                • Decision Support Affirmation<br/>
                • Immutable Append-Only Audit Trail<br/>
                • Statutory PDF / GeoJSON Export
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#eff6ff', padding: '12px 16px', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '11px', color: '#1e40af' }}>
            <b>Key Differentiator:</b> The platform creates a unified <b>Parcel Digital Twin</b> that bridges physical drone imagery with statutory revenue records while maintaining strict decision-support governance.
          </div>
        </div>
      )
    },

    // Slide 3: Spotlight Case Study (Parcel P-102)
    {
      title: "Real-World Discrepancy Spotlight: Parcel P-102 (Survey 104/2)",
      subtitle: "Demonstrating 3 Simultaneous Discrepancy Resolvings",
      render: () => (
        <div style={{ margin: '15px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>
                Discrepancy 1: Area Mismatch
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                • Recorded Ledger: <b>1,250 m²</b><br/>
                • GIS Polygon Area: <b>1,184 m²</b><br/>
                • Variance: <b>5.28% (66.0 m² deficit)</b><br/>
                • Flagged for Revenue Mutation
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', marginBottom: '4px' }}>
                Discrepancy 2: Boundary Shift
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                • Cadastral vs Municipal: <b>4.7m shift</b><br/>
                • Hausdorff distance calculation<br/>
                • Side-by-side visual opacity inspection<br/>
                • Resolved via Harmonized Composite
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed', marginBottom: '4px' }}>
                Discrepancy 3: Encroachment (AI)
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                • Structure <b>BLD-P-102-A</b> detected<br/>
                • <b>18.4 m²</b> extends outside plot bounds<br/>
                • Confidence: <b>93.2% (Drone 0.3m)</b><br/>
                • Sent to Officer Verification Queue
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#f0fdf4', padding: '12px 16px', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '12px', color: '#15803d' }}>
            ✓ <b>Data Matching Confidence: 94.0%</b> • Officer affirms resolution with digital sign-off and immutable audit commit.
          </div>
        </div>
      )
    },

    // Slide 4: Statutory Governance Principle
    {
      title: "Statutory Governance & Human-in-the-Loop Integrity",
      subtitle: "Why BHUMI-SYNC Adheres to Strict Administrative Standards",
      render: () => (
        <div style={{ margin: '20px 0' }}>
          <div style={{ backgroundColor: '#0f2942', color: '#ffffff', padding: '20px', borderRadius: '10px', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8', marginBottom: '8px' }}>
              CORE GOVERNANCE MANDATE
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#e2e8f0' }}>
              "The platform NEVER automatically modifies official land titles or claims legal authority. AI and GIS engines serve strictly as high-precision <b>decision-support intelligence</b> for authorized revenue officers and registrars."
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#0f2942' }}>Explainable AI</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Every score breaks down into IoU, centroid offset, and attribute similarity.
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#0f2942' }}>Immutable Audit Log</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Every verification, rejection, and resolution is cryptographically timestamped.
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#0f2942' }}>Statutory Output</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Download certified PDF audit reports with official Ministry letterhead and seal.
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 5: Measurable Hackathon Prototype Results
    {
      title: "Measurable Prototype Impact & Ready Deployment",
      subtitle: "Scalable Architecture Tested Across 3 Urban Wards",
      render: () => (
        <div style={{ margin: '15px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#1d4ed8' }}>90%</div>
              <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 600 }}>Reduction in Manual Reconcile Time</div>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#15803d' }}>0.3m</div>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Drone Ortho GSD Spatial Accuracy</div>
            </div>

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#dc2626' }}>9</div>
              <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 600 }}>Conflict Categories Detected</div>
            </div>

            <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#7e22ce' }}>100%</div>
              <div style={{ fontSize: '11px', color: '#6b21a8', fontWeight: 600 }}>Audit Trail Traceability</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '14px 0' }}>
            <button
              className="btn btn-demo-run"
              style={{ fontSize: '14px', padding: '10px 24px', margin: '0 auto' }}
              onClick={() => {
                onClose();
                onStartDemo();
              }}
            >
              <Sparkles size={16} />
              Launch Live End-to-End Demonstration Pipeline
            </button>
          </div>
        </div>
      )
    }
  ];

  const current = slides[currentSlide];

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '920px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Award size={20} color="#facc15" />
            <span>SIH 2026 Presentation Deck • Slide {currentSlide + 1} of {slides.length}</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ minHeight: '360px' }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f2942' }}>{current.title}</h2>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{current.subtitle}</div>
          </div>

          {current.render()}
        </div>

        {/* Modal Footer Controls */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            className="btn btn-outline"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(prev => prev - 1)}
          >
            <ArrowLeft size={14} />
            Previous Slide
          </button>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {slides.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: currentSlide === idx ? '#2563eb' : '#cbd5e1',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>

          {currentSlide < slides.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentSlide(prev => prev + 1)}
            >
              Next Slide
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={() => {
                onClose();
                onStartDemo();
              }}
            >
              Start Live Interactive Demo
              <Sparkles size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
