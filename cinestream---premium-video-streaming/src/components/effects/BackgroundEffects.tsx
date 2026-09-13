import React from 'react';

/**
 * Poori site ke peeche ki ambient "candle-light" roshni.
 *
 * - Crimson / wine / rose orbs dheere-dheere drift karte hain (22–30s loops)
 * - Upar se halki warm light-leak, kinaron par vignette, aur film grain
 * - Sirf transform animate hota hai (GPU par sasta); prefers-reduced-motion
 *   par index.css animations band kar deta hai
 * - Mobile par orbs chhote aur kam blur — battery aur scroll smooth rahe
 */
export const BackgroundEffects: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Deep crimson glow — top left */}
      <div className="absolute -top-32 -left-32 w-[340px] h-[340px] md:w-[640px] md:h-[640px] rounded-full bg-crimson-600/20 dark:bg-crimson-600/20 light:bg-crimson-400/15 blur-[90px] md:blur-[140px] animate-drift" />

      {/* Wine glow — center right */}
      <div className="absolute top-1/3 -right-40 w-[320px] h-[320px] md:w-[580px] md:h-[580px] rounded-full bg-wine-700/25 dark:bg-wine-700/25 light:bg-wine-300/20 blur-[100px] md:blur-[150px] animate-drift-slow" />

      {/* Soft rose ember — bottom left */}
      <div className="hidden md:block absolute bottom-0 left-1/4 w-[520px] h-[520px] rounded-full bg-crimson-800/20 dark:bg-crimson-800/20 light:bg-crimson-200/25 blur-[160px] animate-drift [animation-delay:-11s]" />

      {/* Warm light-leak from the top edge */}
      <div className="absolute inset-x-0 top-0 h-[45vh] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(220,20,60,0.12),transparent_70%)] light:bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(220,20,60,0.06),transparent_70%)]" />

      {/* Cinematic edge vignette (sirf dark mode) */}
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(5,2,3,0.65)_100%)]" />

      {/* Fine film grain */}
      <div
        className="absolute inset-0 opacity-[0.04] light:opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,220,228,0.9) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
      />
    </div>
  );
};
