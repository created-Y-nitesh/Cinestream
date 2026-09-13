import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Heart, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { VideoItem } from '../../types';
import { useWatchlist } from '../../context/WatchlistContext';
import { SmartImage } from '../ui/SmartImage';
import { Badge } from '../ui/Badge';

interface VideoCardProps {
  video: VideoItem;
  aspectRatio?: string;
  showProgress?: number; // percentage (0-100) for continue watching
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  aspectRatio = 'aspect-[16/10]',
  showProgress,
  className = '',
}) => {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const isFavorite = isInWatchlist(video.id);

  const handleCardClick = () => {
    navigate(`/movie/${video.id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${video.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(video);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform-gpu hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-crimson-600/30 glass-soft hover:border-crimson-400/50 light:shadow-md ${className}`}
    >
      {/* Thumbnail Container */}
      <div className={`relative w-full overflow-hidden ${aspectRatio}`}>
        <SmartImage
          src={video.thumbnail}
          alt={video.title}
          aspectRatio={aspectRatio}
          className="transition-transform duration-500 ease-out group-hover:scale-108"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5">
            {video.quality && (
              <Badge variant="quality" className="backdrop-blur-md">
                {video.quality.split(' ')[0]}
              </Badge>
            )}
            {video.type === 'series' && (
              <Badge variant="default" className="backdrop-blur-md text-[10px]">
                Series
              </Badge>
            )}
          </div>

          {video.rating && (
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-bold text-amber-400 border border-white/10">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{video.rating}</span>
            </div>
          )}
        </div>

        {/* Floating Quick Action Buttons */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <motion.button
            type="button"
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.94 }}
            onClick={handlePlayClick}
            className="pointer-events-auto p-3 sm:p-3.5 rounded-full bg-gradient-to-br from-crimson-500 to-wine-700 text-white shadow-xl shadow-crimson-600/50 border border-crimson-300/40 opacity-90 md:opacity-0 md:group-hover:opacity-100 translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-300 cursor-pointer"
            aria-label={`Play ${video.title}`}
          >
            <Play className="w-5 h-5 fill-white translate-x-0.5" />
          </motion.button>
        </div>

        {/* Watchlist Bookmark Icon in Corner */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`absolute bottom-2.5 right-2.5 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
            isFavorite
              ? 'bg-rose-600/90 text-white scale-100 shadow-lg shadow-rose-600/30'
              : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/80 opacity-90 md:opacity-0 md:group-hover:opacity-100'
          }`}
          title={isFavorite ? 'Remove from Watchlist' : 'Add to Watchlist'}
          aria-label="Add to Watchlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Continue Watching Progress Bar */}
        {showProgress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20 overflow-hidden">
            <div
              className="h-full bg-crimson-500 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, showProgress))}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Metadata Area */}
      <div className="p-2.5 sm:p-3.5 flex flex-col gap-1 z-10">
        <h3 className="text-xs sm:text-sm font-semibold text-white dark:text-white light:text-neutral-900 truncate group-hover:text-crimson-400 transition-colors">
          {video.title}
        </h3>

        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-400 light:text-neutral-500 font-medium">
          <span>{video.year}</span>
          <span>•</span>
          <span className="truncate">{video.genre[0] || 'Feature'}</span>
          <span>•</span>
          <span className="truncate">{video.duration}</span>
        </div>
      </div>
    </div>
  );
};
