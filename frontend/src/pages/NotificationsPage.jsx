import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Send, ShieldAlert, AlertTriangle, Info } from 'lucide-react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, dispatchAlertBroadcast } from '../services/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Dispatch state
  const [showModal, setShowModal] = useState(false);
  const [targetBasin, setTargetBasin] = useState('adyar');
  const [severity, setSeverity] = useState('CRITICAL');
  const [title, setTitle] = useState('Immediate Riverside Evacuation Order');
  const [message, setMessage] = useState('Adyar river water stage approaching critical bankfull elevation. Relocate to designated higher ground shelters.');
  const [statusMsg, setStatusMsg] = useState('');

  async function loadData() {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleMarkRead(id) {
    await markNotificationRead(id);
    loadData();
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    loadData();
  }

  async function handleDispatch(e) {
    e.preventDefault();
    setStatusMsg('Broadcasting alert...');
    try {
      await dispatchAlertBroadcast({
        basin_id: targetBasin,
        severity,
        title,
        message
      });
      setStatusMsg('Alert successfully logged & dispatched to operational feed!');
      setTimeout(() => {
        setShowModal(false);
        setStatusMsg('');
        loadData();
      }, 1500);
    } catch (err) {
      setStatusMsg('Error broadcasting alert.');
    }
  }

  const filtered = notifications.filter(n => filter === 'ALL' || n.severity === filter);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-[#0c1930]/85 p-6 shadow-xl backdrop-blur-md sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">NOTIFICATION CENTRE</span>
            <span className="rounded bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-blue-500/30">
              Condition-Driven • Deduplicated
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Event & Condition-Driven Notifications
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Automated alerts generated on threshold crossings, ML risk escalations, and reservoir surge events.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-bold text-xs text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-red-500 transition-all"
        >
          <Send className="h-4 w-4" />
          <span>Dispatch Emergency Alert</span>
        </button>
      </div>

      {/* Filter and Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-500/15 bg-[#0c1930] p-4">
        <div className="flex gap-2">
          {['ALL', 'CRITICAL', 'WARNING', 'WATCH'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={handleMarkAll}
          className="flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
        >
          <CheckCheck className="h-4 w-4" /> Mark All Notifications as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map(item => {
          const isCritical = item.severity === 'CRITICAL';
          const isWarning = item.severity === 'WARNING';
          const borderColor = isCritical ? 'border-red-500/40' : (isWarning ? 'border-orange-500/30' : 'border-amber-500/25');
          const bgGlow = isCritical ? 'bg-red-950/20' : (isWarning ? 'bg-orange-950/20' : 'bg-[#0c1930]');

          return (
            <div
              key={item.id}
              className={`rounded-2xl border ${borderColor} ${bgGlow} p-5 shadow-lg backdrop-blur-md transition-all ${
                !item.is_read ? 'border-l-4 border-l-cyan-400' : 'opacity-85'
              }`}
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-extrabold ${
                    isCritical ? 'bg-red-500 text-white' : (isWarning ? 'bg-orange-500 text-black' : 'bg-amber-400 text-black')
                  }`}>
                    {item.severity}
                  </span>
                  <span className="font-mono text-xs uppercase font-bold text-cyan-300">
                    {item.basin_id} Basin
                  </span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                    {item.event_type}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">{item.created_at}</span>
              </div>

              <h4 className="mt-2 text-sm font-bold text-white">{item.title}</h4>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">{item.message}</p>

              <div className="mt-3 flex justify-end">
                {!item.is_read && (
                  <button
                    onClick={() => handleMarkRead(item.id)}
                    className="text-xs font-semibold text-cyan-400 hover:underline"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Dispatch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-[#0c1930] p-6 shadow-2xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Send className="h-5 w-5 text-red-400" /> Dispatch Early Warning Alert Broadcast
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Broadcasts an immediate alert into the system feed and notifies field units.
            </p>

            <form onSubmit={handleDispatch} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Target Basin</label>
                <select
                  value={targetBasin}
                  onChange={e => setTargetBasin(e.target.value)}
                  className="w-full rounded-xl border border-blue-500/30 bg-[#070d18] p-2.5 text-white outline-none"
                >
                  <option value="adyar">Adyar Basin</option>
                  <option value="cooum">Cooum Basin</option>
                  <option value="cauvery">Cauvery Basin</option>
                  <option value="vaigai">Vaigai Basin</option>
                  <option value="tamiraparani">Thamirabarani Basin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value)}
                  className="w-full rounded-xl border border-blue-500/30 bg-[#070d18] p-2.5 text-white outline-none"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="WARNING">WARNING</option>
                  <option value="WATCH">WATCH</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-blue-500/30 bg-[#070d18] p-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Advisory Message</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-blue-500/30 bg-[#070d18] p-2.5 text-white outline-none"
                />
              </div>

              {statusMsg && (
                <div className="rounded-lg bg-emerald-950/60 border border-emerald-500/40 p-2 text-center text-xs text-emerald-300">
                  {statusMsg}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl bg-slate-800 py-2.5 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-red-600 py-2.5 font-bold text-white hover:bg-red-500"
                >
                  Dispatch Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
