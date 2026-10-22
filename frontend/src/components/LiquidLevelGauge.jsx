import React from 'react';
import { Waves, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function LiquidLevelGauge({
  currentLevel = 2.85,
  warningLevel = 2.50,
  dangerLevel = 3.50,
  maxLevel = 4.50,
  riverName = 'Adyar River',
  stationName = 'Saidapet Bridge Gauge',
  rateOfRise = 7.8,
  trend = 'RISING'
}) {
  const safeCurrent = Math.max(0, currentLevel);
  const fillPercentage = Math.min(100, Math.max(5, (safeCurrent / maxLevel) * 100));
  const warningPercentage = Math.min(100, (warningLevel / maxLevel) * 100);
  const dangerPercentage = Math.min(100, (dangerLevel / maxLevel) * 100);

  const isCritical = safeCurrent >= dangerLevel;
  const isWarning = !isCritical && safeCurrent >= warningLevel;
  const isWatch = !isCritical && !isWarning && safeCurrent >= (warningLevel - 0.35);

  const theme = isCritical
    ? {
        border: 'border-red-500/50',
        glow: 'shadow-[0_0_30px_rgba(239,68,68,0.35)]',
        badge: 'bg-red-500 text-white',
        text: 'text-red-400',
        waveGrad: ['#ef4444', '#991b1b'],
        status: 'CRITICAL OVERFLOW RISK'
      }
    : isWarning
    ? {
        border: 'border-orange-500/50',
        glow: 'shadow-[0_0_30px_rgba(249,115,22,0.35)]',
        badge: 'bg-orange-500 text-black',
        text: 'text-orange-400',
        waveGrad: ['#f97316', '#c2410c'],
        status: 'WARNING MARK EXCEEDED'
      }
    : isWatch
    ? {
        border: 'border-amber-400/50',
        glow: 'shadow-[0_0_30px_rgba(251,191,36,0.3)]',
        badge: 'bg-amber-400 text-black',
        text: 'text-amber-400',
        waveGrad: ['#fbbf24', '#b45309'],
        status: 'ELEVATED FLOW WATCH'
      }
    : {
        border: 'border-cyan-400/40',
        glow: 'shadow-[0_0_25px_rgba(6,182,212,0.25)]',
        badge: 'bg-emerald-500 text-black',
        text: 'text-cyan-400',
        waveGrad: ['#06b6d4', '#0284c7'],
        status: 'NORMAL CAPACITY'
      };

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${theme.border} bg-[#0c1930]/90 p-5 ${theme.glow} backdrop-blur-md transition-all duration-500`}>
      {/* Header Info */}
      <div className="flex items-start justify-between border-b border-blue-500/20 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-300">
              CWC TELEMETRIC SENSOR
            </span>
          </div>
          <h3 className="mt-1 font-extrabold text-base text-white">{riverName}</h3>
          <p className="text-xs text-slate-400">{stationName}</p>
        </div>
        <span className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold ${theme.badge}`}>
          {theme.status}
        </span>
      </div>

      {/* Main Gauge Visualizer */}
      <div className="mt-5 grid grid-cols-12 gap-5 items-center">
        {/* Left: Animated Liquid Wave Cylinder (5 cols) */}
        <div className="col-span-5 flex flex-col items-center">
          <div className="relative h-56 w-24 overflow-hidden rounded-2xl border-2 border-blue-400/30 bg-[#070d18] shadow-inner">
            
            {/* Danger Level Marker Line */}
            <div
              className="absolute left-0 right-0 z-20 flex items-center border-t-2 border-dashed border-red-500"
              style={{ bottom: `${dangerPercentage}%` }}
              title={`Danger Level: ${dangerLevel}m`}
            >
              <span className="absolute -top-3 right-1 rounded bg-red-950/90 px-1 font-mono text-[9px] font-bold text-red-300 border border-red-500/40">
                DL {dangerLevel}m
              </span>
            </div>

            {/* Warning Level Marker Line */}
            <div
              className="absolute left-0 right-0 z-20 flex items-center border-t-2 border-dashed border-amber-400"
              style={{ bottom: `${warningPercentage}%` }}
              title={`Warning Level: ${warningLevel}m`}
            >
              <span className="absolute -top-3 right-1 rounded bg-amber-950/90 px-1 font-mono text-[9px] font-bold text-amber-300 border border-amber-500/40">
                WL {warningLevel}m
              </span>
            </div>

            {/* Depth Tick Marks */}
            <div className="absolute top-0 bottom-0 left-1 z-20 flex flex-col justify-between py-2 font-mono text-[8px] text-slate-400 select-none pointer-events-none">
              <span>{maxLevel}m</span>
              <span>{(maxLevel * 0.75).toFixed(1)}m</span>
              <span>{(maxLevel * 0.5).toFixed(1)}m</span>
              <span>{(maxLevel * 0.25).toFixed(1)}m</span>
              <span>0m</span>
            </div>

            {/* Liquid Fill Tank */}
            <div
              className="absolute bottom-0 left-0 right-0 z-10 transition-all duration-1000 ease-out"
              style={{ height: `${fillPercentage}%` }}
            >
              {/* Animated Top Wave SVG */}
              <div className="absolute -top-3 left-0 right-0 h-4 overflow-hidden">
                <svg
                  className="w-[200%] h-full animate-[wave_3s_linear_infinite]"
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                  style={{ transform: 'scaleX(1.5)' }}
                >
                  <path
                    d="M0,0 C150,90 350,-40 500,45 C650,130 900,-30 1200,30 L1200,120 L0,120 Z"
                    fill={theme.waveGrad[0]}
                    opacity="0.8"
                  />
                </svg>
              </div>

              {/* Water Gradient Body */}
              <div
                className="h-full w-full opacity-90 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                style={{
                  background: `linear-gradient(to top, ${theme.waveGrad[1]}, ${theme.waveGrad[0]})`
                }}
              />
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="font-mono text-xs font-bold text-slate-300">
              {fillPercentage.toFixed(1)}% Capacity
            </span>
          </div>
        </div>

        {/* Right: Metric Readouts and Sensor Attributes (7 cols) */}
        <div className="col-span-7 space-y-3">
          {/* Main Water Level Digit */}
          <div className="rounded-xl border border-blue-500/20 bg-[#070d18] p-3 text-left">
            <span className="text-[11px] font-semibold text-slate-400">Current Gauge Depth</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-3xl font-extrabold text-white tracking-tight">
                {safeCurrent.toFixed(2)}
              </span>
              <span className="font-mono text-sm font-bold text-cyan-400">meters</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px]">
              <span className={rateOfRise > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                {rateOfRise > 0 ? `▲ +${rateOfRise} cm/hr (${trend})` : `▼ ${rateOfRise} cm/hr (${trend})`}
              </span>
            </div>
          </div>

          {/* Reference Benchmarks */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="rounded-lg border border-amber-500/25 bg-amber-950/20 p-2">
              <span className="text-[10px] uppercase font-bold text-amber-400">Warning Mark</span>
              <div className="font-mono text-sm font-bold text-white">{warningLevel.toFixed(2)} m</div>
              <div className="text-[9px] text-slate-400">
                {safeCurrent >= warningLevel 
                  ? `+${(safeCurrent - warningLevel).toFixed(2)}m Above` 
                  : `${(warningLevel - safeCurrent).toFixed(2)}m Remaining`}
              </div>
            </div>

            <div className="rounded-lg border border-red-500/25 bg-red-950/20 p-2">
              <span className="text-[10px] uppercase font-bold text-red-400">Danger Mark</span>
              <div className="font-mono text-sm font-bold text-white">{dangerLevel.toFixed(2)} m</div>
              <div className="text-[9px] text-slate-400">
                {safeCurrent >= dangerLevel 
                  ? `+${(safeCurrent - dangerLevel).toFixed(2)}m Breached` 
                  : `${(dangerLevel - safeCurrent).toFixed(2)}m Margin`}
              </div>
            </div>
          </div>

          {/* Sensor Status Footer */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-blue-500/15">
            <span>Sampling: Every 3 sec</span>
            <span className="font-mono text-cyan-300">WRD TN Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
