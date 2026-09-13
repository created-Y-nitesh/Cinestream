import React, { useState } from 'react';
import { VideoItem } from '../../types';
import { GoogleDrivePlayer } from './GoogleDrivePlayer';
import { HTML5Player } from './HTML5Player';
import { useWatchHistory } from '../../context/WatchHistoryContext';
import { Layers, ShieldCheck, Film } from 'lucide-react';

interface VideoPlayerProps {
  video: VideoItem;
  currentEpisodeId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  activeVideoUrl?: string;
  activeEmbedUrl?: string;
  activeSourceType?: string;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  currentEpisodeId,
  seasonNumber,
  episodeNumber,
  activeVideoUrl,
  activeEmbedUrl,
  activeSourceType,
  isTheaterMode = false,
  onToggleTheater,
  className = '',
}) => {
  const { recordProgress } = useWatchHistory();

  // Resolved URLs based on whether an episode is active or the root video
  const videoUrl = activeVideoUrl || video.video_url;
  const embedUrl = activeEmbedUrl || video.embed_url;
  const sourceType = activeSourceType || video.source_type;

  // Track progress callback
  const handleProgress = (progress: number, total: number) => {
    recordProgress(video, progress, total, currentEpisodeId, seasonNumber, episodeNumber);
  };

  // Allow user to switch player mode dynamically if both HTML5 and Embed exist
  const [overrideMode, setOverrideMode] = useState<'auto' | 'html5' | 'embed'>('auto');

  // Determine which sub-player to render
  const renderSubPlayer = () => {
    // 1. Google Drive Player
    if (
      (sourceType === 'google_drive' || overrideMode === 'embed') &&
      embedUrl
    ) {
      return (
        <GoogleDrivePlayer
          embedUrl={embedUrl}
          title={video.title}
        />
      );
    }

    // 2. Direct HTML5 video playback
    if (videoUrl && (sourceType === 'html5' || overrideMode === 'html5' || !embedUrl)) {
      return (
        <HTML5Player
          src={videoUrl}
          poster={video.backdrop || video.thumbnail}
          title={video.title}
          onProgressUpdate={handleProgress}
        />
      );
    }

    // 3. Fallback Embed Player if embed_url is provided
    if (embedUrl) {
      return (
        <GoogleDrivePlayer
          embedUrl={embedUrl}
          title={video.title}
        />
      );
    }

    // 4. Placeholder if neither is available yet
    return (
      <div className="w-full aspect-video flex flex-col items-center justify-center p-8 bg-neutral-900 rounded-2xl border border-white/10 text-center">
        <Film className="w-12 h-12 text-neutral-500 mb-3 animate-pulse" />
        <h3 className="text-base sm:text-lg font-semibold text-white">Stream link missing</h3>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mt-1">
          Is title ke liye Google Sheet me abhi koi stream link nahi hai.
        </p>
      </div>
    );
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Player Container */}
      <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
        {renderSubPlayer()}
      </div>

      {/* Auxiliary Player Control Toolbar (Mode switcher & Theater mode) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 px-1 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-crimson-400" />
            Source: <span className="text-white font-mono uppercase">{sourceType}</span>
          </span>

          {embedUrl && videoUrl && (
            <div className="flex items-center gap-1 ml-2 bg-white/5 p-0.5 rounded-lg border border-white/10">
              <button
                onClick={() => setOverrideMode('html5')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  overrideMode === 'html5' || (overrideMode === 'auto' && sourceType === 'html5')
                    ? 'bg-crimson-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Direct Stream
              </button>
              <button
                onClick={() => setOverrideMode('embed')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  overrideMode === 'embed' || (overrideMode === 'auto' && sourceType === 'google_drive')
                    ? 'bg-crimson-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Drive IFrame
              </button>
            </div>
          )}
        </div>

        {onToggleTheater && (
          <button
            onClick={onToggleTheater}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isTheaterMode ? 'Standard View' : 'Theater Mode'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
