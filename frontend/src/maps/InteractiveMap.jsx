import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  ShieldAlert, 
  Waves, 
  Home, 
  Compass, 
  Key, 
  Maximize2, 
  RotateCcw, 
  Check, 
  ExternalLink, 
  Satellite, 
  Map as MapIcon, 
  Mountain, 
  Moon
} from 'lucide-react';
import { fetchBasinsGeoJSON, fetchFeaturesGeoJSON, fetchRiskHeatmap } from '../services/api';

// Fix Leaflet default icon issues in bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Tile Layer Profiles (Real Satellite, OSM Streets, Topo, and Dark Operations)
const BASEMAP_TILES = {
  satellite: {
    id: 'satellite',
    name: 'Real Satellite (Esri)',
    icon: Satellite,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    overlayUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
  },
  streets: {
    id: 'streets',
    name: 'Real Streets (OSM)',
    icon: MapIcon,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  topo: {
    id: 'topo',
    name: 'Topographic Contours',
    icon: Mountain,
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17
  },
  dark: {
    id: 'dark',
    name: 'Dark Command Mode',
    icon: Moon,
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  }
};

const BASIN_JUMP_TARGETS = {
  all: { name: 'All Tamil Nadu', center: [11.2, 78.8], zoom: 7 },
  adyar: { name: 'Adyar Basin', center: [13.01, 80.18], zoom: 12 },
  cooum: { name: 'Cooum Basin', center: [13.08, 80.20], zoom: 12 },
  cauvery: { name: 'Cauvery Delta', center: [10.87, 78.70], zoom: 10 },
  vaigai: { name: 'Vaigai Basin', center: [9.95, 78.15], zoom: 10 },
  tamiraparani: { name: 'Thamirabarani', center: [8.73, 77.72], zoom: 11 },
  palar: { name: 'Palar Basin', center: [12.92, 79.40], zoom: 10 }
};

export default function InteractiveMap({ 
  onSelectBasin, 
  selectedBasinId = null,
  height = '560px', 
  interactive = true,
  showLayerControls = true 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const baseTileLayerRef = useRef(null);
  const baseOverlayLayerRef = useRef(null);

  const layersRef = useRef({
    basins: null,
    stations: null,
    reservoirs: null,
    shelters: null,
    heatmap: null
  });

  const [currentBasemap, setCurrentBasemap] = useState(() => {
    return localStorage.getItem('fic_basemap') || 'satellite';
  });

  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem('fic_mapbox_key') || '';
  });

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [activeLayers, setActiveLayers] = useState({
    basins: true,
    stations: true,
    reservoirs: true,
    shelters: true,
    heatmap: true
  });

  const [loading, setLoading] = useState(true);
  const [cursorCoords, setCursorCoords] = useState({ lat: 11.5, lng: 79.2, zoom: 7 });

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [11.2, 78.8],
      zoom: 7,
      minZoom: 6,
      maxZoom: 19,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive
    });

    mapInstanceRef.current = map;

    // Track mouse coordinates
    map.on('mousemove', (e) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4)),
        zoom: map.getZoom()
      });
    });

    // Apply initial basemap
    applyBasemapLayer(map, currentBasemap, customApiKey);

    // Load GIS Layers
    async function loadGISData() {
      try {
        const [basinsGeoJSON, featuresGeoJSON, heatmapPoints] = await Promise.all([
          fetchBasinsGeoJSON(),
          fetchFeaturesGeoJSON(),
          fetchRiskHeatmap()
        ]);

        // 1. Basins GeoJSON Layer
        if (basinsGeoJSON && basinsGeoJSON.features) {
          const basinsLayer = L.geoJSON(basinsGeoJSON, {
            style: (feature) => {
              const bId = feature.properties.id;
              const isSelected = selectedBasinId && bId === selectedBasinId;
              const riskColor = feature.properties.risk_color || '#22c55e';
              return {
                color: isSelected ? '#38bdf8' : (feature.properties.modelled ? riskColor : '#3b82f6'),
                weight: isSelected ? 3.5 : (feature.properties.modelled ? 2.5 : 1.2),
                dashArray: feature.properties.modelled ? '' : '4, 4',
                fillColor: riskColor,
                fillOpacity: isSelected ? 0.40 : (feature.properties.modelled ? 0.25 : 0.08)
              };
            },
            onEachFeature: (feature, layer) => {
              const p = feature.properties;
              layer.bindPopup(`
                <div style="font-family: 'Outfit', sans-serif; min-width: 200px; padding: 4px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-size: 10px; text-transform: uppercase; color: #38bdf8; font-weight: 700; letter-spacing: 0.5px;">
                      ${p.modelled ? '★ Modelled Basin' : 'Monitored Basin'}
                    </span>
                    <span style="background: ${p.risk_color || '#22c55e'}; color: #000; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
                      ${p.risk_state || 'NORMAL'}
                    </span>
                  </div>
                  <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #ffffff;">${p.name} Basin</h3>
                  <p style="margin: 0 0 8px 0; font-size: 11px; color: #94a3b8;">Rivers: ${p.rivers}</p>
                  
                  <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                      <span style="color: #94a3b8;">24h Rainfall:</span>
                      <strong style="color: #38bdf8;">${p.current_rain || 0} mm</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                      <span style="color: #94a3b8;">Key Gauge Level:</span>
                      <strong style="color: #f1f5f9;">${p.river_level ? p.river_level + ' m' : 'Active'}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px;">
                      <span style="color: #94a3b8;">Warning Mark:</span>
                      <strong style="color: #f59e0b;">${p.warning_level || '2.50'} m</strong>
                    </div>
                  </div>
                  <button id="popup-btn-${p.id}" style="width: 100%; background: #0284c7; color: #fff; border: none; padding: 7px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: background 0.2s;">
                    View Detailed Basin Intelligence →
                  </button>
                </div>
              `);

              layer.on('popupopen', () => {
                const btn = document.getElementById(`popup-btn-${p.id}`);
                if (btn && onSelectBasin) {
                  btn.onclick = () => onSelectBasin(p.id);
                }
              });

              layer.on('click', () => {
                if (onSelectBasin) onSelectBasin(p.id);
              });
            }
          }).addTo(map);

          layersRef.current.basins = basinsLayer;
        }

        // 2. Feature Points (Stations, Reservoirs, Shelters)
        if (featuresGeoJSON && featuresGeoJSON.features) {
          const stationsGroup = L.layerGroup();
          const reservoirsGroup = L.layerGroup();
          const sheltersGroup = L.layerGroup();

          featuresGeoJSON.features.forEach((feat) => {
            const [lon, lat] = feat.geometry.coordinates;
            const p = feat.properties;

            if (p.type === 'station') {
              const isWarning = p.status === 'WARNING' || p.status === 'CRITICAL';
              const markerHtml = `
                <div style="position: relative; display: flex; items-center: center; justify-content: center; width: 26px; height: 26px;">
                  ${isWarning ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${p.color}; opacity: 0.5; animation: live-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
                  <div style="width: 16px; height: 16px; border-radius: 50%; background: ${p.color}; border: 2.5px solid #ffffff; box-shadow: 0 0 12px ${p.color};"></div>
                </div>
              `;
              const icon = L.divIcon({ html: markerHtml, className: 'custom-station-icon', iconSize: [26, 26] });
              const m = L.marker([lat, lon], { icon }).bindPopup(`
                <div style="font-family: 'Outfit', sans-serif; min-width: 180px;">
                  <span style="font-size: 10px; text-transform: uppercase; color: #38bdf8; font-weight: 700;">RIVER GAUGING TELEMETRY</span>
                  <h4 style="margin: 2px 0 6px 0; font-size: 14px; font-weight: 700; color: #fff;">${p.name}</h4>
                  <div style="font-size: 12px; color: #cbd5e1; line-height: 1.6;">
                    <div>Level: <strong style="color: ${p.color}">${p.current_level_m} m</strong></div>
                    <div>Warning Mark: <strong>${p.warning_level_m} m</strong></div>
                    <div>Danger Mark: <strong style="color: #ef4444">${p.danger_level_m} m</strong></div>
                    <div>Discharge: <strong>${p.discharge_cusecs ? p.discharge_cusecs.toLocaleString() : 'N/A'} cusecs</strong></div>
                    <div>Trend: <strong style="color: ${p.trend === 'RISING' ? '#f59e0b' : '#34d399'}">${p.trend}</strong></div>
                  </div>
                </div>
              `);
              stationsGroup.addLayer(m);
            } else if (p.type === 'reservoir') {
              const markerHtml = `
                <div style="width: 22px; height: 22px; border-radius: 6px; background: #0c4a6e; border: 2px solid #38bdf8; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(56,189,248,0.6);">
                  <div style="width: 8px; height: 8px; border-radius: 2px; background: #38bdf8;"></div>
                </div>
              `;
              const icon = L.divIcon({ html: markerHtml, className: 'custom-res-icon', iconSize: [22, 22] });
              const m = L.marker([lat, lon], { icon }).bindPopup(`
                <div style="font-family: 'Outfit', sans-serif; min-width: 180px;">
                  <span style="font-size: 10px; text-transform: uppercase; color: #06b6d4; font-weight: 700;">DAM / RESERVOIR</span>
                  <h4 style="margin: 2px 0 6px 0; font-size: 14px; color: #fff;">${p.name}</h4>
                  <div style="font-size: 12px; color: #cbd5e1; line-height: 1.6;">
                    <div>Storage: <strong style="color: #38bdf8">${p.storage_pct}%</strong> (${p.storage_mcft} Mcft)</div>
                    <div>Inflow: <strong>${p.inflow_cusecs ? p.inflow_cusecs.toLocaleString() : '—'} cusecs</strong></div>
                    <div>Outflow: <strong style="color: #f59e0b">${p.outflow_cusecs ? p.outflow_cusecs.toLocaleString() : '—'} cusecs</strong></div>
                    <div>Status: <span style="color: #38bdf8; font-weight: 700;">${p.status}</span></div>
                  </div>
                </div>
              `);
              reservoirsGroup.addLayer(m);
            } else if (p.type === 'shelter') {
              const markerHtml = `
                <div style="width: 22px; height: 22px; border-radius: 50%; background: #581c87; border: 2px solid #c084fc; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(192,132,252,0.5);">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: #e9d5ff;"></div>
                </div>
              `;
              const icon = L.divIcon({ html: markerHtml, className: 'custom-shelter-icon', iconSize: [22, 22] });
              const m = L.marker([lat, lon], { icon }).bindPopup(`
                <div style="font-family: 'Outfit', sans-serif; min-width: 190px;">
                  <span style="font-size: 10px; text-transform: uppercase; color: #c084fc; font-weight: 700;">EVACUATION RELIEF CENTRE</span>
                  <h4 style="margin: 2px 0 6px 0; font-size: 14px; color: #fff;">${p.name}</h4>
                  <div style="font-size: 12px; color: #cbd5e1; line-height: 1.6;">
                    <div>Safe Capacity: <strong style="color: #fff;">${p.capacity_persons} persons</strong></div>
                    <div>Safe Ground Elevation: <strong>${p.safe_elevation_m} m MSL</strong></div>
                    <div>Helpline: <strong style="color: #38bdf8">${p.phone}</strong></div>
                  </div>
                </div>
              `);
              sheltersGroup.addLayer(m);
            }
          });

          stationsGroup.addTo(map);
          reservoirsGroup.addTo(map);
          sheltersGroup.addTo(map);

          layersRef.current.stations = stationsGroup;
          layersRef.current.reservoirs = reservoirsGroup;
          layersRef.current.shelters = sheltersGroup;
        }

        // 3. Flood Risk Heatmap Circles
        if (heatmapPoints && heatmapPoints.length) {
          const heatmapGroup = L.layerGroup();
          heatmapPoints.forEach(pt => {
            const color = pt.risk === 'CRITICAL' ? '#ef4444' : (pt.risk === 'WARNING' ? '#f97316' : (pt.risk === 'WATCH' ? '#eab308' : '#22c55e'));
            const circle = L.circleMarker([pt.lat, pt.lon], {
              radius: pt.radius || 22,
              fillColor: color,
              fillOpacity: 0.35,
              color: color,
              weight: 1.5,
              opacity: 0.85
            }).bindPopup(`
              <div style="font-family: 'Outfit', sans-serif;">
                <span style="font-size: 10px; color: ${color}; font-weight: 700;">FLOODPLAIN RISK OVERLAY</span>
                <h4 style="margin: 2px 0 4px 0; font-size: 13px; color: #fff;">${pt.name}</h4>
                <div style="font-size: 11px; color: #94a3b8;">Risk Status: <strong style="color: ${color}">${pt.risk}</strong> (${Math.round(pt.intensity * 100)}% severity)</div>
              </div>
            `);
            heatmapGroup.addLayer(circle);
          });
          heatmapGroup.addTo(map);
          layersRef.current.heatmap = heatmapGroup;
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load GIS data:', err);
        setLoading(false);
      }
    }

    loadGISData();

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Basemap Switcher Helper
  function applyBasemapLayer(map, basemapId, token) {
    if (!map) return;

    // Remove existing tile layer & overlay
    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }
    if (baseOverlayLayerRef.current) {
      map.removeLayer(baseOverlayLayerRef.current);
      baseOverlayLayerRef.current = null;
    }

    // Check if Mapbox token is provided and user selected satellite/streets with token
    if (token && token.trim().startsWith('pk.')) {
      const mapboxStyle = basemapId === 'satellite' ? 'satellite-streets-v12' : (basemapId === 'streets' ? 'streets-v12' : 'dark-v11');
      const mbLayer = L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/${mapboxStyle}/tiles/{z}/{x}/{y}?access_token=${token.trim()}`,
        {
          attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          tileSize: 512,
          zoomOffset: -1,
          maxZoom: 20
        }
      ).addTo(map);
      baseTileLayerRef.current = mbLayer;
      return;
    }

    // Built-in standard tile provider
    const cfg = BASEMAP_TILES[basemapId] || BASEMAP_TILES.satellite;
    const tileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom || 19,
      subdomains: cfg.id === 'dark' ? 'abcd' : 'abc'
    }).addTo(map);
    baseTileLayerRef.current = tileLayer;

    // Optional place names/boundary overlay for satellite
    if (cfg.overlayUrl) {
      const overlay = L.tileLayer(cfg.overlayUrl, {
        maxZoom: 19
      }).addTo(map);
      baseOverlayLayerRef.current = overlay;
    }
  }

  // Handle switching basemaps
  function handleBasemapChange(basemapId) {
    setCurrentBasemap(basemapId);
    localStorage.setItem('fic_basemap', basemapId);
    if (mapInstanceRef.current) {
      applyBasemapLayer(mapInstanceRef.current, basemapId, customApiKey);
    }
  }

  // Handle saving Mapbox API Key
  function handleSaveApiKey(e) {
    if (e) e.preventDefault();
    const cleanKey = tempApiKey.trim();
    setCustomApiKey(cleanKey);
    localStorage.setItem('fic_mapbox_key', cleanKey);
    setShowKeyModal(false);
    if (mapInstanceRef.current) {
      applyBasemapLayer(mapInstanceRef.current, currentBasemap, cleanKey);
    }
  }

  function handleClearApiKey() {
    setCustomApiKey('');
    setTempApiKey('');
    localStorage.removeItem('fic_mapbox_key');
    setShowKeyModal(false);
    if (mapInstanceRef.current) {
      applyBasemapLayer(mapInstanceRef.current, currentBasemap, '');
    }
  }

  // Update layer visibility when activeLayers state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.keys(activeLayers).forEach(key => {
      const layer = layersRef.current[key];
      if (!layer) return;
      if (activeLayers[key]) {
        if (!map.hasLayer(layer)) map.addLayer(layer);
      } else {
        if (map.hasLayer(layer)) map.removeLayer(layer);
      }
    });
  }, [activeLayers]);

  function toggleLayer(layerKey) {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  }

  function handleJumpToBasin(basinKey) {
    const target = BASIN_JUMP_TARGETS[basinKey];
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(target.center, target.zoom, {
        duration: 1.4,
        easeLinearity: 0.25
      });
      if (basinKey !== 'all' && onSelectBasin) {
        onSelectBasin(basinKey);
      }
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-blue-500/25 bg-[#070d18] shadow-2xl">
      
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#070d18]/85 backdrop-blur-md">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-cyan-400 border-t-transparent shadow-[0_0_15px_#06b6d4]" />
            <span className="font-mono text-xs tracking-widest text-cyan-400">CONNECTING REAL GIS SATELLITE TILES...</span>
          </div>
        </div>
      )}

      {/* Top Left: Basemap Switcher & Custom Key Control */}
      <div className="absolute top-4 left-4 z-[999] flex flex-wrap items-center gap-1.5 rounded-xl border border-blue-500/30 bg-[#0c1930]/90 p-1.5 shadow-xl backdrop-blur-md">
        
        {/* Basemap Options */}
        {Object.values(BASEMAP_TILES).map((bm) => {
          const IconComp = bm.icon;
          const isActive = currentBasemap === bm.id;
          return (
            <button
              key={bm.id}
              onClick={() => handleBasemapChange(bm.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                isActive 
                  ? 'bg-blue-600 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]' 
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/60 hover:text-white'
              }`}
              title={bm.name}
            >
              <IconComp className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{bm.name}</span>
            </button>
          );
        })}

        {/* Custom Map API Key Button */}
        <button
          onClick={() => {
            setTempApiKey(customApiKey);
            setShowKeyModal(true);
          }}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            customApiKey
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-400/50'
              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/60 hover:text-white'
          }`}
          title="Configure Mapbox / Custom Map API Key"
        >
          <Key className="h-3.5 w-3.5 text-amber-400" />
          <span>{customApiKey ? 'Mapbox Key Active' : 'Map Key'}</span>
        </button>
      </div>

      {/* Top Right: Quick Basin Jump Selector */}
      <div className="absolute top-4 right-4 z-[999] hidden md:flex items-center gap-1 rounded-xl border border-blue-500/30 bg-[#0c1930]/90 p-1.5 shadow-xl backdrop-blur-md">
        <span className="px-2 text-[10px] font-mono uppercase text-slate-400">JUMP TO:</span>
        {Object.entries(BASIN_JUMP_TARGETS).map(([key, item]) => {
          const isSelected = selectedBasinId === key || (key === 'all' && !selectedBasinId);
          return (
            <button
              key={key}
              onClick={() => handleJumpToBasin(key)}
              className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
                isSelected 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {key === 'all' ? 'All TN' : item.name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Bottom Left: Layer Visibility Toggles & View Reset */}
      {showLayerControls && !loading && (
        <div className="absolute bottom-4 left-4 z-[999] flex flex-wrap items-center gap-1.5 rounded-xl border border-blue-500/30 bg-[#0c1930]/90 p-2 shadow-xl backdrop-blur-md">
          <button
            onClick={() => toggleLayer('basins')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeLayers.basins ? 'bg-blue-600/50 text-cyan-300 border border-cyan-400/50' : 'bg-slate-800/40 text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="h-3.5 w-3.5" /> Basins (6)
          </button>
          <button
            onClick={() => toggleLayer('stations')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeLayers.stations ? 'bg-blue-600/50 text-cyan-300 border border-cyan-400/50' : 'bg-slate-800/40 text-slate-400 hover:text-white'
            }`}
          >
            <Waves className="h-3.5 w-3.5" /> Live Gauges
          </button>
          <button
            onClick={() => toggleLayer('reservoirs')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeLayers.reservoirs ? 'bg-blue-600/50 text-cyan-300 border border-cyan-400/50' : 'bg-slate-800/40 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Dams
          </button>
          <button
            onClick={() => toggleLayer('shelters')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeLayers.shelters ? 'bg-purple-600/50 text-purple-200 border border-purple-400/50' : 'bg-slate-800/40 text-slate-400 hover:text-white'
            }`}
          >
            <Home className="h-3.5 w-3.5" /> Relief Shelters
          </button>
          <button
            onClick={() => toggleLayer('heatmap')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeLayers.heatmap ? 'bg-amber-600/50 text-amber-200 border border-amber-400/50' : 'bg-slate-800/40 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" /> Risk Heatmap
          </button>
          <button
            onClick={() => handleJumpToBasin('all')}
            title="Reset Map View"
            className="rounded-lg bg-slate-800/60 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Right: Coordinates HUD & Risk Legend */}
      <div className="absolute bottom-4 right-4 z-[999] flex flex-col items-end gap-2">
        {/* Coordinates HUD */}
        <div className="hidden sm:block rounded-lg border border-blue-500/20 bg-[#0c1930]/90 px-2.5 py-1 font-mono text-[10px] text-slate-400 shadow-lg backdrop-blur-md">
          LAT: <span className="text-cyan-300">{cursorCoords.lat}°N</span> | LON: <span className="text-cyan-300">{cursorCoords.lng}°E</span> | ZOOM: <span className="text-cyan-300">{cursorCoords.zoom}</span>
        </div>

        {/* Risk Legend */}
        <div className="rounded-xl border border-blue-500/30 bg-[#0c1930]/90 px-3.5 py-2.5 shadow-xl backdrop-blur-md">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Risk Severity</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="text-slate-200">Normal / Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              <span className="text-slate-200">Watch (Rising)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
              <span className="text-slate-200">Warning Mark</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              <span className="text-slate-200">Critical Breach</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mapbox / Custom Map API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-cyan-400/40 bg-[#0c1930] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-400/40 text-cyan-400">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Map API Key Settings</h3>
                <p className="text-xs text-slate-400">
                  Switch to Mapbox Satellite Streets or custom vector tile server
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              By default, this intelligence centre already streams <strong>Real Satellite Imagery (Esri World Imagery)</strong>, 
              <strong>Real OpenStreetMap Streets</strong>, and <strong>Topographic Contours</strong> with 100% free live access.
              If you have a private <strong>Mapbox Access Token</strong> (starting with <code className="text-cyan-300">pk.eyJ...</code>), you can paste it below to enable high-resolution Mapbox Satellite Streets v12.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mapbox Access Token
                </label>
                <input
                  type="text"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSI..."
                  className="w-full rounded-xl border border-blue-500/30 bg-[#070d18] px-3.5 py-2.5 font-mono text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                {customApiKey && (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="rounded-xl border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40"
                  >
                    Clear Saved Key
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-400"
                  >
                    <Check className="h-4 w-4" />
                    Apply Key
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
