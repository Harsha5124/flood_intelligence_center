import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import { loginUser, signupUser } from '../services/api';

export default function LoginModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('admin@hydron.gov.in');
  const [password, setPassword] = useState('Admin@1234');
  const [fullName, setFullName] = useState('Dr. K. Senthil Nathan, IAS');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function fillAdminCredentials() {
    setEmail('admin@hydron.gov.in');
    setPassword('Admin@1234');
    setFullName('Dr. K. Senthil Nathan, IAS');
    setError('');
  }

  function fillAnalystCredentials() {
    setEmail('demo@hydron.app');
    setPassword('Demo@1234');
    setFullName('Dr. M. Krishnan');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isSignUp) {
        res = await signupUser({ email, password, full_name: fullName });
      } else {
        res = await loginUser(email, password);
      }
      onAuthSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid credentials or network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-blue-500/40 bg-[#0c1930] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/50 bg-blue-950/80 text-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.4)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {isSignUp ? 'Create Officer Account' : 'Authorized Sign In'}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {isSignUp ? 'Register for state flood intelligence workstation clearance' : 'Access live CWC telemetry, scikit-learn models & alert dispatch'}
          </p>
        </div>

        {/* 1-Click Demo Credentials Quick-Fill Buttons */}
        {!isSignUp && (
          <div className="mb-5 rounded-xl border border-cyan-400/30 bg-cyan-950/20 p-3">
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-cyan-300">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                DEMO LOGIN OPTIONS
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Click to auto-fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="flex flex-col items-start rounded-lg border border-cyan-500/30 bg-[#070d18] p-2 text-left transition-all hover:border-cyan-400 hover:bg-blue-950/60"
              >
                <div className="flex items-center gap-1 font-bold text-[11px] text-cyan-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin ID
                </div>
                <span className="font-mono text-[10px] text-slate-300 truncate w-full">admin@hydron.gov.in</span>
                <span className="font-mono text-[9px] text-slate-400">Pass: Admin@1234</span>
              </button>

              <button
                type="button"
                onClick={fillAnalystCredentials}
                className="flex flex-col items-start rounded-lg border border-blue-500/30 bg-[#070d18] p-2 text-left transition-all hover:border-blue-400 hover:bg-blue-950/60"
              >
                <div className="flex items-center gap-1 font-bold text-[11px] text-blue-300">
                  <KeyRound className="h-3.5 w-3.5" />
                  Analyst ID
                </div>
                <span className="font-mono text-[10px] text-slate-300 truncate w-full">demo@hydron.app</span>
                <span className="font-mono text-[9px] text-slate-400">Pass: Demo@1234</span>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">Full Name & Title</label>
              <div className="relative">
                <User className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Officer Name"
                  className="w-full rounded-xl border border-blue-500/30 bg-[#070d18] py-2.5 pr-4 pl-10 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-300">Official Email</label>
            <div className="relative">
              <Mail className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hydron.gov.in"
                className="w-full rounded-xl border border-blue-500/30 bg-[#070d18] py-2.5 pr-4 pl-10 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-blue-500/30 bg-[#070d18] py-2.5 pr-4 pl-10 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 font-bold text-xs text-white shadow-[0_0_20px_rgba(2,132,199,0.4)] transition-all hover:bg-cyan-500 hover:text-black disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : (isSignUp ? 'Register Officer Account' : 'Sign In as Officer / Admin')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-4 border-t border-blue-500/20 pt-3 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs text-cyan-400 hover:underline"
          >
            {isSignUp ? 'Already registered? Sign in here' : "Need an account? Request officer registration"}
          </button>
        </div>
      </div>
    </div>
  );
}
