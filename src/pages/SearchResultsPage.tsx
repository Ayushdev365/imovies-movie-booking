import React, { useEffect, useState } from 'react';
import { Search, Film, ArrowLeft } from 'lucide-react';
import { Movie } from '../types/index.js';
import { api } from '../services/api.js';
import { MovieCard } from '../components/MovieCard.js';

interface SearchResultsPageProps {
  query: string;
  navigate: (path: string, state?: any) => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ query, navigate }) => {
  const [searchTerm, setSearchTerm] = useState<string>(query || '');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function searchMovies() {
      try {
        setLoading(true);
        const res = await api.getMovies({ search: searchTerm });
        setMovies(res.movies);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }
    searchMovies();
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1 as any || '/')}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-red-500" />
            Search Cinema Titles
          </h1>
          <p className="text-xs text-zinc-400">
            {movies.length} result{movies.length === 1 ? '' : 's'} matching "{searchTerm}"
          </p>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSearch} className="max-w-xl relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search by movie title, actor, or director..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#121218] text-sm text-zinc-200 pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
        />
      </form>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-80 bg-zinc-900 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-[#121218] border border-zinc-800 space-y-4">
          <Film className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No movies found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            We couldn't find any movie matching "{searchTerm}". Try searching for popular titles like "Dune", "Oppenheimer", or "Batman".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
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
