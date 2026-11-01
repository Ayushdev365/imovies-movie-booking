import React from 'react';
import { LayoutDashboard, Film, Building2, CalendarDays, TicketCheck, ArrowLeft, Shield } from 'lucide-react';

interface AdminSidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentPath, navigate }) => {
  const navItems = [
    { label: 'Overview & Stats', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Movies', path: '/admin/movies', icon: Film },
    { label: 'Manage Theatres', path: '/admin/theatres', icon: Building2 },
    { label: 'Manage Showtimes', path: '/admin/showtimes', icon: CalendarDays },
    { label: 'Customer Bookings', path: '/admin/bookings', icon: TicketCheck },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#101015] border-r border-zinc-800/80 p-5 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Admin Brand */}
        <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
          <div className="w-9 h-9 rounded-lg bg-red-600/20 text-red-500 border border-red-800/40 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wider text-white">IMOVIES ADMIN</h2>
            <p className="text-[10px] text-zinc-400 font-medium">Control Suite</p>
          </div>
        </div>

        {/* Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Exit to Public Site */}
      <div className="pt-6 border-t border-zinc-800 mt-6">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to IMovies Storefront
        </button>
      </div>
    </aside>
  );
};
