import React, { useState } from 'react';
import { Film, Search, Ticket, User as UserIcon, Shield, GitBranch, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string, state?: any) => void;
  onOpenGithubModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, onOpenGithubModal }) => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate('/search', { q: searchTerm.trim() });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c10]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-950/60 transition group-hover:scale-105">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-white font-sans flex items-center gap-1">
                I<span className="text-red-600">MOVIES</span>
              </span>
              <span className="block text-[10px] tracking-widest uppercase text-zinc-400 font-medium -mt-1">
                Cinema Booking
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => navigate('/')}
              className={`px-3 py-1.5 rounded transition ${
                currentPath === '/' ? 'text-white bg-zinc-800/80' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => navigate('/movies')}
              className={`px-3 py-1.5 rounded transition ${
                currentPath.startsWith('/movies') ? 'text-white bg-zinc-800/80' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => navigate('/theatres')}
              className={`px-3 py-1.5 rounded transition ${
                currentPath.startsWith('/theatres') ? 'text-white bg-zinc-800/80' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Theatres
            </button>
            {user && (
              <button
                onClick={() => navigate('/my-bookings')}
                className={`px-3 py-1.5 rounded transition ${
                  currentPath === '/my-bookings' ? 'text-white bg-zinc-800/80' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                My Bookings
              </button>
            )}
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
                  currentPath.startsWith('/admin') ? 'text-red-400 bg-red-950/40 border border-red-800/40' : 'text-red-400 hover:text-red-300 hover:bg-red-950/20'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            )}
          </nav>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative flex-1 max-w-xs items-center">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search movies, genres, actors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#16161c] text-sm text-zinc-200 pl-9 pr-4 py-2 rounded-lg border border-zinc-800/80 placeholder:text-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
          />
        </form>

        {/* Actions & User */}
        <div className="flex items-center gap-3">
          {/* GitHub Sync Button */}
          <button
            onClick={onOpenGithubModal}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 transition"
            title="Inspect GitHub Integration for Ayushdev365"
          >
            <GitBranch className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">GitHub:</span>
            <span className="text-white">Ayushdev365</span>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-medium text-zinc-200 transition"
              >
                <div className="w-6 h-6 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user.name}</span>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-[#16161d] border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 text-sm"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-zinc-800">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    {user.role === 'admin' && (
                      <span className="inline-block mt-1 text-[10px] font-semibold tracking-wider uppercase text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded">
                        Administrator
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-zinc-300 hover:bg-zinc-800/80 hover:text-white flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-zinc-400" />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/my-bookings');
                    }}
                    className="w-full text-left px-4 py-2 text-zinc-300 hover:bg-zinc-800/80 hover:text-white flex items-center gap-2"
                  >
                    <Ticket className="w-4 h-4 text-zinc-400" />
                    My Bookings
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/admin');
                      }}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-950/30 hover:text-red-300 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Dashboard
                    </button>
                  )}

                  <div className="border-t border-zinc-800 my-1"></div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2 text-zinc-400 hover:bg-zinc-800/80 hover:text-red-400 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="text-xs font-semibold px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
              >
                Join IMovies
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
