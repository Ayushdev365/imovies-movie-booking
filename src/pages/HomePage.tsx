import React, { useEffect, useState } from 'react';
import { Play, Ticket, Star, Clock, Sparkles, MapPin, ChevronRight, ShieldCheck, Film } from 'lucide-react';
import { Movie, Theatre } from '../types/index.js';
import { api } from '../services/api.js';
import { MovieCard } from '../components/MovieCard.js';
import { DeveloperProfileCard } from '../components/DeveloperProfileCard.js';

interface HomePageProps {
  navigate: (path: string, state?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [moviesRes, theatresRes] = await Promise.all([
          api.getMovies(),
          api.getTheatres(),
        ]);
        setMovies(moviesRes.movies);
        setTheatres(theatresRes.theatres);
        if (moviesRes.movies.length > 0) {
          setFeaturedMovie(moviesRes.movies[0]);
        }
      } catch (err) {
        console.error('Failed to load homepage movies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const genres = ['All', 'Sci-Fi', 'Action', 'Drama', 'Adventure', 'Animation'];

  const nowShowingMovies = movies.filter((m) => m.status === 'now_showing');
  const filteredNowShowing = selectedGenre === 'All'
    ? nowShowingMovies
    : nowShowingMovies.filter((m) => m.genre?.includes(selectedGenre));

  const upcomingMovies = movies.filter((m) => m.status === 'upcoming');

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      {featuredMovie && (
        <section className="relative min-h-[580px] lg:h-[680px] w-full flex items-center overflow-hidden">
          {/* Backdrop Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredMovie.backdropUrl || featuredMovie.posterUrl}
              alt={featuredMovie.title}
              className="w-full h-full object-cover object-center filter brightness-50 contrast-125"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-12 w-full">
            <div className="max-w-2xl space-y-5">
              {/* Badges */}
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold tracking-wider uppercase">
                  Spotlight Premiere
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{featuredMovie.rating.toFixed(1)} Rating</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-300 text-xs bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{Math.floor(featuredMovie.duration / 60)}h {featuredMovie.duration % 60}m</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none uppercase">
                {featuredMovie.title}
              </h1>

              {/* Genres */}
              <p className="text-sm font-medium text-red-400">
                {featuredMovie.genre.join(' • ')} • Directed by {featuredMovie.director}
              </p>

              {/* Description */}
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed line-clamp-3">
                {featuredMovie.description}
              </p>

              {/* Starring */}
              <p className="text-xs text-zinc-400">
                <span className="text-zinc-500 uppercase tracking-wider font-semibold">Starring: </span>
                {featuredMovie.cast.slice(0, 4).join(', ')}
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  onClick={() => navigate('/showtimes', { movieId: featuredMovie._id || featuredMovie.id })}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-red-950/60 transition hover:scale-105"
                >
                  <Ticket className="w-4 h-4" />
                  Book Tickets Now
                </button>

                <button
                  onClick={() => navigate(`/movies/${featuredMovie._id || featuredMovie.id}`)}
                  className="px-5 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-sm font-semibold flex items-center gap-2 transition"
                >
                  <Play className="w-4 h-4 text-red-500 fill-red-500" />
                  Watch Details & Cast
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. QUICK BOOKING WIDGET */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-8 relative z-20">
        <div className="p-4 sm:p-6 rounded-2xl bg-[#121218] border border-zinc-800/80 shadow-2xl backdrop-blur-md grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              1. Choose Movie
            </label>
            <select
              defaultValue={featuredMovie?._id || ''}
              onChange={(e) => {
                const found = movies.find((m) => (m._id || m.id) === e.target.value);
                if (found) setFeaturedMovie(found);
              }}
              className="w-full bg-[#181822] text-sm text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
            >
              {nowShowingMovies.map((m) => (
                <option key={m._id || m.id} value={m._id || m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              2. Preferred Cinema City
            </label>
            <select
              className="w-full bg-[#181822] text-sm text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
            >
              <option value="New York">New York (Times Square IMAX)</option>
              <option value="Los Angeles">Los Angeles (Sunset Dolby Cinema)</option>
              <option value="Chicago">Chicago (Millennium Cineplex)</option>
              <option value="London">London (Leicester Square Flagship)</option>
            </select>
          </div>

          <div className="sm:pt-5">
            <button
              onClick={() => {
                if (featuredMovie) {
                  navigate('/showtimes', { movieId: featuredMovie._id || featuredMovie.id });
                } else {
                  navigate('/movies');
                }
              }}
              className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <Ticket className="w-4 h-4" />
              Find Available Showtimes
            </button>
          </div>
        </div>
      </div>

      {/* 3. NOW SHOWING SECTION */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-red-600 rounded-sm"></span>
              Now Showing in Theatres
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Select any blockbuster to browse showtimes and reserve seats with real-time locking.
            </p>
          </div>

          {/* Genre Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#121218] p-1 rounded-lg border border-zinc-800">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  selectedGenre === g
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-zinc-900/60 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredNowShowing.map((movie) => (
              <MovieCard
                key={movie._id || movie.id}
                movie={movie}
                onSelect={(m) => navigate(`/movies/${m._id || m.id}`)}
                onBookNow={(m) => navigate('/showtimes', { movieId: m._id || m.id })}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. PREMIUM CINEMA FORMATS */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#161620] to-[#0f0f15] border border-zinc-800/80 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-red-500">
              The Ultimate Motion Picture Experience
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              IMAX 4K Laser & Dolby Atmos Precision Audio
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Every IMovies auditorium features custom-engineered acoustic walls, dual 4K laser projection, and ultra-plush motorized VIP leather recliners with personal tables.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <p className="text-xs font-bold text-white">IMAX with Laser</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Sharper, brighter contrast</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <p className="text-xs font-bold text-white">Dolby Atmos Sound</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">360° multidimensional audio</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 col-span-2 sm:col-span-1">
                <p className="text-xs font-bold text-white">VIP Suite Recliners</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Heated seats & dine-in service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMING SOON SECTION */}
      {upcomingMovies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                Coming Soon to IMovies
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Advance booking notices and teasers.</p>
            </div>
            <button
              onClick={() => navigate('/movies', { filter: 'upcoming' })}
              className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              View All Upcoming <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {upcomingMovies.map((movie) => (
              <MovieCard
                key={movie._id || movie.id}
                movie={movie}
                onSelect={(m) => navigate(`/movies/${m._id || m.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. CINEMA THEATRES TEASER */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Flagship Theatres
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Discover premier locations with luxury amenities.</p>
          </div>
          <button
            onClick={() => navigate('/theatres')}
            className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            Explore All Theatres <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {theatres.map((theatre) => (
            <div
              key={theatre._id || theatre.id}
              onClick={() => navigate('/theatres', { theatreId: theatre._id || theatre.id })}
              className="p-5 rounded-2xl bg-[#121217] border border-zinc-800/80 hover:border-zinc-700 transition cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                  {theatre.city}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {theatre.screensCount} Screens
                </span>
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-red-400 transition">
                {theatre.name}
              </h4>
              <p className="text-xs text-zinc-400 line-clamp-1">{theatre.address}</p>
              <div className="flex flex-wrap gap-1 pt-2">
                {theatre.facilities.slice(0, 2).map((fac) => (
                  <span key={fac} className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 text-[10px] font-medium border border-zinc-800">
                    {fac}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. DEVELOPER & CONTRIBUTOR SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-red-600 rounded-sm"></span>
              Platform Engineering & Contributor
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Production full-stack cinema architecture developed and maintained by open-source contributors.
            </p>
          </div>
        </div>

        <DeveloperProfileCard />
      </section>
    </div>
  );
};
