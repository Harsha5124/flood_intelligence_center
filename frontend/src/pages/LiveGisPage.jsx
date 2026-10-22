import React, { useState } from 'react';
import { Compass, Layers, ShieldAlert, Waves, Home, Info, Filter } from 'lucide-react';
import InteractiveMap from '../maps/InteractiveMap';

export default function LiveGisPage({ selectedBasinId = 'adyar', onSelectBasin }) {
  return (
    <div className="space-y-5">
      {/* Workstation Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-[#0c1930]/85 p-6 shadow-xl backdrop-blur-md sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">GIS OPERATIONS CENTRE</span>
            <span className="rounded bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-blue-500/30">
              Leaflet • OpenStreetMap Dark • GeoJSON
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Interactive Tamil Nadu Basin Workstation
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Real multi-layer spatial exploration of river basins, gauging stations, reservoirs, evacuation shelters, and dynamic risk heatmaps.
          </p>
        </div>

        {/* Quick Instructions */}
        <div className="rounded-xl border border-blue-500/15 bg-[#070d18] px-4 py-2.5 text-xs text-slate-300">
          <span className="text-cyan-400 font-bold">Tip:</span> Click any basin polygon or station pin for live telemetry.
        </div>
      </div>

      {/* Main Full-Size Map Canvas */}
      <div className="relative rounded-2xl border border-blue-500/30 bg-[#0c1930] p-4 shadow-2xl">
        <InteractiveMap 
          height="620px"
          onSelectBasin={onSelectBasin}
          selectedBasinId={selectedBasinId}
          showLayerControls={true}
        />
      </div>

      {/* Layer Explanation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-blue-500/15 bg-[#0c1930]/80 p-4">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
            <Compass className="h-4 w-4" /> Basin Polygons
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real geographic watershed boundaries for Tamil Nadu river systems with color-coded flood risk fills.
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/15 bg-[#0c1930]/80 p-4">
          <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
            <Waves className="h-4 w-4" /> River Gauging Stations
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time stage water meters (Saidapet, Nandambakkam, Aminjikarai, Mukkombu) with pulse indicators.
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/15 bg-[#0c1930]/80 p-4">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
            <Layers className="h-4 w-4" /> Reservoirs & Dams
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Live storage percentages, inflow/outflow discharge rates, and gate opening configurations.
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/15 bg-[#0c1930]/80 p-4">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
            <Home className="h-4 w-4" /> Evacuation Shelters
          </div>
          <p className="mt-1 text-xs text-slate-400">
            High-elevation relief centres, designated community halls, capacity ratings, and officer emergency helplines.
          </p>
        </div>
      </div>
    </div>
  );
}
