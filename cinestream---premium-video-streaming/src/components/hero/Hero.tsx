import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Plus, Check, Star, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { HERO_BACKGROUND_IMAGE, HERO_CONFIG, HERO_FALLBACK_IMAGE, HERO_MOBILE_FOCUS } from '../../config/hero';
import { VideoItem } from '../../types';
import { useWatchlist } from '../../context/WatchlistContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface HeroProps {
  featuredVideo?: VideoItem;
}

export const Hero: React.FC<HeroProps> = ({ featuredVideo }) => {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Use featured video if passed, else default to hero config
  const videoId = featuredVideo?.id || HERO_CONFIG.featuredVideoId;
  const title = featuredVideo?.title || HERO_CONFIG.featuredTitle;
  const description = featuredVideo?.description || HERO_CONFIG.subtitle;
  const year = featuredVideo?.year || 2026;
  const rating = featuredVideo?.rating || 9.1;
  const duration = featuredVideo?.duration || '48m per episode';
  const quality = featuredVideo?.quality || '4K Ultra HD';
  const genre = featuredVideo?.genre || ['Sci-Fi', 'Space Opera'];

  // Config decide karta hai: fixed landing image ya featured video ka backdrop.
  const preferredImage = HERO_CONFIG.useFeaturedBackdrop
    ? featuredVideo?.backdrop || HERO_BACKGROUND_IMAGE
    : HERO_BACKGROUND_IMAGE;

  // Image load fail ho (file upload hi nahi hui) to chain me agla option.
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const bgImage =
    [preferredImage, featuredVideo?.backdrop, HERO_FALLBACK_IMAGE].find(
      (src): src is string => Boolean(src) && !failedImages.includes(src as string)
    ) || HERO_FALLBACK_IMAGE;

  // Mobile par character frame me rahe, desktop par center.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  const isWatchlisted = featuredVideo ? isInWatchlist(featuredVideo.id) : false;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  return (
    <div
      id="cinematic-hero-section"
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-[82svh] sm:min-h-[88svh] lg:min-h-[92svh] flex items-end md:items-center overflow-hidden select-none"
    >
      {/* Background group — dark mode me neeche se page me ghul jata hai (index.css .hero-bg-mask) */}
      <div className="absolute inset-0 z-0 bg-cinema-black hero-bg-mask" aria-hidden="true">
        {/* 
          =======================================================================
          LAYER 1: BACKGROUND IMAGE LAYER
          Replace the image easily in `src/config/hero.ts`
          =======================================================================
        */}
        <div className="absolute inset-0 z-0">
          <motion.img
            key={bgImage}
            src={bgImage}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
            onError={() => setFailedImages(prev => (prev.includes(bgImage) ? prev : [...prev, bgImage]))}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1.0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.05]"
            style={{
              objectPosition: isMobile ? HERO_MOBILE_FOCUS : 'center center',
              // parallax sirf desktop par — touch par mousemove hota hi nahi
              transform: isMobile
                ? undefined
                : `translate(${(mousePos.x - 0.5) * -12}px, ${(mousePos.y - 0.5) * -8}px)`,
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        {/* 
          =======================================================================
          LAYER 2: CINEMATIC DUAL GRADIENT OVERLAYS (Vignette, Depth, Readability)
          =======================================================================
        */}
        {/* Top navbar fade */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/85 via-black/20 to-transparent light:from-day-bg/80 light:via-day-bg/15 h-44 pointer-events-none" />

        {/* Bottom fade into main content shelf */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-cinema-black via-cinema-black/60 to-transparent pointer-events-none" />
          {/* Light mode: dark hero se blush page tak chhota, saaf transition */}
          <div className="absolute inset-0 z-[3] hidden light:block bg-[linear-gradient(to_top,var(--color-day-bg)_0%,transparent_14%)] pointer-events-none" />

        {/* Candle-light crimson glow — neeche-left se uthti garam roshni */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_75%_55%_at_15%_100%,rgba(220,20,60,0.32),transparent_70%)]" />

        {/* Radial soft vignette */}
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        {/* Left side directional contrast gradient */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-neutral-950/50 via-transparent to-transparent md:from-neutral-950/90 md:via-neutral-950/40 w-full md:w-3/4 pointer-events-none" />

        {/* 
          =======================================================================
          LAYER 3: DECORATIVE EFFECTS & AMBIENT PARTICLES
          =======================================================================
        */}
        <div
          className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-crimson-600/20 blur-[120px] pointer-events-none z-[2] transition-transform duration-700 ease-out hidden sm:block"
          style={{
            transform: `translate(${mousePos.x * 60}px, ${mousePos.y * 60}px)`,
          }}
        />
      </div>

      {/* 
        =======================================================================
        LAYER 4: FOREGROUND CONTENT (Hero Headline, Meta, Actions)
        =======================================================================
      */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-20 pb-16 light:pb-28 md:pb-16 md:light:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl flex flex-col gap-4 sm:gap-5"
        >
          {/* Category / Premiere Badge */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-crimson-600/85 to-wine-700/85 backdrop-blur-md text-white shadow-lg shadow-crimson-600/40 border border-crimson-300/30">
              <Heart className="w-3.5 h-3.5 fill-white animate-heartbeat" />
              {HERO_CONFIG.badgeText}
            </span>
            <Badge variant="quality">{quality}</Badge>
          </div>

          {/* Cinematic Large Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold italic tracking-tight text-white leading-[1.02] [text-shadow:0_2px_6px_rgba(0,0,0,0.6),0_8px_50px_rgba(220,20,60,0.55)]">
            {title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-neutral-300 font-medium">
            <div className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{rating} IMDb</span>
            </div>
            <span>•</span>
            <span>{year}</span>
            <span>•</span>
            <span>{duration}</span>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              {genre.slice(0, 2).map(g => (
                <span key={g} className="text-crimson-300">
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Subtitle / Description */}
          <p className="text-sm sm:text-base text-neutral-300/90 line-clamp-3 leading-relaxed max-w-xl drop-shadow-md">
            {description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-3">
            <Button
              variant="primary"
              size="lg"
              icon={<Play className="w-5 h-5 fill-white" />}
              onClick={() => navigate(`/watch/${videoId}`)}
              className="max-sm:px-5 shadow-xl shadow-crimson-600/40 animate-glow-pulse hover:scale-[1.02] active:scale-[0.98]"
            >
              Watch Now
            </Button>

            <Button
              variant="glass"
              size="lg"
              icon={<Info className="w-5 h-5" />}
              className="max-sm:px-5"
              onClick={() => navigate(`/movie/${videoId}`)}
            >
              Details
            </Button>

            {featuredVideo && (
              <Button
                variant="outline"
                size="icon"
                icon={isWatchlisted ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
                onClick={() => toggleWatchlist(featuredVideo)}
                title={isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
                aria-label="Add to Watchlist"
                className="rounded-xl border-white/20 hover:border-crimson-300/60 light:border-white/30! light:text-white! light:hover:bg-white/10!"
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
