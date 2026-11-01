import React, { useEffect, useState } from 'react';
import { Film, GitBranch, Database, ShieldCheck, Heart } from 'lucide-react';
import { api } from '../services/api.js';
import { GitHubLogoIcon } from './DeveloperProfileCard.js';

interface FooterProps {
  navigate: (path: string) => void;
  onOpenGithubModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate, onOpenGithubModal }) => {
  const [dbStatus, setDbStatus] = useState<string>('Checking DB...');
  const [isAtlas, setIsAtlas] = useState<boolean>(false);

  useEffect(() => {
    api.getHealth()
      .then((data) => {
        setDbStatus(data.database.statusMessage);
        setIsAtlas(data.database.connectedToAtlas);
      })
      .catch(() => {
        setDbStatus('In-Memory Persistence Engine');
      });
  }, []);

  return (
    <footer className="bg-[#08080a] border-t border-zinc-900 text-zinc-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-red-600 flex items-center justify-center text-white">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-wider text-white">
                I<span className="text-red-600">MOVIES</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Premium cinematic ticket reservation platform. Real-time seat inventory, IMAX & Dolby Cinema bookings, and instantaneous digital tickets.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-zinc-300 font-medium">Live Seat Engine Active</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Cinemas & Formats</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => navigate('/theatres')} className="hover:text-white transition">
                  Flagship Locations
                </button>
              </li>
              <li>
                <span className="text-zinc-400">IMAX Laser 4K Experience</span>
              </li>
              <li>
                <span className="text-zinc-400">Dolby Cinema & Atmos Sound</span>
              </li>
              <li>
                <span className="text-zinc-400">VIP Lounges & Dine-in</span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Account & Support</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => navigate('/my-bookings')} className="hover:text-white transition">
                  My Bookings
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/profile')} className="hover:text-white transition">
                  Profile & Settings
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-white transition">
                  Sign In / Register
                </button>
              </li>
              <li>
                <span className="text-zinc-400">Instant Cancellation Policy</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Integration & Architecture</h4>
            <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-300 font-medium">
                <Database className="w-3.5 h-3.5 text-red-400" />
                <span>Database Status:</span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2">{dbStatus}</p>

              <button
                onClick={onOpenGithubModal}
                className="w-full mt-2 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <GitBranch className="w-3 h-3 text-red-400" />
                Inspect GitHub Repo
              </button>

              <a
                href="https://github.com/soulfulkushagra"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-1.5 py-1.5 px-2 bg-[#121218] hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded text-[11px] font-semibold flex items-center justify-between gap-1.5 transition group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <GitHubLogoIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate text-zinc-300 group-hover:text-white">@soulfulkushagra</span>
                </div>
                <span className="text-[10px] text-zinc-500 group-hover:text-red-400 font-mono">Profile ↗</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>
            © {new Date().getFullYear()} IMovies Cinema Group • Contributed by{' '}
            <a
              href="https://github.com/soulfulkushagra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-200 hover:text-red-400 font-bold transition underline underline-offset-2"
            >
              @soulfulkushagra
            </a>
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              Secure 256-Bit JWT & Atomic Seat Locks
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
