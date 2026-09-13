import React from 'react';
import { VideoItem } from '../../types';
import { VideoCard } from './VideoCard';
import { Film } from 'lucide-react';
import { Button } from '../ui/Button';

interface VideoGridProps {
  videos: VideoItem[];
  aspectRatio?: string;
  emptyMessage?: string;
  onResetFilters?: () => void;
  className?: string;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  aspectRatio = 'aspect-[16/10]',
  emptyMessage = 'No titles found matching your selection.',
  onResetFilters,
  className = '',
}) => {
  if (!videos || videos.length === 0) {
    return (
      <div className="py-20 px-4 text-center flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
        <div className="p-4 rounded-full bg-white/5 text-neutral-400">
          <Film className="w-8 h-8 opacity-60" />
        </div>
        <h3 className="text-lg font-semibold text-white dark:text-white light:text-neutral-900">
          No Results Found
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400">
          {emptyMessage}
        </p>
        {onResetFilters && (
          <Button variant="secondary" size="sm" onClick={onResetFilters} className="mt-2">
            Reset Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6 ${className}`}
    >
      {videos.map(video => (
        <VideoCard key={video.id} video={video} aspectRatio={aspectRatio} />
      ))}
    </div>
  );
};
