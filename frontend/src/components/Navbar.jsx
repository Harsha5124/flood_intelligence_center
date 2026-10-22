import React, { useState, useEffect } from 'react';
import { ShieldCheck, Bell, LogIn, LogOut, User, Activity, Clock, Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function Navbar({
  isAuthenticated,
  user,
  onOpenLogin,
  onLogout,
  onOpenNotifications,
  unreadCount = 0,
  activeTab,
  onNavigateTab
}) {
  const [istTime, setIstTime] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live ticking IST Clock
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      // Format as IST
      const opts = {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setIstTime(now.toLocaleDateString('en-IN', opts).toUpperCase() + ' IST');
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-[800] border-b border-blue-500/20 bg-[#070d18]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div 
          onClick={() => onNavigateTab(isAuthenticated ? 'dashboard' : 'landing')}
          className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/60 bg-[#0c1930] text-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.4)]">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
            </span>
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wider text-white sm:text-base">
              FLOOD INTELLIGENCE CENTRE
            </div>
            <div className="font-mono text-[10px] tracking-widest text-cyan-400 uppercase">
              Tamil Nadu River Basins • 2026MIN270
            </div>
          </div>
        </div>

        {/* Center Live IST Clock & Telemetry Indicator */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-[#0c1930]/80 px-3 py-1 font-mono text-[11px] text-slate-300 shadow-inner">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>{istTime || '16 OCT 2026 • 14:45:00 IST'}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-[11px] font-bold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span>6 BASINS STREAMING</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`hidden sm:flex rounded-xl border p-2 text-xs transition-all ${
              soundEnabled
                ? 'border-blue-500/30 bg-[#0c1930] text-cyan-300 hover:border-cyan-400'
                : 'border-slate-700 bg-slate-900/60 text-slate-500'
            }`}
            title={soundEnabled ? 'Emergency Siren Sound Active' : 'Siren Muted'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Notification Bell with Badge */}
              <button
                onClick={onOpenNotifications}
                className="relative rounded-xl border border-blue-500/30 bg-[#0c1930] p-2 text-slate-300 transition-all hover:border-cyan-400 hover:text-white"
                aria-label="Open notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-[0_0_10px_#ef4444]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Officer Profile Chip */}
              <div className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-[#0c1930] px-3 py-1.5 text-xs text-slate-200">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-600 font-bold text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  {user?.full_name ? user.full_name[0] : 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-white leading-tight truncate max-w-[140px]">
                    {user?.full_name || 'Admin Officer'}
                  </div>
                  <div className="text-[10px] text-cyan-400 leading-tight">
                    {user?.role?.includes('Admin') ? 'Super Admin' : 'SDMA Analyst'}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="ml-1 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* Admin demo credential indicator button */}
              <button
                onClick={onOpenLogin}
                className="hidden md:flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-950/30 px-3 py-1.5 text-xs text-cyan-300 transition-all hover:bg-cyan-900/40 hover:border-cyan-300"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Admin Demo: <strong className="font-mono text-white">admin@hydron.gov.in</strong></span>
              </button>

              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_18px_rgba(2,132,199,0.4)] transition-all hover:bg-cyan-500 hover:text-black"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In / Log In</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
