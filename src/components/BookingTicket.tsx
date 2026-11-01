import React from 'react';
import { Booking } from '../types/index.js';
import { Calendar, Clock, MapPin, Film, Printer, CheckCircle2, XCircle } from 'lucide-react';

interface BookingTicketProps {
  booking: Booking;
  onCancel?: (bookingId: string) => void;
  showCancelButton?: boolean;
}

export const BookingTicket: React.FC<BookingTicketProps> = ({ booking, onCancel, showCancelButton }) => {
  const isCancelled = booking.bookingStatus === 'cancelled';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[#15151c] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Decorative side notches / perforations */}
      <div className="absolute top-[68%] -left-3 w-6 h-6 rounded-full bg-[#0a0a0c] border border-zinc-800 z-10"></div>
      <div className="absolute top-[68%] -right-3 w-6 h-6 rounded-full bg-[#0a0a0c] border border-zinc-800 z-10"></div>

      {/* Ticket Header */}
      <div className="bg-gradient-to-r from-red-950/60 to-zinc-900 p-5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-white tracking-wider text-sm">
              I<span className="text-red-600">MOVIES</span> PASS
            </span>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
              REF: {booking.bookingReference}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCancelled ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-950/80 text-red-400 border border-red-800/60 text-xs font-bold uppercase tracking-wider">
              <XCircle className="w-3.5 h-3.5" /> Cancelled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
            </span>
          )}
        </div>
      </div>

      {/* Main Ticket Body */}
      <div className="p-6 space-y-6">
        <div className="flex gap-4">
          {/* Poster thumb */}
          {booking.movie?.posterUrl && (
            <img
              src={booking.movie.posterUrl}
              alt={booking.movie.title}
              className="w-20 h-28 object-cover rounded-lg border border-zinc-800 shrink-0"
            />
          )}

          {/* Details */}
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-white text-lg leading-tight">
              {booking.movie?.title || 'Blockbuster Movie'}
            </h3>
            <div className="space-y-1 text-xs text-zinc-300">
              <p className="flex items-center gap-1.5 text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-zinc-200 font-medium">{booking.theatre?.name || 'IMovies Cinema'}</span>
              </p>
              <p className="text-zinc-500 text-[11px] pl-5">{booking.theatre?.address}</p>
            </div>

            <div className="flex flex-wrap gap-4 pt-1 text-xs">
              <div className="flex items-center gap-1 text-zinc-300">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>{booking.showtime?.date || 'Today'}</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span className="font-bold text-white">{booking.showtime?.startTime || '20:00'}</span>
              </div>
              {booking.showtime?.screenType && (
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-semibold text-red-300">
                  {booking.showtime.screenType}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Seats Grid on Ticket */}
        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Reserved Seats</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {booking.seats.map((s) => (
                <span
                  key={s.seatNumber}
                  className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-700/40 text-xs font-bold font-mono"
                >
                  {s.seatNumber} ({s.tier})
                </span>
              ))}
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Paid</p>
            <p className="text-base font-black text-white font-mono mt-0.5">
              ${booking.grandTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Perforation line */}
      <div className="border-t border-dashed border-zinc-800 relative"></div>

      {/* Barcode & Stub Footer */}
      <div className="p-6 bg-[#0f0f14] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Simulated Barcode */}
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center gap-1 justify-center sm:justify-start">
            {[2, 4, 1, 3, 5, 2, 6, 2, 4, 1, 3, 2, 4, 1, 5, 2, 3, 4, 1, 3, 2, 5].map((w, i) => (
              <div key={i} className="bg-zinc-400 h-9" style={{ width: `${w}px` }}></div>
            ))}
          </div>
          <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
            {booking.transactionId}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Pass
          </button>

          {showCancelButton && !isCancelled && onCancel && (
            <button
              onClick={() => onCancel(booking._id || booking.id)}
              className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-950/80 text-red-400 border border-red-900/60 text-xs font-semibold transition"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
