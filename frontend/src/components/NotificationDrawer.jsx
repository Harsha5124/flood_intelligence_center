import React, { useState } from 'react';
import { Bell, X, CheckCheck, AlertTriangle, ShieldAlert, Info, Send, Volume2, VolumeX } from 'lucide-react';
import { markNotificationRead, markAllNotificationsRead, dispatchAlertBroadcast } from '../services/api';

export default function NotificationDrawer({ 
  isOpen, 
  onClose, 
  notifications = [], 
  onRefresh,
  audioAlertsEnabled = true,
  onToggleAudio 
}) {
  const [filter, setFilter] = useState('ALL');
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchTitle, setDispatchTitle] = useState('Critical River Discharge Warning');
  const [dispatchMessage, setDispatchMessage] = useState('Emergency flood alert dispatched by analyst following ML prediction spike. Immediate riverbank clearance requested.');
  const [dispatchSeverity, setDispatchSeverity] = useState('CRITICAL');
  const [dispatchBasin, setDispatchBasin] = useState('adyar');
  const [dispatching, setDispatching] = useState(false);

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (filter === 'ALL') return true;
    return n.severity === filter;
  });

  async function handleMarkRead(id) {
    await markNotificationRead(id);
    onRefresh();
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    onRefresh();
  }

  async function handleDispatch(e) {
    e.preventDefault();
    setDispatching(true);
    try {
      await dispatchAlertBroadcast({
        basin_id: dispatchBasin,
        severity: dispatchSeverity,
        title: dispatchTitle,
        message: dispatchMessage
      });
      setShowDispatchModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDispatching(false);
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 z-[1500] flex w-full max-w-md flex-col border-l border-blue-500/30 bg-[#0c1930]/98 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-500/20 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-950/40 text-amber-400">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Notification Centre</h3>
            <p className="text-[11px] text-slate-400">Condition-driven telemetry alerts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onToggleAudio && (
            <button
              onClick={onToggleAudio}
              title={audioAlertsEnabled ? "Mute alert chime" : "Enable alert chime"}
              className={`rounded-lg p-1.5 transition-all ${
                audioAlertsEnabled ? 'text-cyan-400 bg-cyan-950/50 border border-cyan-500/30' : 'text-slate-500 hover:text-white'
              }`}
            >
              {audioAlertsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="flex items-center justify-between border-b border-blue-500/10 bg-[#081122]/60 px-5 py-2.5">
        <div className="flex gap-1.5 text-[11px]">
          {['ALL', 'CRITICAL', 'WARNING', 'WATCH'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={handleMarkAll}
          className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
        >
          <CheckCheck className="h-3 w-3" /> Mark all read
        </button>
      </div>

      {/* Trigger Broadcast Button */}
      <div className="p-3 bg-blue-950/20 border-b border-blue-500/15">
        <button
          onClick={() => setShowDispatchModal(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-950/30 py-2 text-xs font-semibold text-red-300 transition-all hover:bg-red-900/40 hover:border-red-400"
        >
          <Send className="h-3.5 w-3.5 text-red-400" /> Dispatch Emergency Broadcast Alert
        </button>
      </div>

      {/* Notification List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center text-slate-500">
            <Info className="mb-2 h-8 w-8 text-slate-600" />
            <p className="text-xs">No active alerts matching filter.</p>
          </div>
        ) : (
          filtered.map(item => {
            const isCritical = item.severity === 'CRITICAL';
            const isWarning = item.severity === 'WARNING';
            const borderColor = isCritical ? 'border-red-500/40' : (isWarning ? 'border-orange-500/30' : 'border-amber-500/25');
            const bgGlow = isCritical ? 'bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : (isWarning ? 'bg-orange-950/20' : 'bg-[#0f1f3d]');

            return (
              <div
                key={item.id}
                className={`relative rounded-xl border ${borderColor} ${bgGlow} p-3.5 transition-all ${
                  !item.is_read ? 'border-l-4 border-l-cyan-400' : 'opacity-85'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      isCritical ? 'bg-red-500 text-white' : (isWarning ? 'bg-orange-500 text-black' : 'bg-amber-400 text-black')
                    }`}>
                      {item.severity}
                    </span>
                    <span className="text-[11px] font-mono uppercase text-cyan-300">
                      {item.basin_id}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{item.created_at}</span>
                </div>

                <h4 className="mt-2 text-xs font-bold text-white">{item.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{item.message}</p>

                <div className="mt-3 flex items-center justify-between border-t border-slate-700/40 pt-2 text-[10px]">
                  <span className="font-mono text-slate-400">Event: {item.event_type}</span>
                  {!item.is_read && (
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      className="font-semibold text-cyan-400 hover:underline"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-red-500/40 bg-[#0c1930] p-5 shadow-2xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-400" /> Dispatch Flood Warning Alert
            </h4>
            <p className="mt-1 text-xs text-slate-400">Broadcasts instant alert to all field responders and app feed.</p>
            
            <form onSubmit={handleDispatch} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Target Basin</label>
                <select
                  value={dispatchBasin}
                  onChange={e => setDispatchBasin(e.target.value)}
                  className="w-full rounded-lg border border-blue-500/30 bg-[#070d18] p-2 text-white outline-none"
                >
                  <option value="adyar">Adyar River Basin</option>
                  <option value="cooum">Cooum River Basin</option>
                  <option value="cauvery">Cauvery Basin</option>
                  <option value="vaigai">Vaigai Basin</option>
                  <option value="tamiraparani">Thamirabarani Basin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Severity Level</label>
                <select
                  value={dispatchSeverity}
                  onChange={e => setDispatchSeverity(e.target.value)}
                  className="w-full rounded-lg border border-blue-500/30 bg-[#070d18] p-2 text-white outline-none"
                >
                  <option value="CRITICAL">CRITICAL (Sirens + Immediate Evacuation)</option>
                  <option value="WARNING">WARNING (High Risk / Standby Shelters)</option>
                  <option value="WATCH">WATCH (Elevated Runoff Surveillance)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Alert Headline</label>
                <input
                  type="text"
                  required
                  value={dispatchTitle}
                  onChange={e => setDispatchTitle(e.target.value)}
                  className="w-full rounded-lg border border-blue-500/30 bg-[#070d18] p-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Alert Broadcast Message</label>
                <textarea
                  rows={3}
                  required
                  value={dispatchMessage}
                  onChange={e => setDispatchMessage(e.target.value)}
                  className="w-full rounded-lg border border-blue-500/30 bg-[#070d18] p-2 text-white outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="flex-1 rounded-xl bg-slate-800 py-2 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatching}
                  className="flex-1 rounded-xl bg-red-600 py-2 font-bold text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {dispatching ? 'Dispatching...' : 'Broadcast Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
