import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Ticket, ArrowRight, Home } from 'lucide-react';
import { Booking } from '../types/index.js';
import { BookingTicket } from '../components/BookingTicket.js';

interface BookingConfirmationPageProps {
  booking?: Booking;
  navigate: (path: string, state?: any) => void;
}

export const BookingConfirmationPage: React.FC<BookingConfirmationPageProps> = ({ booking, navigate }) => {
  useEffect(() => {
    // Fire celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#dc2626', '#ffffff', '#fbbf24'],
    });
  }, []);

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">No Active Confirmation Found</h2>
        <p className="text-xs text-zinc-400">Head over to your bookings dashboard to review all your active cinema passes.</p>
        <button
          onClick={() => navigate('/my-bookings')}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold"
        >
          Go to My Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12 space-y-8">
      {/* Success banner */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/60 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/40">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Your cinema seats have been officially locked and your digital pass is ready. An email with ticket barcodes has been dispatched to{' '}
          <strong className="text-zinc-200">{booking.customerDetails?.email}</strong>.
        </p>
      </div>

      {/* Render Digital Pass */}
      <div className="pt-2">
        <BookingTicket booking={booking} />
      </div>

      {/* Navigation action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={() => navigate('/my-bookings')}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-red-950 transition"
        >
          <Ticket className="w-4 h-4" />
          View All My Bookings
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <Home className="w-4 h-4" />
          Back to Discover
        </button>
      </div>
    </div>
  );
};
