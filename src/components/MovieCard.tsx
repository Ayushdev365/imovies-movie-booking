import React from 'react';
import { Star, Clock, Calendar, Ticket } from 'lucide-react';
import { Movie } from '../types/index.js';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onBookNow?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect, onBookNow }) => {
  return (
    <div className="group relative bg-[#131318] border border-zinc-800/80 rounded-xl overflow-hidden hover:border-zinc-700 transition flex flex-col h-full shadow-lg hover:shadow-2xl hover:shadow-black/60">
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950 cursor-pointer" onClick={() => onSelect(movie)}>
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-amber-500/30">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
          {movie.ageRating && (
            <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-semibold text-zinc-300 border border-zinc-700/60">
              {movie.ageRating}
            </span>
          )}
        </div>

        {/* Status label if upcoming */}
        {movie.status === 'upcoming' && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-red-950/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-red-300 border border-red-700/40">
            Upcoming
          </div>
        )}

        {/* Hover overlay button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onBookNow) onBookNow(movie);
              else onSelect(movie);
            }}
            className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-950 transition"
          >
            <Ticket className="w-3.5 h-3.5" />
            {movie.status === 'upcoming' ? 'View Details' : 'Book Tickets'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <h3
            onClick={() => onSelect(movie)}
            className="font-bold text-white text-sm line-clamp-1 cursor-pointer hover:text-red-400 transition"
            title={movie.title}
          >
            {movie.title}
          </h3>

          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
            {movie.genre.slice(0, 3).join(' • ')}
          </p>
        </div>

        {/* Metadata row */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-zinc-400" />
            <span>{movie.releaseDate.split('-')[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
