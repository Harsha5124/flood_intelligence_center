import React, { useState, useEffect } from 'react';
import { Home, Phone, User, Compass, MapPin, ShieldCheck, CheckCircle, Navigation } from 'lucide-react';
import { fetchShelters, fetchNearestShelters } from '../services/api';

export default function EvacuationPage() {
  const [shelters, setShelters] = useState([]);
  const [nearestResult, setNearestResult] = useState(null);
  const [userLat, setUserLat] = useState('13.0185');
  const [userLon, setUserLon] = useState('80.2227');
  const [loadingNearest, setLoadingNearest] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchShelters();
        setShelters(data);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  async function handleFindNearest(e) {
    if (e) e.preventDefault();
    setLoadingNearest(true);
    try {
      const data = await fetchNearestShelters(parseFloat(userLat), parseFloat(userLon));
      setNearestResult(data.nearest_shelters);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNearest(false);
    }
  }

  const displayedShelters = nearestResult || shelters;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-[#0c1930]/85 p-6 shadow-xl backdrop-blur-md sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">DECISION SUPPORT & CIVIL DEFENSE</span>
            <span className="rounded bg-purple-900/60 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
              High-Elevation Safe Zones
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Designated Evacuation Shelters & Relief Camps
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Pre-identified flood shelters, safe elevation benchmarks, generator backups, and officer contacts.
          </p>
        </div>

        {/* State Helpline */}
        <div className="rounded-xl border border-purple-500/30 bg-purple-950/40 px-4 py-2 text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">State Disaster Helpline</div>
          <div className="font-mono text-base font-extrabold text-cyan-300">1070 / 1077 / 1913</div>
        </div>
      </div>

      {/* Spatial Proximity Lookup Box */}
      <div className="rounded-2xl border border-blue-500/25 bg-[#0c1930] p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Navigation className="h-4 w-4 text-cyan-400" />
              Nearest Shelter Spatial Proximity Search
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter target coordinates to calculate direct distance, travel time, and capacity.
            </p>
          </div>

          <form onSubmit={handleFindNearest} className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-[#070d18] px-3 py-2">
              <span className="text-slate-400 font-mono">Lat:</span>
              <input
                type="text"
                value={userLat}
                onChange={e => setUserLat(e.target.value)}
                className="w-20 bg-transparent text-white outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-[#070d18] px-3 py-2">
              <span className="text-slate-400 font-mono">Lon:</span>
              <input
                type="text"
                value={userLon}
                onChange={e => setUserLon(e.target.value)}
                className="w-20 bg-transparent text-white outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loadingNearest}
              className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-cyan-500 hover:text-black transition-all"
            >
              {loadingNearest ? 'Calculating...' : 'Locate Nearest Shelters'}
            </button>

            {nearestResult && (
              <button
                type="button"
                onClick={() => setNearestResult(null)}
                className="rounded-xl bg-slate-800 px-3 py-2 text-slate-300 hover:bg-slate-700"
              >
                Reset
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayedShelters.map((sh, idx) => {
          const occupancyPct = Math.round((sh.current_occupancy / sh.capacity_persons) * 100);

          return (
            <div
              key={sh.id}
              className="flex flex-col justify-between rounded-2xl border border-purple-500/25 bg-[#0c1930] p-5 shadow-xl backdrop-blur-md transition-all hover:border-purple-400/50"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-purple-400">
                      {sh.basin_id.toUpperCase()} Basin Shelter
                    </span>
                    <h3 className="mt-1 font-bold text-base text-white">{sh.name}</h3>
                  </div>
                  {sh.distance_km !== undefined && (
                    <span className="rounded-lg bg-cyan-950/80 px-2 py-0.5 font-mono text-[11px] font-bold text-cyan-300 border border-cyan-500/40">
                      {sh.distance_km} km
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-300">{sh.address}</p>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-purple-500/15 bg-purple-950/20 p-2.5">
                    <div className="text-[10px] text-slate-400">Total Capacity</div>
                    <div className="mt-1 font-mono font-bold text-white">{sh.capacity_persons}</div>
                  </div>
                  <div className="rounded-xl border border-purple-500/15 bg-purple-950/20 p-2.5">
                    <div className="text-[10px] text-slate-400">Occupancy</div>
                    <div className="mt-1 font-mono font-bold text-cyan-300">{sh.current_occupancy}</div>
                  </div>
                  <div className="rounded-xl border border-purple-500/15 bg-purple-950/20 p-2.5">
                    <div className="text-[10px] text-slate-400">Safe Elevation</div>
                    <div className="mt-1 font-mono font-bold text-emerald-400">{sh.safe_elevation_m}m</div>
                  </div>
                </div>

                {/* Facilities Badges */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {sh.facilities?.map((f, i) => (
                    <span key={i} className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Officer & Phone Footer */}
              <div className="mt-5 border-t border-blue-500/15 pt-3 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Disaster Officer</div>
                  <div className="font-semibold text-white">{sh.contact_officer}</div>
                </div>
                <a
                  href={`tel:${sh.phone}`}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 font-mono text-xs font-bold text-cyan-300 hover:bg-cyan-900/50"
                >
                  <Phone className="h-3 w-3" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
