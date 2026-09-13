import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { VideoGrid } from '../components/video/VideoGrid';
import { PageTransition } from '../components/effects/PageTransition';
import { Bookmark, Trash2, Film } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { watchlist, clearWatchlist } = useWatchlist();

  return (
    <PageTransition className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10 dark:border-white/10 light:border-black/10">
        <div>
          <div className="flex items-center gap-2 text-crimson-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Personal Collection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white dark:text-white light:text-neutral-900 tracking-tight">
            My Watchlist
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Titles you have saved for later streaming across sessions.
          </p>
        </div>

        {watchlist.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearWatchlist}
            icon={<Trash2 className="w-4 h-4 text-rose-400" />}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
          >
            Clear Watchlist
          </Button>
        )}
      </div>

      {/* Watchlist Grid or Empty State */}
      {watchlist.length > 0 ? (
        <VideoGrid videos={watchlist} />
      ) : (
        <div className="py-24 text-center flex flex-col items-center justify-center max-w-md mx-auto gap-4">
          <div className="p-5 rounded-2xl bg-crimson-600/10 border border-crimson-500/20 text-crimson-400">
            <Film className="w-10 h-10" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xl font-bold text-white dark:text-white light:text-neutral-900">
              Your Watchlist is Empty
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed">
              Explore trending titles, blockbusters, and original series, then click the heart or plus icon to save them here.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/movies')}
            className="mt-2"
          >
            Explore Catalog
          </Button>
        </div>
      )}
    </PageTransition>
  );
};
