import React, { useState, useEffect } from 'react';
import { GitBranch, ExternalLink, Copy, Check, ShieldCheck, Terminal, ArrowLeft } from 'lucide-react';
import { api } from '../services/api.js';
import { DeveloperProfileCard } from '../components/DeveloperProfileCard.js';

interface GitHubSyncPageProps {
  navigate: (path: string) => void;
}

export const GitHubSyncPage: React.FC<GitHubSyncPageProps> = ({ navigate }) => {
  const [copied, setCopied] = useState(false);
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    api.getGithubInfo().then((res) => setInfo(res)).catch(() => {});
  }, []);

  const fullCommand = `git remote add origin https://github.com/Ayushdev365/imovies-movie-booking.git\ngit branch -M main\ngit add .\ngit commit -m "feat: complete production-oriented IMovies cinema booking platform"\ngit push -u origin main`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to IMovies
      </button>

      <div>
        <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-xs">
          <GitBranch className="w-4 h-4" />
          Version Control & Deployment Synchronization
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mt-1">
          GitHub Integration Guide
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Follow these exact steps to connect this project to your GitHub account: <strong className="text-white">Ayushdev365</strong>.
        </p>
      </div>

      {/* Target Repo Information */}
      <div className="p-6 rounded-2xl bg-[#121218] border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Target Repository Specification
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span className="text-zinc-500">GitHub Profile</span>
            <p className="font-semibold text-white flex items-center gap-1.5">
              <span>https://github.com/Ayushdev365</span>
              <a href="https://github.com/Ayushdev365" target="_blank" rel="noreferrer">
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
              </a>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span className="text-zinc-500">Repository Name</span>
            <p className="font-semibold text-red-400 font-mono">imovies-movie-booking</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span className="text-zinc-500">Local Branch</span>
            <p className="font-semibold text-white font-mono">main</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span className="text-zinc-500">Credential Protection</span>
            <p className="font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> .env & secrets isolated
            </p>
          </div>
        </div>
      </div>

      {/* Contributor Profile */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Platform Contributor & Developer
        </h3>
        <DeveloperProfileCard />
      </div>

      {/* Step by Step Commands */}
      <div className="p-6 rounded-2xl bg-[#121218] border border-zinc-800 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-red-500" />
            Execution Commands to Link & Push
          </h3>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Script'}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-black border border-zinc-800 text-zinc-300 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre">
          {fullCommand}
        </pre>

        <div className="space-y-3 pt-2 text-xs text-zinc-400 leading-relaxed">
          <p>
            <strong className="text-white">Note on GitHub CLI / Personal Access Token:</strong>
          </p>
          <p>
            When pushing from a remote environment or terminal, GitHub prompts for your username (<code className="text-zinc-200 font-mono">Ayushdev365</code>) and your GitHub Personal Access Token (classic token with <code className="text-red-400 font-mono">repo</code> permissions).
          </p>
        </div>
      </div>
    </div>
  );
};
