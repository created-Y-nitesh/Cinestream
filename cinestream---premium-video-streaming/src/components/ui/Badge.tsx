import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'quality' | 'rating' | 'genre' | 'year' | 'accent' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap select-none transition-colors';

  const variants = {
    quality: 'bg-crimson-600/20 text-crimson-300 border border-crimson-500/30 dark:bg-crimson-500/15 dark:text-crimson-300 dark:border-crimson-500/30 light:bg-crimson-50 light:text-crimson-700 light:border-crimson-200',
    rating: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300 light:bg-amber-50 light:text-amber-800 light:border-amber-200',
    genre: 'bg-white/10 text-neutral-300 border border-white/10 hover:border-white/20 dark:bg-white/10 dark:text-neutral-200 dark:border-white/10 light:bg-neutral-100 light:text-neutral-700 light:border-neutral-200',
    year: 'bg-neutral-800/80 text-neutral-300 border border-neutral-700/50 dark:bg-neutral-800/80 dark:text-neutral-300 light:bg-neutral-200 light:text-neutral-800 light:border-neutral-300',
    accent: 'bg-gradient-to-r from-crimson-600 to-wine-600 text-white shadow-sm shadow-crimson-500/20',
    default: 'bg-neutral-800/60 text-neutral-300 border border-white/5 dark:bg-neutral-800/60 dark:text-neutral-300 light:bg-neutral-100 light:text-neutral-700 light:border-neutral-200',
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
