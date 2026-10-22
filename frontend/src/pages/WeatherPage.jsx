import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Droplets, Gauge, Compass, Sun, ShieldAlert, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchWeather, fetchWeatherForecast } from '../services/api';

export default function WeatherPage({ selectedBasinId = 'adyar' }) {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeatherData() {
      setLoading(true);
      try {
        const [wData, fData] = await Promise.all([
          fetchWeather(selectedBasinId),
          fetchWeatherForecast(selectedBasinId)
        ]);
        setWeather(wData);
        setForecast(fData.forecast_hours || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWeatherData();
  }, [selectedBasinId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="font-mono text-xs text-cyan-400">POLLING METEOROLOGICAL TELEMETRY...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Weather Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-[#0c1930]/85 p-6 shadow-xl backdrop-blur-md sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">METEOROLOGY & RADAR</span>
            <span className="rounded bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-blue-500/30">
              IMD & Open-Meteo Integration
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {selectedBasinId.toUpperCase()} Basin Weather Conditions
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Station: {weather?.station} • Updated: {weather?.timestamp}
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-[#070d18] px-4 py-2.5 text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Current Weather State</div>
          <div className="text-sm font-bold text-cyan-300">{weather?.condition}</div>
        </div>
      </div>

      {/* Main Meteorological Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-blue-500/20 bg-[#0c1930] p-4 text-center">
          <div className="flex justify-center text-cyan-400 mb-2"><CloudRain className="h-5 w-5" /></div>
          <div className="text-[11px] uppercase font-bold text-slate-400">Rainfall (Last 1h)</div>
          <div className="mt-1 font-mono text-2xl font-black text-cyan-300">{weather?.rainfall_last_1h_mm} <span className="text-xs font-normal">mm</span></div>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-[#0c1930] p-4 text-center">
          <div className="flex justify-center text-blue-400 mb-2"><Droplets className="h-5 w-5" /></div>
          <div className="text-[11px] uppercase font-bold text-slate-400">Cumulative (24h)</div>
          <div className="mt-1 font-mono text-2xl font-black text-white">{weather?.rainfall_last_24h_mm} <span className="text-xs font-normal">mm</span></div>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-[#0c1930] p-4 text-center">
          <div className="flex justify-center text-amber-400 mb-2"><Sparkles className="h-5 w-5" /></div>
          <div className="text-[11px] uppercase font-bold text-slate-400">Forecast (24h)</div>
          <div className="mt-1 font-mono text-2xl font-black text-amber-300">{weather?.forecast_next_24h_mm} <span className="text-xs font-normal">mm</span></div>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-[#0c1930] p-4 text-center">
          <div className="flex justify-center text-rose-400 mb-2"><Sun className="h-5 w-5" /></div>
          <div className="text-[11px] uppercase font-bold text-slate-400">Temperature</div>
          <div className="mt-1 font-mono text-2xl font-black text-white">{weather?.temperature_c}°C</div>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-[#0c1930] p-4 text-center">
          <div className="flex justify-center text-teal-400 mb-2"><Droplets className="h-5 w-5" /></div>
          <div className="text-[11px] uppercase font-bold text-slate-400">Relative Humidity</div>
          <div className="mt-1 font-mono text-2xl font-black text-teal-300">{weather?.humidity_pct}%</div>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-[#0c1930] p-4 text-center">
          <div className="flex justify-center text-indigo-400 mb-2"><Wind className="h-5 w-5" /></div>
          <div className="text-[11px] uppercase font-bold text-slate-400">Wind Velocity</div>
          <div className="mt-1 font-mono text-2xl font-black text-white">{weather?.wind_speed_kmh} <span className="text-xs font-normal">km/h</span></div>
        </div>
      </div>

      {/* 24-Hour Hourly Precipitation Forecast Chart */}
      <div className="rounded-2xl border border-blue-500/25 bg-[#0c1930] p-6 shadow-xl backdrop-blur-md">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <div className="font-mono text-xs uppercase text-cyan-400">PRECIPITATION ACCUMULATION</div>
            <h3 className="text-base font-bold text-white">24-Hour Projected Rain Influx (mm/hour)</h3>
          </div>
          <span className="text-xs text-slate-400">Open-Meteo High Resolution Forecast Model</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast}>
              <defs>
                <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" stroke="#64748b" />
              <YAxis stroke="#64748b" tickFormatter={v => `${v}mm`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0c1930', borderColor: '#0284c7', borderRadius: '12px' }}
                labelFormatter={v => `Time: ${v}`}
                formatter={(val) => [`${val} mm`, 'Rain Influx']}
              />
              <Area 
                type="monotone" 
                dataKey="rain_mm" 
                stroke="#0284c7" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#rainGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
