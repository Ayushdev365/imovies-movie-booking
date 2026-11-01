import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, ShieldCheck, Ticket, AlertTriangle, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useBooking } from '../context/BookingContext.js';
import { api } from '../services/api.js';

interface CheckoutPageProps {
  navigate: (path: string, state?: any) => void;
  bookingState?: any;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate, bookingState }) => {
  const { user } = useAuth();
  const {
    selectedMovie,
    selectedTheatre,
    selectedShowtime,
    selectedSeats,
    secondsRemaining,
    clearBookingFlow,
  } = useBooking();

  const [customerName, setCustomerName] = useState(user?.name || 'Alex Mercer');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'user@imovies.com');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+1 (555) 482-9912');

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate prices
  const ticketSubtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = selectedSeats.length > 0 ? +(selectedSeats.length * 1.75).toFixed(2) : 0;
  const tax = +(ticketSubtotal * 0.08).toFixed(2);
  const grandTotal = +(ticketSubtotal + convenienceFee + tax).toFixed(2);

  // Minutes and seconds timer formatting
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isExpiringSoon = secondsRemaining > 0 && secondsRemaining < 60;

  useEffect(() => {
    if (selectedSeats.length === 0) {
      // If user came here without seats, bounce back to movies
      navigate('/movies');
    }
  }, [selectedSeats, navigate]);

  const handlePayAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShowtime || selectedSeats.length === 0) {
      setErrorMsg('No active seat reservation found.');
      return;
    }

    try {
      setProcessing(true);
      setErrorMsg('');

      const showtimeId = selectedShowtime._id || selectedShowtime.id;
      const seatNumbers = selectedSeats.map((s) => s.seatNumber);

      const res = await api.createBooking({
        showtimeId,
        seatNumbers,
        customerDetails: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        paymentMethod: 'Simulation Card (Visa **** 4242)',
      });

      // Clear the temporary hold state
      clearBookingFlow();

      // Navigate to confirmation with booking payload
      navigate('/confirmation', { booking: res.booking });
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing failed. Please check seat status.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      {/* Top back */}
      <button
        onClick={() => {
          if (selectedShowtime) {
            navigate('/seats', { showtimeId: selectedShowtime._id || selectedShowtime.id });
          } else {
            navigate('/movies');
          }
        }}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Modify Seat Selection
      </button>

      {/* Countdown Warning Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition ${
          isExpiringSoon
            ? 'bg-red-950/70 border-red-600 text-red-200 animate-pulse'
            : 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${isExpiringSoon ? 'text-red-400' : 'text-amber-400'}`} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white">Temporary Seat Lock Active</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Seats are reserved for you on our server. Complete booking before timer expires.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-medium">Time Left</span>
          <span className="text-xl font-black font-mono text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Payment & Contact Form, Right Booking Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form */}
        <form onSubmit={handlePayAndConfirm} className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="p-6 rounded-2xl bg-[#121218] border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-red-500" />
              1. Contact & Ticket Delivery
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Email (for e-ticket & QR)</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 font-semibold mb-1">Mobile Number (SMS pass alert)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>
          </div>

          {/* Payment Method & Simulation Disclaimer */}
          <div className="p-6 rounded-2xl bg-[#121218] border border-zinc-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-red-500" />
                2. Payment Method
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40">
                Development Simulation Mode
              </span>
            </div>

            {/* Explicit simulation disclaimer as requested */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Simulated Cinema Sandbox Payment</span>
              </div>
              <p>
                No real credit card will be charged. This sandbox simulator verifies server-side atomic reservations, confirms inventory, and generates authentic verifiable ticket barcodes.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Simulated Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-[#181822] text-zinc-200 pl-10 pr-4 py-2.5 rounded-lg border border-zinc-700/80 font-mono focus:outline-none focus:border-red-600"
                  />
                  <CreditCard className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 font-mono focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">CVV / CVC</label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-[#181822] text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-700/80 font-mono focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing || secondsRemaining <= 0}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-950 transition hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>Processing Simulated Payment...</>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Pay ${grandTotal.toFixed(2)} & Issue Digital Pass
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#121218] border border-zinc-800 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Booking Overview</h3>

            {/* Movie item */}
            <div className="flex gap-3 pb-4 border-b border-zinc-800">
              {selectedMovie?.posterUrl && (
                <img
                  src={selectedMovie.posterUrl}
                  alt={selectedMovie.title}
                  className="w-14 h-20 object-cover rounded-md border border-zinc-800 shrink-0"
                />
              )}
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm leading-tight">{selectedMovie?.title}</h4>
                <p className="text-[11px] text-zinc-400">{selectedTheatre?.name}</p>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {selectedShowtime?.date} • {selectedShowtime?.startTime} ({selectedShowtime?.screenType})
                </p>
              </div>
            </div>

            {/* Seats */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Seats</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedSeats.map((s) => (
                  <span
                    key={s.seatNumber}
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-xs font-mono font-bold text-white"
                  >
                    {s.seatNumber} ({s.tier})
                  </span>
                ))}
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2 pt-3 border-t border-zinc-800 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Tickets Subtotal ({selectedSeats.length} seats)</span>
                <span className="font-mono text-white">${ticketSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Convenience Fee</span>
                <span className="font-mono text-white">${convenienceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Integrated City Cinema Tax (8%)</span>
                <span className="font-mono text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm font-bold text-white">
                <span>Grand Total</span>
                <span className="font-mono text-red-400">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
