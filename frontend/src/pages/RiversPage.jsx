import React, { useState, useEffect } from 'react';
import { Waves, TrendingUp, TrendingDown, Minus, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { fetchRivers, fetchRiverHydrograph } from '../services/api';

export default function RiversPage() {
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState('st-ady-02');
  const [hydrographData, setHydrographData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRiversData() {
      try {
        const data = await fetchRivers();
        setStations(data);
        if (data.length > 0) {
          const firstId = data.find(s => s.id === 'st-ady-02')?.id || data[0].id;
          setSelectedStationId(firstId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRiversData();
  }, []);

  useEffect(() => {
    if (!selectedStationId) return;
    async function loadHydrograph() {
      try {
        const hData = await fetchRiverHydrograph(selectedStationId);
        setHydrographData(hData);
      } catch (err) {
        console.error(err);
      }
    }
    loadHydrograph();
  }, [selectedStationId]);

  const selectedStation = stations.find(s => s.id === selectedStationId);

  return (
    <div className="space-y-6">
      
      {/* Rivers Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-[#0c1930]/85 p-6 shadow-xl backdrop-blur-md sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">RIVER STAGE & TELEMETRY</span>
            <span className="rounded bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-blue-500/30">
              {stations.length} Active Gauges
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            River Gauging Stations & Hydrographs
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Real-time stage heights relative to Warning & Danger marks with rate-of-change trend vectors.
          </p>
        </div>
      </div>

      {/* Selected Station 24h Hydrograph View */}
      {selectedStation && (
        <div className="rounded-2xl border border-blue-500/25 bg-[#0c1930] p-6 shadow-xl backdrop-blur-md">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-400 uppercase font-bold">{selectedStation.river} River</span>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  selectedStation.status === 'WARNING' ? 'bg-orange-500 text-black' : (selectedStation.status === 'WATCH' ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-black')
                }`}>
                  {selectedStation.status}
                </span>
              </div>
              <h2 className="mt-1 text-xl font-bold text-white">{selectedStation.name}</h2>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <div className="text-slate-400">Current Level</div>
                <div className="text-lg font-bold text-white">{selectedStation.current_level_m} m</div>
              </div>
              <div className="text-right">
                <div className="text-slate-400">Rate of Rise</div>
                <div className="text-lg font-bold text-amber-300">+{selectedStation.rate_of_change_cm_hr} cm/h</div>
              </div>
              <div className="text-right">
                <div className="text-slate-400">Est. Discharge</div>
                <div className="text-lg font-bold text-cyan-300">{selectedStation.discharge_cusecs.toLocaleString()} cusecs</div>
              </div>
            </div>
          </div>

          {/* Hydrograph Chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hydrographData?.hydrograph || []}>
                <defs>
                  <linearGradient id="levelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, Math.ceil(selectedStation.danger_level_m + 1.0)]} tickFormatter={v => `${v}m`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c1930', borderColor: '#0284c7', borderRadius: '12px' }}
                  labelFormatter={v => `Time: ${v}`}
                  formatter={(val, name) => [`${val} m`, name === 'water_level_m' ? 'Water Level' : name]}
                />
                {/* Warning Mark Reference Line */}
                <ReferenceLine 
                  y={selectedStation.warning_level_m} 
                  stroke="#f59e0b" 
                  strokeDasharray="4 4" 
                  label={{ value: `Warning: ${selectedStation.warning_level_m}m`, fill: '#f59e0b', fontSize: 11 }} 
                />
                {/* Danger Mark Reference Line */}
                <ReferenceLine 
                  y={selectedStation.danger_level_m} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  label={{ value: `Danger: ${selectedStation.danger_level_m}m`, fill: '#ef4444', fontSize: 11 }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="water_level_m" 
                  stroke="#38bdf8" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#levelGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Stations Table */}
      <div className="rounded-2xl border border-blue-500/20 bg-[#0c1930] p-5 shadow-xl backdrop-blur-md">
        <h3 className="mb-4 font-bold text-sm text-white">All Tamil Nadu Gauging Stations Telemetry</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-blue-500/20 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pl-3">Station Name</th>
                <th className="pb-3">River / Basin</th>
                <th className="pb-3">Current Level</th>
                <th className="pb-3">Warning Mark</th>
                <th className="pb-3">Danger Mark</th>
                <th className="pb-3">Rate of Rise</th>
                <th className="pb-3">Discharge</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/10">
              {stations.map(st => {
                const isSelected = st.id === selectedStationId;
                const isWarning = st.status === 'WARNING';
                const isWatch = st.status === 'WATCH';

                return (
                  <tr 
                    key={st.id} 
                    onClick={() => setSelectedStationId(st.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-600/20' : 'hover:bg-blue-950/30'
                    }`}
                  >
                    <td className="py-3 pl-3 font-semibold text-white">{st.name}</td>
                    <td className="py-3 text-slate-300">{st.river} ({st.basin_id})</td>
                    <td className="py-3 font-mono font-bold text-cyan-300">{st.current_level_m} m</td>
                    <td className="py-3 font-mono text-amber-400">{st.warning_level_m} m</td>
                    <td className="py-3 font-mono text-red-400">{st.danger_level_m} m</td>
                    <td className="py-3 font-mono text-slate-200">
                      {st.rate_of_change_cm_hr > 0 ? `+${st.rate_of_change_cm_hr}` : st.rate_of_change_cm_hr} cm/h
                    </td>
                    <td className="py-3 font-mono text-slate-300">{st.discharge_cusecs.toLocaleString()} cusecs</td>
                    <td className="py-3">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        isWarning ? 'bg-orange-500 text-black' : (isWatch ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-black')
                      }`}>
                        {st.status}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <button 
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                          isSelected ? 'bg-cyan-500 text-black' : 'bg-blue-950 text-cyan-400 border border-blue-500/30'
                        }`}
                      >
                        {isSelected ? 'Viewing' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
