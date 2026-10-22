import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Cpu, 
  CloudRain, 
  Waves, 
  Layers, 
  ShieldAlert, 
  Home, 
  Bell, 
  History, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  onSelectTab, 
  selectedBasin, 
  onSelectBasin,
  basins = [] 
}) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gis', label: 'Live GIS Map', icon: Map },
    { id: 'predictions', label: 'Flood Predictions', icon: Cpu },
    { id: 'weather', label: 'Weather Radar', icon: CloudRain },
    { id: 'rivers', label: 'River Monitoring', icon: Waves },
    { id: 'reservoirs', label: 'Reservoirs & Dams', icon: Layers },
    { id: 'warnings', label: 'Early Warnings', icon: ShieldAlert },
    { id: 'evacuation', label: 'Evacuation', icon: Home },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'history', label: 'History & Analytics', icon: History },
    { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal },
  ];

  return (
    <aside 
      className={`relative flex flex-col border-r border-blue-500/20 bg-[#070d18]/95 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-blue-500/40 bg-[#0c1930] text-cyan-400 shadow-md hover:bg-blue-900"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Basin Selector Context */}
      <div className="border-b border-blue-500/15 p-4">
        {!collapsed ? (
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Filter className="h-3 w-3 text-cyan-400" /> Active Basin Context
            </label>
            <select
              value={selectedBasin}
              onChange={(e) => onSelectBasin(e.target.value)}
              className="w-full rounded-xl border border-blue-500/30 bg-[#0c1930] px-3 py-2 text-xs font-semibold text-white outline-none focus:border-cyan-400"
            >
              <option value="adyar">Adyar Basin (Modelled)</option>
              <option value="cooum">Cooum Basin (Modelled)</option>
              <option value="cauvery">Cauvery Basin (Delta)</option>
              <option value="vaigai">Vaigai Basin (South)</option>
              <option value="tamiraparani">Thamirabarani Basin</option>
              <option value="palar">Palar Basin (North)</option>
            </select>
          </div>
        ) : (
          <div className="flex justify-center" title={`Active Basin: ${selectedBasin.toUpperCase()}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/40 bg-blue-950 font-mono text-xs font-bold text-cyan-300">
              {selectedBasin[0].toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'border border-cyan-400/40 bg-blue-600/25 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:bg-blue-950/40 hover:text-white'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      {!collapsed && (
        <div className="border-t border-blue-500/15 p-4 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span>Model Engine</span>
            <span className="font-mono text-cyan-400 font-semibold">HistGradBoost</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Spatial Data</span>
            <span className="font-mono text-emerald-400 font-semibold">GeoJSON / Leaflet</span>
          </div>
        </div>
      )}
    </aside>
  );
}
