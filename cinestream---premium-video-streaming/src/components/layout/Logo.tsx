import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 group select-none transition-transform active:scale-95 ${className}`}
      aria-label="CineStream Home"
    >
      {/* Reusable Logo Icon */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-wine-800 via-crimson-600 to-crimson-400 text-white shadow-lg shadow-crimson-600/40 group-hover:shadow-crimson-500/60 ring-1 ring-crimson-300/30 transition-all duration-300 ${iconSizes[size]}`}>
        {/* Play / Prism Emblem */}
        <svg
          className="w-1/2 h-1/2 fill-white translate-x-0.5 group-hover:scale-110 transition-transform duration-300"
          viewBox="0 0 24 24"
        >
          <path d="M5 3l14 9-14 9V3z" />
        </svg>
      </div>

      {/* Typography with subtle accent dot */}
      <div className="flex items-center font-display tracking-tight font-extrabold leading-none">
        <span className={`text-white dark:text-white light:text-neutral-900 ${textSizes[size]}`}>
          CINE
        </span>
        <span className={`romance-text ${textSizes[size]}`}>
          STREAM
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-crimson-500 ml-0.5 animate-heartbeat shadow-[0_0_10px_rgba(245,48,79,0.9)]" />
      </div>
    </Link>
  );
};
