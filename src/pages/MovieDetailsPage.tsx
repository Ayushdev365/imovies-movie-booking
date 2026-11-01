import React, { useEffect, useState } from 'react';
import { Movie, Showtime } from '../types/index.js';
import { api } from '../services/api.js';
import { Star, Clock, Calendar, Film, Ticket, Play, ArrowLeft, Users, Clapperboard, ShieldCheck } from 'lucide-react';

interface MovieDetailsPageProps {
  movieId: string;
  navigate: (path: string, state?: any) => void;
}

export const MovieDetailsPage: React.FC<MovieDetailsPageProps> = ({ movieId, navigate }) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTrailerModal, setShowTrailerModal] = useState<boolean>(false);

  useEffect(() => {
    async function loadMovieDetails() {
      try {
        setLoading(true);
        const [movieRes, showtimesRes] = await Promise.all([
          api.getMovie(movieId),
          api.getShowtimes({ movieId }),
        ]);
        setMovie(movieRes.movie);
        setShowtimes(showtimesRes.showtimes);
      } catch (err) {
        console.error('Failed to load movie details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (movieId) {
      loadMovieDetails();
    }
  }, [movieId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6">
        <div className="h-96 bg-zinc-900 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <p className="text-xs text-zinc-400">The requested title could not be located in our cinema database.</p>
        <button
          onClick={() => navigate('/movies')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        <button
          onClick={() => navigate('/movies')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Movies
        </button>
      </div>

      {/* Cinematic Banner & Overview */}
      <section className="relative">
        {/* Backdrop background */}
        <div className="absolute inset-0 h-[460px] overflow-hidden -top-16 -z-10">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover filter brightness-[0.25] contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <div className="w-64 sm:w-72 aspect-[2/3] rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl shrink-0 bg-zinc-950">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Movie Info */}
            <div className="flex-1 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider">
                  {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-bold border border-zinc-700">
                  {movie.ageRating || 'PG-13'}
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/60 px-2 py-0.5 rounded border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{movie.rating.toFixed(1)} / 10</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase">
                {movie.title}
              </h1>

              {/* Quick specs */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m ({movie.duration} mins)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <span>Release: {movie.releaseDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-red-500" />
                  <span>{movie.language.join(', ')}</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {movie.genre.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-lg bg-zinc-800/90 text-zinc-200 text-xs font-medium border border-zinc-700/60"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Synopsis</h3>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
                  {movie.description}
                </p>
              </div>

              {/* Cast & Crew */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div>
                  <span className="text-zinc-500 font-bold uppercase tracking-wider block">Director</span>
                  <p className="text-white font-semibold mt-0.5 flex items-center gap-1.5">
                    <Clapperboard className="w-3.5 h-3.5 text-red-500" />
                    {movie.director}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 font-bold uppercase tracking-wider block">Cast Members</span>
                  <p className="text-white font-semibold mt-0.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-red-500" />
                    {movie.cast.join(', ')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => navigate('/showtimes', { movieId: movie._id || movie.id })}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-red-950 transition hover:scale-105"
                >
                  <Ticket className="w-4 h-4" />
                  Select Theatres & Showtimes
                </button>

                <button
                  onClick={() => setShowTrailerModal(true)}
                  className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-sm font-semibold flex items-center gap-2 transition"
                >
                  <Play className="w-4 h-4 text-red-500 fill-red-500" />
                  Watch Cinematic Trailer
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Showtimes Quick Preview */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6 pt-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-red-500" />
              Scheduled Screenings for {movie.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Available across our IMAX & Dolby Cinema flagships.
            </p>
          </div>
        </div>

        {showtimes.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#121217] border border-zinc-800 text-center text-xs text-zinc-400">
            No active public showtimes scheduled yet for this title. Check back soon for advance tickets!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {showtimes.map((st) => (
              <div
                key={st._id || st.id}
                className="p-4 rounded-xl bg-[#121218] border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{st.theatre?.name || 'IMovies Cinema'}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-red-400 border border-zinc-700">
                      {st.screenType}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{st.theatre?.city} • {st.theatre?.address}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                  <div>
                    <span className="text-zinc-400 text-[10px] block">Date & Time</span>
                    <span className="font-bold text-white font-mono">{st.date} @ {st.startTime}</span>
                  </div>

                  <button
                    onClick={() => navigate('/seats', { showtimeId: st._id || st.id })}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition"
                  >
                    Select Seats
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trailer Modal */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#121217] border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Play className="w-4 h-4 text-red-500 fill-red-500" />
                {movie.title} — Official Cinema Preview
              </h4>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-semibold px-2 py-1 bg-zinc-800 rounded"
              >
                Close
              </button>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${movie.trailerUrl?.includes('v=') ? movie.trailerUrl.split('v=')[1] : 'Way9Dexny3w'}?autoplay=1`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
