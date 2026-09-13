import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Radio, ExternalLink } from 'lucide-react';
import { Logo } from './Logo';
import { isUsingMockData } from '../../api/client';
import { getApiBaseUrl } from '../../api/config';

export const Footer: React.FC = () => {
  const isMock = isUsingMockData();
  const currentBaseUrl = getApiBaseUrl();

  return (
    <footer className="glass-dock pt-16 pb-24 md:pb-12 text-sm text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/10 dark:border-white/10 light:border-black/5">
          {/* Brand & Mission */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Logo size="md" />
            <p className="text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed">
              Movies aur web series, seedha Google Drive se stream — Google Sheet se manage hone wala hulka aur fast platform.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-white/10 dark:border-white/10 light:border-black/10 bg-white/5 dark:bg-white/5 light:bg-white text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                <Radio className={`w-3 h-3 ${isMock ? 'text-amber-400' : 'text-emerald-400 animate-pulse'}`} />
                <span>{isMock ? 'Mock API Engine' : `Connected: ${currentBaseUrl}`}</span>
              </span>
              <Link
                to="/settings"
                className="text-xs text-crimson-400 hover:text-crimson-300 underline underline-offset-2"
              >
                Configure Backend
              </Link>
            </div>
          </div>

          {/* Catalog Navigation */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-white dark:text-white light:text-neutral-900 tracking-wider uppercase">
              Explore
            </h4>
            <ul className="flex flex-col gap-2 text-xs sm:text-sm">
              <li>
                <Link to="/movies" className="hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors">
                  All Movies
                </Link>
              </li>
              <li>
                <Link to="/series" className="hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors">
                  TV &amp; Web Series
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors">
                  My Watchlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Tech */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-white dark:text-white light:text-neutral-900 tracking-wider uppercase">
              Architecture
            </h4>
            <ul className="flex flex-col gap-2 text-xs sm:text-sm">
              <li>
                <Link to="/settings" className="hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors">
                  REST API Endpoints
                </Link>
              </li>
              <li>
                <span className="text-neutral-500">Google Drive Embed Player</span>
              </li>
              <li>
                <span className="text-neutral-500">Google Sheet + Vercel API</span>
              </li>
              <li>
                <span className="text-neutral-500">Static Host Ready (InfinityFree)</span>
              </li>
            </ul>
          </div>

          {/* Legal / Policy placeholders */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-white dark:text-white light:text-neutral-900 tracking-wider uppercase">
              Legal &amp; Privacy
            </h4>
            <ul className="flex flex-col gap-2 text-xs sm:text-sm">
              <li>
                <span className="text-neutral-400 hover:text-white cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-neutral-400 hover:text-white cursor-pointer transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-neutral-400 hover:text-white cursor-pointer transition-colors">
                  DMCA Compliance
                </span>
              </li>
              <li>
                <span className="text-neutral-400 hover:text-white cursor-pointer transition-colors">
                  API License
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row: copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} CineStream. Built with React, Tailwind &amp; Motion.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-crimson-400" />
              Secure IFrame Sandbox
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
