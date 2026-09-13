import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sun, Moon, Bookmark, Settings as SettingsIcon, Menu, X, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useWatchlist } from '../../context/WatchlistContext';
import { Logo } from './Logo';
import { SearchBar } from '../search/SearchBar';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, effectiveTheme, toggleTheme, setTheme } = useTheme();
  const { watchlist } = useWatchlist();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/movies', label: 'Movies' },
    { to: '/series', label: 'Series' },
    { to: '/categories', label: 'Categories' },
    { to: '/favorites', label: 'Watchlist', badge: watchlist.length > 0 ? watchlist.length : undefined },
  ];

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'glass-bar py-3'
          : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent light:from-day-bg/90 light:via-day-bg/50 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-8 min-w-0 shrink">
          <Logo />

          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`relative px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 rounded-full flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white dark:text-white light:text-crimson-700 font-semibold'
                      : 'text-neutral-300 hover:text-white dark:text-neutral-400 dark:hover:text-white light:text-neutral-600 light:hover:text-neutral-900'
                  }`}
                >
                  {link.label}
                  {link.badge !== undefined && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-crimson-600 text-white">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-gradient-to-r from-crimson-600/35 to-wine-700/35 ring-1 ring-crimson-400/30 shadow-[0_0_22px_-4px_rgba(220,20,60,0.55)] rounded-full -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right: Search, Theme Toggle, Settings, Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">
          {/* Expandable Search Component */}
          <SearchBar className="flex-1 sm:flex-none flex justify-end" />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-neutral-300 hover:text-white dark:text-neutral-400 dark:hover:text-white light:text-neutral-600 light:hover:text-neutral-900 bg-white/5 dark:bg-white/5 light:bg-black/5 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/10 transition-colors cursor-pointer"
            aria-label={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Current theme: ${theme}. Click to toggle.`}
          >
            {effectiveTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-crimson-600 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Settings Link */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `hidden sm:flex p-2.5 rounded-full transition-colors cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-crimson-600 to-wine-700 text-white shadow-md shadow-crimson-600/40 ring-1 ring-crimson-400/30'
                  : 'text-neutral-300 hover:text-white dark:text-neutral-400 dark:hover:text-white light:text-neutral-600 light:hover:text-neutral-900 bg-white/5 dark:bg-white/5 light:bg-black/5 hover:bg-white/10'
              }`
            }
            aria-label="Platform Settings"
            title="Settings & Diagnostics"
          >
            <SettingsIcon className="w-4 h-4" />
          </NavLink>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2.5 rounded-full text-neutral-300 hover:text-white dark:text-neutral-300 light:text-neutral-800 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden glass-bar overflow-hidden px-6 py-6"
          >
            <nav className="flex flex-col gap-3">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between text-base font-medium py-2 px-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-crimson-600 to-wine-700 text-white shadow-lg shadow-crimson-900/40'
                        : 'text-neutral-300 hover:text-white dark:text-neutral-300 light:text-neutral-700 hover:bg-white/5'
                    }`
                  }
                >
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-crimson-500/20 text-crimson-300">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              ))}
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 text-base font-medium py-2 px-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-crimson-600 to-wine-700 text-white shadow-lg shadow-crimson-900/40'
                      : 'text-neutral-300 hover:text-white dark:text-neutral-300 light:text-neutral-700 hover:bg-white/5'
                  }`
                }
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Settings &amp; API Config</span>
              </NavLink>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
