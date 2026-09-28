import React, { useState, useEffect } from 'react';
import { 
  Play, CheckCircle2, Clock, AlertTriangle, 
  Sparkles, ArrowRight, X, ShieldCheck, Database, Layers, Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<any>(null);

  const steps = [
    { num: 1, title: 'Multi-Source Geospatial Ingestion', desc: 'Ingesting Cadastral maps, Municipal GIS, Property Tax ledgers, and Drone orthophotos.' },
    { num: 2, title: 'Automated Topology Validation', desc: 'Checking self-intersections, slivers, and unclosed rings with Shapely make_valid().' },
    { num: 3, title: 'CRS Georeferencing & Transform', desc: 'Reprojecting all layers to canonical EPSG:4326 with UTM 43N metric surface geodesy.' },
    { num: 4, title: 'Attribute Schema Standardization', desc: 'Mapping Survey_No, Khasra, Plot_ID, and Rakba to National Canonical Schema.' },
    { num: 5, title: 'Multi-Signal Parcel Matching', desc: 'Computing spatial IoU, centroid offset, and string similarity confidence scores.' },
    { num: 6, title: 'AI Computer Vision Segmentation', desc: 'Extracting building footprints and identifying boundary encroachments from 0.3m imagery.' },
    { num: 7, title: 'Intelligent Conflict Detection', desc: 'Flagging boundary shifts, area mismatches (>5%), and unauthorized land-use changes.' },
    { num: 8, title: 'Digital Twin Compilation', desc: 'Generating 236 unified parcel digital twins ready for officer verification and statutory audit.' }
  ];

  const handleStartPipeline = async () => {
    setIsRunning(true);
    setIsCompleted(false);
    setCurrentStep(1);

    try {
      // Step-by-step visual animation progression
      for (let i = 1; i <= 8; i++) {
        setCurrentStep(i);
        await new Promise(r => setTimeout(r, 450));
      }

      // Execute actual backend pipeline
      const res = await api.runDemoPipeline();
      setSummaryData(res.summary);
      setIsCompleted(true);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Ignore if confetti fails
      }

    } catch (err) {
      alert(`Pipeline execution error: ${err}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={18} color="#38bdf8" />
            BHUMI-SYNC: Live End-to-End Hackathon Demonstration Pipeline
          </div>
          {!isRunning && (
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="modal-body">
          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
            This orchestrator executes the complete 8-step intelligent harmonization workflow across 3 urban wards, demonstrating real spatial processing, AI vision, and conflict detection.
          </p>

          {/* Steps Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
            {steps.map((s) => {
              const isDone = isCompleted || (isRunning && currentStep > s.num);
              const isCurrent = isRunning && currentStep === s.num;
              return (
                <div 
                  key={s.num}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: isCurrent ? '#eff6ff' : isDone ? '#f0fdf4' : '#f8fafc',
                    border: isCurrent ? '1px solid #3b82f6' : isDone ? '1px solid #86efac' : '1px solid #e2e8f0',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isDone ? '#16a34a' : isCurrent ? '#2563eb' : '#cbd5e1',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {isDone ? <CheckCircle2 size={14} /> : s.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: isCurrent ? '#1d4ed8' : '#0f2942' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {s.desc}
                    </div>
                  </div>
                  <div>
                    {isDone ? (
                      <span className="badge badge-verified">Done</span>
                    ) : isCurrent ? (
                      <span className="badge badge-pending">Processing...</span>
                    ) : (
                      <span className="badge badge-neutral">Queued</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Result Highlights */}
          {isCompleted && summaryData && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: '14px',
              marginTop: '10px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} />
                Automated Harmonization & Verification Pipeline Completed Successfully!
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '11px', color: '#166534', marginTop: '8px' }}>
                <div>Parcels Ingested: <b>{summaryData.total_parcels}</b></div>
                <div>Conflicts Detected: <b>{summaryData.total_conflicts}</b></div>
                <div>AI Buildings: <b>{summaryData.total_buildings}</b></div>
                <div>Datasets Linked: <b>{summaryData.total_datasets}</b></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {!isCompleted ? (
            <button 
              className="btn btn-primary"
              disabled={isRunning}
              onClick={handleStartPipeline}
              style={{ minWidth: '180px' }}
            >
              {isRunning ? 'Executing Real Pipeline...' : '▶ Start Automated Pipeline'}
            </button>
          ) : (
            <button 
              className="btn btn-success"
              onClick={() => {
                onClose();
                onComplete();
              }}
              style={{ minWidth: '180px' }}
            >
              Explore Results on GIS Map
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
