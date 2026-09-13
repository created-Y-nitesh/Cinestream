import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { VideoItem } from '../types';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { VideoRow } from '../components/video/VideoRow';
import { EpisodeList } from '../components/video/EpisodeList';
import { SkeletonDetails } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { PageTransition } from '../components/effects/PageTransition';
import {
  Play,
  Heart,
  Share2,
  Star,
  Clock,
  Calendar,
  Sparkles,
  Layers,
  ArrowLeft,
  Copy,
  Check,
  Film,
} from 'lucide-react';

export const VideoDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { showToast } = useToast();

  const [video, setVideo] = useState<VideoItem | null>(null);
  const [related, setRelated] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadVideo() {
      if (!id) return;
      setLoading(true);
      window.scrollTo(0, 0);

      try {
        const item = await api.getVideoById(id);
        if (isMounted && item) {
          setVideo(item);
          const relatedItems = await api.getRelated(item.id, item.genre);
          if (isMounted) setRelated(relatedItems);
        }
      } catch (err) {
        console.error('Failed to load video details', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadVideo();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <SkeletonDetails />;
  }

  if (!video) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto">
        <Film className="w-12 h-12 text-neutral-500 mb-3" />
        <h2 className="text-xl font-bold text-white mb-1">Video Not Found</h2>
        <p className="text-xs text-neutral-400 mb-4">
          The requested media item is unavailable or has expired.
        </p>
        <Button onClick={() => navigate('/movies')}>Browse Catalog</Button>
      </div>
    );
  }

  const isFavorite = isInWatchlist(video.id);

  const handleShare = async () => {
    const shareData = {
      title: video.title,
      text: video.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Shared successfully', 'success');
      } catch (err) {
        // User cancelled or share failed, fallback to modal
        setShareModalOpen(true);
      }
    } else {
      setShareModalOpen(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageTransition className="min-h-screen pb-20">
      {/* 
        =======================================================================
        TOP CINEMATIC BACKDROP BANNER
        =======================================================================
      */}
      <div className="relative w-full h-[44svh] sm:h-[60svh] lg:h-[65svh] overflow-hidden select-none bg-neutral-950">
        <img
          src={video.backdrop || video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover object-top filter brightness-[0.7] contrast-[1.05]"
        />

        {/* Back Button */}
        <div className="absolute top-20 left-4 sm:left-8 z-30">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>

        {/* Gradient Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent dark:from-cinema-black dark:via-cinema-black/60 light:from-day-bg light:via-day-bg/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-transparent to-transparent w-3/4" />
      </div>

      {/* 
        =======================================================================
        CONTENT SECTION: POSTER, METADATA & ACTIONS
        =======================================================================
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-40 lg:-mt-48 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 items-start">
          {/* Left: Poster Card */}
          <div className="col-span-1 hidden md:block">
            <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-neutral-900 sticky top-28">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Title, Badges, CTAs, Description, Cast */}
          <div className="col-span-1 md:col-span-3 flex flex-col gap-5">
            {/* Title & Type */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {video.quality && <Badge variant="quality">{video.quality}</Badge>}
                <Badge variant="default" className="capitalize">
                  {video.type}
                </Badge>
                {video.rating && (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/25">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{video.rating} IMDb</span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white dark:text-white light:text-neutral-900 tracking-tight leading-tight">
                {video.title}
              </h1>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-neutral-300 dark:text-neutral-400 light:text-neutral-600 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {video.year}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {video.duration}
                </span>
                {video.language && (
                  <>
                    <span>•</span>
                    <span>{video.language}</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons: Watch Now, Watchlist, Share */}
            <div className="flex flex-wrap items-center gap-3 py-2">
              <Button
                variant="primary"
                size="lg"
                icon={<Play className="w-5 h-5 fill-white" />}
                onClick={() => navigate(`/watch/${video.id}`)}
                className="shadow-xl shadow-crimson-600/35 flex-1 sm:flex-none min-w-[9rem]"
              >
                Watch Stream
              </Button>

              <Button
                variant="secondary"
                size="lg"
                icon={<Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />}
                onClick={() => toggleWatchlist(video)}
                className="flex-1 sm:flex-none min-w-[9rem]"
              >
                {isFavorite ? 'In Watchlist' : 'Add to Watchlist'}
              </Button>

              <Button
                variant="outline"
                size="icon"
                icon={<Share2 className="w-5 h-5" />}
                onClick={handleShare}
                title="Share video"
                aria-label="Share video"
              />
            </div>

            {/* Genre Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {video.genre.map(g => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 dark:bg-white/10 light:bg-neutral-200 text-neutral-200 dark:text-neutral-200 light:text-neutral-800"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Synopsis / Description */}
            <div className="flex flex-col gap-2 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                Synopsis
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 dark:text-neutral-300 light:text-neutral-700 leading-relaxed max-w-3xl">
                {video.description}
              </p>
            </div>

            {/* Cast & Crew if available */}
            {video.cast && video.cast.length > 0 && (
              <div className="flex flex-col gap-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Starring
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 dark:text-neutral-400 light:text-neutral-600">
                  {video.cast.join(', ')}
                </p>
              </div>
            )}

            {/* If Series, render Season & Episode Accordion */}
            {video.type === 'series' && video.seasons && (
              <div className="pt-6">
                <EpisodeList
                  seasons={video.seasons}
                  onSelectEpisode={(ep, season) => {
                    navigate(`/watch/${video.id}?season=${season.seasonNumber}&episode=${ep.episodeNumber}`);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Related Titles Shelf */}
        {related.length > 0 && (
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-white/10 dark:border-white/10 light:border-black/5 -mx-4 sm:-mx-6 lg:-mx-8">
            <VideoRow
              title="More Like This"
              subtitle={`Recommendations inspired by ${video.title}`}
              videos={related}
            />
          </div>
        )}
      </div>

      {/* Share Modal Dialog */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share this Title"
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs sm:text-sm text-neutral-300 dark:text-neutral-400 light:text-neutral-600">
            Share &ldquo;{video.title}&rdquo; with friends or save the direct stream link:
          </p>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 dark:bg-black/50 light:bg-neutral-100 border border-white/10">
            <input
              type="text"
              readOnly
              value={window.location.href}
              className="w-full bg-transparent text-xs text-neutral-300 font-mono focus:outline-none px-2 select-all"
            />
            <Button
              size="sm"
              variant="primary"
              onClick={handleCopyLink}
              icon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
};
