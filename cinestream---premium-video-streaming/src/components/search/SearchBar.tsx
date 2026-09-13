import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Play, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../api/client';
import { useDebounce } from '../../hooks/useDebounce';
import { VideoItem } from '../../types';
import { Badge } from '../ui/Badge';

interface SearchBarProps {
  expandedDefault?: boolean;
  onSelectResult?: () => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  expandedDefault = false,
  onSelectResult,
  className = '',
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(expandedDefault);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 250);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        if (!expandedDefault && !query) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedDefault, query]);

  // Handle Search API calls
  useEffect(() => {
    let active = true;

    async function fetchSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await api.search(debouncedQuery);
        if (active) {
          setResults(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchSearch();

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onSelectResult?.();
    }
  };

  const handleSelectVideo = (video: VideoItem) => {
    setShowDropdown(false);
    navigate(`/movie/${video.id}`);
    onSelectResult?.();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const toggleExpand = () => {
    setIsOpen(prev => {
      const next = !prev;
      if (next) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      return next;
    });
  };

  return (
    <div ref={containerRef} className={`relative z-40 min-w-0 ${className}`}>
      <form
        onSubmit={handleSubmit}
        className={`flex items-center transition-all duration-300 rounded-full border ${
          isOpen
            ? 'w-full sm:w-80 bg-cinema-surface/80 dark:bg-cinema-surface/80 light:bg-white/90 border-crimson-400/50 shadow-lg shadow-crimson-600/25'
            : 'w-10 h-10 bg-white/5 dark:bg-white/5 light:bg-black/5 border-transparent hover:border-white/20'
        } backdrop-blur-xl px-2.5 py-1.5`}
      >
        <button
          type={isOpen ? 'submit' : 'button'}
          onClick={!isOpen ? toggleExpand : undefined}
          className="text-neutral-400 hover:text-white dark:text-neutral-400 dark:hover:text-white light:text-neutral-600 light:hover:text-neutral-900 transition-colors p-1 cursor-pointer shrink-0"
          aria-label="Search movies and series"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-crimson-400" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>

        {isOpen && (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (results.length > 0 || query.trim()) setShowDropdown(true);
            }}
            placeholder="Search movies, series…"
            className="w-full bg-transparent border-none text-xs sm:text-sm px-2 text-white dark:text-white light:text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
            aria-label="Search field"
          />
        )}

        {isOpen && query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors p-1 cursor-pointer shrink-0"
            aria-label="Clear search query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Instant Dropdown Suggestions */}
      <AnimatePresence>
        {showDropdown && isOpen && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-[4.25rem] sm:absolute sm:left-0 sm:-right-8 sm:top-full sm:mt-2 rounded-2xl glass-red p-2 max-h-[60vh] sm:max-h-[380px] overflow-y-auto no-scrollbar"
          >
            {loading ? (
              <div className="py-6 text-center flex flex-col items-center justify-center gap-2 text-neutral-400">
                <Loader2 className="w-5 h-5 animate-spin text-crimson-400" />
                <span className="text-xs">Searching cinematic catalog...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Top Results
                </div>
                {results.slice(0, 5).map(video => (
                  <button
                    key={video.id}
                    onClick={() => handleSelectVideo(video)}
                    className="flex items-center gap-3 p-2 rounded-xl text-left hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-neutral-100 transition-colors cursor-pointer group w-full"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-14 h-10 object-cover rounded-lg shrink-0 bg-neutral-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white dark:text-white light:text-neutral-900 truncate group-hover:text-crimson-400 transition-colors">
                        {video.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                        <span>{video.year}</span>
                        <span>•</span>
                        <span className="capitalize">{video.type}</span>
                        {video.quality && (
                          <Badge variant="quality" className="text-[9px] py-0 px-1">
                            {video.quality.split(' ')[0]}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-neutral-400 group-hover:text-crimson-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                  </button>
                ))}
                <button
                  onClick={handleSubmit}
                  className="mt-1 pt-2 border-t border-white/5 dark:border-white/5 light:border-black/5 text-center text-xs font-medium text-crimson-400 hover:text-crimson-300 py-1.5 cursor-pointer block w-full"
                >
                  View all results for &ldquo;{query}&rdquo; →
                </button>
              </div>
            ) : (
              <div className="py-6 text-center text-neutral-400 flex flex-col items-center justify-center gap-1.5">
                <Film className="w-6 h-6 opacity-40" />
                <span className="text-sm font-medium">No matches found</span>
                <span className="text-xs text-neutral-500">Try searching for a genre or title</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
