import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, AlertTriangle, Loader2, ShieldCheck, RotateCw, Maximize } from 'lucide-react';
import { formatGoogleDriveEmbedUrl, isSafeEmbedUrl } from '../../api/config';
import { Button } from '../ui/Button';

interface GoogleDrivePlayerProps {
  embedUrl: string;
  title: string;
  className?: string;
  onEnded?: () => void;
}

/**
 * Google Drive / YouTube iframe streaming player.
 *
 * Zaroori baatein:
 *  - Drive video sirf tabhi chalega jab file sharing "Anyone with the link" ho.
 *  - `allowFullScreen` + `allow="fullscreen"` dono chahiye, warna mobile par
 *    fullscreen button kaam nahi karta.
 *  - Yahan `sandbox` attribute jaan-boojh kar nahi lagaya gaya: sandbox lagane par
 *    Drive ka apna player mobile browsers me fullscreen aur quality control
 *    block kar deta hai. Security allowlist (isSafeEmbedUrl) se handle hoti hai.
 */
export const GoogleDrivePlayer: React.FC<GoogleDrivePlayerProps> = ({
  embedUrl,
  title,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  // Drive URLs ko /preview me normalize karo (/view?usp=sharing bhi chalega)
  const normalizedUrl = formatGoogleDriveEmbedUrl(embedUrl);
  const isSafe = isSafeEmbedUrl(normalizedUrl);

  // Naya video aane par player reset
  useEffect(() => {
    setLoading(true);
    setHasError(false);
  }, [normalizedUrl]);

  // Agar 20 sec me iframe load na ho to error state dikhao (silent black screen se behtar)
  useEffect(() => {
    if (!loading) return undefined;

    timeoutRef.current = window.setTimeout(() => {
      setLoading(false);
      setHasError(true);
    }, 20000);

    return () => window.clearTimeout(timeoutRef.current);
  }, [loading, reloadKey]);

  const retry = () => {
    setHasError(false);
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const goFullscreen = () => {
    const element = containerRef.current as (HTMLDivElement & {
      webkitRequestFullscreen?: () => void;
    }) | null;
    if (!element) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else if (element.requestFullscreen) {
      element.requestFullscreen().catch(() => undefined);
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
  };

  if (!normalizedUrl) {
    return (
      <div className="w-full aspect-video flex flex-col items-center justify-center p-6 text-center bg-neutral-900 rounded-2xl border border-white/10 text-neutral-300">
        <AlertTriangle className="w-9 h-9 text-amber-400 mb-3" />
        <h3 className="text-base font-semibold text-white mb-1">Stream link missing</h3>
        <p className="text-xs text-neutral-400 max-w-sm">
          Is title ke liye Google Sheet me <span className="font-mono text-neutral-300">drive_link</span> column khaali hai.
        </p>
      </div>
    );
  }

  if (!isSafe) {
    return (
      <div className="w-full aspect-video flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-neutral-900 rounded-2xl border border-rose-500/30 text-neutral-300">
        <AlertTriangle className="w-9 h-9 text-rose-400 mb-3" />
        <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Untrusted Video Source Blocked</h3>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-4">
          Security ke liye embed domains allowlist me hone chahiye
          (<span className="font-mono">VITE_ALLOWED_IFRAME_DOMAINS</span>).
        </p>
        <span className="text-[11px] font-mono text-rose-300 bg-rose-950/50 px-3 py-1 rounded border border-rose-500/20 max-w-full truncate">
          {normalizedUrl}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black border border-crimson-500/25 shadow-[0_30px_90px_-30px_rgba(220,20,60,0.55)] ${className}`}
    >
      {/* Loading Overlay */}
      {loading && !hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-neutral-950/90 backdrop-blur-sm gap-3 text-neutral-300 px-4 text-center">
          <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-crimson-500 animate-spin" />
          <span className="text-[11px] sm:text-xs font-medium tracking-wide">
            Stream connect ho raha hai…
          </span>
        </div>
      )}

      <iframe
        key={reloadKey}
        src={normalizedUrl}
        title={title || 'Video Stream'}
        // fullscreen dono jagah declare karna zaroori hai (Chrome mobile ke liye)
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
        allowFullScreen
        referrerPolicy="no-referrer"
        loading="eager"
        onLoad={() => {
          window.clearTimeout(timeoutRef.current);
          setLoading(false);
        }}
        onError={() => {
          setLoading(false);
          setHasError(true);
        }}
        className="w-full h-full border-0 relative z-0 bg-black"
      />

      {/* Top-right controls — mobile par bhi tap ho sake isliye hamesha visible */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex items-center gap-1.5 sm:gap-2 opacity-80 hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-black/70 backdrop-blur-md text-neutral-300 px-2.5 py-1 rounded-full border border-white/10">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Drive Stream
        </span>

        <button
          type="button"
          onClick={goFullscreen}
          className="p-2 rounded-full glass-ember hover:border-crimson-300/50 text-white transition-colors cursor-pointer"
          title="Fullscreen"
          aria-label="Fullscreen"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={retry}
          className="p-2 rounded-full glass-ember hover:border-crimson-300/50 text-white transition-colors cursor-pointer"
          title="Reload stream"
          aria-label="Reload stream"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <a
          href={embedUrl.replace('/preview', '/view')}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full glass-ember hover:border-crimson-300/50 text-white transition-colors"
          title="Open video in new tab"
          aria-label="Open source in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {hasError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 sm:p-6 bg-neutral-950/95 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
          <h4 className="text-sm sm:text-base font-semibold text-white">Playback shuru nahi ho paya</h4>
          <p className="text-[11px] sm:text-xs text-neutral-400 max-w-sm my-3 leading-relaxed">
            Drive file ki sharing <strong className="text-neutral-200">&ldquo;Anyone with the link — Viewer&rdquo;</strong> honi
            chahiye. Bahut bade ya abhi-abhi upload hue videos me Drive kuch der processing dikhata hai.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button size="sm" variant="primary" onClick={retry} icon={<RotateCw className="w-3.5 h-3.5" />}>
              Retry
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.open(embedUrl.replace('/preview', '/view'), '_blank', 'noopener')}
              icon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Drive me kholo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
