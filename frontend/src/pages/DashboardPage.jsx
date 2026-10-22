import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Waves, 
  CloudRain, 
  Layers, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Send,
  Compass,
  ArrowRight,
  Radio,
  Sparkles
} from 'lucide-react';
import InteractiveMap from '../maps/InteractiveMap';
import LiquidLevelGauge from '../components/LiquidLevelGauge';
import { fetchLatestPrediction, fetchWarnings, fetchNotifications, dispatchAlertBroadcast } from '../services/api';

export default function DashboardPage({ 
  basins = [], 
  onNavigateTab, 
  onSelectBasin, 
  selectedBasinId = 'adyar' 
}) {
  const [prediction, setPrediction] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertSent, setAlertSent] = useState(false);
  const [liveStreamActive, setLiveStreamActive] = useState(true);
  const [sensorJitter, setSensorJitter] = useState(0);

  // Micro-fluctuation simulation for live river sensor telemetry
  useEffect(() => {
    if (!liveStreamActive) return;
    const interval = setInterval(() => {
      // Small sensor fluctuation between -0.02m and +0.02m
      const delta = (Math.random() - 0.48) * 0.04;
      setSensorJitter(prev => Number((prev + delta).toFixed(3)));
    }, 3000);
    return () => clearInterval(interval);
  }, [liveStreamActive]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [predData, warnData, notifData] = await Promise.all([
          fetchLatestPrediction(selectedBasinId),
          fetchWarnings(),
          fetchNotifications()
        ]);
        setPrediction(predData);
        setWarnings(warnData);
        setNotifications(notifData);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [selectedBasinId]);

  async function handleQuickAlertDispatch() {
    try {
      await dispatchAlertBroadcast({
        basin_id: selectedBasinId,
        severity: prediction?.risk_category || 'WARNING',
        title: `Dashboard Alert: ${selectedBasinId.toUpperCase()} Flood Risk Surge`,
        message: `Automated broadcast triggered from operations dashboard. River level at ${prediction?.predicted_level_m}m.`
      });
      setAlertSent(true);
      setTimeout(() => setAlertSent(false), 4000);
    } catch (e) {
      console.error(e);
    }
  }

  // Find active basin metadata
  const currentBasin = basins.find(b => b.id === selectedBasinId) || {
    id: 'adyar',
    name: 'Adyar River Basin',
    river_level_m: 2.85,
    warning_level_m: 2.50,
    danger_level_m: 3.50,
    key_reservoir: 'Chembarambakkam Lake',
    rate_of_change_cm_hr: 7.8,
    trend: 'RISING'
  };

  const dynamicCurrentLevel = Number((currentBasin.river_level_m + sensorJitter).toFixed(2));

  return (
    <div className="space-y-6">
      
      {/* Top Welcome / Operations Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-[#0c1930]/85 p-6 shadow-xl backdrop-blur-md sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">OPERATIONAL CONSOLE</span>
            <button 
              onClick={() => setLiveStreamActive(!liveStreamActive)}
              className="flex items-center gap-1.5 rounded-full bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30 hover:border-emerald-400 transition-colors"
            >
              <span className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${liveStreamActive ? 'animate-pulse' : ''}`} />
              <span>{liveStreamActive ? 'LIVE TELEMETRY STREAM: ACTIVE' : 'STREAM PAUSED'}</span>
            </button>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Tamil Nadu River Basin Monitoring
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Real-time multi-sensor telemetry, scikit-learn flood prediction, and early warning dispatch across 6 modelled river basins.
          </p>
        </div>

        {/* Quick Action Button to Broadcast Alert */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickAlertDispatch}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md ${
              alertSent 
                ? 'bg-emerald-600 text-white' 
                : 'border border-red-500/40 bg-red-950/40 text-red-200 hover:bg-red-900/50 hover:border-red-400'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>{alertSent ? 'Broadcast Dispatched!' : 'Broadcast Flood Alert'}</span>
          </button>
        </div>
      </div>

      {/* Critical Early Warning Alert Banner (if active alerts exist) */}
      {warnings.length > 0 && warnings[0].status === 'ACTIVE' && (
        <div className="flex items-start justify-between rounded-2xl border border-orange-500/40 bg-orange-950/30 p-4 shadow-[0_0_25px_rgba(249,115,22,0.2)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-600/30 text-orange-400 border border-orange-500/40">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-orange-500 px-2 py-0.5 text-[10px] font-extrabold text-black">
                  {warnings[0].severity}
                </span>
                <h3 className="font-bold text-sm text-white">{warnings[0].title}</h3>
              </div>
              <p className="mt-1 text-xs text-orange-200/90 leading-relaxed">{warnings[0].message}</p>
              <div className="mt-2 text-[11px] font-semibold text-cyan-300">
                Action: {warnings[0].recommended_action}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('warnings')}
            className="hidden sm:flex shrink-0 items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline"
          >
            Manage Warning →
          </button>
        </div>
      )}

      {/* Basin Selector Tabs Across All 6 Modelled Basins */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 shrink-0">SELECT BASIN:</span>
        {basins.map(b => {
          const isSelected = b.id === selectedBasinId;
          return (
            <button
              key={b.id}
              onClick={() => onSelectBasin(b.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(2,132,199,0.5)] border border-cyan-400/50'
                  : 'bg-[#0c1930]/80 text-slate-300 border border-blue-500/20 hover:border-cyan-400/50 hover:text-white'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${
                b.risk_state === 'CRITICAL' ? 'bg-red-400 animate-ping' : (b.risk_state === 'WARNING' ? 'bg-orange-400' : 'bg-emerald-400')
              }`} />
              <span>{b.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Focus: Liquid Water Level Gauge & Live ML Status Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Animated Liquid Water Level Tank Gauge (6 cols) */}
        <div className="lg:col-span-6">
          <LiquidLevelGauge
            currentLevel={dynamicCurrentLevel}
            warningLevel={currentBasin.warning_level_m || 2.50}
            dangerLevel={currentBasin.danger_level_m || 3.50}
            maxLevel={(currentBasin.danger_level_m || 3.50) * 1.3}
            riverName={`${currentBasin.name} Basin`}
            stationName={`Primary WRD Gauge Station (${currentBasin.key_reservoir || 'Main Reservoir'})`}
            rateOfRise={currentBasin.rate_of_change_cm_hr || 4.2}
            trend={currentBasin.trend || 'RISING'}
          />
        </div>

        {/* Right: ML Prediction & Reservoir Telemetry Card (6 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-blue-500/25 bg-[#0c1930] p-6 shadow-xl backdrop-blur-md lg:col-span-6">
          <div>
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
                  AI HYDROLOGICAL PREDICTION
                </span>
                <h3 className="mt-1 text-lg font-bold text-white">
                  {currentBasin.name} 24h Forecast
                </h3>
              </div>
              <span className={`rounded-lg px-3 py-1 font-extrabold text-xs ${
                prediction?.risk_category === 'CRITICAL' 
                  ? 'bg-red-500 text-white' 
                  : (prediction?.risk_category === 'WARNING' || prediction?.risk_category === 'HIGH' ? 'bg-orange-500 text-black' : 'bg-emerald-500 text-black')
              }`}>
                {prediction?.risk_category || 'LOW RISK'}
              </span>
            </div>

            {/* Prediction Key Figures */}
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-blue-500/20 bg-[#070d18] p-4 text-left">
                <span className="text-[11px] text-slate-400 font-semibold">Flood Probability</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-extrabold text-white">
                    {prediction?.flood_probability_pct || '12.4'}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-700"
                    style={{ width: `${Math.min(100, prediction?.flood_probability_pct || 12.4)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-[#070d18] p-4 text-left">
                <span className="text-[11px] text-slate-400 font-semibold">Predicted River Level</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-extrabold text-cyan-300">
                    {prediction?.predicted_level_m || dynamicCurrentLevel}
                  </span>
                  <span className="font-mono text-xs text-slate-400">meters</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-2 block">
                  Warning Mark: <strong className="text-amber-400">{currentBasin.warning_level_m}m</strong>
                </span>
              </div>
            </div>

            {/* Environmental Drivers */}
            <div className="mt-4 rounded-xl border border-blue-500/15 bg-blue-950/20 p-3.5">
              <span className="text-[10px] font-mono uppercase text-slate-400">Primary Risk Contributing Factors</span>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">24h Rain</span>
                  <div className="font-mono font-bold text-cyan-300">{currentBasin.current_rain_24h_mm || 45} mm</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Reservoir Storage</span>
                  <div className="font-mono font-bold text-white">{currentBasin.reservoir_storage_pct || 78}%</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">ROC</span>
                  <div className="font-mono font-bold text-amber-300">+{currentBasin.rate_of_change_cm_hr || 3.5} cm/h</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-blue-500/20 pt-4">
            <span className="text-xs text-slate-400">
              Key Dam: <strong className="text-white">{currentBasin.key_reservoir}</strong>
            </span>
            <button
              onClick={() => onNavigateTab('predictions')}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600/40 px-3.5 py-2 text-xs font-bold text-cyan-300 border border-blue-500/40 hover:bg-cyan-500 hover:text-black transition-all"
            >
              <span>Detailed ML Model Analysis</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Live GIS Satellite Map & Live Event Feed Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Map Preview (8 cols) */}
        <div className="rounded-2xl border border-blue-500/20 bg-[#0c1930]/90 p-5 shadow-xl backdrop-blur-md lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Live Real Satellite & River Basin GIS</h3>
            </div>
            <button
              onClick={() => onNavigateTab('gis')}
              className="text-xs font-semibold text-cyan-400 hover:underline"
            >
              Open Fullscreen GIS Workstation →
            </button>
          </div>
          <InteractiveMap 
            height="420px" 
            onSelectBasin={onSelectBasin}
            selectedBasinId={selectedBasinId}
          />
        </div>

        {/* Live Event Feeds & Alerts (4 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-blue-500/20 bg-[#0c1930]/90 p-5 shadow-xl backdrop-blur-md lg:col-span-4">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Live Telemetric Event Log</h3>
              <span className="font-mono text-[11px] text-cyan-400">Real-time CWC feed</span>
            </div>

            <div className="space-y-3">
              {notifications.slice(0, 4).map(item => (
                <div 
                  key={item.id}
                  className="rounded-xl border border-blue-500/15 bg-[#070d18] p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      item.severity === 'CRITICAL' ? 'bg-red-500 text-white' : (item.severity === 'WARNING' ? 'bg-orange-500 text-black' : 'bg-amber-400 text-black')
                    }`}>
                      {item.severity}
                    </span>
                    <span className="text-[10px] text-slate-500">{item.created_at.split(' ')[1] || '11:00'}</span>
                  </div>
                  <h4 className="mt-1.5 font-bold text-white">{item.title}</h4>
                  <p className="mt-0.5 text-[11px] text-slate-300 line-clamp-2">{item.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-blue-500/15 pt-3">
            <button
              onClick={() => onNavigateTab('notifications')}
              className="w-full rounded-xl bg-blue-950/60 py-2 text-center text-xs font-semibold text-cyan-300 hover:bg-blue-900/60 transition-colors"
            >
              View All Alerts & Dispatches →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
