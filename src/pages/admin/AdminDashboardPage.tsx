import React, { useEffect, useState } from 'react';
import { DollarSign, Ticket, Film, Building2, Users, ArrowUpRight, ShieldCheck, RefreshCw, Plus } from 'lucide-react';
import { AdminStats, Booking } from '../../types/index.js';
import { api } from '../../services/api.js';
import { AdminSidebar } from '../../components/AdminSidebar.js';

interface AdminDashboardPageProps {
  navigate: (path: string, state?: any) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminStats();
      setStats(res.stats);
      setRecentBookings(res.recentBookings || []);
    } catch (err) {
      console.error('Failed to load admin statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-[85vh]">
      <AdminSidebar currentPath="/admin" navigate={navigate} />

      <main className="flex-1 p-6 lg:p-10 space-y-8 bg-[#0a0a0e] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
              Operations & Analytics
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Executive Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadStats}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/admin/movies')}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-950 transition"
            >
              <Plus className="w-4 h-4" /> Add Movie
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-28 bg-zinc-900/60 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="p-5 rounded-2xl bg-[#121218] border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black font-mono text-white">
                ${stats?.totalRevenue.toFixed(2) || '0.00'}
              </p>
              <span className="text-[11px] text-emerald-400 font-medium">Verified completed payments</span>
            </div>

            {/* Total Bookings */}
            <div className="p-5 rounded-2xl bg-[#121218] border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Reservations</span>
                <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/40 text-red-400 flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black font-mono text-white">
                {stats?.totalBookings || 0}
              </p>
              <span className="text-[11px] text-zinc-400">
                {stats?.confirmedBookings || 0} confirmed • {stats?.cancelledBookings || 0} cancelled
              </span>
            </div>

            {/* Active Movies */}
            <div className="p-5 rounded-2xl bg-[#121218] border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Movies in Catalog</span>
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black font-mono text-white">
                {(stats?.activeMovies || 0) + (stats?.upcomingMovies || 0)}
              </p>
              <span className="text-[11px] text-zinc-400">
                {stats?.activeMovies || 0} now playing • {stats?.upcomingMovies || 0} upcoming
              </span>
            </div>

            {/* Registered Users */}
            <div className="p-5 rounded-2xl bg-[#121218] border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Registered Patrons</span>
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black font-mono text-white">
                {stats?.totalUsers || 0}
              </p>
              <span className="text-[11px] text-zinc-400">Across 4 cinema flagships</span>
            </div>
          </div>
        )}

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => navigate('/admin/movies')}
            className="p-5 rounded-2xl bg-[#121218] border border-zinc-800/80 hover:border-zinc-700 cursor-pointer space-y-2 group transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Catalog</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
            </div>
            <h3 className="font-bold text-white text-base">Manage Movies</h3>
            <p className="text-xs text-zinc-400">Add blockbusters, edit posters, synopsis, and status.</p>
          </div>

          <div
            onClick={() => navigate('/admin/theatres')}
            className="p-5 rounded-2xl bg-[#121218] border border-zinc-800/80 hover:border-zinc-700 cursor-pointer space-y-2 group transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Venues</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
            </div>
            <h3 className="font-bold text-white text-base">Theatres & Auditoriums</h3>
            <p className="text-xs text-zinc-400">Configure multiplexes, IMAX screens, and seat layouts.</p>
          </div>

          <div
            onClick={() => navigate('/admin/showtimes')}
            className="p-5 rounded-2xl bg-[#121218] border border-zinc-800/80 hover:border-zinc-700 cursor-pointer space-y-2 group transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Scheduling</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
            </div>
            <h3 className="font-bold text-white text-base">Showtime Management</h3>
            <p className="text-xs text-zinc-400">Publish screening time slots and set base ticket pricing.</p>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="p-6 rounded-2xl bg-[#121218] border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h3 className="font-bold text-white text-base">Recent Patron Transactions</h3>
              <p className="text-xs text-zinc-400">Latest ticket purchases with real-time seat allocations.</p>
            </div>
            <button
              onClick={() => navigate('/admin/bookings')}
              className="text-xs font-semibold text-red-400 hover:text-red-300"
            >
              View All Bookings →
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No transactions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Seats</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {recentBookings.map((b) => (
                    <tr key={b._id || b.id} className="hover:bg-zinc-900/40">
                      <td className="py-3 px-3 text-red-400 font-bold">{b.bookingReference}</td>
                      <td className="py-3 px-3 font-sans text-white">{b.customerDetails?.name || 'Customer'}</td>
                      <td className="py-3 px-3">{b.seats?.map((s) => s.seatNumber).join(', ')}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
