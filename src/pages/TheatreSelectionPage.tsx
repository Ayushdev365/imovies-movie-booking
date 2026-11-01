import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Phone, Film, Sparkles, ChevronRight } from 'lucide-react';
import { Theatre, Showtime } from '../types/index.js';
import { api } from '../services/api.js';

interface TheatreSelectionPageProps {
  navigate: (path: string, state?: any) => void;
  selectedTheatreId?: string;
}

export const TheatreSelectionPage: React.FC<TheatreSelectionPageProps> = ({ navigate, selectedTheatreId }) => {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [activeTheatreId, setActiveTheatreId] = useState<string>(selectedTheatreId || '');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [theatresRes, showtimesRes] = await Promise.all([
          api.getTheatres(),
          api.getShowtimes(),
        ]);
        setTheatres(theatresRes.theatres);
        setShowtimes(showtimesRes.showtimes);
        if (!activeTheatreId && theatresRes.theatres.length > 0) {
          setActiveTheatreId(theatresRes.theatres[0]._id || theatresRes.theatres[0].id);
        }
      } catch (err) {
        console.error('Failed to load theatres:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const cities = ['all', 'New York', 'Los Angeles', 'Chicago', 'London'];

  const filteredTheatres = cityFilter === 'all'
    ? theatres
    : theatres.filter((t) => t.city.toLowerCase() === cityFilter.toLowerCase());

  const currentTheatre = theatres.find((t) => (t._id || t.id) === activeTheatreId) || theatres[0];
  const theatreShowtimes = showtimes.filter((st) => st.theatreId === (currentTheatre?._id || currentTheatre?.id));

  // Group showtimes by movie
  const movieMap = new Map<string, { movie: any; slots: Showtime[] }>();
  theatreShowtimes.forEach((st) => {
    if (!st.movie) return;
    const movieId = st.movieId;
    if (!movieMap.has(movieId)) {
      movieMap.set(movieId, { movie: st.movie, slots: [] });
    }
    movieMap.get(movieId)!.slots.push(st);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-red-600" />
          Cinema Theatres & Complexes
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Explore flagship auditoriums equipped with IMAX 4K Laser, Dolby Atmos, and ultra-plush VIP Recliners.
        </p>
      </div>

      {/* City Filters */}
      <div className="flex flex-wrap items-center gap-2 bg-[#121217] p-2 rounded-xl border border-zinc-800">
        <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] pl-2">Filter City:</span>
        {cities.map((c) => (
          <button
            key={c}
            onClick={() => setCityFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
              cityFilter === c
                ? 'bg-red-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Layout: Left Theatres List, Right Detail & Screenings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Theatres List */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Locations ({filteredTheatres.length})
          </h3>
          <div className="space-y-3">
            {filteredTheatres.map((theatre) => {
              const isSelected = (theatre._id || theatre.id) === activeTheatreId;
              return (
                <div
                  key={theatre._id || theatre.id}
                  onClick={() => setActiveTheatreId(theatre._id || theatre.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-zinc-900 border-red-600 shadow-lg shadow-red-950/20'
                      : 'bg-[#121217] border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                      {theatre.city}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {theatre.screensCount} Screens
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{theatre.name}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-1">{theatre.address}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Theatre Detail & Screenings */}
        {currentTheatre && (
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-[#121218] border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-500">
                    {currentTheatre.city} Flagship Multiplex
                  </span>
                  <h2 className="text-2xl font-black text-white mt-0.5">{currentTheatre.name}</h2>
                </div>
                <div className="text-xs text-zinc-400 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>{currentTheatre.address}</span>
                  </p>
                  {currentTheatre.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{currentTheatre.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Facilities */}
              <div className="pt-3 border-t border-zinc-800/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Auditorium Amenities
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentTheatre.facilities.map((fac) => (
                    <span
                      key={fac}
                      className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700/80 text-xs text-zinc-300 font-medium"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Movies & Screenings at this theatre */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-red-500" />
                Movies Playing at {currentTheatre.name}
              </h3>

              {Array.from(movieMap.values()).length === 0 ? (
                <div className="p-8 rounded-xl bg-[#121217] border border-zinc-800 text-center text-xs text-zinc-400">
                  No showtimes currently scheduled for this location. Please check other cinema locations!
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from(movieMap.values()).map(({ movie, slots }) => (
                    <div
                      key={movie.id}
                      className="p-5 rounded-2xl bg-[#121217] border border-zinc-800/80 space-y-4 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {movie.posterUrl && (
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="w-12 h-16 object-cover rounded-md border border-zinc-700"
                            />
                          )}
                          <div>
                            <h4
                              onClick={() => navigate(`/movies/${movie.id}`)}
                              className="font-bold text-white text-base hover:text-red-400 cursor-pointer transition"
                            >
                              {movie.title}
                            </h4>
                            <p className="text-xs text-zinc-400">
                              {Math.floor(movie.duration / 60)}h {movie.duration % 60}m • Rating: {movie.rating.toFixed(1)}/10
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/movies/${movie.id}`)}
                          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1"
                        >
                          Movie Info <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Time Slots */}
                      <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center gap-2.5">
                        {slots.map((st) => (
                          <button
                            key={st._id || st.id}
                            onClick={() => navigate('/seats', { showtimeId: st._id || st.id })}
                            className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-red-600 hover:text-white border border-zinc-700/80 text-zinc-200 text-xs font-mono font-bold transition flex flex-col items-center group"
                          >
                            <span>{st.startTime}</span>
                            <span className="text-[10px] text-zinc-400 group-hover:text-red-100 font-sans font-medium">
                              ${st.basePrice.toFixed(2)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
