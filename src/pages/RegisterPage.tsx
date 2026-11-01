import React, { useState } from 'react';
import { Film, User, Mail, Lock, Phone, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface RegisterPageProps {
  navigate: (path: string, state?: any) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await register(name, email, password, phone);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-red-950/60">
            <Film className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-zinc-400">
            Join IMovies for seamless digital passes and cinema rewards.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#121218] border border-zinc-800 space-y-4 shadow-xl">
          <div className="space-y-1 text-xs">
            <label className="block text-zinc-400 font-semibold">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#181822] text-zinc-200 pl-9 pr-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

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
            <label className="block text-zinc-400 font-semibold">Mobile Phone (optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#181822] text-zinc-200 pl-9 pr-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="block text-zinc-400 font-semibold">Password (min 6 characters)</label>
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

          <div className="space-y-1 text-xs">
            <label className="block text-zinc-400 font-semibold">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#181822] text-zinc-200 pl-9 pr-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400">
          Already registered?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-red-400 hover:underline font-semibold"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};
