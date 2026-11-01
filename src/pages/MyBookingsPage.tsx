import React, { useEffect, useState } from 'react';
import { Ticket, Calendar, Clock, MapPin, AlertCircle, RefreshCw, XCircle, Eye } from 'lucide-react';
import { Booking } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { BookingTicket } from '../components/BookingTicket.js';

interface MyBookingsPageProps {
  navigate: (path: string, state?: any) => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);
  const [actionMsg, setActionMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.getMyBookings();
      setBookings(res.bookings);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? Reserved seats will be released back to the box office inventory.')) {
      return;
    }

    try {
      setActionMsg('');
      setErrorMsg('');
      const res = await api.cancelBooking(bookingId);
      setActionMsg('Booking cancelled successfully. Simulated refund credited.');
      fetchBookings();
      if (selectedTicket && (selectedTicket._id === bookingId || selectedTicket.id === bookingId)) {
        setSelectedTicket(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to cancel booking');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Please sign in to view your bookings</h2>
        <button
          onClick={() => navigate('/login', { redirectTo: '/my-bookings' })}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-red-600" />
            My Cinema Bookings & Passes
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            View active movie tickets, review seat allocations, or cancel reservations.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh List
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-200">
          {actionMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-zinc-900 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-[#121218] border border-zinc-800 space-y-4">
          <Ticket className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active bookings yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            You haven't reserved any movie tickets yet. Browse currently playing titles to book your cinema pass!
          </p>
          <button
            onClick={() => navigate('/movies')}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold"
          >
            Explore Movies Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isCancelled = booking.bookingStatus === 'cancelled';
            return (
              <div
                key={booking._id || booking.id}
                className="p-5 rounded-2xl bg-[#121218] border border-zinc-800 hover:border-zinc-700 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left info */}
                <div className="flex items-start gap-4">
                  {booking.movie?.posterUrl ? (
                    <img
                      src={booking.movie.posterUrl}
                      alt={booking.movie.title}
                      className="w-16 h-24 object-cover rounded-lg border border-zinc-800 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-24 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                      <Ticket className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-red-400">
                        {booking.bookingReference}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isCancelled
                            ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base">
                      {booking.movie?.title || 'Cinema Screening'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        {booking.theatre?.name || 'IMovies Multiplex'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        {booking.showtime?.date} @ {booking.showtime?.startTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="text-zinc-500">Seats:</span>
                      <div className="flex flex-wrap gap-1">
                        {booking.seats.map((s) => (
                          <span
                            key={s.seatNumber}
                            className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-700 text-[11px] font-mono font-bold"
                          >
                            {s.seatNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right price & action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-zinc-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Grand Total</span>
                    <span className="text-lg font-black font-mono text-white">
                      ${booking.grandTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTicket(booking)}
                      className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Pass
                    </button>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelBooking(booking._id || booking.id)}
                        className="px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-950/80 border border-red-900/40 text-red-400 text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-xl space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg"
              >
                Close Ticket View
              </button>
            </div>
            <BookingTicket
              booking={selectedTicket}
              showCancelButton={true}
              onCancel={handleCancelBooking}
            />
          </div>
        </div>
      )}
    </div>
  );
};
