import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, MapPin, Eye, EyeOff, Ruler, 
  Maximize2, Filter, AlertTriangle, CheckCircle2, 
  Search, Info, ChevronRight, X
} from 'lucide-react';
import { api, ParcelDigitalTwin } from '../services/api';

interface GISMapExplorerProps {
  selectedWard: string;
  setSelectedWard: (ward: string) => void;
  onSelectParcel: (parcel: ParcelDigitalTwin) => void;
  highlightParcelCode?: string | null;
}

export const GISMapExplorer: React.FC<GISMapExplorerProps> = ({
  selectedWard,
  setSelectedWard,
  onSelectParcel,
  highlightParcelCode
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const buildingsLayerRef = useRef<L.LayerGroup | null>(null);
  const cadastralLayerRef = useRef<L.GeoJSON | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [baseMap, setBaseMap] = useState<string>('satellite');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterConflict, setFilterConflict] = useState<string>('ALL');

  // Layer visibility toggles
  const [showHarmonized, setShowHarmonized] = useState<boolean>(true);
  const [showCadastral, setShowCadastral] = useState<boolean>(true);
  const [showBuildings, setShowBuildings] = useState<boolean>(true);
  const [showConflictsOnly, setShowConflictsOnly] = useState<boolean>(false);

  // Quick stats for map view
  const [mapStats, setMapStats] = useState({ total: 0, verified: 0, conflicts: 0 });

  // Base tile layers (100% Free & Open - No API Key Required)
  const tileLayers: Record<string, L.TileLayer> = {
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri, Maxar, Earthstar Geographics',
      maxZoom: 19
    }),
    streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }),
    topo: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri World Topo',
      maxZoom: 19
    })
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center around Pune Urban Ward 12 (18.5280, 73.8520)
    const map = L.map(mapContainerRef.current, {
      center: [18.5204, 73.8567],
      zoom: 16,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    tileLayers.satellite.addTo(map);
    mapInstanceRef.current = map;

    buildingsLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    Object.values(tileLayers).forEach(layer => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });

    if (tileLayers[baseMap]) {
      tileLayers[baseMap].addTo(map);
    }
  }, [baseMap]);

  // Load and Render Geospatial Layers
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const geojsonData = await api.getParcelsGeoJSON({
          ward: selectedWard,
          status: filterStatus,
          conflict_type: filterConflict
        });

        if (!isMounted || !mapInstanceRef.current) return;
        const map = mapInstanceRef.current;

        // Remove old layers
        if (geojsonLayerRef.current) {
          map.removeLayer(geojsonLayerRef.current);
        }
        if (cadastralLayerRef.current) {
          map.removeLayer(cadastralLayerRef.current);
        }
        if (buildingsLayerRef.current) {
          buildingsLayerRef.current.clearLayers();
        }

        let verifiedCount = 0;
        let conflictCount = 0;

        // 1. Cadastral Boundary Baseline Layer (Blue dashed boundary lines)
        if (showCadastral) {
          const cadLayer = L.geoJSON(geojsonData, {
            style: () => ({
              color: '#38bdf8',
              weight: 1.5,
              dashArray: '4, 4',
              fillOpacity: 0.05,
              fillColor: '#38bdf8'
            }),
            interactive: false
          });
          cadLayer.addTo(map);
          cadastralLayerRef.current = cadLayer;
        }

        // 2. Harmonized Digital Twin Parcels Layer
        if (showHarmonized) {
          const pLayer = L.geoJSON(geojsonData, {
            filter: (feature) => {
              if (showConflictsOnly && !feature.properties.has_conflict) {
                return false;
              }
              return true;
            },
            style: (feature) => {
              const props = feature?.properties || {};
              const isVerified = props.verification_status === 'VERIFIED';
              const hasConflict = props.has_conflict;
              const isHighlighted = highlightParcelCode && props.parcel_id === highlightParcelCode;

              let fillColor = '#2563eb';
              let strokeColor = '#1d4ed8';
              let weight = 2;
              let fillOpacity = 0.35;

              if (isVerified) {
                fillColor = '#16a34a';
                strokeColor = '#15803d';
              } else if (hasConflict) {
                fillColor = '#dc2626';
                strokeColor = '#b91c1c';
                fillOpacity = 0.55;
                weight = 2.5;
              } else if (props.verification_status === 'UNDER_REVIEW') {
                fillColor = '#d97706';
                strokeColor = '#b45309';
              }

              if (isHighlighted) {
                strokeColor = '#facc15';
                weight = 4;
                fillOpacity = 0.7;
              }

              return {
                color: strokeColor,
                weight: weight,
                fillColor: fillColor,
                fillOpacity: fillOpacity,
              };
            },
            onEachFeature: (feature, layer) => {
              const props = feature.properties;
              if (props.verification_status === 'VERIFIED') verifiedCount++;
              if (props.has_conflict) conflictCount++;

              // Tooltip on hover
              layer.bindTooltip(`
                <div style="font-family: Inter, sans-serif; font-size: 11px; padding: 2px;">
                  <strong style="color: #0f2942; font-size: 12px;">Parcel ${props.parcel_id}</strong> (Survey: ${props.survey_number})<br/>
                  <b>Area:</b> ${props.recorded_area} m² (GIS: ${props.gis_area} m²)<br/>
                  <b>Status:</b> <span style="color: ${props.verification_status === 'VERIFIED' ? '#16a34a' : props.has_conflict ? '#dc2626' : '#2563eb'}">${props.verification_status}</span><br/>
                  <b>Confidence:</b> ${props.confidence}%
                  ${props.has_conflict ? `<br/><span style="color: #dc2626; font-weight: bold;">⚠ ${props.primary_conflict}</span>` : ''}
                </div>
              `, { sticky: true });

              // Click to inspect parcel digital twin
              layer.on('click', async () => {
                try {
                  const digitalTwin = await api.getParcelDigitalTwin(props.id);
                  onSelectParcel(digitalTwin);
                } catch (err) {
                  console.error('Error fetching parcel details', err);
                }
              });
            }
          });

          pLayer.addTo(map);
          geojsonLayerRef.current = pLayer;

          // Fit bounds if features exist
          if (geojsonData.features.length > 0 && !highlightParcelCode) {
            map.fitBounds(pLayer.getBounds(), { padding: [30, 30] });
          }
        }

        // 3. AI Building Footprints Layer
        if (showBuildings && buildingsLayerRef.current) {
          const buildingsData = await api.getDetectedBuildings(false);
          buildingsData.forEach(bldg => {
            if (bldg.geometry) {
              const bldgLayer = L.geoJSON(bldg.geometry, {
                style: {
                  color: bldg.is_encroaching ? '#dc2626' : '#ea580c',
                  weight: 1.5,
                  fillColor: bldg.is_encroaching ? '#f87171' : '#fb923c',
                  fillOpacity: 0.75
                }
              });

              bldgLayer.bindTooltip(`
                <div style="font-size: 11px;">
                  <strong>AI Building: ${bldg.building_code}</strong><br/>
                  Footprint Area: ${bldg.area_sqm} m² (${bldg.floors} Floors)<br/>
                  Confidence: ${bldg.confidence}%<br/>
                  ${bldg.is_encroaching ? `<span style="color: #dc2626; font-weight: bold;">⚠ Encroachment: ${bldg.encroachment_area_sqm} m² outside plot</span>` : '<span style="color: #16a34a;">✓ Inside Parcel Boundary</span>'}
                </div>
              `);

              buildingsLayerRef.current?.addLayer(bldgLayer);
            }
          });
        }

        setMapStats({
          total: geojsonData.features.length,
          verified: verifiedCount,
          conflicts: conflictCount
        });

      } catch (err) {
        console.error('Failed to load map data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedWard, filterStatus, filterConflict, showHarmonized, showCadastral, showBuildings, showConflictsOnly, highlightParcelCode]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 170px)', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      {/* Leaflet Map Target Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Map Header Toolbar: Filters & Jurisdiction Selector */}
      <div className="map-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRight: '1px solid #cbd5e1', paddingRight: '10px' }}>
          <MapPin size={16} color="#0f2942" />
          <select 
            value={selectedWard} 
            onChange={(e) => setSelectedWard(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, color: '#0f2942' }}
          >
            <option value="ALL">All Urban Wards (Pune Core)</option>
            <option value="Ward 12 - Indira Nagar">Ward 12 - Indira Nagar</option>
            <option value="Ward 14 - Shivaji Nagar">Ward 14 - Shivaji Nagar</option>
            <option value="Ward 17 - Cyber Tech Zone">Ward 17 - Cyber Tech Zone</option>
          </select>
        </div>

        {/* Verification Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRight: '1px solid #cbd5e1', paddingRight: '10px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>STATUS:</span>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="PENDING">Pending Verification</option>
            <option value="UNDER_REVIEW">Under Field Review</option>
          </select>
        </div>

        {/* Conflict Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>CONFLICT:</span>
          <select 
            value={filterConflict} 
            onChange={(e) => setFilterConflict(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
          >
            <option value="ALL">All Conflicts</option>
            <option value="BOUNDARY_MISMATCH">Boundary Mismatch</option>
            <option value="AREA_MISMATCH">Area Mismatch (&gt;5%)</option>
            <option value="BUILDING_OUTSIDE_PARCEL">Building Encroachment</option>
            <option value="PARCEL_OVERLAP">Parcel Overlap</option>
            <option value="LAND_USE_INCONSISTENCY">Land-Use Inconsistency</option>
          </select>
        </div>

        {/* Highlight Conflicts Button */}
        <button 
          className={`btn btn-sm ${showConflictsOnly ? 'btn-danger' : 'btn-outline'}`}
          onClick={() => setShowConflictsOnly(!showConflictsOnly)}
        >
          <AlertTriangle size={13} />
          {showConflictsOnly ? 'Showing Conflicts Only' : 'Filter Conflicts'}
        </button>
      </div>

      {/* Layer Visibility & Base Map Controller */}
      <div className="map-layer-control">
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f2942', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} />
          GIS Layer Manager
        </div>

        {/* Base Map Selector */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Base Map</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              className={`btn btn-sm ${baseMap === 'satellite' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: '3px 4px', fontSize: '10px' }}
              onClick={() => setBaseMap('satellite')}
            >
              Satellite
            </button>
            <button 
              className={`btn btn-sm ${baseMap === 'streets' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: '3px 4px', fontSize: '10px' }}
              onClick={() => setBaseMap('streets')}
            >
              Streets
            </button>
            <button 
              className={`btn btn-sm ${baseMap === 'topo' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: '3px 4px', fontSize: '10px' }}
              onClick={() => setBaseMap('topo')}
            >
              Topo Map
            </button>
          </div>
        </div>

        {/* Vector Layers Checkboxes */}
        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Vector Overlays</div>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', marginBottom: '4px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={showHarmonized} 
            onChange={(e) => setShowHarmonized(e.target.checked)} 
          />
          <span>Harmonized Digital Twins</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', marginBottom: '4px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={showCadastral} 
            onChange={(e) => setShowCadastral(e.target.checked)} 
          />
          <span>Cadastral Survey Boundary (2018)</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', marginBottom: '4px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={showBuildings} 
            onChange={(e) => setShowBuildings(e.target.checked)} 
          />
          <span>AI Building Footprints (Drone 0.3m)</span>
        </label>

        <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #e2e8f0', fontSize: '10px', color: '#64748b' }}>
          <span>Parcels on Map: <b>{mapStats.total}</b> (Verified: <b style={{ color: '#16a34a' }}>{mapStats.verified}</b>)</span>
        </div>
      </div>

      {/* Dynamic Map Legend */}
      <div className="map-legend">
        <div style={{ fontWeight: 700, color: '#0f2942', marginBottom: '6px' }}>Map Symbology</div>
        <div className="legend-item">
          <div className="legend-color-box" style={{ backgroundColor: '#16a34a' }}></div>
          <span>Verified & Affirmed Parcel</span>
        </div>
        <div className="legend-item">
          <div className="legend-color-box" style={{ backgroundColor: '#2563eb' }}></div>
          <span>Pending Officer Review</span>
        </div>
        <div className="legend-item">
          <div className="legend-color-box" style={{ backgroundColor: '#dc2626' }}></div>
          <span>Discrepancy / Conflict Flagged</span>
        </div>
        <div className="legend-item">
          <div className="legend-color-box" style={{ backgroundColor: '#fb923c' }}></div>
          <span>AI Detected Structure Footprint</span>
        </div>
        <div className="legend-item">
          <div className="legend-color-box" style={{ border: '2px dashed #38bdf8', backgroundColor: 'transparent' }}></div>
          <span>Cadastral Survey Baseline</span>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(15, 41, 66, 0.9)', color: '#ffffff', padding: '12px 20px', borderRadius: '8px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
          <div style={{ width: '16px', height: '16px', border: '2px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span>Rendering High-Precision Vector Layers...</span>
        </div>
      )}
    </div>
  );
};
