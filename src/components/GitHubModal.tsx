import React, { useState } from 'react';
import { GitBranch, X, Check, Copy, ExternalLink, ShieldCheck, Terminal, AlertCircle, Download } from 'lucide-react';
import { DeveloperProfileCard, GitHubLogoIcon } from './DeveloperProfileCard.js';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const macPushCommand = `cd ~/Downloads\nunzip -o imovies-movie-booking.zip -d imovies-movie-booking\ncd imovies-movie-booking\ngit init\ngit remote add origin https://github.com/Ayushdev365/imovies-movie-booking.git\ngit add .\ngit commit -m "feat: complete IMovies cinema booking platform"\ngit branch -M main\ngit push -u origin main`;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121217] border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-red-500">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">GitHub Integration & Repository Sync</h3>
              <p className="text-xs text-zinc-400">Profile: github.com/Ayushdev365 • Target Repo: imovies-movie-booking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm">
          {/* Status Box */}
          <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Repository Architecture</span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                Local Git Initialized (main)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-zinc-500">GitHub Profile</p>
                <a
                  href="https://github.com/Ayushdev365"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white hover:text-red-400 flex items-center gap-1 transition"
                >
                  <span>@Ayushdev365</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </div>
              <div>
                <p className="text-zinc-500">Target Repository</p>
                <a
                  href="https://github.com/Ayushdev365/imovies-movie-booking"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-red-400 hover:underline flex items-center gap-1 transition"
                >
                  <span>imovies-movie-booking</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div>
                <p className="text-zinc-500">Security / Credential Protection</p>
                <p className="font-medium text-zinc-300">.env & credentials ignored</p>
              </div>
              <div>
                <p className="text-zinc-500">Branch</p>
                <p className="font-medium text-zinc-300">main</p>
              </div>
            </div>
          </div>

          {/* Developer Profile Section for @soulfulkushagra */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <GitHubLogoIcon className="w-3.5 h-3.5 text-red-500" />
              Platform Contributor & Developer
            </h4>
            <DeveloperProfileCard compact={true} />
          </div>

          {/* Quick Connect Instruction */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Steps to Push to GitHub from your Mac:
            </h4>

            {/* Step 1: Download Code */}
            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold shrink-0">
                1
              </span>
              <div className="flex-1 text-xs space-y-1.5">
                <p className="font-semibold text-white">Download Project Code (.ZIP)</p>
                <p className="text-zinc-400">
                  Save the complete IMovies source code directly to your Mac:
                </p>
                <a
                  href="/api/v1/download-project"
                  download="imovies-movie-booking.zip"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-950 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download imovies-movie-booking.zip
                </a>
              </div>
            </div>

            {/* Step 2: Ensure repo on GitHub */}
            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold shrink-0">
                2
              </span>
              <div className="flex-1 text-xs">
                <p className="font-semibold text-white">Create the repository on your GitHub account</p>
                <p className="text-zinc-400 mt-0.5">
                  Ensure the repository named <code className="text-red-400 bg-black/40 px-1 py-0.5 rounded">imovies-movie-booking</code> exists on GitHub:
                </p>
                <a
                  href="https://github.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold mt-1.5"
                >
                  Open github.com/new <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Step 3: Terminal commands */}
            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold shrink-0">
                3
              </span>
              <div className="flex-1 text-xs space-y-2">
                <p className="font-semibold text-white">Run these commands in your Mac Terminal</p>
                <p className="text-zinc-400">
                  This navigates into your Downloads, extracts the code, and pushes to your repository:
                </p>
                <div className="relative group">
                  <pre className="p-3 rounded-lg bg-black/70 border border-zinc-800 text-zinc-300 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed">
                    {macPushCommand}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(macPushCommand, 3)}
                    className="absolute top-2 right-2 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold flex items-center gap-1"
                  >
                    {copiedStep === 3 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedStep === 3 ? 'Copied!' : 'Copy Commands'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Safety & Integrity Guarantee */}
          <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/40 flex items-start gap-2.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-zinc-300 leading-relaxed">
              <strong className="text-white">Security Guarantee:</strong> All database passwords, JWT secrets, and environment tokens are strictly protected by <code className="text-red-400 bg-black/40 px-1 py-0.2 rounded">.gitignore</code> and never committed to version control.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900/30">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <a
              href="https://github.com/soulfulkushagra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-200 hover:text-red-400 flex items-center gap-1.5 font-semibold transition"
            >
              <GitHubLogoIcon className="w-3.5 h-3.5 text-red-500" />
              <span>@soulfulkushagra</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <a
              href="https://github.com/Ayushdev365"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white flex items-center gap-1.5 transition"
            >
              @Ayushdev365 <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
