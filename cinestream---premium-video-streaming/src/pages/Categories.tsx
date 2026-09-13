import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { CategoryItem } from '../types';
import { PageTransition } from '../components/effects/PageTransition';
import {
  Rocket, Flame, Eye, HeartHandshake, Sparkles, Globe, Compass, Film, Laugh, Ghost,
  Music, Heart, Trophy, Swords, Mountain, Landmark, Users, Wand2, Fingerprint,
  Clapperboard, User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SkeletonCard } from '../components/ui/Skeleton';

/**
 * Backend har genre ke liye ek iconName bhejta hai (Backend/lib/normalize.js dekho).
 * Yaha use asli lucide icon se map karte hain; naya genre aaye to Film fallback.
 */
const ICONS: Record<string, LucideIcon> = {
  Rocket, Flame, Eye, HeartHandshake, Sparkles, Globe, Compass, Film, Laugh, Ghost,
  Music, Heart, Trophy, Swords, Mountain, Landmark, Users, Wand2, Fingerprint,
  Clapperboard, User,
};

export const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getIcon = (iconName: string) => {
    const Icon = ICONS[iconName] || Film;
    return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-crimson-400" />;
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await api.getCategories();
        if (isMounted) setCategories(data);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageTransition className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-crimson-400 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Curated Universes</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white dark:text-white light:text-neutral-900 tracking-tight">
          Explore by Category
        </h1>
        <p className="text-sm text-neutral-400 max-w-xl">
          Dive into tailored cinematic genres with customized color palettes, sound profiles, and streaming collections.
        </p>
      </div>

      {/* Grid of Category Visual Tiles */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} aspectRatio="aspect-[16/9]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => navigate(`/movies?genre=${encodeURIComponent(cat.name)}`)}
              className="group relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-crimson-500/50 shadow-xl transition-all duration-300 transform-gpu hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-crimson-600/20"
            >
              {/* Backdrop Artwork — na ho to gradient tile */}
              {cat.backdrop ? (
                <img
                  src={cat.backdrop}
                  alt={cat.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out brightness-[0.75] group-hover:brightness-90"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-crimson-700/60 via-wine-800/50 to-neutral-950" />
              )}

              {/* Multi-tier Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

              {/* Content Overlay */}
              <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between z-10">
                {/* Top Icon & Count Pill */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                    {getIcon(cat.iconName)}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10">
                    {cat.count} Videos
                  </span>
                </div>

                {/* Bottom Details */}
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg sm:text-xl font-display font-extrabold text-white tracking-tight group-hover:text-crimson-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-neutral-300/80 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
};
