import React, { useEffect, useState } from 'react';
import { Film, Plus, Edit, Trash2, X, Star, Check, AlertCircle } from 'lucide-react';
import { Movie } from '../../types/index.js';
import { api } from '../../services/api.js';
import { AdminSidebar } from '../../components/AdminSidebar.js';

interface MovieManagementPageProps {
  navigate: (path: string, state?: any) => void;
}

export const MovieManagementPage: React.FC<MovieManagementPageProps> = ({ navigate }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [genre, setGenre] = useState('Action, Sci-Fi');
  const [duration, setDuration] = useState('150');
  const [releaseDate, setReleaseDate] = useState('2024-11-15');
  const [rating, setRating] = useState('8.5');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');
  const [status, setStatus] = useState<'now_showing' | 'upcoming'>('now_showing');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadMovies = async () => {
    try {
      setLoading(true);
      const res = await api.getMovies();
      setMovies(res.movies);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const openAddModal = () => {
    setEditingMovie(null);
    setTitle('');
    setDescription('');
    setPosterUrl('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop');
    setBackdropUrl('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop');
    setGenre('Action, Thriller');
    setDuration('140');
    setReleaseDate(new Date().toISOString().split('T')[0]);
    setRating('8.2');
    setDirector('Christopher Nolan');
    setCast('Actor One, Actor Two');
    setStatus('now_showing');
    setModalOpen(true);
  };

  const openEditModal = (m: Movie) => {
    setEditingMovie(m);
    setTitle(m.title);
    setDescription(m.description);
    setPosterUrl(m.posterUrl);
    setBackdropUrl(m.backdropUrl);
    setGenre(m.genre.join(', '));
    setDuration(String(m.duration));
    setReleaseDate(m.releaseDate);
    setRating(String(m.rating));
    setDirector(m.director);
    setCast(m.cast.join(', '));
    setStatus(m.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');

      const payload = {
        title,
        description,
        posterUrl,
        backdropUrl: backdropUrl || posterUrl,
        genre: genre.split(',').map((s) => s.trim()).filter(Boolean),
        duration: Number(duration),
        releaseDate,
        rating: Number(rating),
        director,
        cast: cast.split(',').map((s) => s.trim()).filter(Boolean),
        status,
      };

      if (editingMovie) {
        await api.updateMovie(editingMovie._id || editingMovie.id, payload);
        setMsg('Movie updated successfully!');
      } else {
        await api.createMovie(payload);
        setMsg('Movie added to catalog successfully!');
      }

      setModalOpen(false);
      loadMovies();
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save movie');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (movieId: string) => {
    if (!confirm('Are you sure you want to delete this movie from the cinema catalog?')) {
      return;
    }
    try {
      await api.deleteMovie(movieId);
      setMsg('Movie deleted.');
      loadMovies();
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete movie');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[85vh]">
      <AdminSidebar currentPath="/admin/movies" navigate={navigate} />

      <main className="flex-1 p-6 lg:p-10 space-y-6 bg-[#0a0a0e] overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
              Cinema Catalog Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Manage Movies
            </h1>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950 transition"
          >
            <Plus className="w-4 h-4" />
            Add New Movie
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
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Movies List Table */}
        <div className="p-6 rounded-2xl bg-[#121218] border border-zinc-800/80 shadow-xl overflow-hidden">
          {loading ? (
            <p className="text-xs text-zinc-400 py-6 text-center">Loading cinema database...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Poster</th>
                    <th className="py-3 px-3">Title & Director</th>
                    <th className="py-3 px-3">Genres</th>
                    <th className="py-3 px-3">Runtime</th>
                    <th className="py-3 px-3">Rating</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {movies.map((m) => (
                    <tr key={m._id || m.id} className="hover:bg-zinc-900/40">
                      <td className="py-3 px-3">
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          className="w-10 h-14 object-cover rounded border border-zinc-700"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-white text-sm">{m.title}</p>
                        <p className="text-[11px] text-zinc-400">Dir: {m.director}</p>
                      </td>
                      <td className="py-3 px-3 text-zinc-400">
                        {m.genre.slice(0, 2).join(', ')}
                      </td>
                      <td className="py-3 px-3 font-mono">{m.duration} mins</td>
                      <td className="py-3 px-3 font-bold text-amber-400 font-mono">
                        ★ {m.rating.toFixed(1)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            m.status === 'now_showing'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {m.status === 'now_showing' ? 'Now Playing' : 'Upcoming'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                            title="Edit Movie"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(m._id || m.id)}
                            className="p-1.5 rounded bg-red-950/40 hover:bg-red-950/80 text-red-400 transition"
                            title="Delete Movie"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for Add / Edit */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[#121217] border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <h3 className="font-bold text-white text-base">
                  {editingMovie ? 'Edit Cinema Movie' : 'Add New Movie to IMovies'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-zinc-400 font-semibold mb-1">Movie Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600 font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-zinc-400 font-semibold mb-1">Description / Synopsis</label>
                    <textarea
                      rows={3}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Poster Image URL</label>
                    <input
                      type="url"
                      required
                      value={posterUrl}
                      onChange={(e) => setPosterUrl(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Backdrop Image URL</label>
                    <input
                      type="url"
                      value={backdropUrl}
                      onChange={(e) => setBackdropUrl(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Genres (comma separated)</label>
                    <input
                      type="text"
                      required
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Director</label>
                    <input
                      type="text"
                      required
                      value={director}
                      onChange={(e) => setDirector(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      required
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Rating (e.g. 8.5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      required
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Release Date</label>
                    <input
                      type="date"
                      required
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Screening Status</label>
                    <select
                      value={status}
                      onChange={(e: any) => setStatus(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
                    >
                      <option value="now_showing">Now Showing</option>
                      <option value="upcoming">Upcoming</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-zinc-400 font-semibold mb-1">Cast Members (comma separated)</label>
                    <input
                      type="text"
                      value={cast}
                      onChange={(e) => setCast(e.target.value)}
                      className="w-full bg-[#181822] text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingMovie ? 'Update Movie' : 'Create Movie'}
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
