/**
 * =========================================================================
 * HERO BACKGROUND CONFIGURATION
 * =========================================================================
 * 
 * Replace this image with your final landing-page background!
 * 
 * Instructions:
 * 1. You can drop your image into `public/hero-background.jpg` or `src/assets/hero-background.jpg`
 * 2. Or update `HERO_BACKGROUND_IMAGE` below with your custom URL or asset import.
 * 
 * The Hero component will automatically layer:
 *  - Background Image Layer
 *  - Cinematic Dual Gradient Vignette
 *  - Blur / Ambient Glow
 *  - Particle Canvas
 *  - Interactive Foreground Typography & CTAs
 * =========================================================================
 */

/**
 * Landing page ki background image.
 * File yaha rakho:  public/hero-background.jpg
 * (build ke baad yeh dist/hero-background.jpg ban jati hai -> htdocs/ me upload)
 *
 * Image badalte waqt naam same rakho to HERO_IMAGE_VERSION +1 kar dena,
 * warna browsers purani image cache se dikhate rahenge.
 */
const HERO_IMAGE_VERSION = 1;
export const HERO_BACKGROUND_IMAGE = `/hero-background.jpg?v=${HERO_IMAGE_VERSION}`;

/** Local file na mile to yeh dikhegi (site kabhi blank na lage). */
export const HERO_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=2560&q=85';

/**
 * Mobile (portrait) par image ka kaunsa hissa dikhe — "x% y%".
 * Tumhari image me character right side (~68%) par hai, isliye center crop
 * karne par woh kat jata. Desktop par poori image fit hoti hai.
 */
export const HERO_MOBILE_FOCUS = '68% 30%';

export const HERO_CONFIG = {
  headline: "Unlimited Cinema, Infinite Horizons",
  subtitle: "Stream award-winning cinema, original interstellar series, and documentaries in crisp 4K Ultra HD. Seamless Google Drive integration with zero buffering.",
  primaryCtaText: "Start Watching Now",
  secondaryCtaText: "Explore Catalog",
  badgeText: "Tonight's Premiere",
  featuredTitle: "Chronicles of the Void: Episode VI",
  featuredMeta: "2026 • Sci-Fi • 4K HDR • 8.9 IMDb",
  featuredVideoId: "vid-scifi-01",

  /**
   * false = hamesha upar wali HERO_BACKGROUND_IMAGE dikhe (landing page ki fixed image).
   * true  = sheet ke featured video ka backdrop dikhe; image sirf fallback.
   */
  useFeaturedBackdrop: false,
};
