import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, ShieldCheck, Ticket, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { Showtime, Seat } from '../types/index.js';
import { api } from '../services/api.js';
import { SeatLayout } from '../components/SeatLayout.js';
import { useAuth } from '../context/AuthContext.js';
import { useBooking } from '../context/BookingContext.js';

interface SeatSelectionPageProps {
  showtimeId: string;
  navigate: (path: string, state?: any) => void;
}

export const SeatSelectionPage: React.FC<SeatSelectionPageProps> = ({ showtimeId, navigate }) => {
  const { user, loginAsDemoUser } = useAuth();
  const {
    setSelectedMovie,
    setSelectedTheatre,
    setSelectedShowtime,
    setSeatHold,
  } = useBooking();

  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingHold, setSubmittingHold] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchSeatMap = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [showtimeRes, seatsRes] = await Promise.all([
        api.getShowtime(showtimeId),
        api.getSeats(showtimeId),
      ]);
      setShowtime(showtimeRes.showtime);
      setSeats(seatsRes.seats);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load seats map.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showtimeId) {
      fetchSeatMap();
    }
  }, [showtimeId]);

  const handleToggleSeat = (seat: Seat) => {
    setErrorMsg('');
    const exists = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        setErrorMsg('Maximum 8 seats can be reserved in a single transaction.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Pricing calculation
  const ticketSubtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = selectedSeats.length > 0 ? +(selectedSeats.length * 1.75).toFixed(2) : 0;
  const estimatedTax = +(ticketSubtotal * 0.08).toFixed(2);
  const grandTotal = +(ticketSubtotal + convenienceFee + estimatedTax).toFixed(2);

  const handleProceedToCheckout = async () => {
    if (selectedSeats.length === 0) {
      setErrorMsg('Please select at least 1 seat to continue.');
      return;
    }

    if (!user) {
      setErrorMsg('Authentication required: Please sign in or use 1-click Demo Login below to hold your seats.');
      return;
    }

    try {
      setSubmittingHold(true);
      setErrorMsg('');

      // Call backend atomic hold API
      const seatNumbers = selectedSeats.map((s) => s.seatNumber);
      const res = await api.holdSeats(showtimeId, seatNumbers);

      if (showtime) {
        setSelectedMovie(showtime.movie as any);
        setSelectedTheatre(showtime.theatre as any);
        setSelectedShowtime(showtime);
      }
      setSeatHold(selectedSeats, res.expiresAt);

      navigate('/checkout', {
        showtimeId,
        seatNumbers,
        subtotal: ticketSubtotal,
        total: grandTotal,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Seat reservation conflict. Someone else may have selected this seat.');
      fetchSeatMap(); // Refresh latest state
    } finally {
      setSubmittingHold(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-center">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin mx-auto" />
        <p className="text-xs text-zinc-400">Loading live cinema seating matrix...</p>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Showtime Not Available</h2>
        <button onClick={() => navigate('/movies')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold">
          Back to Movies
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Top Bar with Showtime Details */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/showtimes', { movieId: showtime.movieId })}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white uppercase">{showtime.movie?.title}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-red-400 border border-zinc-700 font-mono">
                {showtime.screenType}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {showtime.theatre?.name} • {showtime.date} at <strong className="text-white font-mono">{showtime.startTime}</strong>
            </p>
          </div>
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-zinc-300 font-medium">Live Inventory Sync</span>
          <button
            onClick={fetchSeatMap}
            title="Refresh Seating"
            className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs ml-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 flex items-start gap-3 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-white">{errorMsg}</p>
            {!user && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={async () => {
                    await loginAsDemoUser();
                    setErrorMsg('');
                  }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition"
                >
                  Quick Sign In as Demo Patron
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-semibold transition"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Seat Layout Display */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[#0f0f14] border border-zinc-800/80 shadow-2xl">
        <SeatLayout
          seats={seats}
          selectedSeats={selectedSeats}
          onToggleSeat={handleToggleSeat}
          currentUserId={user?.id}
        />
      </div>

      {/* Bottom Sticky Floating Cart & Checkout Panel */}
      <div className="sticky bottom-4 z-30 p-4 sm:p-5 rounded-2xl bg-[#14141c]/95 border border-zinc-800 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Selected Seats summary */}
        <div className="space-y-1 text-center md:text-left w-full md:w-auto">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Ticket className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Selected Seats ({selectedSeats.length})
            </span>
          </div>

          {selectedSeats.length === 0 ? (
            <p className="text-xs text-zinc-500">Tap available seats on the map above to select.</p>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-start">
              {selectedSeats.map((s) => (
                <span
                  key={s.seatNumber}
                  className="px-2 py-0.5 rounded bg-red-600 text-white font-mono font-bold text-xs shadow-sm"
                >
                  {s.seatNumber} (${s.price})
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Proceed Button */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Estimated Total</span>
            <span className="text-xl font-black text-white font-mono">${grandTotal.toFixed(2)}</span>
          </div>

          <button
            disabled={selectedSeats.length === 0 || submittingHold}
            onClick={handleProceedToCheckout}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-xl transition ${
              selectedSeats.length === 0 || submittingHold
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-950/60 hover:scale-105'
            }`}
          >
            {submittingHold ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Locking Seats...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Lock Seats & Checkout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
