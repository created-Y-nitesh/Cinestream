import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { VideoItem, CategoryItem } from '../types';
import { Hero } from '../components/hero/Hero';
import { VideoRow } from '../components/video/VideoRow';
import { SkeletonHero, SkeletonCard } from '../components/ui/Skeleton';
import { PageTransition } from '../components/effects/PageTransition';
import { useWatchHistory } from '../context/WatchHistoryContext';
import { useNavigate } from 'react-router-dom';
import { Flame, Sparkles, TrendingUp, Play, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { history } = useWatchHistory();

  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState<VideoItem[]>([]);
  const [trending, setTrending] = useState<VideoItem[]>([]);
  const [movies, setMovies] = useState<VideoItem[]>([]);
  const [series, setSeries] = useState<VideoItem[]>([]);
  const [popular, setPopular] = useState<VideoItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeContent() {
      try {
        setLoading(true);
        const [featData, trendData, movData, serData, popData, catData] = await Promise.all([
          api.getFeatured(),
          api.getTrending(),
          api.getVideos({ type: 'movie' }),
          api.getVideos({ type: 'series' }),
          api.getPopular(),
          api.getCategories(),
        ]);

        if (isMounted) {
          setFeatured(featData);
          setTrending(trendData);
          setMovies(movData);
          setSeries(serData);
          setPopular(popData);
          setCategories(catData);
        }
      } catch (err) {
        console.error('Failed to load home page content', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHomeContent();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen">
        <SkeletonHero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  const primaryFeatured = featured[0] || trending[0];

  return (
    <PageTransition className="w-full min-h-screen flex flex-col">
      {/* 1. Cinematic Hero Section */}
      <Hero featuredVideo={primaryFeatured} />

      {/* 2. Content Shelves */}
      <div className="relative z-20 flex flex-col gap-8 -mt-8 sm:-mt-12">
        {/* Continue Watching (if history exists) */}
        {history.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white dark:text-white light:text-neutral-900 flex items-center gap-2">
                <span>Continue Watching</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {history.slice(0, 4).map(item => {
                const progressPercent = (item.progressSeconds / (item.totalSeconds || 1)) * 100;

                return (
                  <div
                    key={item.videoId}
                    onClick={() => navigate(`/watch/${item.videoId}`)}
                    className="group relative rounded-xl overflow-hidden glass-soft hover:border-crimson-400/50 transition-all cursor-pointer shadow-lg"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={item.thumbnail}
                        alt={item.videoTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-3 rounded-full bg-crimson-600 text-white shadow-lg">
                          <Play className="w-4 h-4 fill-white translate-x-0.5" />
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div
                          className="h-full bg-crimson-500"
                          style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-3 flex justify-between items-center text-xs">
                      <span className="font-medium text-white light:text-neutral-900 truncate max-w-[70%]">
                        {item.videoTitle}
                      </span>
                      <span className="text-neutral-400">
                        {Math.floor(progressPercent)}% watched
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Trending Now */}
        <VideoRow
          title="Trending Now"
          subtitle="Stories everyone is falling for this week"
          videos={trending}
          cardWidth="w-56 xs:w-64 sm:w-72 md:w-80"
        />

        {/* Visual Category Tiles Preview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white dark:text-white light:text-neutral-900">
                Explore Genres
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                Choose the mood for tonight
              </p>
            </div>
            <button
              onClick={() => navigate('/categories')}
              className="text-xs font-semibold text-crimson-400 hover:text-crimson-300 flex items-center gap-1 cursor-pointer"
            >
              <span>All Genres</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.slice(0, 6).map(cat => (
              <div
                key={cat.id}
                onClick={() => navigate(`/movies?genre=${encodeURIComponent(cat.name)}`)}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-crimson-500/50 transition-all duration-300 shadow-md hover:-translate-y-1 hover:shadow-xl hover:shadow-crimson-600/20"
              >
                {cat.backdrop ? (
                  <img
                    src={cat.backdrop}
                    alt={cat.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-75"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-crimson-700/50 via-wine-800/40 to-neutral-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 p-3 flex flex-col justify-end text-white">
                  <h3 className="text-xs sm:text-sm font-bold tracking-tight group-hover:text-crimson-300 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-neutral-400">
                    {cat.count} Titles
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Films & Movies */}
        <VideoRow
          title="Movies to Fall For"
          subtitle="Passion, heartbreak and unforgettable nights"
          videos={movies}
          cardWidth="w-40 xs:w-44 sm:w-60 md:w-72"
        />

        {/* Episodic TV & Web Series */}
        <VideoRow
          title="Series Worth Staying Up For"
          subtitle="Slow-burn stories, one episode at a time"
          videos={series}
          cardWidth="w-40 xs:w-44 sm:w-60 md:w-72"
        />

        {/* Popular & Top Rated */}
        <VideoRow
          title="Most Loved"
          subtitle="The highest-rated stories in the collection"
          videos={popular}
          cardWidth="w-40 xs:w-44 sm:w-60 md:w-72"
        />
      </div>
    </PageTransition>
  );
};
