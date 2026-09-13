import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { VideoItem } from '../types';
import { VideoCard } from '../components/video/VideoCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import { PageTransition } from '../components/effects/PageTransition';
import { Tv, Layers } from 'lucide-react';

export const Series: React.FC = () => {
  const [allSeries, setAllSeries] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  useEffect(() => {
    let isMounted = true;

    async function loadSeries() {
      setLoading(true);
      try {
        const data = await api.getVideos({ type: 'series' });
        if (isMounted) setAllSeries(data);
      } catch (err) {
        console.error('Error fetching series', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSeries();
    return () => {
      isMounted = false;
    };
  }, []);

  // Genres asli data se — sheet me jo genres hain wahi pills banti hain.
  const genres = useMemo(() => {
    const set = new Set<string>();
    allSeries.forEach(item => item.genre?.forEach(g => g && set.add(g)));
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allSeries]);

  const visibleSeries = useMemo(() => {
    if (selectedGenre === 'All') return allSeries;
    const needle = selectedGenre.toLowerCase();
    return allSeries.filter(item => item.genre?.some(g => g.toLowerCase() === needle));
  }, [allSeries, selectedGenre]);

  return (
    <PageTransition className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-5 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-crimson-400 text-xs font-bold uppercase tracking-wider">
          <Tv className="w-4 h-4" />
          <span>Episodic Cinema</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white dark:text-white light:text-neutral-900 tracking-tight">
          TV &amp; Web Series
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
          Season-wise episodes, seedha Google Drive se stream — binge karne ke liye taiyaar.
        </p>
      </div>

      {/* Genre Filter Pills */}
      {genres.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 py-1">
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedGenre.toLowerCase() === g.toLowerCase()
                  ? 'bg-gradient-to-r from-crimson-600 to-wine-700 text-white shadow-md shadow-crimson-600/40 ring-1 ring-crimson-400/30'
                  : 'glass-soft hover:border-crimson-400/40 text-neutral-300 dark:text-neutral-300 light:text-neutral-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Series Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : visibleSeries.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
          {visibleSeries.map(item => (
            <div key={item.id} className="relative group">
              <VideoCard video={item} />
              {/* Season indicator badge */}
              {item.seasons && item.seasons.length > 0 && (
                <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 backdrop-blur-md text-crimson-300 border border-crimson-500/30">
                    <Layers className="w-3 h-3" />
                    {item.seasons.length}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-neutral-400">
          <Tv className="w-10 h-10 mx-auto opacity-40 mb-3" />
          <h3 className="text-base font-semibold text-white dark:text-white light:text-neutral-900">
            Koi series nahi mili
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
            {allSeries.length === 0
              ? 'Google Sheet me type = series wali row add karo aur Episodes sheet me uske episodes daalo.'
              : 'Doosra genre filter try karo.'}
          </p>
        </div>
      )}
    </PageTransition>
  );
};
