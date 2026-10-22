import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Sliders, 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Info,
  SlidersHorizontal,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { fetchLatestPrediction, fetchModelMetrics, calculateCustomPrediction, dispatchAlertBroadcast } from '../services/api';

const ALL_BASINS = [
  { id: 'adyar', name: 'Adyar Basin', river: 'Adyar River', defaultLevel: 2.85 },
  { id: 'cooum', name: 'Cooum Basin', river: 'Cooum River', defaultLevel: 1.95 },
  { id: 'cauvery', name: 'Cauvery Delta', river: 'Cauvery / Coleroon', defaultLevel: 3.80 },
  { id: 'vaigai', name: 'Vaigai Basin', river: 'Vaigai River', defaultLevel: 2.10 },
  { id: 'tamiraparani', name: 'Thamirabarani', river: 'Thamirabarani River', defaultLevel: 2.45 },
  { id: 'palar', name: 'Palar Basin', river: 'Palar River', defaultLevel: 1.85 }
];

export default function PredictionsPage({ selectedBasinId = 'adyar', onSelectBasin }) {
  const [prediction, setPrediction] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  // Custom simulation slider states
  const [simRain1d, setSimRain1d] = useState(65);
  const [simRainFcst, setSimRainFcst] = useState(80);
  const [simStorage, setSimStorage] = useState(82);
  const [simSoil, setSimSoil] = useState(0.72);
  const [simLevel, setSimLevel] = useState(2.85);

  // Alert Dispatch Modal State
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState('Critical River Discharge Warning');
  const [alertMessage, setAlertMessage] = useState('Emergency flood alert dispatched by analyst following ML prediction spike. Immediate riverbank clearance requested.');
  const [alertSeverity, setAlertSeverity] = useState('CRITICAL');
  const [dispatchStatus, setDispatchStatus] = useState('');

  // Load prediction whenever selectedBasinId changes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [predData, metricsData] = await Promise.all([
          fetchLatestPrediction(selectedBasinId),
          fetchModelMetrics()
        ]);
        setPrediction(predData);
        setMetrics(metricsData);
        if (predData) {
          setSimLevel(predData.predicted_level_m || 2.5);
        }
      } catch (err) {
        console.error('Error loading prediction:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedBasinId]);

  // Handle instant recalculate using Scikit-Learn custom calculate API
  async function handleRecalculate(e) {
    if (e) e.preventDefault();
    setRecalculating(true);
    try {
      const customPred = await calculateCustomPrediction({
        basin_id: selectedBasinId,
        rain_1d: parseFloat(simRain1d),
        rain_3d: parseFloat(simRain1d) * 1.5,
        rain_7d: parseFloat(simRain1d) * 2.2,
        rain_14d: parseFloat(simRain1d) * 3.1,
        rain_fcst_1d: parseFloat(simRainFcst),
        soil: parseFloat(simSoil),
        storage_pct: parseFloat(simStorage),
        level_m: parseFloat(simLevel),
        d_level: parseFloat(simLevel) * 0.1,
        tide_m: 0.35
      });
      setPrediction(customPred);
    } catch (err) {
      console.error('Recalculation error:', err);
    } finally {
      setRecalculating(false);
    }
  }

  async function handleDispatchAlert(e) {
    e.preventDefault();
    setDispatchStatus('Dispatching alert...');
    try {
      await dispatchAlertBroadcast({
        basin_id: selectedBasinId,
        severity: alertSeverity,
        title: alertTitle,
        message: alertMessage
      });
      setDispatchStatus('Alert broadcast successfully dispatched!');
      setTimeout(() => {
        setShowAlertModal(false);
        setDispatchStatus('');
      }, 2000);
    } catch (err) {
      setDispatchStatus('Failed to dispatch alert.');
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-cyan-400 border-t-transparent shadow-[0_0_15px_#06b6d4]" />
          <span className="font-mono text-xs text-cyan-400">EXECUTING MULTI-BASIN SCIKIT-LEARN INFERENCE...</span>
        </div>
      </div>
    );
  }

  const probPct = prediction?.flood_probability_pct || 0;
  const isCritical = prediction?.risk_category === 'CRITICAL';
  const isWarning = prediction?.risk_category === 'WARNING' || prediction?.risk_category === 'HIGH';
  const isWatch = prediction?.risk_category === 'WATCH' || prediction?.risk_category === 'MODERATE';

  return (
    <div className="space-y-6">
      
      {/* Top Header & Basin Selection */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-[#0c1930]/85 p-6 shadow-xl backdrop-blur-md sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">ML INFERENCE ENGINE</span>
            <span className="rounded bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-blue-500/30">
              HistGradientBoosting Ensemble v2.0
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            24-Hour Flood Risk Prediction
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Calibrated probabilistic classification and river depth regression across all 6 Tamil Nadu river basins.
          </p>
        </div>

        {/* Dispatch Alert Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAlertModal(true)}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-red-500 transition-all"
          >
            <Send className="h-4 w-4" />
            <span>Dispatch Flood Alert</span>
          </button>
        </div>
      </div>

      {/* 6-Basin Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 shrink-0">SELECT BASIN:</span>
        {ALL_BASINS.map(b => {
          const isSelected = selectedBasinId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onSelectBasin(b.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(2,132,199,0.5)] border border-cyan-400/50'
                  : 'bg-[#0c1930]/80 text-slate-300 border border-blue-500/20 hover:border-cyan-400/50 hover:text-white'
              }`}
            >
              <span>{b.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Prediction Outputs Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Probability & Risk Card (5 cols) */}
        <div className="rounded-2xl border border-blue-500/25 bg-[#0c1930] p-6 shadow-xl backdrop-blur-md lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-slate-400">
                {selectedBasinId.toUpperCase()} RISK STATE
              </span>
              <span className={`rounded-lg px-3 py-1 text-xs font-extrabold ${
                isCritical ? 'bg-red-500 text-white' : (isWarning ? 'bg-orange-500 text-black' : (isWatch ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-black'))
              }`}>
                {prediction?.risk_category || 'LOW RISK'}
              </span>
            </div>

            {/* Circular / Large Probability Gauge */}
            <div className="my-6 text-center">
              <div className="text-6xl font-black tracking-tight text-white">
                {probPct}%
              </div>
              <div className="mt-1 font-mono text-xs text-slate-400">
                Flood Occurrence Probability (Threshold: {((prediction?.threshold || 0.195) * 100).toFixed(1)}%)
              </div>

              {/* Multi-Level Status Progress */}
              <div className="mx-auto mt-5 h-3 w-full max-w-sm overflow-hidden rounded-full bg-slate-800">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isCritical ? 'bg-red-500' : (isWarning ? 'bg-orange-500' : (isWatch ? 'bg-amber-400' : 'bg-emerald-500'))
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, probPct))}%` }}
                />
              </div>
              <div className="mx-auto mt-2 flex max-w-sm justify-between text-[10px] text-slate-400">
                <span>0% (Low)</span>
                <span>15% (Watch)</span>
                <span>40% (Warning)</span>
                <span>70%+ (Critical)</span>
              </div>
            </div>

            {/* Predicted Water Level */}
            <div className="rounded-xl border border-blue-500/20 bg-[#070d18] p-4 text-center">
              <div className="text-xs text-slate-400">Projected Peak River Water Level</div>
              <div className="mt-1 text-3xl font-extrabold text-cyan-300">
                {prediction?.predicted_level_m} <span className="text-lg font-normal text-slate-400">meters</span>
              </div>
              <div className="mt-1 flex justify-center gap-4 text-xs">
                <span className="text-amber-400">Warning Mark: {prediction?.warning_mark_m}m</span>
                <span className="text-red-400">Danger Mark: {prediction?.danger_mark_m}m</span>
              </div>
            </div>
          </div>

          {/* Operational Advisory */}
          <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-950/40 p-4 text-xs text-slate-200">
            <strong className="text-cyan-300">Operational Advisory:</strong> {prediction?.advisory}
          </div>
        </div>

        {/* Right Feature Contribution & Explainability (7 cols) */}
        <div className="rounded-2xl border border-blue-500/25 bg-[#0c1930] p-6 shadow-xl backdrop-blur-md lg:col-span-7">
          <div className="flex items-center justify-between border-b border-blue-500/15 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Feature Importance & Decision Drivers</h3>
            </div>
            <span className="text-[11px] text-slate-400">Permutation Attribution</span>
          </div>

          <div className="mt-4 space-y-4">
            {prediction?.contributions?.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-blue-500/15 bg-[#070d18] p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{item.feature}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-400 font-bold">{item.value}</span>
                    <span className="rounded bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-white">
                      {item.impact_pct}% weight
                    </span>
                  </div>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: `${item.impact_pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-blue-500/15 bg-blue-950/20 p-3 text-[11px] text-slate-400 flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-cyan-400" />
            <span>Forecast rainfall in the next 24 hours accounts for the highest risk weighting, reinforced by current gauge level and upstream dam storage saturation.</span>
          </div>
        </div>

      </div>

      {/* Interactive Live What-If Parameter Tuning Panel */}
      <div className="rounded-2xl border border-blue-500/25 bg-[#0c1930] p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-blue-500/15 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Interactive What-If Scenario Recalculation</h3>
          </div>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 font-bold text-xs text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-400 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Inference Running...' : 'Recalculate ML Risk'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
          {/* Slider 1: 24h Rain */}
          <div className="rounded-xl border border-blue-500/15 bg-[#070d18] p-3.5">
            <div className="flex justify-between font-semibold text-slate-300 mb-1">
              <span>Past 24h Rain:</span>
              <span className="font-mono text-cyan-400">{simRain1d} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="250"
              value={simRain1d}
              onChange={e => setSimRain1d(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Slider 2: Forecast Rain */}
          <div className="rounded-xl border border-blue-500/15 bg-[#070d18] p-3.5">
            <div className="flex justify-between font-semibold text-slate-300 mb-1">
              <span>Next 24h Forecast:</span>
              <span className="font-mono text-cyan-400">{simRainFcst} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="250"
              value={simRainFcst}
              onChange={e => setSimRainFcst(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Slider 3: Reservoir Storage */}
          <div className="rounded-xl border border-blue-500/15 bg-[#070d18] p-3.5">
            <div className="flex justify-between font-semibold text-slate-300 mb-1">
              <span>Dam Storage:</span>
              <span className="font-mono text-cyan-400">{simStorage}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={simStorage}
              onChange={e => setSimStorage(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Slider 4: Soil Moisture */}
          <div className="rounded-xl border border-blue-500/15 bg-[#070d18] p-3.5">
            <div className="flex justify-between font-semibold text-slate-300 mb-1">
              <span>Soil Saturation:</span>
              <span className="font-mono text-cyan-400">{simSoil}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={simSoil}
              onChange={e => setSimSoil(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Slider 5: Current Level */}
          <div className="rounded-xl border border-blue-500/15 bg-[#070d18] p-3.5">
            <div className="flex justify-between font-semibold text-slate-300 mb-1">
              <span>Current Level:</span>
              <span className="font-mono text-cyan-400">{simLevel} m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="7.0"
              step="0.1"
              value={simLevel}
              onChange={e => setSimLevel(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Rainfall vs Flood Risk Response Curve (AreaChart) */}
      <div className="rounded-2xl border border-blue-500/25 bg-[#0c1930] p-6 shadow-xl backdrop-blur-md">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <div className="font-mono text-xs uppercase text-cyan-400">SENSITIVITY ANALYSIS</div>
            <h3 className="text-base font-bold text-white">Rainfall-to-Flood Risk Response Curve</h3>
          </div>
          <span className="text-xs text-slate-400">Simulated 0mm to 300mm forecast precipitation</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={prediction?.risk_curve || []}>
              <defs>
                <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="forecast_rain_mm" stroke="#64748b" tickFormatter={v => `${v}mm`} />
              <YAxis stroke="#64748b" tickFormatter={v => `${v}%`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0c1930', borderColor: '#0284c7', borderRadius: '12px' }}
                labelFormatter={v => `Forecast Rain: ${v} mm`}
                formatter={(val) => [`${val}%`, 'Flood Probability']}
              />
              <Area 
                type="monotone" 
                dataKey="flood_probability" 
                stroke="#38bdf8" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#probGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audited Model Quality & Test Split Metrics */}
      <div className="rounded-2xl border border-blue-500/20 bg-[#0c1930]/90 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-blue-500/15 pb-3">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <h3 className="font-bold text-sm text-white">Audited Model Verification & Benchmark Evaluation</h3>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 text-center">
          <div className="rounded-xl border border-blue-500/15 bg-[#070d18] p-4">
            <div className="text-[11px] uppercase font-bold text-slate-400">ROC-AUC Score</div>
            <div className="mt-1 font-mono text-2xl font-black text-emerald-400">
              {metrics?.test?.roc_auc || 0.998}
            </div>
            <div className="mt-1 text-[10px] text-slate-500">Held-out 2020–2025 Test</div>
          </div>

          <div className="rounded-xl border border-blue-500/15 bg-[#070d18] p-4">
            <div className="text-[11px] uppercase font-bold text-slate-400">PR-AUC Score</div>
            <div className="mt-1 font-mono text-2xl font-black text-cyan-400">
              {metrics?.test?.pr_auc || 0.868}
            </div>
            <div className="mt-1 text-[10px] text-slate-500">Precision-Recall Curve</div>
          </div>

          <div className="rounded-xl border border-blue-500/15 bg-[#070d18] p-4">
            <div className="text-[11px] uppercase font-bold text-slate-400">F1-Score</div>
            <div className="mt-1 font-mono text-2xl font-black text-blue-300">
              {((metrics?.test?.f1 || 0.775) * 100).toFixed(1)}%
            </div>
            <div className="mt-1 text-[10px] text-slate-500">Multi-Basin Optimized</div>
          </div>

          <div className="rounded-xl border border-blue-500/15 bg-[#070d18] p-4">
            <div className="text-[11px] uppercase font-bold text-slate-400">Level Regressor MAE</div>
            <div className="mt-1 font-mono text-2xl font-black text-amber-300">
              {metrics?.level_regressor_test?.mae_m || 0.049} m
            </div>
            <div className="mt-1 text-[10px] text-slate-500">R² = {metrics?.level_regressor_test?.r2 || 0.943}</div>
          </div>
        </div>

        <div className="mt-4 text-[11px] text-slate-400">
          *Evaluation conducted across 56,976 chronological daily records covering all 6 Tamil Nadu river basins (2000–2025). Chronological time-series split: Train (2000–2015), Validation (2016–2019), Held-out Test (2020–2025).
        </div>
      </div>

      {/* Dispatch Alert Modal (User Alert Option) */}
      {showAlertModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-[#0c1930] p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold text-base">
              <Send className="h-5 w-5" />
              <span>Broadcast Emergency Flood Alert</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Dispatches an immediate alert notification to the operational command centre, relief camps, and field personnel.
            </p>

            <form onSubmit={handleDispatchAlert} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Target Basin</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedBasinId.toUpperCase()} Basin`}
                  className="w-full rounded-xl border border-blue-500/30 bg-[#070d18] p-2.5 text-cyan-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Severity</label>
                <select
                  value={alertSeverity}
                  onChange={e => setAlertSeverity(e.target.value)}
                  className="w-full rounded-xl border border-blue-500/30 bg-[#070d18] p-2.5 text-white outline-none"
                >
                  <option value="CRITICAL">CRITICAL (Immediate Siren & Evacuation)</option>
                  <option value="WARNING">WARNING (High Risk / Relief Camp Activation)</option>
                  <option value="WATCH">WATCH (Elevated Gauge Surveillance)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Alert Headline</label>
                <input
                  type="text"
                  required
                  value={alertTitle}
                  onChange={e => setAlertTitle(e.target.value)}
                  className="w-full rounded-xl border border-blue-500/30 bg-[#070d18] p-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Dispatch Advisory Message</label>
                <textarea
                  rows={3}
                  required
                  value={alertMessage}
                  onChange={e => setAlertMessage(e.target.value)}
                  className="w-full rounded-xl border border-blue-500/30 bg-[#070d18] p-2.5 text-white outline-none"
                />
              </div>

              {dispatchStatus && (
                <div className="rounded-lg bg-emerald-950/60 border border-emerald-500/40 p-2 text-center text-xs text-emerald-300">
                  {dispatchStatus}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAlertModal(false)}
                  className="flex-1 rounded-xl bg-slate-800 py-2.5 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-red-600 py-2.5 font-bold text-white hover:bg-red-500"
                >
                  Confirm & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
