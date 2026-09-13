import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { VideoItem, Episode, Season } from '../types';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { EpisodeList } from '../components/video/EpisodeList';
import { SkeletonPlayer } from '../components/ui/Skeleton';
import { PageTransition } from '../components/effects/PageTransition';
import { useWatchlist } from '../context/WatchlistContext';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const Watch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [video, setVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Parse season & episode from URL query if available
  const seasonParam = searchParams.get('season');
  const episodeParam = searchParams.get('episode');

  const [currentSeasonNum, setCurrentSeasonNum] = useState<number>(seasonParam ? Number(seasonParam) : 1);
  const [currentEpisodeNum, setCurrentEpisodeNum] = useState<number>(episodeParam ? Number(episodeParam) : 1);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!id) return;
      setLoading(true);
      window.scrollTo(0, 0);

      try {
        const item = await api.getVideoById(id);
        if (isMounted && item) {
          setVideo(item);
        }
      } catch (err) {
        console.error('Watch video load failed', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (seasonParam) setCurrentSeasonNum(Number(seasonParam));
    if (episodeParam) setCurrentEpisodeNum(Number(episodeParam));
  }, [seasonParam, episodeParam]);

  if (loading) {
    return <SkeletonPlayer />;
  }

  if (!video) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-white mb-2">Video Stream Unavailable</h2>
        <p className="text-xs text-neutral-400 mb-4">
          The requested stream link could not be resolved from the server.
        </p>
        <Button onClick={() => navigate('/movies')}>Browse Catalog</Button>
      </div>
    );
  }

  const isSeries = video.type === 'series' && video.seasons && video.seasons.length > 0;
  const currentSeason = isSeries ? video.seasons?.find(s => s.seasonNumber === currentSeasonNum) || video.seasons?.[0] : null;
  const currentEpisode = currentSeason ? currentSeason.episodes.find(e => e.episodeNumber === currentEpisodeNum) || currentSeason.episodes[0] : null;

  // Next / Previous Episode resolution
  let prevEpisode: { season: Season; episode: Episode } | null = null;
  let nextEpisode: { season: Season; episode: Episode } | null = null;

  if (isSeries && video.seasons && currentSeason && currentEpisode) {
    const currentEpIndex = currentSeason.episodes.findIndex(e => e.id === currentEpisode.id);

    if (currentEpIndex > 0) {
      prevEpisode = { season: currentSeason, episode: currentSeason.episodes[currentEpIndex - 1] };
    } else {
      const prevSeasonIndex = video.seasons.findIndex(s => s.seasonNumber === currentSeason.seasonNumber) - 1;
      if (prevSeasonIndex >= 0) {
        const prevS = video.seasons[prevSeasonIndex];
        prevEpisode = { season: prevS, episode: prevS.episodes[prevS.episodes.length - 1] };
      }
    }

    if (currentEpIndex < currentSeason.episodes.length - 1) {
      nextEpisode = { season: currentSeason, episode: currentSeason.episodes[currentEpIndex + 1] };
    } else {
      const nextSeasonIndex = video.seasons.findIndex(s => s.seasonNumber === currentSeason.seasonNumber) + 1;
      if (nextSeasonIndex < video.seasons.length) {
        const nextS = video.seasons[nextSeasonIndex];
        nextEpisode = { season: nextS, episode: nextS.episodes[0] };
      }
    }
  }

  const handleSelectEpisode = (ep: Episode, season: Season) => {
    setCurrentSeasonNum(season.seasonNumber);
    setCurrentEpisodeNum(ep.episodeNumber);
    setSearchParams({ season: String(season.seasonNumber), episode: String(ep.episodeNumber) });
  };

  const isFavorite = isInWatchlist(video.id);

  return (
    <PageTransition className="min-h-screen pt-16 sm:pt-20 pb-12">
      <div className={`mx-auto px-2.5 sm:px-6 transition-all duration-300 ${isTheaterMode ? 'max-w-[98%]' : 'max-w-6xl'}`}>
        {/* Top Back Nav & Title Indicator */}
        <div className="flex items-center justify-between gap-4 py-3 mb-2">
          <button
            onClick={() => navigate(`/movie/${video.id}`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Details &amp; Overview</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-300 truncate max-w-xs sm:max-w-md">
              {video.title} {isSeries && currentEpisode && `• S${currentSeasonNum}:E${currentEpisodeNum}`}
            </span>
          </div>
        </div>

        {/* 
          =======================================================================
          CORE STREAMING PLAYER COMPONENT
          =======================================================================
        */}
        <div className="w-full">
          <VideoPlayer
            video={video}
            currentEpisodeId={currentEpisode?.id}
            seasonNumber={currentSeasonNum}
            episodeNumber={currentEpisodeNum}
            activeVideoUrl={currentEpisode?.video_url}
            activeEmbedUrl={currentEpisode?.embed_url}
            activeSourceType={currentEpisode?.source_type}
            isTheaterMode={isTheaterMode}
            onToggleTheater={() => setIsTheaterMode(prev => !prev)}
          />
        </div>

        {/* 
          =======================================================================
          SERIES EPISODE CONTROLLER BAR (Previous / Next Episode)
          =======================================================================
        */}
        {isSeries && currentEpisode && (
          <div className="mt-4 p-4 rounded-2xl glass-red flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5 text-center sm:text-left">
              <span className="text-[11px] font-bold text-crimson-400 tracking-wider uppercase">
                Now Streaming
              </span>
              <h3 className="text-sm font-bold text-white dark:text-white light:text-neutral-900">
                Season {currentSeasonNum}, Episode {currentEpisodeNum}: {currentEpisode.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                disabled={!prevEpisode}
                onClick={() => prevEpisode && handleSelectEpisode(prevEpisode.episode, prevEpisode.season)}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <Button
                size="sm"
                variant="primary"
                disabled={!nextEpisode}
                onClick={() => nextEpisode && handleSelectEpisode(nextEpisode.episode, nextEpisode.season)}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Next Episode
              </Button>
            </div>
          </div>
        )}

        {/* 
          =======================================================================
          VIDEO INFO & EPISODES DRAWER
          =======================================================================
        */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Info Column */}
          <div className={`${isSeries ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col gap-4`}>
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 dark:border-white/10 light:border-black/10">
              <div className="flex flex-col gap-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white dark:text-white light:text-neutral-900">
                  {video.title}
                </h1>
                <div className="flex items-center gap-2.5 text-xs text-neutral-400">
                  <span>{video.year}</span>
                  <span>•</span>
                  <span>{video.duration}</span>
                  <span>•</span>
                  {video.quality && (
                    <Badge variant="quality" className="py-0 px-1.5 text-[10px]">
                      {video.quality}
                    </Badge>
                  )}
                  {video.rating && (
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {video.rating}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />}
                  onClick={() => toggleWatchlist(video)}
                >
                  {isFavorite ? 'Watchlisted' : 'Watchlist'}
                </Button>
              </div>
            </div>

            <p className="text-sm text-neutral-300 dark:text-neutral-400 light:text-neutral-700 leading-relaxed">
              {isSeries && currentEpisode ? currentEpisode.description : video.description}
            </p>

            {/* Keyboard shortcuts reminder */}
            <div className="hidden sm:flex p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-neutral-400 flex-wrap items-center gap-4">
              <span className="font-semibold text-neutral-300">Shortcuts:</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-black/40 text-neutral-300">Space</kbd> Play/Pause</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-black/40 text-neutral-300">F</kbd> Fullscreen</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-black/40 text-neutral-300">M</kbd> Mute</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-black/40 text-neutral-300">← / →</kbd> Seek ±10s</span>
            </div>
          </div>

          {/* Episode List Column (if Series) */}
          {isSeries && video.seasons && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <EpisodeList
                  seasons={video.seasons}
                  currentEpisodeId={currentEpisode?.id}
                  onSelectEpisode={handleSelectEpisode}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
