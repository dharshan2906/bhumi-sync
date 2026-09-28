import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  SplitSquareVertical, Sliders, Layers, Eye, 
  MapPin, AlertTriangle, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { ParcelDigitalTwin } from '../services/api';

interface SourceComparisonViewProps {
  selectedParcel: ParcelDigitalTwin | null;
}

export const SourceComparisonView: React.FC<SourceComparisonViewProps> = ({
  selectedParcel
}) => {
  const mapLeftRef = useRef<HTMLDivElement>(null);
  const mapRightRef = useRef<HTMLDivElement>(null);
  const leftInstance = useRef<L.Map | null>(null);
  const rightInstance = useRef<L.Map | null>(null);

  const [cadastralOpacity, setCadastralOpacity] = useState<number>(85);
  const [satelliteOpacity, setSatelliteOpacity] = useState<number>(75);
  const [highlightMismatch, setHighlightMismatch] = useState<boolean>(true);

  const defaultParcelCoords = [18.5280, 73.8520];

  // Initialize Split Maps
  useEffect(() => {
    if (!mapLeftRef.current || !mapRightRef.current) return;

    const centerLat = selectedParcel ? selectedParcel.centroid_lat : defaultParcelCoords[0];
    const centerLon = selectedParcel ? selectedParcel.centroid_lon : defaultParcelCoords[1];

    // Left Map: Cadastral Survey Focus (Standard OpenStreetMap - No API key needed)
    const mapL = L.map(mapLeftRef.current, {
      center: [centerLat, centerLon],
      zoom: 18,
      zoomControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(mapL);

    // Right Map: Satellite / Drone Ortho Focus (Esri World Imagery - No API key needed)
    const mapR = L.map(mapRightRef.current, {
      center: [centerLat, centerLon],
      zoom: 18,
      zoomControl: false,
    });
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri, Maxar, Earthstar Geographics',
      maxZoom: 19
    }).addTo(mapR);

    // Synchronize Map Navigation (Panning & Zooming)
    mapL.on('move', () => {
      mapR.setView(mapL.getCenter(), mapL.getZoom(), { animate: false });
    });
    mapR.on('move', () => {
      mapL.setView(mapR.getCenter(), mapR.getZoom(), { animate: false });
    });

    leftInstance.current = mapL;
    rightInstance.current = mapR;

    return () => {
      mapL.remove();
      mapR.remove();
      leftInstance.current = null;
      rightInstance.current = null;
    };
  }, [selectedParcel]);

  // Render Overlay Geometries on Both Maps
  useEffect(() => {
    if (!leftInstance.current || !rightInstance.current || !selectedParcel) return;

    const mapL = leftInstance.current;
    const mapR = rightInstance.current;

    // Draw Cadastral Geometry on Left Map
    if (selectedParcel.geometry) {
      const cadPoly = L.geoJSON(selectedParcel.geometry, {
        style: {
          color: '#1d4ed8',
          weight: 3,
          fillColor: '#3b82f6',
          fillOpacity: cadastralOpacity / 100.0,
        }
      });
      cadPoly.addTo(mapL);
      mapL.fitBounds(cadPoly.getBounds(), { padding: [40, 40] });

      // Draw Satellite Overlay on Right Map
      const satPoly = L.geoJSON(selectedParcel.geometry, {
        style: {
          color: highlightMismatch ? '#dc2626' : '#facc15',
          weight: 3,
          dashArray: highlightMismatch ? '5, 5' : undefined,
          fillColor: '#ef4444',
          fillOpacity: (100 - satelliteOpacity) / 100.0 * 0.4,
        }
      });
      satPoly.addTo(mapR);

      // Draw Buildings if any
      selectedParcel.buildings.forEach(b => {
        if (b.geometry) {
          L.geoJSON(b.geometry, {
            style: {
              color: '#ea580c',
              weight: 2,
              fillColor: '#fb923c',
              fillOpacity: 0.8
            }
          }).addTo(mapR);
        }
      });
    }
  }, [selectedParcel, cadastralOpacity, satelliteOpacity, highlightMismatch]);

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Multi-Source Dual Map Split-Screen Comparison</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Synchronized split-screen inspection of Historical Cadastral Survey vs High-Resolution Drone Orthophoto.
          </p>
        </div>

        {selectedParcel && (
          <div style={{ backgroundColor: '#ffffff', padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
            Active Parcel: <b style={{ color: '#0f2942' }}>{selectedParcel.parcel_id}</b> (Survey #{selectedParcel.survey_number})
          </div>
        )}
      </div>

      {/* Opacity & Overlay Controls Bar */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sliders size={16} color="#0f2942" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f2942' }}>Layer Opacity Controls:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Cadastral Opacity: <b>{cadastralOpacity}%</b></span>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={cadastralOpacity}
              onChange={(e) => setCadastralOpacity(Number(e.target.value))}
              style={{ width: '110px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Satellite Opacity: <b>{satelliteOpacity}%</b></span>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={satelliteOpacity}
              onChange={(e) => setSatelliteOpacity(Number(e.target.value))}
              style={{ width: '110px' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={highlightMismatch}
              onChange={(e) => setHighlightMismatch(e.target.checked)}
            />
            <span>Highlight Mismatched Boundaries</span>
          </label>
        </div>
      </div>

      {/* Dual Synchronized Map Viewport */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        height: 'calc(100vh - 270px)',
        minHeight: '480px'
      }}>
        
        {/* Left Map: Cadastral Survey Map */}
        <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '2px solid #3b82f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 999,
            backgroundColor: 'rgba(15, 41, 66, 0.9)',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Layers size={14} color="#38bdf8" />
            LEFT: Official Cadastral Revenue Map (2018)
          </div>
          <div ref={mapLeftRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Right Map: Satellite / Drone Ortho-Mosaic */}
        <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '2px solid #ef4444', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 999,
            backgroundColor: 'rgba(15, 41, 66, 0.9)',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Eye size={14} color="#f87171" />
            RIGHT: High-Res Drone Ortho (2026) + AI Footprints
          </div>
          <div ref={mapRightRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  );
};
