import React, { useEffect, useState } from 'react';
import { Movie } from '../types/index.js';
import { api } from '../services/api.js';
import { MovieCard } from '../components/MovieCard.js';
import { Search, SlidersHorizontal, Film } from 'lucide-react';

interface MoviesPageProps {
  navigate: (path: string, state?: any) => void;
  initialFilter?: string;
}

export const MoviesPage: React.FC<MoviesPageProps> = ({ navigate, initialFilter }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('rating');

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const res = await api.getMovies();
        setMovies(res.movies);
      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  const genres = ['all', 'Sci-Fi', 'Action', 'Drama', 'Adventure', 'Biography', 'Animation'];

  // Filter & Sort
  const filtered = movies.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (genreFilter !== 'all' && !m.genre?.some((g) => g.toLowerCase() === genreFilter.toLowerCase())) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(term);
      const matchDirector = m.director.toLowerCase().includes(term);
      const matchCast = m.cast?.some((c) => c.toLowerCase().includes(term));
      if (!matchTitle && !matchDirector && !matchCast) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'duration') return b.duration - a.duration;
    if (sortBy === 'releaseDate') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
          <Film className="w-6 h-6 text-red-600" />
          Cinema Catalog
        </h1>
        <p className="text-xs text-zinc-400">
          Discover current box office hits and advance bookings across all IMovies multiplexes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121217] border border-zinc-800 space-y-4">
        {/* Status Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-[#1a1a24] p-1 rounded-xl border border-zinc-800 w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Movies' },
              { id: 'now_showing', label: 'Now Showing' },
              { id: 'upcoming', label: 'Coming Soon' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === tab.id
                    ? 'bg-red-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, director, cast..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181822] text-xs text-zinc-200 pl-9 pr-4 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
            />
          </div>
        </div>

        {/* Secondary filters: Genre & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Genre:</span>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setGenreFilter(g)}
                className={`px-2.5 py-1 rounded text-xs capitalize transition ${
                  genreFilter === g
                    ? 'bg-zinc-800 text-red-400 font-bold border border-red-800/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#181822] text-xs text-zinc-300 px-3 py-1 rounded-md border border-zinc-700/80 focus:outline-none focus:border-red-600"
            >
              <option value="rating">Highest Rated</option>
              <option value="releaseDate">Release Date</option>
              <option value="duration">Runtime</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movie Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 bg-zinc-900/60 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121217] border border-zinc-800 space-y-3">
          <p className="text-base font-bold text-white">No movies match your selected filters</p>
          <p className="text-xs text-zinc-400">Try choosing a different genre or clearing the search query.</p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setGenreFilter('all');
              setSearchTerm('');
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((movie) => (
            <MovieCard
              key={movie._id || movie.id}
              movie={movie}
              onSelect={(m) => navigate(`/movies/${m._id || m.id}`)}
              onBookNow={(m) => navigate('/showtimes', { movieId: m._id || m.id })}
            />
          ))}
        </div>
      )}
    </div>
  );
};
