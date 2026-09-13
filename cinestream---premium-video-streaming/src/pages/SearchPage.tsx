import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { VideoItem } from '../types';
import { VideoGrid } from '../components/video/VideoGrid';
import { SkeletonCard } from '../components/ui/Skeleton';
import { PageTransition } from '../components/effects/PageTransition';
import { Search as SearchIcon, Film, Filter } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series'>('all');

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    let isMounted = true;

    async function executeSearch() {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await api.search(query);
        if (isMounted) {
          setResults(data);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    executeSearch();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const filteredResults = results.filter(v => {
    if (filterType === 'all') return true;
    return v.type === filterType;
  });

  return (
    <PageTransition className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Search Input Hero Bar */}
      <div className="flex flex-col gap-4 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white dark:text-white light:text-neutral-900 tracking-tight">
          Search Results
        </h1>

        <form onSubmit={handleFormSubmit} className="relative w-full">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by title, character, actor, or genre..."
            className="w-full py-3.5 pl-12 pr-28 rounded-2xl bg-neutral-900/80 dark:bg-cinema-surface/80 light:bg-white text-sm text-white dark:text-white light:text-neutral-900 placeholder:text-neutral-500 border border-white/10 dark:border-white/10 light:border-black/10 focus:border-crimson-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 shadow-xl"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Query Stats & Sub-filters */}
      {query && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs sm:text-sm text-neutral-400">
            Found <strong className="text-white dark:text-white light:text-neutral-900">{filteredResults.length}</strong> results for &ldquo;{query}&rdquo;
          </span>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-crimson-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All ({results.length})
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'movie' ? 'bg-crimson-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Movies ({results.filter(r => r.type === 'movie').length})
            </button>
            <button
              onClick={() => setFilterType('series')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'series' ? 'bg-crimson-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Series ({results.filter(r => r.type === 'series').length})
            </button>
          </div>
        </div>
      )}

      {/* Grid or Skeletons or Empty State */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : query && filteredResults.length > 0 ? (
        <VideoGrid videos={filteredResults} />
      ) : query ? (
        <div className="py-20 text-center flex flex-col items-center justify-center max-w-md mx-auto gap-3 text-neutral-400">
          <Film className="w-10 h-10 opacity-40" />
          <h3 className="text-lg font-semibold text-white">No Matching Titles</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            We couldn&apos;t find any video matching &ldquo;{query}&rdquo;. Try checking the spelling or searching for a broader term like &ldquo;Sci-Fi&rdquo; or &ldquo;Action&rdquo;.
          </p>
        </div>
      ) : (
        <div className="py-20 text-center text-neutral-400">
          <SearchIcon className="w-10 h-10 mx-auto opacity-30 mb-2" />
          <p className="text-sm">Type a title or genre above to begin searching.</p>
        </div>
      )}
    </PageTransition>
  );
};
