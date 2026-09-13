import React from 'react';

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`animate-pulse rounded-lg bg-white/5 dark:bg-white/5 light:bg-black/5 ${className}`}
  />
);

export const SkeletonCard: React.FC<{ aspectRatio?: string }> = ({ aspectRatio = 'aspect-[16/10]' }) => (
  <div className="flex flex-col gap-2.5 w-full">
    <div className={`w-full rounded-xl overflow-hidden bg-neutral-800/40 dark:bg-white/5 light:bg-black/5 animate-pulse ${aspectRatio}`} />
    <div className="flex flex-col gap-1.5 px-0.5">
      <SkeletonBox className="h-4 w-3/4" />
      <div className="flex items-center gap-2">
        <SkeletonBox className="h-3 w-12" />
        <SkeletonBox className="h-3 w-16" />
        <SkeletonBox className="h-3 w-10" />
      </div>
    </div>
  </div>
);

export const SkeletonHero: React.FC = () => (
  <div className="relative w-full min-h-[75vh] flex items-end pb-16 px-6 sm:px-12 bg-neutral-900/60 dark:bg-cinema-surface/60 light:bg-neutral-200/80 animate-pulse">
    <div className="max-w-2xl w-full flex flex-col gap-4">
      <SkeletonBox className="h-6 w-36 rounded-full" />
      <SkeletonBox className="h-12 w-4/5" />
      <SkeletonBox className="h-5 w-full" />
      <SkeletonBox className="h-5 w-2/3" />
      <div className="flex gap-4 pt-4">
        <SkeletonBox className="h-12 w-40 rounded-xl" />
        <SkeletonBox className="h-12 w-32 rounded-xl" />
      </div>
    </div>
  </div>
);

export const SkeletonDetails: React.FC = () => (
  <div className="w-full min-h-screen pt-24 pb-16 px-4 sm:px-12 max-w-7xl mx-auto flex flex-col gap-8">
    <SkeletonBox className="w-full h-80 rounded-2xl" />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="col-span-1">
        <SkeletonBox className="aspect-[2/3] w-full rounded-xl" />
      </div>
      <div className="col-span-3 flex flex-col gap-4">
        <SkeletonBox className="h-10 w-2/3" />
        <div className="flex gap-2">
          <SkeletonBox className="h-6 w-16" />
          <SkeletonBox className="h-6 w-16" />
          <SkeletonBox className="h-6 w-20" />
        </div>
        <SkeletonBox className="h-24 w-full" />
        <div className="flex gap-4 pt-4">
          <SkeletonBox className="h-12 w-36 rounded-xl" />
          <SkeletonBox className="h-12 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonPlayer: React.FC = () => (
  <div className="w-full max-w-6xl mx-auto pt-20 px-4 flex flex-col gap-6">
    <SkeletonBox className="w-full aspect-video rounded-2xl" />
    <div className="flex justify-between items-center">
      <div className="flex flex-col gap-2 w-1/2">
        <SkeletonBox className="h-7 w-3/4" />
        <SkeletonBox className="h-4 w-1/3" />
      </div>
      <div className="flex gap-3">
        <SkeletonBox className="h-10 w-24 rounded-lg" />
        <SkeletonBox className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  </div>
);
