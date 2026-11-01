import React, { useState } from 'react';
import { Film, Lock, Mail, Shield, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface LoginPageProps {
  navigate: (path: string, state?: any) => void;
  redirectTo?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate, redirectTo }) => {
  const { login, loginAsDemoUser, loginAsAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');
      await login(email, password);
      navigate(redirectTo || '/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoUser = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await loginAsDemoUser();
      navigate(redirectTo || '/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await loginAsAdmin();
      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-red-950/60">
            <Film className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Sign In to IMovies
          </h1>
          <p className="text-xs text-zinc-400">
            Access your cinema bookings, fast ticket reservations, and perks.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1-Click Quick Demo Sign-Ins */}
        <div className="p-4 rounded-xl bg-[#14141c] border border-zinc-800 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Instant Test Credentials (1-Click)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoUser}
              className="py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
              Demo Patron
            </button>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="py-2 px-3 rounded-lg bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Shield className="w-3.5 h-3.5" />
              Cinema Admin
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#121218] border border-zinc-800 space-y-4 shadow-xl">
          <div className="space-y-1 text-xs">
            <label className="block text-zinc-400 font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#181822] text-zinc-200 pl-9 pr-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="block text-zinc-400 font-semibold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#181822] text-zinc-200 pl-9 pr-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400">
          Don't have an IMovies account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-red-400 hover:underline font-semibold"
          >
            Create one now
          </button>
        </p>
      </div>
    </div>
  );
};
