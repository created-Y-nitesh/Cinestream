import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { WatchHistoryProvider } from './context/WatchHistoryContext';
import { BackgroundEffects } from './components/effects/BackgroundEffects';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';

// Pages
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { Series } from './pages/Series';
import { Categories } from './pages/Categories';
import { VideoDetails } from './pages/VideoDetails';
import { Watch } from './pages/Watch';
import { Favorites } from './pages/Favorites';
import { SearchPage } from './pages/SearchPage';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <WatchlistProvider>
          <WatchHistoryProvider>
            <BrowserRouter>
              <ScrollToTop />
              {/*
                pb-mobile-nav: mobile par neeche fixed bottom-nav hai, uske peeche
                content chhup na jaye iske liye safe-area ke saath padding.
              */}
              <div className="relative min-h-screen flex flex-col overflow-x-hidden pb-mobile-nav bg-[#FBF5F6] dark:bg-[#0A0507] text-[#1A0B10] dark:text-[#FFFFFF] transition-colors duration-300">
                {/* Visual Ambient Glow and Noise */}
                <BackgroundEffects />

                {/* Primary Sticky Navigation */}
                <Navbar />

                {/* Main Viewport Routed Content */}
                <main className="flex-1 relative z-10">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/movies" element={<Movies />} />
                    <Route path="/series" element={<Series />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/movie/:id" element={<VideoDetails />} />
                    <Route path="/series/:id" element={<VideoDetails />} />
                    <Route path="/watch/:id" element={<Watch />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>

                {/* Footer */}
                <Footer />

                {/* Mobile Bottom Navigation (Visible on mobile/tablet) */}
                <MobileNav />
              </div>
            </BrowserRouter>
          </WatchHistoryProvider>
        </WatchlistProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
