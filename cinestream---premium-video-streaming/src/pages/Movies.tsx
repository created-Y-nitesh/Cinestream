import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { VideoItem } from '../types';
import { VideoGrid } from '../components/video/VideoGrid';
import { SkeletonCard } from '../components/ui/Skeleton';
import { PageTransition } from '../components/effects/PageTransition';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';

type SortKey = 'popular' | 'rating' | 'newest' | 'title';

/**
 * Movies catalog.
 *
 * Catalog ek hi baar fetch hota hai aur filtering client-side hoti hai —
 * har filter tap par network call nahi jaata, isliye mobile data par
 * filters instant lagte hain.
 */
export const Movies: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [allMovies, setAllMovies] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedGenre, setSelectedGenre] = useState<string>(searchParams.get('genre') || 'All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedQuality, setSelectedQuality] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<SortKey>('popular');

  useEffect(() => {
    let isMounted = true;

    async function loadMovies() {
      setLoading(true);
      try {
        const data = await api.getVideos({ type: 'movie' });
        if (isMounted) setAllMovies(data);
      } catch (err) {
        console.error('Error fetching movies', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMovies();
    return () => {
      isMounted = false;
    };
  }, []);

  // URL ?genre=... badle to filter sync rahe (Home ke genre tiles isse use karte hain)
  useEffect(() => {
    setSelectedGenre(searchParams.get('genre') || 'All');
  }, [searchParams]);

  // ---- Filter options seedha data se banti hain (hardcoded list nahi) ----
  const genres = useMemo(() => {
    const set = new Set<string>();
    allMovies.forEach(movie => movie.genre?.forEach(g => g && set.add(g)));
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allMovies]);

  const years = useMemo(() => {
    const set = new Set<number>();
    allMovies.forEach(movie => movie.year && set.add(movie.year));
    return ['All', ...Array.from(set).sort((a, b) => b - a).map(String)];
  }, [allMovies]);

  const qualities = useMemo(() => {
    const set = new Set<string>();
    allMovies.forEach(movie => movie.quality && set.add(movie.quality));
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allMovies]);

  const languages = useMemo(() => {
    const set = new Set<string>();
    allMovies.forEach(movie => movie.language && set.add(movie.language));
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allMovies]);

  const visibleMovies = useMemo(() => {
    let result = [...allMovies];

    if (selectedGenre !== 'All') {
      const needle = selectedGenre.toLowerCase();
      result = result.filter(movie => movie.genre?.some(g => g.toLowerCase() === needle));
    }
    if (selectedYear !== 'All') {
      result = result.filter(movie => String(movie.year) === selectedYear);
    }
    if (selectedQuality !== 'All') {
      result = result.filter(movie => movie.quality === selectedQuality);
    }
    if (selectedLanguage !== 'All') {
      result = result.filter(movie => movie.language === selectedLanguage);
    }

    switch (selectedSort) {
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'popular':
      default:
        result.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || (b.rating || 0) - (a.rating || 0));
        break;
    }

    return result;
  }, [allMovies, selectedGenre, selectedYear, selectedQuality, selectedLanguage, selectedSort]);

  const resetFilters = () => {
    setSelectedGenre('All');
    setSelectedYear('All');
    setSelectedQuality('All');
    setSelectedLanguage('All');
    setSelectedSort('popular');
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedGenre !== 'All' ||
    selectedYear !== 'All' ||
    selectedQuality !== 'All' ||
    selectedLanguage !== 'All' ||
    selectedSort !== 'popular';

  const selectClass =
    'bg-cinema-surface-elevated dark:bg-cinema-surface-elevated light:bg-white text-white dark:text-white light:text-neutral-900 rounded-lg px-2.5 py-1.5 text-xs border border-white/10 dark:border-white/10 light:border-black/10 focus:outline-none focus:border-crimson-500 cursor-pointer max-w-[10rem] truncate';

  return (
    <PageTransition className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-5 sm:gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white dark:text-white light:text-neutral-900 tracking-tight">
          Browse Movies
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
          {loading ? 'Catalog load ho raha hai…' : `${visibleMovies.length} of ${allMovies.length} titles`}
        </p>
      </div>

      {/* Filters */}
      <div className="p-3 sm:p-4 rounded-2xl glass flex flex-col gap-3">
        {/* Genre Pills — mobile par horizontally scroll hote hain */}
        {genres.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 py-1">
            {genres.map(g => (
              <button
                key={g}
                onClick={() => {
                  setSelectedGenre(g);
                  setSearchParams(g !== 'All' ? { genre: g } : {});
                }}
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

        {/* Mobile par advanced filters toggle ke peeche — screen saaf rehti hai */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5 dark:border-white/5 light:border-black/5">
          <button
            onClick={() => setShowFilters(prev => !prev)}
            className="sm:hidden flex items-center gap-1.5 text-xs font-semibold text-neutral-300 light:text-neutral-600 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showFilters ? 'Hide filters' : 'More filters'}</span>
          </button>

          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-wrap items-center gap-3 w-full`}>
            <label className="flex items-center gap-1.5 text-xs text-neutral-400">
              <span>Year:</span>
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className={selectClass}>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>

            {qualities.length > 1 && (
              <label className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span>Quality:</span>
                <select value={selectedQuality} onChange={e => setSelectedQuality(e.target.value)} className={selectClass}>
                  {qualities.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </label>
            )}

            {languages.length > 1 && (
              <label className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span>Language:</span>
                <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} className={selectClass}>
                  {languages.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="flex items-center gap-1.5 text-xs text-neutral-400">
              <span>Sort:</span>
              <select
                value={selectedSort}
                onChange={e => setSelectedSort(e.target.value as SortKey)}
                className={selectClass}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </label>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-crimson-400 hover:text-crimson-300 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Catalog */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <VideoGrid
          videos={visibleMovies}
          emptyMessage={
            allMovies.length === 0
              ? 'Catalog khaali hai. Google Sheet me movies add karo, ya Settings me backend URL check karo.'
              : 'In filters se koi movie match nahi hui. Filters reset karke dekho.'
          }
          onResetFilters={allMovies.length > 0 ? resetFilters : undefined}
        />
      )}
    </PageTransition>
  );
};
