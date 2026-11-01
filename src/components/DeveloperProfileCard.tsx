import React, { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw, GitFork, Users, BookOpen, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at?: string;
  location?: string | null;
}

// Official GitHub Logo Mark SVG
export const GitHubLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

interface DeveloperProfileCardProps {
  compact?: boolean;
}

export const DeveloperProfileCard: React.FC<DeveloperProfileCardProps> = ({ compact = false }) => {
  const [profile, setProfile] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);

  const fallbackProfile: GitHubUser = {
    login: 'soulfulkushagra',
    name: 'Kushagra',
    avatar_url: 'https://avatars.githubusercontent.com/u/292747643?v=4',
    html_url: 'https://github.com/soulfulkushagra',
    bio: 'Full-Stack Developer & Open Source Contributor',
    public_repos: 0,
    followers: 0,
    following: 0,
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setIsRateLimited(false);
      const res = await fetch('https://api.github.com/users/soulfulkushagra', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (res.status === 403) {
        // Rate limited by GitHub public API
        setIsRateLimited(true);
        setProfile(fallbackProfile);
        return;
      }

      if (!res.ok) {
        throw new Error(`GitHub API error: ${res.status}`);
      }

      const data = await res.json();
      setProfile({
        login: data.login || 'soulfulkushagra',
        name: data.name || 'Kushagra',
        avatar_url: data.avatar_url || fallbackProfile.avatar_url,
        html_url: data.html_url || 'https://github.com/soulfulkushagra',
        bio: data.bio || 'Full-Stack Developer & Cinema Booking Platform Contributor',
        public_repos: data.public_repos ?? 0,
        followers: data.followers ?? 0,
        following: data.following ?? 0,
        created_at: data.created_at,
        location: data.location,
      });
    } catch (err) {
      console.warn('Could not fetch live GitHub profile, using graceful fallback:', err);
      setProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const data = profile || fallbackProfile;

  if (compact) {
    return (
      <div className="p-4 rounded-xl bg-[#121218] border border-zinc-800 hover:border-zinc-700 transition flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={data.avatar_url}
            alt={data.login}
            className="w-10 h-10 rounded-full border border-zinc-700 object-cover shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackProfile.avatar_url;
            }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs truncate">{data.name || 'Kushagra'}</span>
              <CheckCircle2 className="w-3 h-3 text-red-500 shrink-0" />
            </div>
            <a
              href={data.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-zinc-400 hover:text-red-400 font-mono transition block truncate"
            >
              @{data.login}
            </a>
          </div>
        </div>

        <a
          href={data.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-1 shrink-0 transition"
          title="Open GitHub Profile"
        >
          <GitHubLogoIcon className="w-3.5 h-3.5" />
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#14141c] to-[#0c0c10] border border-zinc-800/80 p-6 sm:p-8 shadow-2xl overflow-hidden group hover:border-zinc-700 transition duration-300">
      {/* Subtle background ambient red cinema glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Avatar & Bio details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar with status indicator */}
          <div className="relative shrink-0">
            {loading ? (
              <div className="w-20 h-20 rounded-2xl bg-zinc-800 animate-pulse border border-zinc-700" />
            ) : (
              <img
                src={data.avatar_url}
                alt={data.login}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-zinc-700 group-hover:border-red-600/60 object-cover shadow-xl transition duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackProfile.avatar_url;
                }}
              />
            )}
            <div
              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-zinc-900 border border-zinc-800 text-white"
              title="Verified GitHub Contributor"
            >
              <GitHubLogoIcon className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Text block */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded">
                Developer Profile
              </span>
              <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Platform Contributor
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {data.name || 'Kushagra'}
            </h3>

            <div className="flex items-center gap-2">
              <a
                href={data.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
              >
                <span>@{data.login}</span>
                <ExternalLink className="w-3 h-3 text-zinc-500" />
              </a>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed pt-1">
              {data.bio || 'Full-Stack Developer contributing to high-performance cinema booking architectures.'}
            </p>
          </div>
        </div>

        {/* Right: Quick Stats & Direct Action Button */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-4 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-800/80">
          {/* GitHub Metric Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center flex-1 sm:flex-none min-w-[70px]">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Repos</span>
              <span className="text-sm font-black font-mono text-white">{data.public_repos}</span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center flex-1 sm:flex-none min-w-[70px]">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Followers</span>
              <span className="text-sm font-black font-mono text-white">{data.followers}</span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center flex-1 sm:flex-none min-w-[70px]">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Following</span>
              <span className="text-sm font-black font-mono text-white">{data.following}</span>
            </div>
          </div>

          {/* Action Button & Sync trigger */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={fetchProfile}
              disabled={loading}
              title="Refresh GitHub Data"
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/80 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
            </button>

            <a
              href={data.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition hover:scale-[1.02]"
            >
              <GitHubLogoIcon className="w-4 h-4" />
              <span>Visit @{data.login}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
