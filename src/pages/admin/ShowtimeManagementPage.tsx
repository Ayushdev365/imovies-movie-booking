import React, { useEffect, useState } from 'react';
import { CalendarDays, Plus, Trash2, X, Check, AlertCircle, Clock, MapPin, Film } from 'lucide-react';
import { Showtime, Movie, Theatre } from '../../types/index.js';
import { api } from '../../services/api.js';
import { AdminSidebar } from '../../components/AdminSidebar.js';

interface ShowtimeManagementPageProps {
  navigate: (path: string, state?: any) => void;
}

export const ShowtimeManagementPage: React.FC<ShowtimeManagementPageProps> = ({ navigate }) => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedTheatreId, setSelectedTheatreId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('21:45');
  const [basePrice, setBasePrice] = useState('16.50');
  const [screenType, setScreenType] = useState('IMAX');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [showtimesRes, moviesRes, theatresRes] = await Promise.all([
        api.getShowtimes(),
        api.getMovies(),
        api.getTheatres(),
      ]);
      setShowtimes(showtimesRes.showtimes);
      setMovies(moviesRes.movies);
      setTheatres(theatresRes.theatres);
      if (moviesRes.movies.length > 0) setSelectedMovieId(moviesRes.movies[0]._id || moviesRes.movies[0].id);
      if (theatresRes.theatres.length > 0) setSelectedTheatreId(theatresRes.theatres[0]._id || theatresRes.theatres[0].id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load showtimes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');

      await api.createShowtime({
        movieId: selectedMovieId,
        theatreId: selectedTheatreId,
        date,
        startTime,
        endTime,
        basePrice: Number(basePrice),
        screenType,
      });

      setMsg('Showtime scheduled successfully!');
      setModalOpen(false);
      loadData();
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to schedule showtime');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShowtime = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled showtime?')) return;
    try {
      await api.deleteShowtime(id);
      setMsg('Showtime deleted.');
      loadData();
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete showtime');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[85vh]">
      <AdminSidebar currentPath="/admin/showtimes" navigate={navigate} />

      <main className="flex-1 p-6 lg:p-10 space-y-6 bg-[#0a0a0e] overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
              Programming & Schedules
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Manage Showtimes
            </h1>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950 transition"
          >
            <Plus className="w-4 h-4" />
            Schedule Showtime
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

        {/* Showtimes Table */}
        <div className="p-6 rounded-2xl bg-[#121218] border border-zinc-800/80 shadow-xl overflow-hidden">
          {loading ? (
            <p className="text-xs text-zinc-400 py-6 text-center">Loading schedule calendar...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Movie</th>
                    <th className="py-3 px-3">Theatre Venue</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Time Window</th>
                    <th className="py-3 px-3">Format</th>
                    <th className="py-3 px-3">Base Price</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {showtimes.map((st) => (
                    <tr key={st._id || st.id} className="hover:bg-zinc-900/40">
                      <td className="py-3 px-3 font-sans font-bold text-white">
                        {st.movie?.title || 'Unknown Movie'}
                      </td>
                      <td className="py-3 px-3 font-sans text-zinc-300">
                        {st.theatre?.name || 'Multiplex'}
                      </td>
                      <td className="py-3 px-3 text-zinc-400">{st.date}</td>
                      <td className="py-3 px-3 font-bold text-white">
                        {st.startTime} – {st.endTime}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-red-400 border border-zinc-700 text-[10px] font-bold">
                          {st.screenType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-white">${st.basePrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteShowtime(st._id || st.id)}
                          className="p-1.5 rounded bg-red-950/40 hover:bg-red-950/80 text-red-400 transition"
                          title="Cancel Showtime"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for Scheduling */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[#121217] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <h3 className="font-bold text-white text-base">Schedule New Showtime</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateShowtime} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Select Movie</label>
                  <select
                    value={selectedMovieId}
                    onChange={(e) => setSelectedMovieId(e.target.value)}
                    className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600 font-medium"
                  >
                    {movies.map((m) => (
                      <option key={m._id || m.id} value={m._id || m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Select Theatre Complex</label>
                  <select
                    value={selectedTheatreId}
                    onChange={(e) => setSelectedTheatreId(e.target.value)}
                    className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600 font-medium"
                  >
                    {theatres.map((t) => (
                      <option key={t._id || t.id} value={t._id || t.id}>
                        {t.name} ({t.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2 rounded-lg border border-zinc-700/80 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Experience Format</label>
                    <select
                      value={screenType}
                      onChange={(e) => setScreenType(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2 rounded-lg border border-zinc-700/80"
                    >
                      <option value="IMAX">IMAX Laser</option>
                      <option value="Dolby Atmos">Dolby Atmos</option>
                      <option value="4DX">4DX Motion</option>
                      <option value="Standard 2D">Standard 2D</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700/80 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700/80 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Base Price ($)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700/80 font-mono"
                    />
                  </div>
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
                    {saving ? 'Scheduling...' : 'Confirm Showtime'}
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
