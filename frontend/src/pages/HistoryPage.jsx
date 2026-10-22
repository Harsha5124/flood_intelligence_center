import React, { useState, useEffect } from 'react';
import { History, Calendar, FileText, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { fetchHistoryEvents } from '../services/api';

export default function HistoryPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchHistoryEvents();
        setEvents(data);
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
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">HISTORICAL BENCHMARKS & ARCHIVE</span>
            <span className="rounded bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-blue-500/30">
              2000–2025 Archive (18,992 Records)
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Major Tamil Nadu Flood Event Analysis
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Comparative analysis of past monsoon cloudbursts, reservoir spillway surges, and ML model backtesting.
          </p>
        </div>
      </div>

      {/* Benchmark Event Cards */}
      <div className="space-y-5">
        {events.map(ev => {
          const isCatastrophic = ev.severity === 'CATASTROPHIC';
          const isCritical = ev.severity === 'CRITICAL';
          const borderColor = isCatastrophic ? 'border-red-500/40' : (isCritical ? 'border-orange-500/30' : 'border-amber-500/25');
          const bgGlow = isCatastrophic ? 'bg-red-950/15' : 'bg-[#0c1930]';

          return (
            <div
              key={ev.id}
              className={`rounded-2xl border ${borderColor} ${bgGlow} p-6 shadow-xl backdrop-blur-md`}
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2.5 py-0.5 text-[10px] font-extrabold ${
                      isCatastrophic ? 'bg-red-600 text-white' : (isCritical ? 'bg-orange-500 text-black' : 'bg-amber-400 text-black')
                    }`}>
                      {ev.severity}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-cyan-400" /> {ev.date}
                    </span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-white">{ev.name}</h3>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {ev.summary}
                  </p>
                </div>
              </div>

              {/* Event Peak Telemetry Grid */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 text-center text-xs">
                <div className="rounded-xl border border-blue-500/15 bg-[#070d18] p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Peak 24h Rain</div>
                  <div className="mt-1 font-mono text-lg font-bold text-cyan-300">{ev.peak_rainfall_24h_mm} mm</div>
                </div>

                <div className="rounded-xl border border-blue-500/15 bg-[#070d18] p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Peak Spillway Outflow</div>
                  <div className="mt-1 font-mono text-lg font-bold text-orange-400">{ev.peak_chembarambakkam_outflow_cusecs.toLocaleString()} cusecs</div>
                </div>

                <div className="rounded-xl border border-blue-500/15 bg-[#070d18] p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Peak River Stage</div>
                  <div className="mt-1 font-mono text-lg font-bold text-red-400">{ev.max_adyar_level_m} m</div>
                </div>

                <div className="rounded-xl border border-blue-500/15 bg-[#070d18] p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Affected Basins</div>
                  <div className="mt-1 font-mono text-xs font-semibold text-white truncate">{ev.affected_basins.join(', ')}</div>
                </div>
              </div>

              {/* Lessons Learned */}
              <div className="mt-4 rounded-xl border border-blue-500/15 bg-blue-950/20 p-3 text-xs">
                <span className="font-bold text-cyan-300">Operational Takeaway: </span>
                <span className="text-slate-300">{ev.key_lessons}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
