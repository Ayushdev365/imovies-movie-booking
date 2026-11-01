import React, { useEffect, useState } from 'react';
import { Building2, Plus, Trash2, X, Check, AlertCircle, Layers } from 'lucide-react';
import { Theatre } from '../../types/index.js';
import { api } from '../../services/api.js';
import { AdminSidebar } from '../../components/AdminSidebar.js';

interface TheatreManagementPageProps {
  navigate: (path: string, state?: any) => void;
}

export const TheatreManagementPage: React.FC<TheatreManagementPageProps> = ({ navigate }) => {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [screenModalOpen, setScreenModalOpen] = useState(false);
  const [selectedTheatre, setSelectedTheatre] = useState<Theatre | null>(null);

  // Theatre form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [facilities, setFacilities] = useState('IMAX Laser 4K, Dolby Atmos, VIP Recliners');

  // Screen form state
  const [screenName, setScreenName] = useState('');
  const [screenType, setScreenType] = useState<'IMAX' | '4DX' | 'Dolby Atmos' | 'Standard 2D'>('IMAX');
  const [rows, setRows] = useState('8');
  const [cols, setCols] = useState('12');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadTheatres = async () => {
    try {
      setLoading(true);
      const res = await api.getTheatres();
      setTheatres(res.theatres);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load theatres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheatres();
  }, []);

  const openAddTheatre = () => {
    setName('');
    setCity('San Francisco');
    setAddress('100 Market Street, San Francisco, CA 94105');
    setPhone('+1 (415) 555-0199');
    setFacilities('IMAX Laser, Dolby Atmos, VIP Loungers');
    setModalOpen(true);
  };

  const handleSaveTheatre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');

      await api.createTheatre({
        name,
        city,
        address,
        phone,
        facilities: facilities.split(',').map((s) => s.trim()).filter(Boolean),
        screensCount: 1,
      });

      setMsg('Theatre created successfully!');
      setModalOpen(false);
      loadTheatres();
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create theatre');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTheatre = async (id: string) => {
    if (!confirm('Are you sure you want to delete this theatre complex?')) return;
    try {
      await api.deleteTheatre(id);
      setMsg('Theatre deleted');
      loadTheatres();
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete theatre');
    }
  };

  const openAddScreen = (theatre: Theatre) => {
    setSelectedTheatre(theatre);
    setScreenName(`${theatre.name} - Screen 3 (Laser 4DX)`);
    setScreenType('4DX');
    setRows('8');
    setCols('12');
    setScreenModalOpen(true);
  };

  const handleSaveScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTheatre) return;

    try {
      setSaving(true);
      setErrorMsg('');

      const token = localStorage.getItem('imovies_token');
      const res = await fetch('/api/v1/screens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          theatreId: selectedTheatre._id || selectedTheatre.id,
          name: screenName,
          screenType,
          rows: Number(rows),
          cols: Number(cols),
        }),
      });

      if (!res.ok) throw new Error('Failed to create auditorium screen');

      setMsg('Auditorium screen added!');
      setScreenModalOpen(false);
      loadTheatres();
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create screen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[85vh]">
      <AdminSidebar currentPath="/admin/theatres" navigate={navigate} />

      <main className="flex-1 p-6 lg:p-10 space-y-6 bg-[#0a0a0e] overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
              Venue Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Manage Theatres & Screens
            </h1>
          </div>

          <button
            onClick={openAddTheatre}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950 transition"
          >
            <Plus className="w-4 h-4" />
            Add Theatre Complex
          </button>
        </div>

        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{msg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Theatres Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-44 bg-zinc-900 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {theatres.map((t) => (
              <div
                key={t._id || t.id}
                className="p-6 rounded-2xl bg-[#121218] border border-zinc-800/80 space-y-4 hover:border-zinc-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                    {t.city} Multiplex
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAddScreen(t)}
                      className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-300 flex items-center gap-1"
                    >
                      <Layers className="w-3 h-3 text-red-400" /> + Screen
                    </button>
                    <button
                      onClick={() => handleDeleteTheatre(t._id || t.id)}
                      className="p-1 rounded bg-red-950/40 hover:bg-red-950 text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base">{t.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{t.address}</p>
                  {t.phone && <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{t.phone}</p>}
                </div>

                <div className="pt-2 border-t border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1.5">
                    Auditorium Features
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {t.facilities.map((fac) => (
                      <span
                        key={fac}
                        className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-medium text-zinc-300"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Add Theatre */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[#121217] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <h3 className="font-bold text-white text-base">Add Cinema Complex</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTheatre} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Complex Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="IMovies Bay Area Cineplex"
                    className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Physical Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Facilities (comma separated)</label>
                  <input
                    type="text"
                    value={facilities}
                    onChange={(e) => setFacilities(e.target.value)}
                    className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Create Theatre'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Add Screen */}
        {screenModalOpen && selectedTheatre && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[#121217] border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <h3 className="font-bold text-white text-base">Add Screen to {selectedTheatre.name}</h3>
                <button
                  onClick={() => setScreenModalOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveScreen} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Screen Name</label>
                  <input
                    type="text"
                    required
                    value={screenName}
                    onChange={(e) => setScreenName(e.target.value)}
                    className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Format Type</label>
                  <select
                    value={screenType}
                    onChange={(e: any) => setScreenType(e.target.value)}
                    className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
                  >
                    <option value="IMAX">IMAX Laser 4K</option>
                    <option value="Dolby Atmos">Dolby Atmos Surround</option>
                    <option value="4DX">4DX Motion & Effects</option>
                    <option value="Standard 2D">Standard 2D Digital</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Seating Rows (A-H)</label>
                    <input
                      type="number"
                      min="4"
                      max="12"
                      value={rows}
                      onChange={(e) => setRows(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700/80 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Cols per row</label>
                    <input
                      type="number"
                      min="6"
                      max="20"
                      value={cols}
                      onChange={(e) => setCols(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700/80 font-mono"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400">
                  Total Capacity: <strong className="text-white font-mono">{Number(rows) * Number(cols)}</strong> seats (automatically mapped to VIP, Premium, and Standard tiers).
                </p>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setScreenModalOpen(false)}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Save Screen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
