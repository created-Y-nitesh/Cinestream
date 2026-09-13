import React, { useState } from 'react';
import { Film } from 'lucide-react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string; // e.g. 'aspect-video' or 'aspect-[2/3]'
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  aspectRatio = 'aspect-video',
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-neutral-900/40 dark:bg-cinema-surface light:bg-neutral-200 ${aspectRatio} ${containerClassName}`}>
      {/* Loading Shimmer */}
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-neutral-800/40 via-neutral-700/20 to-neutral-800/40 dark:from-white/5 dark:via-white/10 dark:to-white/5 light:from-black/5 light:via-black/10 light:to-black/5" />
      )}

      {/* Fallback Display if image fails to load */}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-neutral-800 to-neutral-900 text-neutral-400">
          <Film className="w-8 h-8 opacity-40 mb-2" />
          <span className="text-xs line-clamp-2 font-medium opacity-75">{alt || 'Media Preview'}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
};
