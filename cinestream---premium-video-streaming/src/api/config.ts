/**
 * Centralized API & Player Configuration
 *
 * The frontend communicates with your FastAPI backend through this single point.
 * In development or when no backend URL is set, the API client automatically
 * falls back to high-fidelity mock data.
 */

// Central API Base URL from environment variable
export const DEFAULT_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string || '').trim().replace(/\/+$/, '');

// LocalStorage key to allow testing different backend URLs dynamically from the UI Settings
export const STORAGE_KEYS = {
  THEME: 'cinestream_theme',
  WATCHLIST: 'cinestream_watchlist',
  WATCH_HISTORY: 'cinestream_history',
  SETTINGS: 'cinestream_user_settings',
  CUSTOM_API_URL: 'cinestream_custom_api_url',
  USE_MOCK_DATA: 'cinestream_use_mock_data',
} as const;

// Read dynamic or environment base URL
export function getApiBaseUrl(): string {
  const customUrl = localStorage.getItem(STORAGE_KEYS.CUSTOM_API_URL);
  if (customUrl !== null && customUrl.trim() !== '') {
    return customUrl.trim().replace(/\/+$/, '');
  }
  return DEFAULT_API_BASE_URL;
}

// Configurable trusted domains for iframe video embedding (Google Drive, YouTube, Vimeo, etc.)
const defaultAllowedDomains = [
  'drive.google.com',
  'docs.google.com',
  'drive.usercontent.google.com',
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
];

const envAllowed = (import.meta.env.VITE_ALLOWED_IFRAME_DOMAINS as string || '')
  .split(',')
  .map((d: string) => d.trim().toLowerCase())
  .filter(Boolean);

export const ALLOWED_IFRAME_DOMAINS = Array.from(new Set([...defaultAllowedDomains, ...envAllowed]));

/**
 * Validates if a video embed URL is safe to render in an iframe
 */
export function isSafeEmbedUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_IFRAME_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

/**
 * Normalizes Google Drive sharing links into embeddable /preview links
 * e.g. https://drive.google.com/file/d/FILE_ID/view?usp=sharing -> https://drive.google.com/file/d/FILE_ID/preview
 */
export function formatGoogleDriveEmbedUrl(url: string): string {
  if (!url) return '';
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
  }
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://drive.google.com/file/d/${idParamMatch[1]}/preview`;
  }
  return url;
}
