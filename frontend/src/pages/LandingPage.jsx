import React from 'react';
import { ArrowRight, Activity, ShieldAlert, Waves, Compass, Layers, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import InteractiveMap from '../maps/InteractiveMap';

export default function LandingPage({ 
  basins = [], 
  onSelectBasin, 
  onOpenLogin,
  onExploreWorkstation 
}) {
  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section (Faithful to Canva Reference) */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          
          {/* Left Hero Content */}
          <div className="space-y-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              ENVIRONMENTAL MONITORING • DECISION SUPPORT
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
              Real-time flood intelligence for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">Tamil Nadu</span> river basins
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              AI-assisted prediction, GIS monitoring and clear operational context for earlier, better-informed flood preparedness. All values shown are demonstration data.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreWorkstation}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-sm text-white shadow-[0_0_25px_rgba(2,132,199,0.4)] transition-all hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_35px_rgba(6,182,212,0.6)]"
              >
                <span>Enter Operations Workstation</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 rounded-xl border border-cyan-400/50 bg-[#0c1930]/90 px-5 py-3 font-semibold text-sm text-cyan-300 transition-all hover:bg-cyan-950/60 hover:text-white"
              >
                <span>Officer Sign In</span>
              </button>
            </div>

            {/* Quick Demo Credentials Banner */}
            <div className="rounded-xl border border-blue-500/30 bg-[#0c1930]/80 p-3 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-[11px] mb-1">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                DEMO LOGIN CREDENTIALS
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]">
                <span>Admin Email: <strong className="text-white">admin@hydron.gov.in</strong></span>
                <span>Password: <strong className="text-white">Admin@1234</strong></span>
              </div>
            </div>
          </div>

          {/* Right Hero GIS Map Card (Canva Style Framed Interactive Map) */}
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-[#0c1930]/90 p-3 shadow-[0_15px_45px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <div className="mb-2.5 flex items-center justify-between px-2 pt-1">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                  TAMIL NADU • BASIN INTELLIGENCE DEMO
                </span>
                <span className="text-[11px] text-slate-400">Real Interactive GIS</span>
              </div>
              <InteractiveMap 
                height="440px" 
                onSelectBasin={onSelectBasin}
                showLayerControls={true}
              />
            </div>
          </div>

        </div>
      </section>

      {/* System Statistics Banner Row (Canva Reference) */}
      <section id="stats-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 divide-y divide-blue-500/15 rounded-2xl border border-blue-500/25 bg-[#0c1930]/80 p-6 shadow-xl backdrop-blur-md md:grid-cols-4 md:divide-x md:divide-y-0">
          
          {/* Stat 1 */}
          <div className="p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              MONITORED BASINS
            </div>
            <div className="mt-2 text-4xl font-extrabold text-white">17</div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> MONITORED
            </div>
          </div>

          {/* Stat 2 */}
          <div className="p-4 md:pl-8">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              ACTIVE WARNINGS
            </div>
            <div className="mt-2 text-4xl font-extrabold text-amber-400">03</div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-950/60 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> ACTIONED
            </div>
          </div>

          {/* Stat 3 */}
          <div className="p-4 md:pl-8">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              RAINFALL STATIONS
            </div>
            <div className="mt-2 text-4xl font-extrabold text-cyan-400">146</div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-cyan-950/60 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> ONLINE
            </div>
          </div>

          {/* Stat 4 */}
          <div className="p-4 md:pl-8">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              LAST SYSTEM UPDATE
            </div>
            <div className="mt-2 text-3xl font-extrabold text-white">15:30</div>
            <div className="mt-3 text-xs text-slate-400">
              20 Sep • Demo Ingestion
            </div>
          </div>

        </div>
      </section>

      {/* Basin Intelligence Grid (Explore basin conditions) */}
      <section id="basins-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
              BASIN INTELLIGENCE
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Explore basin conditions
            </h2>
          </div>
          <button
            onClick={onExploreWorkstation}
            className="self-start rounded-xl border border-blue-500/30 bg-[#0c1930] px-4 py-2 text-xs font-semibold text-blue-200 transition-all hover:border-cyan-400 hover:text-white sm:self-auto"
          >
            View all basins in workstation →
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {basins.map(b => {
            const isCritical = b.risk_state === 'CRITICAL';
            const isWarning = b.risk_state === 'WARNING';
            const isWatch = b.risk_state === 'WATCH';

            return (
              <div
                key={b.id}
                onClick={() => onSelectBasin(b.id)}
                className="group cursor-pointer rounded-2xl border border-blue-500/20 bg-[#0c1930]/85 p-5 shadow-lg backdrop-blur-md transition-all hover:scale-[1.02] hover:border-cyan-400/60 hover:shadow-[0_10px_30px_rgba(6,182,212,0.2)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400">
                      {b.modelled ? '★ Machine Learning Basin' : 'GIS Monitored'}
                    </span>
                    <h3 className="mt-1 font-bold text-lg text-white group-hover:text-cyan-300">
                      {b.name}
                    </h3>
                  </div>
                  <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                    isCritical ? 'bg-red-500 text-white' : (isWarning ? 'bg-orange-500 text-black' : (isWatch ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-black'))
                  }`}>
                    {b.risk_state}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-xs text-slate-300">
                  {b.description}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-blue-500/15 pt-3 text-center">
                  <div className="rounded-lg bg-blue-950/40 p-2">
                    <div className="text-[10px] text-slate-400">24h Rain</div>
                    <div className="mt-1 font-mono font-bold text-xs text-cyan-300">{b.current_rain_24h_mm} mm</div>
                  </div>
                  <div className="rounded-lg bg-blue-950/40 p-2">
                    <div className="text-[10px] text-slate-400">River Level</div>
                    <div className="mt-1 font-mono font-bold text-xs text-white">{b.river_level_m} m</div>
                  </div>
                  <div className="rounded-lg bg-blue-950/40 p-2">
                    <div className="text-[10px] text-slate-400">Trend</div>
                    <div className="mt-1 font-mono font-bold text-xs text-amber-300">{b.trend}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>View Basin Intelligence</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mission / Environmental Awareness Section (Canva Reference) */}
      <section id="mission-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          
          {/* Left Drone Imagery Card */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-[#0c1930] shadow-2xl lg:col-span-6">
            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1000&q=80"
                alt="Aerial view of flood monitoring in river basin"
                className="h-full w-full object-cover filter brightness-[0.75] contrast-[1.1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070d18] via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <span className="rounded bg-cyan-950/80 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300 border border-cyan-500/40">
                  ENVIRONMENTAL AWARENESS
                </span>
                <p className="text-sm font-semibold text-white">
                  Contextual basin monitoring for prepared operational teams.
                </p>
              </div>
            </div>
          </div>

          {/* Right Mission Content */}
          <div className="space-y-5 lg:col-span-6">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
              MISSION
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl leading-snug">
              Preparedness begins with a clearer view of changing water conditions.
            </h2>

            <p className="text-sm leading-relaxed text-slate-300">
              Flood Intelligence Centre brings basin signals, contextual mapping and plain-language risk summaries together in one consistent operational workspace. It is designed as a decision-support prototype, not a replacement for official emergency instructions.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-xl border border-blue-500/20 bg-[#0c1930]/80 p-4 backdrop-blur-md">
                <h4 className="font-bold text-sm text-cyan-300">Interpretable signals</h4>
                <p className="mt-1 text-xs text-slate-400">
                  Gradient-boosted decision trees transparently weight forecast rainfall, reservoir levels, and soil saturation.
                </p>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-[#0c1930]/80 p-4 backdrop-blur-md">
                <h4 className="font-bold text-sm text-cyan-300">GIS context</h4>
                <p className="mt-1 text-xs text-slate-400">
                  Real geographic boundaries, river courses, gauging stations, and evacuation centres mapped on Leaflet.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
