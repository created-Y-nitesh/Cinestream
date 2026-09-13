import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Film, Tv, Bookmark, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useWatchlist } from '../../context/WatchlistContext';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { watchlist } = useWatchlist();

  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/movies', label: 'Movies', icon: Film },
    { to: '/series', label: 'Series', icon: Tv },
    { to: '/favorites', label: 'Watchlist', icon: Bookmark, badge: watchlist.length > 0 ? watchlist.length : null },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-dock px-2 py-2 safe-bottom"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map(item => {
          const isActive = location.pathname === item.to;
          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-crimson-400 dark:text-crimson-400 light:text-crimson-600 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 dark:text-neutral-400 light:text-neutral-500'
              }`}
            >
              <div className="relative">
                <IconComponent className="w-5 h-5 transition-transform duration-200" />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-crimson-600 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-dot"
                  className="w-1.5 h-1.5 rounded-full bg-crimson-500 mt-0.5 shadow-[0_0_8px_rgba(245,48,79,0.9)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
