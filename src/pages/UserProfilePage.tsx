import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Shield, Check, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface UserProfilePageProps {
  navigate: (path: string, state?: any) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ navigate }) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Please sign in to view your profile</h2>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      await updateProfile({ name, phone });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-red-600" />
          My Profile & Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your personal cinema credentials, ticket delivery preferences, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="p-6 rounded-2xl bg-[#121218] border border-zinc-800 space-y-5 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-red-600/20 border border-red-800/40 text-red-500 text-3xl font-black flex items-center justify-center">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{user.name}</h3>
            <p className="text-xs text-zinc-400">{user.email}</p>
            <div className="mt-2">
              <span className="inline-block px-2.5 py-0.5 rounded bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-red-400 border border-zinc-700">
                {user.role === 'admin' ? 'Cinema Administrator' : 'VIP Cinema Patron'}
              </span>
            </div>
          </div>

          <div className="w-full pt-4 border-t border-zinc-800 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Account Type</span>
              <span className="font-semibold text-white capitalize">{user.role}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Security Level</span>
              <span className="font-semibold text-emerald-400">JWT 256-Bit</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-[#121218] border border-zinc-800 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Personal Information
          </h3>

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-zinc-900/60 text-zinc-500 px-3.5 py-2.5 rounded-lg border border-zinc-800 cursor-not-allowed"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Email is tied to your cryptographic ticket history and cannot be altered.
              </span>
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Mobile Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
