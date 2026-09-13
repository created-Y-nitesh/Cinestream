import { CategoryItem, FilterOptions, VideoItem } from '../types';
import { getApiBaseUrl, STORAGE_KEYS } from './config';
import { MOCK_CATEGORIES, MOCK_VIDEOS } from './mockData';

export interface BackendHealth {
  connected: boolean;
  status: string;
  baseUrl: string;
  isMock: boolean;
  latencyMs?: number;
  message?: string;
  videos?: number;
  categories?: number;
}

/** Last request ka error — Settings/Footer diagnostics me dikhaya ja sakta hai. */
let lastError: string | null = null;

export function getLastApiError(): string | null {
  return lastError;
}

/**
 * Mock data tabhi use hota hai jab koi backend URL set hi nahi hai
 * (ya user ne Settings se force kiya ho).
 */
export function isUsingMockData(): boolean {
  const forceMock = localStorage.getItem(STORAGE_KEYS.USE_MOCK_DATA);
  if (forceMock === 'true') return true;
  const baseUrl = getApiBaseUrl();
  return !baseUrl || baseUrl.trim() === '';
}

/**
 * Generic fetch wrapper — timeout + error handling ke saath.
 *
 * Note: yaha jaan-boojh kar 'Content-Type' header nahi bheja jata. GET request par
 * woh header CORS preflight (OPTIONS) trigger karta hai, jo har call ko slow
 * karta hai — mobile networks par saaf farak padta hai.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s — mobile data slow hota hai

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      throw new Error(`API Error [${res.status}]: ${res.statusText || 'Request failed'}`);
    }

    const data = await res.json();
    lastError = null;
    return data as T;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      lastError = 'Request timed out (12s). Backend slow hai ya reachable nahi.';
    } else {
      lastError = err instanceof Error ? err.message : 'Network request failed';
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Backend `{ success, data }` ya seedhi array — dono shapes handle karta hai. */
function unwrapList<T>(payload: T[] | { data: T[] } | null | undefined): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray((payload as { data: T[] }).data)) return (payload as { data: T[] }).data;
  return [];
}

function unwrapItem<T>(payload: T | { data: T } | null | undefined): T | null {
  if (!payload) return null;
  if (typeof payload === 'object' && payload !== null && 'data' in (payload as object)) {
    return ((payload as { data: T }).data) ?? null;
  }
  return payload as T;
}

/**
 * Backend down hone par kya return karein.
 *
 * Mock mode me mock data, warna KHAALI list — kyunki live site par asli catalog ki
 * jagah demo movies dikhana user ko confuse karta hai aur bug chhupa deta hai.
 */
function fallback<T>(mock: T, empty: T): T {
  return isUsingMockData() ? mock : empty;
}

/** Filter/sort helper — sirf mock mode ke liye (live me backend karta hai). */
function filterMockVideos(videos: VideoItem[], options: FilterOptions = {}): VideoItem[] {
  let result = [...videos];

  if (options.type && options.type !== 'all') {
    result = result.filter(v => v.type === options.type);
  }

  if (options.genre && options.genre.toLowerCase() !== 'all') {
    const gLower = options.genre.toLowerCase();
    result = result.filter(v => v.genre.some(g => g.toLowerCase().includes(gLower) || gLower.includes(g.toLowerCase())));
  }

  if (options.year) {
    const yr = Number(options.year);
    if (!isNaN(yr)) {
      result = result.filter(v => v.year === yr);
    }
  }

  if (options.quality && options.quality !== 'all') {
    result = result.filter(v => v.quality?.toLowerCase().includes(options.quality!.toLowerCase()));
  }

  if (options.language && options.language !== 'all') {
    result = result.filter(v => v.language?.toLowerCase().includes(options.language!.toLowerCase()));
  }

  if (options.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    result = result.filter(v =>
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.genre.some(g => g.toLowerCase().includes(q)) ||
      v.tags?.some(t => t.toLowerCase().includes(q)) ||
      v.cast?.some(c => c.toLowerCase().includes(q))
    );
  }

  if (options.sortBy) {
    switch (options.sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'popular':
      default:
        result.sort((a, b) => ((b.trending ? 1 : 0) - (a.trending ? 1 : 0)));
        break;
    }
  }

  return result;
}

/**
 * API Service
 *
 * Backend URL set ho to sab kuch server se aata hai (Google Sheet -> Vercel API).
 * URL na ho to poori site mock data par chalti hai — design preview ke liye.
 */
export const api = {
  /** Backend health check (Settings page par dikhta hai) */
  async checkHealth(): Promise<BackendHealth> {
    const baseUrl = getApiBaseUrl();

    if (!baseUrl) {
      return {
        connected: false,
        status: 'Mock Mode Active',
        baseUrl: 'Local Mock Store',
        isMock: true,
        message: 'VITE_API_BASE_URL set nahi hai. Site mock data par chal rahi hai.',
      };
    }

    const start = performance.now();
    try {
      const res = await request<{ status?: string; videos?: number; categories?: number; message?: string }>('/health');
      return {
        connected: true,
        status: 'Online',
        baseUrl,
        isMock: false,
        latencyMs: Math.round(performance.now() - start),
        videos: res?.videos,
        categories: res?.categories,
        message: res?.message || 'Backend se connected.',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      return {
        connected: false,
        status: 'Offline / CORS Blocked',
        baseUrl,
        isMock: false,
        message: msg,
      };
    }
  },

  /** Videos list — filters + sorting ke saath */
  async getVideos(options: FilterOptions = {}): Promise<VideoItem[]> {
    if (isUsingMockData()) {
      return filterMockVideos(MOCK_VIDEOS, options);
    }

    try {
      const queryParams = new URLSearchParams();
      if (options.type && options.type !== 'all') queryParams.append('type', options.type);
      if (options.genre && options.genre.toLowerCase() !== 'all') queryParams.append('genre', options.genre);
      if (options.year) queryParams.append('year', String(options.year));
      if (options.quality) queryParams.append('quality', options.quality);
      if (options.language) queryParams.append('language', options.language);
      if (options.sortBy) queryParams.append('sort_by', options.sortBy);
      if (options.search) queryParams.append('q', options.search);

      const qs = queryParams.toString();
      const data = await request<VideoItem[] | { data: VideoItem[] }>(`/videos${qs ? `?${qs}` : ''}`);
      return unwrapList(data);
    } catch (err) {
      console.warn('[api] /videos fail:', err);
      return fallback(filterMockVideos(MOCK_VIDEOS, options), []);
    }
  },

  /** Ek video (series ho to seasons + episodes ke saath) */
  async getVideoById(id: string): Promise<VideoItem | null> {
    if (isUsingMockData()) {
      return MOCK_VIDEOS.find(v => v.id === id) || null;
    }

    try {
      const data = await request<VideoItem | { data: VideoItem }>(`/videos/${encodeURIComponent(id)}`);
      return unwrapItem(data);
    } catch (err) {
      console.warn(`[api] /videos/${id} fail:`, err);
      return fallback(MOCK_VIDEOS.find(v => v.id === id) || null, null);
    }
  },

  /** Hero banner ke liye featured titles */
  async getFeatured(): Promise<VideoItem[]> {
    if (isUsingMockData()) {
      return MOCK_VIDEOS.filter(v => v.featured);
    }

    try {
      return unwrapList(await request<VideoItem[] | { data: VideoItem[] }>('/videos/featured'));
    } catch {
      return fallback(MOCK_VIDEOS.filter(v => v.featured), []);
    }
  },

  async getTrending(): Promise<VideoItem[]> {
    if (isUsingMockData()) {
      return MOCK_VIDEOS.filter(v => v.trending);
    }

    try {
      return unwrapList(await request<VideoItem[] | { data: VideoItem[] }>('/videos/trending'));
    } catch {
      return fallback(MOCK_VIDEOS.filter(v => v.trending), []);
    }
  },

  async getRecentlyAdded(): Promise<VideoItem[]> {
    if (isUsingMockData()) {
      return [...MOCK_VIDEOS].sort((a, b) => b.year - a.year);
    }

    try {
      return unwrapList(await request<VideoItem[] | { data: VideoItem[] }>('/videos/recent'));
    } catch {
      return fallback([...MOCK_VIDEOS].sort((a, b) => b.year - a.year), []);
    }
  },

  async getPopular(): Promise<VideoItem[]> {
    if (isUsingMockData()) {
      return [...MOCK_VIDEOS].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    try {
      return unwrapList(await request<VideoItem[] | { data: VideoItem[] }>('/videos/popular'));
    } catch {
      return fallback([...MOCK_VIDEOS].sort((a, b) => (b.rating || 0) - (a.rating || 0)), []);
    }
  },

  async getCategories(): Promise<CategoryItem[]> {
    if (isUsingMockData()) {
      return MOCK_CATEGORIES;
    }

    try {
      return unwrapList(await request<CategoryItem[] | { data: CategoryItem[] }>('/categories'));
    } catch {
      return fallback(MOCK_CATEGORIES, []);
    }
  },

  async search(query: string): Promise<VideoItem[]> {
    if (!query || !query.trim()) return [];

    if (isUsingMockData()) {
      return filterMockVideos(MOCK_VIDEOS, { search: query });
    }

    try {
      return unwrapList(await request<VideoItem[] | { data: VideoItem[] }>(`/search?q=${encodeURIComponent(query)}`));
    } catch {
      return fallback(filterMockVideos(MOCK_VIDEOS, { search: query }), []);
    }
  },

  async getRelated(videoId: string, genres: string[] = []): Promise<VideoItem[]> {
    if (isUsingMockData()) {
      return MOCK_VIDEOS.filter(v => v.id !== videoId && v.genre.some(g => genres.includes(g))).slice(0, 6);
    }

    try {
      return unwrapList(
        await request<VideoItem[] | { data: VideoItem[] }>(`/videos/${encodeURIComponent(videoId)}/related`)
      );
    } catch {
      return fallback(
        MOCK_VIDEOS.filter(v => v.id !== videoId && v.genre.some(g => genres.includes(g))).slice(0, 6),
        []
      );
    }
  },
};
