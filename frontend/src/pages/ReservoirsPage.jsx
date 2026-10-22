import React, { useState, useEffect } from 'react';
import { Layers, AlertTriangle, ShieldCheck, ArrowUpRight, ArrowDownRight, Droplet } from 'lucide-react';
import { fetchReservoirs } from '../services/api';

export default function ReservoirsPage() {
  const [reservoirs, setReservoirs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchReservoirs();
        setReservoirs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-[#0c1930]/85 p-6 shadow-xl backdrop-blur-md sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">STORAGE & DISCHARGE REGULATION</span>
            <span className="rounded bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-blue-500/30">
              5 Major Reservoirs
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Tamil Nadu Dam & Reservoir Telemetry
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Current storage percentages, regulated flood gate discharge, and inflow capacity margins.
          </p>
        </div>
      </div>

      {/* Reservoirs Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reservoirs.map(r => {
          const isHighAlert = r.status === 'HIGH ALERT';
          const isMonitoring = r.status === 'MONITORING';

          return (
            <div
              key={r.id}
              className={`rounded-2xl border p-5 shadow-xl backdrop-blur-md transition-all ${
                isHighAlert 
                  ? 'border-orange-500/50 bg-[#0c1930] shadow-[0_0_25px_rgba(249,115,22,0.2)]' 
                  : 'border-blue-500/20 bg-[#0c1930]/85'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase text-cyan-400 font-bold">
                    {r.district} District • {r.basin_id.toUpperCase()} Basin
                  </span>
                  <h3 className="mt-1 font-bold text-lg text-white">{r.name}</h3>
                </div>
                <span className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold ${
                  isHighAlert ? 'bg-orange-500 text-black' : (isMonitoring ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-black')
                }`}>
                  {r.status}
                </span>
              </div>

              {/* Storage Percentage Bar */}
              <div className="mt-5 rounded-xl border border-blue-500/20 bg-[#070d18] p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Storage</span>
                  <span className="font-mono font-bold text-white text-base">{r.storage_pct}%</span>
                </div>

                <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      r.storage_pct > 80 ? 'bg-orange-500' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${r.storage_pct}%` }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-[11px] font-mono text-slate-400">
                  <span>{r.current_storage_mcft} Mcft</span>
                  <span>Cap: {r.total_capacity_mcft} Mcft</span>
                </div>
              </div>

              {/* Inflow vs Outflow */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs">
                <div className="rounded-xl border border-blue-500/15 bg-blue-950/30 p-3">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                    <ArrowDownRight className="h-3.5 w-3.5 text-cyan-400" /> Inflow
                  </div>
                  <div className="mt-1 font-mono font-bold text-base text-cyan-300">
                    {r.inflow_cusecs.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">cusecs</div>
                </div>

                <div className="rounded-xl border border-blue-500/15 bg-blue-950/30 p-3">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                    <ArrowUpRight className="h-3.5 w-3.5 text-orange-400" /> Outflow
                  </div>
                  <div className="mt-1 font-mono font-bold text-base text-orange-300">
                    {r.outflow_cusecs.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">cusecs</div>
                </div>
              </div>

              {/* Spillway Gates */}
              <div className="mt-4 flex items-center justify-between border-t border-blue-500/15 pt-3 text-xs text-slate-300">
                <span>Spillway Gates:</span>
                <span className="font-mono font-bold text-white">
                  <span className="text-orange-400">{r.gates_opened}</span> / {r.total_gates} Gates Opened
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
