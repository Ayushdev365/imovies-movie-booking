import React, { useEffect, useState } from 'react';
import { Calendar, Film, MapPin, Ticket, Clock, ArrowLeft } from 'lucide-react';
import { Movie, Theatre, Showtime } from '../types/index.js';
import { api } from '../services/api.js';

interface ShowtimeSelectionPageProps {
  movieId?: string;
  navigate: (path: string, state?: any) => void;
}

export const ShowtimeSelectionPage: React.FC<ShowtimeSelectionPageProps> = ({ movieId: initialMovieId, navigate }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedMovieId, setSelectedMovieId] = useState<string>(initialMovieId || '');
  const [selectedTheatreId, setSelectedTheatreId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Generate next 5 dates
  const dateOptions = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dateStr, dayName, formattedDate };
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [moviesRes, theatresRes, showtimesRes] = await Promise.all([
          api.getMovies({ status: 'now_showing' }),
          api.getTheatres(),
          api.getShowtimes(),
        ]);
        setMovies(moviesRes.movies);
        setTheatres(theatresRes.theatres);
        setShowtimes(showtimesRes.showtimes);

        if (!selectedMovieId && moviesRes.movies.length > 0) {
          setSelectedMovieId(moviesRes.movies[0]._id || moviesRes.movies[0].id);
        }
        if (!selectedDate && dateOptions.length > 0) {
          setSelectedDate(dateOptions[0].dateStr);
        }
      } catch (err) {
        console.error('Failed to load showtimes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentMovie = movies.find((m) => (m._id || m.id) === selectedMovieId);

  // Filter showtimes
  const filteredShowtimes = showtimes.filter((st) => {
    if (selectedMovieId && st.movieId !== selectedMovieId) return false;
    if (selectedTheatreId !== 'all' && st.theatreId !== selectedTheatreId) return false;
    if (selectedDate && st.date !== selectedDate) return false;
    return true;
  });

  // Group by Theatre
  const theatreGroupMap = new Map<string, { theatre: any; slots: Showtime[] }>();
  filteredShowtimes.forEach((st) => {
    if (!st.theatre) return;
    const tId = st.theatreId;
    if (!theatreGroupMap.has(tId)) {
      theatreGroupMap.set(tId, { theatre: st.theatre, slots: [] });
    }
    theatreGroupMap.get(tId)!.slots.push(st);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/movies')}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-red-600" />
            Select Showtimes
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Choose your preferred date, cinema theatre, and experience format.
          </p>
        </div>
      </div>

      {/* Date Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {dateOptions.map(({ dateStr, dayName, formattedDate }) => (
          <button
            key={dateStr}
            onClick={() => setSelectedDate(dateStr)}
            className={`px-5 py-3 rounded-xl border text-center shrink-0 transition ${
              selectedDate === dateStr
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/60'
                : 'bg-[#121217] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
            }`}
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider">{dayName}</span>
            <span className="block text-sm font-black font-mono mt-0.5">{formattedDate}</span>
          </button>
        ))}
      </div>

      {/* Movie & Theatre Selectors */}
      <div className="p-4 rounded-2xl bg-[#121217] border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-red-500" />
            Selected Movie
          </label>
          <select
            value={selectedMovieId}
            onChange={(e) => setSelectedMovieId(e.target.value)}
            className="w-full bg-[#181822] text-sm text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600 font-medium"
          >
            {movies.map((m) => (
              <option key={m._id || m.id} value={m._id || m.id}>
                {m.title} ({Math.floor(m.duration / 60)}h {m.duration % 60}m)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            Filter by Theatre
          </label>
          <select
            value={selectedTheatreId}
            onChange={(e) => setSelectedTheatreId(e.target.value)}
            className="w-full bg-[#181822] text-sm text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600 font-medium"
          >
            <option value="all">All Theatres & Multiplexes</option>
            {theatres.map((t) => (
              <option key={t._id || t.id} value={t._id || t.id}>
                {t.name} ({t.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Movie Details Summary Pill */}
      {currentMovie && (
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-4">
          <img
            src={currentMovie.posterUrl}
            alt={currentMovie.title}
            className="w-12 h-16 object-cover rounded-md border border-zinc-700 shrink-0"
          />
          <div>
            <h3 className="font-bold text-white text-base">{currentMovie.title}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {currentMovie.genre.join(', ')} • {currentMovie.ageRating || 'PG-13'} • {currentMovie.duration} mins
            </p>
          </div>
        </div>
      )}

      {/* Screenings by Theatre */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-40 bg-zinc-900 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : Array.from(theatreGroupMap.values()).length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-[#121217] border border-zinc-800 space-y-3">
          <Clock className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No showtimes found for this date</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Please choose another date or change the selected cinema theatre.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(theatreGroupMap.values()).map(({ theatre, slots }) => (
            <div
              key={theatre.id}
              className="p-6 rounded-2xl bg-[#121218] border border-zinc-800/80 space-y-4 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    {theatre.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{theatre.city} • {theatre.address}</p>
                </div>
              </div>

              {/* Slots */}
              <div className="flex flex-wrap items-center gap-3">
                {slots.map((st) => (
                  <button
                    key={st._id || st.id}
                    onClick={() => navigate('/seats', { showtimeId: st._id || st.id })}
                    className="p-3 rounded-xl bg-zinc-900 hover:bg-red-600 hover:text-white border border-zinc-700/80 text-zinc-200 transition duration-150 flex flex-col items-start min-w-[120px] group"
                  >
                    <span className="text-sm font-bold font-mono tracking-tight group-hover:text-white">
                      {st.startTime}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-red-400 group-hover:text-red-100 mt-0.5">
                      {st.screenType}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 group-hover:text-zinc-200 mt-1">
                      From ${st.basePrice.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
