import React, { useState } from 'react';
import { SlidersHorizontal, Play, RotateCcw, AlertTriangle, ShieldCheck, ArrowRight, Activity, Zap } from 'lucide-react';
import { runSimulatorScenario } from '../services/api';

export default function SimulatorPage() {
  const [basinId, setBasinId] = useState('adyar');
  const [rainfallMm, setRainfallMm] = useState(120);
  const [reservoirDischarge, setReservoirDischarge] = useState(6500);
  const [soilSaturation, setSoilSaturation] = useState(0.85);
  const [gaugeLevel, setGaugeLevel] = useState(2.80);

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleRunSimulation(e) {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const data = await runSimulatorScenario({
        basin_id: basinId,
        rainfall_scenario_mm: parseFloat(rainfallMm),
        reservoir_discharge_cusecs: parseFloat(reservoirDischarge),
        upstream_soil_saturation: parseFloat(soilSaturation),
        gauge_water_level_m: parseFloat(gaugeLevel)
      });
      setSimResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setRainfallMm(120);
    setReservoirDischarge(6500);
    setSoilSaturation(0.85);
    setGaugeLevel(2.80);
    setSimResult(null);
  }

  const ml = simResult?.ml_result;
  const isCritical = ml?.risk_category === 'CRITICAL';
  const isWarning = ml?.risk_category === 'WARNING';
  const isWatch = ml?.risk_category === 'WATCH';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-[#0c1930]/85 p-6 shadow-xl backdrop-blur-md sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">WHAT-IF SCENARIO SIMULATOR</span>
            <span className="rounded bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-blue-500/30">
              Interactive ML Recalculation
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Hypothetical Flood Scenario Simulator
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Dynamically adjust cloudburst rainfall, upstream dam releases, and soil saturation to test early warning responses.
          </p>
        </div>
      </div>

      {/* Simulator Inputs & Outputs Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Interactive Sliders Panel (6 cols) */}
        <div className="rounded-2xl border border-blue-500/25 bg-[#0c1930] p-6 shadow-xl backdrop-blur-md lg:col-span-6">
          <div className="flex items-center justify-between border-b border-blue-500/15 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
              Scenario Control Parameters
            </h3>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" /> Reset Defaults
            </button>
          </div>

          <form onSubmit={handleRunSimulation} className="mt-5 space-y-5 text-xs">
            {/* Basin Choice */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Target River Basin (All 6 Modelled)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'adyar', name: 'Adyar (Chembarambakkam)', level: 2.85, disc: 6500 },
                  { id: 'cooum', name: 'Cooum (Poondi)', level: 1.95, disc: 2500 },
                  { id: 'cauvery', name: 'Cauvery (Mettur)', level: 3.80, disc: 25000 },
                  { id: 'vaigai', name: 'Vaigai (Vaigai Dam)', level: 2.10, disc: 3500 },
                  { id: 'tamiraparani', name: 'Thamirabarani (Papanasam)', level: 2.45, disc: 4500 },
                  { id: 'palar', name: 'Palar (Kaveripakkam)', level: 1.85, disc: 2000 }
                ].map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setBasinId(b.id);
                      setGaugeLevel(b.level);
                      setReservoirDischarge(b.disc);
                    }}
                    className={`rounded-xl py-2 px-2 font-bold transition-all text-[11px] truncate ${
                      basinId === b.id 
                        ? 'bg-blue-600 text-white shadow-md border border-cyan-400/50' 
                        : 'bg-[#070d18] text-slate-400 border border-blue-500/20 hover:text-white'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Rainfall Slider */}
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1.5">
                <span>Hypothetical 24h Precipitation:</span>
                <span className="font-mono text-cyan-400 font-bold">{rainfallMm} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="400"
                step="5"
                value={rainfallMm}
                onChange={e => setRainfallMm(e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0 mm (Dry)</span>
                <span>150 mm (Heavy)</span>
                <span>400 mm (Michaung Extreme)</span>
              </div>
            </div>

            {/* Reservoir Discharge Slider */}
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1.5">
                <span>Upstream Dam Spillway Outflow:</span>
                <span className="font-mono text-orange-400 font-bold">{reservoirDischarge.toLocaleString()} cusecs</span>
              </div>
              <input
                type="range"
                min="500"
                max="25000"
                step="500"
                value={reservoirDischarge}
                onChange={e => setReservoirDischarge(e.target.value)}
                className="w-full accent-orange-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>500 cusecs</span>
                <span>10,000 cusecs</span>
                <span>25,000 cusecs (Max)</span>
              </div>
            </div>

            {/* Soil Saturation Slider */}
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1.5">
                <span>Catchment Soil Saturation Index:</span>
                <span className="font-mono text-emerald-400 font-bold">{soilSaturation}</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="1.00"
                step="0.05"
                value={soilSaturation}
                onChange={e => setSoilSaturation(e.target.value)}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.20 (Dry Soil / High Infiltration)</span>
                <span>1.00 (100% Waterlogged / Immediate Runoff)</span>
              </div>
            </div>

            {/* Gauge Water Level Slider */}
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1.5">
                <span>Starting River Gauge Level:</span>
                <span className="font-mono text-white font-bold">{gaugeLevel} meters</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="4.50"
                step="0.10"
                value={gaugeLevel}
                onChange={e => setGaugeLevel(e.target.value)}
                className="w-full accent-blue-400 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 font-bold text-sm text-white shadow-[0_0_25px_rgba(2,132,199,0.4)] hover:brightness-110 transition-all disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              <span>{loading ? 'Executing ML Inference...' : 'Run Scenario Simulation'}</span>
            </button>
          </form>
        </div>

        {/* Right Output Results Panel (6 cols) */}
        <div className="rounded-2xl border border-blue-500/25 bg-[#0c1930] p-6 shadow-xl backdrop-blur-md lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-blue-500/15 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400" />
                Simulated ML Risk Output
              </h3>
              <span className="font-mono text-xs text-cyan-400 uppercase font-bold">
                {simResult ? 'Live Simulation' : 'Ready'}
              </span>
            </div>

            {simResult ? (
              <div className="mt-5 space-y-5">
                {/* Simulated Risk Badge & Probability */}
                <div className="rounded-2xl border border-blue-500/20 bg-[#070d18] p-5 text-center">
                  <span className={`inline-block rounded-xl px-4 py-1.5 text-sm font-extrabold ${
                    isCritical ? 'bg-red-500 text-white' : (isWarning ? 'bg-orange-500 text-black' : (isWatch ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-black'))
                  }`}>
                    SIMULATED STATE: {ml.risk_category}
                  </span>

                  <div className="mt-4 text-5xl font-black text-white">
                    {ml.flood_probability_pct}%
                  </div>
                  <div className="mt-1 text-xs text-slate-400 font-mono">
                    Projected Flood Occurrence Probability
                  </div>

                  <div className="mt-4 border-t border-slate-800 pt-3">
                    <div className="text-xs text-slate-400">Estimated Peak River Stage:</div>
                    <div className="mt-1 font-mono text-2xl font-bold text-cyan-300">
                      {ml.predicted_level_m} <span className="text-sm font-normal text-slate-400">meters</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Warning Response */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-950/30 p-4 text-xs">
                  <div className="font-bold text-cyan-300">Automated Warning System Evaluation:</div>
                  <p className="mt-1 text-slate-200 leading-relaxed">
                    {simResult.warning_evaluation?.reason}
                  </p>
                  <div className="mt-2 text-amber-300 font-semibold">
                    Advisory: {simResult.warning_evaluation?.recommended_action}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-72 flex-col items-center justify-center text-center text-slate-500">
                <SlidersHorizontal className="h-10 w-10 text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-400">Adjust the sliders on the left</p>
                <p className="text-xs text-slate-500 mt-1">Click "Run Scenario Simulation" to test flood response in real time.</p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-blue-500/15 pt-3 text-[11px] text-slate-400">
            *Simulations use genuine scikit-learn HistGradientBoosting inference without altering permanent operational telemetry.
          </div>
        </div>

      </div>

    </div>
  );
}
