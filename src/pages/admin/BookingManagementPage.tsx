import React, { useEffect, useState } from 'react';
import { TicketCheck, Search, Filter, Eye, XCircle, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Booking } from '../../types/index.js';
import { api } from '../../services/api.js';
import { AdminSidebar } from '../../components/AdminSidebar.js';
import { BookingTicket } from '../../components/BookingTicket.js';

interface BookingManagementPageProps {
  navigate: (path: string, state?: any) => void;
}

export const BookingManagementPage: React.FC<BookingManagementPageProps> = ({ navigate }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminBookings();
      setBookings(res.bookings);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleAdminCancel = async (bookingId: string) => {
    if (!confirm('Cancel this customer booking? This will immediately release reserved seats and credit a simulated refund.')) {
      return;
    }

    try {
      setMsg('');
      setErrorMsg('');
      await api.cancelBooking(bookingId);
      setMsg('Booking cancelled and seats released.');
      loadBookings();
      if (selectedTicket && (selectedTicket._id === bookingId || selectedTicket.id === bookingId)) {
        setSelectedTicket(null);
      }
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Cancellation failed');
    }
  };

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.bookingStatus !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchRef = b.bookingReference.toLowerCase().includes(term);
      const matchName = b.customerDetails?.name?.toLowerCase().includes(term);
      const matchEmail = b.customerDetails?.email?.toLowerCase().includes(term);
      const matchMovie = b.movieTitle?.toLowerCase().includes(term);
      if (!matchRef && !matchName && !matchEmail && !matchMovie) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-[85vh]">
      <AdminSidebar currentPath="/admin/bookings" navigate={navigate} />

      <main className="flex-1 p-6 lg:p-10 space-y-6 bg-[#0a0a0e] overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
              Box Office Records
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Customer Bookings
            </h1>
          </div>

          <button
            onClick={loadBookings}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition w-fit"
            title="Refresh Bookings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{msg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-[#121218] border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-[#1a1a24] p-1 rounded-xl border border-zinc-800 w-full sm:w-auto">
            {['all', 'confirmed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  statusFilter === tab
                    ? 'bg-red-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by ref, email, movie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181822] text-xs text-zinc-200 pl-9 pr-4 py-2 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-red-600"
            />
          </div>
        </div>

        {/* Bookings Table */}
        <div className="p-6 rounded-2xl bg-[#121218] border border-zinc-800/80 shadow-xl overflow-hidden">
          {loading ? (
            <p className="text-xs text-zinc-400 py-6 text-center">Loading transactions database...</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">No bookings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3">Patron Name & Email</th>
                    <th className="py-3 px-3">Movie & Theatre</th>
                    <th className="py-3 px-3">Seats</th>
                    <th className="py-3 px-3">Total Paid</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {filtered.map((b) => (
                    <tr key={b._id || b.id} className="hover:bg-zinc-900/40">
                      <td className="py-3 px-3 font-bold text-red-400">{b.bookingReference}</td>
                      <td className="py-3 px-3 font-sans">
                        <p className="font-semibold text-white">{b.customerDetails?.name || 'Patron'}</p>
                        <p className="text-[11px] text-zinc-500">{b.customerDetails?.email}</p>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <p className="text-white font-medium">{b.movieTitle}</p>
                        <p className="text-[11px] text-zinc-500">{b.theatreName}</p>
                      </td>
                      <td className="py-3 px-3 font-bold text-zinc-200">
                        {b.seats?.map((s: any) => s.seatNumber).join(', ')}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">${b.grandTotal.toFixed(2)}</td>
                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            b.bookingStatus === 'confirmed'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : 'bg-red-950/60 text-red-400 border border-red-800/40'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedTicket(b)}
                            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            title="Inspect Pass"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {b.bookingStatus === 'confirmed' && (
                            <button
                              onClick={() => handleAdminCancel(b._id || b.id)}
                              className="p-1.5 rounded bg-red-950/40 hover:bg-red-950 text-red-400"
                              title="Cancel & Refund"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pass Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="w-full max-w-xl space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-3 py-1 bg-zinc-800 text-white text-xs font-semibold rounded-lg"
                >
                  Close Pass Inspector
                </button>
              </div>
              <BookingTicket
                booking={selectedTicket}
                showCancelButton={selectedTicket.bookingStatus === 'confirmed'}
                onCancel={handleAdminCancel}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
