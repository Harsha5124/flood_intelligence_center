import React from 'react';
import { X, ArrowRight, ShieldAlert, Waves, CloudRain, Layers, Compass, CheckCircle } from 'lucide-react';

export default function BasinOverviewModal({ basin, isOpen, onClose, onViewDetailed }) {
  if (!isOpen || !basin) return null;

  const isCritical = basin.risk_state === 'CRITICAL';
  const isWarning = basin.risk_state === 'WARNING';
  const isWatch = basin.risk_state === 'WATCH';

  return (
    <div className="fixed inset-0 z-[1800] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-blue-500/30 bg-[#0c1930] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-start justify-between border-b border-blue-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">
                {basin.modelled ? '★ Machine Learning Supported' : 'GIS Monitored'}
              </span>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                isCritical ? 'bg-red-500 text-white' : (isWarning ? 'bg-orange-500 text-black' : (isWatch ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-black'))
              }`}>
                {basin.risk_state}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">{basin.name}</h2>
            <p className="mt-1 text-xs text-slate-400">Districts: {basin.districts?.join(', ')}</p>
          </div>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-blue-500/20 bg-[#070d18] p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">24h Rainfall</div>
            <div className="mt-1 font-mono text-lg font-bold text-cyan-300">{basin.current_rain_24h_mm} mm</div>
            <div className="text-[10px] text-slate-500">Forecast: {basin.forecast_rain_24h_mm} mm</div>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-[#070d18] p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">River Level</div>
            <div className="mt-1 font-mono text-lg font-bold text-white">{basin.river_level_m} m</div>
            <div className="text-[10px] text-amber-400">Warn Mark: {basin.warning_level_m}m</div>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-[#070d18] p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Rate of Rise</div>
            <div className="mt-1 font-mono text-lg font-bold text-amber-300">+{basin.rate_of_change_cm_hr} cm/h</div>
            <div className="text-[10px] text-slate-500">Trend: {basin.trend}</div>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-[#070d18] p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Key Reservoir</div>
            <div className="mt-1 truncate font-mono text-xs font-bold text-blue-300">{basin.key_reservoir}</div>
            <div className="text-[10px] text-emerald-400">Active Outflow</div>
          </div>
        </div>

        {/* Basin Description */}
        <div className="mt-5 rounded-xl border border-blue-500/15 bg-blue-950/20 p-4">
          <h4 className="font-semibold text-xs text-cyan-300">Hydrological Profile & Floodplain Context</h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            {basin.description}
          </p>
        </div>

        {/* Public Notice */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200">
          <span>Public summary mode. Detailed ML feature contributions, live sensor telemetry, and evacuation intelligence require officer authentication.</span>
        </div>

        {/* Primary Action Button */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onViewDetailed(basin.id);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-xs text-white shadow-[0_0_20px_rgba(2,132,199,0.4)] transition-all hover:bg-cyan-500 hover:text-black"
          >
            <span>View Detailed Intelligence</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
