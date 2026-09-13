import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoItem } from '../../types';
import { VideoCard } from './VideoCard';

interface VideoRowProps {
  title: string;
  subtitle?: string;
  videos: VideoItem[];
  aspectRatio?: string;
  cardWidth?: string; // e.g. 'w-64 sm:w-72'
}

export const VideoRow: React.FC<VideoRowProps> = ({
  title,
  subtitle,
  videos,
  aspectRatio = 'aspect-[16/10]',
  cardWidth = 'w-40 xs:w-44 sm:w-60 md:w-72',
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [videos]);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const offset = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -offset : offset,
        behavior: 'smooth',
      });
    }
  };

  if (!videos || videos.length === 0) return null;

  return (
    <section className="relative w-full py-4 group/row">
      {/* Row Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 sm:mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white dark:text-white light:text-neutral-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-400 light:text-neutral-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Desktop Arrow Controls */}
        <div className="hidden sm:flex items-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="p-2 rounded-full glass-ember hover:border-crimson-400/50 text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-lg"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="p-2 rounded-full glass-ember hover:border-crimson-400/50 text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-lg"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Shelf */}
      <div
        ref={rowRef}
        onScroll={checkScrollability}
        className="flex gap-3 sm:gap-5 overflow-x-auto no-scrollbar snap-row scroll-smooth px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-2"
      >
        {videos.map(video => (
          <div key={video.id} className={`shrink-0 snap-item ${cardWidth}`}>
            <VideoCard video={video} aspectRatio={aspectRatio} />
          </div>
        ))}
      </div>
    </section>
  );
};
