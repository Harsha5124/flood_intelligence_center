import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Activity, Bell, Info } from 'lucide-react';
import { fetchWarnings, acknowledgeWarning } from '../services/api';

export default function WarningsPage() {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchWarnings();
        setWarnings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleAcknowledge(id) {
    await acknowledgeWarning(id);
    const updated = await fetchWarnings();
    setWarnings(updated);
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-[#0c1930]/85 p-6 shadow-xl backdrop-blur-md sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">STATE EARLY WARNING ENGINE</span>
            <span className="rounded bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-blue-500/30">
              Condition-Driven Hysteresis
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Automated Early Warning Status
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Multi-stage flood alerts combining stage thresholds, rate-of-rise confirmation, and ML flood probabilities.
          </p>
        </div>
      </div>

      {/* State Machine Hierarchy Display */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-[#0c1930] p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-emerald-400">NORMAL</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <p className="mt-2 text-xs text-slate-300">
            River stage below 2.0m. ML flood probability &lt; 15%. Routine surveillance active.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-[#0c1930] p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-amber-400">WATCH</span>
            <span className="h-2 w-2 rounded-full bg-amber-400" />
          </div>
          <p className="mt-2 text-xs text-slate-300">
            Stage within 0.35m of warning mark. Soil saturation high. 15-minute telemetry intervals.
          </p>
        </div>

        <div className="rounded-2xl border border-orange-500/40 bg-[#0c1930] p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-orange-400">WARNING</span>
            <span className="h-2 w-2 rounded-full bg-orange-400" />
          </div>
          <p className="mt-2 text-xs text-slate-300">
            Warning Mark (2.50m) crossed or ML prob &gt; 40%. Restrict causeway crossings and prep relief shelters.
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/40 bg-[#0c1930] p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-red-400">CRITICAL</span>
            <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          </div>
          <p className="mt-2 text-xs text-slate-300">
            Danger Mark (3.50m) exceeded or ML prob &gt; 70%. Immediate low-lying habitation evacuation.
          </p>
        </div>
      </div>

      {/* Active Alerts List */}
      <div className="rounded-2xl border border-blue-500/20 bg-[#0c1930] p-6 shadow-xl backdrop-blur-md">
        <h3 className="font-bold text-sm text-white mb-4">Active & Historical Early Warnings</h3>

        <div className="space-y-4">
          {warnings.map(w => {
            const isCritical = w.severity === 'CRITICAL';
            const isWarning = w.severity === 'WARNING';
            const borderColor = isCritical ? 'border-red-500/40' : (isWarning ? 'border-orange-500/30' : 'border-amber-500/25');
            const bgGlow = isCritical ? 'bg-red-950/20' : (isWarning ? 'bg-orange-950/20' : 'bg-blue-950/20');

            return (
              <div
                key={w.id}
                className={`rounded-2xl border ${borderColor} ${bgGlow} p-5 transition-all`}
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-extrabold ${
                        isCritical ? 'bg-red-500 text-white' : (isWarning ? 'bg-orange-500 text-black' : 'bg-amber-400 text-black')
                      }`}>
                        {w.severity}
                      </span>
                      <span className="font-mono text-xs uppercase font-bold text-cyan-300">
                        {w.basin_id} Basin
                      </span>
                      <span className="text-[11px] text-slate-400">• Logged: {w.created_at}</span>
                    </div>

                    <h4 className="mt-2 font-bold text-base text-white">{w.title}</h4>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">{w.message}</p>
                    
                    <div className="mt-3 rounded-xl border border-blue-500/20 bg-[#070d18] p-3 text-xs">
                      <strong className="text-cyan-300">Recommended Operational Action:</strong>{' '}
                      <span className="text-slate-200">{w.recommended_action}</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {w.acknowledged ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                        <CheckCircle2 className="h-4 w-4" /> Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(w.id)}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 hover:text-black transition-all"
                      >
                        Acknowledge Alert
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
