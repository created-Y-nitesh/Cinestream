/**
 * Google Sheet se data laata hai aur ready catalog banata hai.
 *
 * Do modes:
 *  1. APPS_SCRIPT_URL set hai  -> Apps Script Web App se JSON (private sheet chalti hai)
 *  2. warna SHEET_ID           -> gviz CSV export (sheet "Anyone with the link: Viewer" honi chahiye)
 *
 * Result memory me cache hota hai (CACHE_TTL_SECONDS), isliye har request par
 * Google ko hit nahi karta — Vercel ke warm instances par yeh bahut fast hai.
 */

import { config, isConfigured, sourceLabel } from './config.js';
import { csvToObjects, objectsToNormalized } from './csv.js';
import {
  attachEpisodes,
  deriveCategories,
  isPublished,
  rowToCategory,
  rowToEpisode,
  rowToVideo,
} from './normalize.js';

const FETCH_TIMEOUT_MS = 10000;

/** In-memory cache (warm lambda / local server ke beech reuse hota hai). */
let cache = {
  data: null,
  expiresAt: 0,
  fetchedAt: 0,
};

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal, redirect: 'follow' });
  } finally {
    clearTimeout(timer);
  }
}

function gvizUrl(sheetName) {
  const base = `https://docs.google.com/spreadsheets/d/${config.sheetId}/gviz/tq`;
  return `${base}?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

/** Ek tab ko CSV ke roop me padhta hai. Tab na mile to [] return karta hai (crash nahi). */
async function fetchSheetCsv(sheetName) {
  const response = await fetchWithTimeout(gvizUrl(sheetName));

  if (!response.ok) {
    if (response.status === 400 || response.status === 404) return []; // tab exist nahi karta
    throw new Error(`Google Sheet "${sheetName}" fetch fail (HTTP ${response.status}). Sheet sharing "Anyone with the link" par set hai?`);
  }

  const text = await response.text();

  // Google kabhi-kabhi error ko HTML/JS payload me bhejta hai.
  if (/^\s*</.test(text) || text.startsWith('/*O_o*/')) return [];

  return csvToObjects(text);
}

/** Apps Script Web App se poora catalog ek hi call me. */
async function fetchFromAppsScript() {
  const url = new URL(config.appsScriptUrl);
  if (config.appsScriptKey) url.searchParams.set('key', config.appsScriptKey);

  const response = await fetchWithTimeout(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Apps Script fetch fail (HTTP ${response.status}). Web App "Anyone" access ke saath deploy hui hai?`);
  }

  const payload = await response.json();

  if (payload && payload.error) {
    throw new Error(`Apps Script error: ${payload.error}`);
  }

  return {
    videos: objectsToNormalized(payload.videos || payload.movies || payload.data || []),
    episodes: objectsToNormalized(payload.episodes || []),
    categories: objectsToNormalized(payload.categories || []),
  };
}

/** Dono modes ka raw row data ek jaisa bana kar deta hai. */
async function fetchRawRows() {
  if (config.appsScriptUrl) {
    return fetchFromAppsScript();
  }

  const [videos, episodes, categories] = await Promise.all([
    fetchSheetCsv(config.videosSheet),
    fetchSheetCsv(config.episodesSheet),
    fetchSheetCsv(config.categoriesSheet),
  ]);

  return { videos, episodes, categories };
}

/** Raw rows -> saaf catalog { videos, categories }. */
function buildCatalog(raw) {
  const videos = attachEpisodes(
    raw.videos
      .filter(isPublished)
      .map(rowToVideo)
      .filter(Boolean),
    raw.episodes
      .filter(isPublished)
      .map(rowToEpisode)
      .filter(Boolean),
  );

  // Duplicate ids hatao — pehli entry jeetegi.
  const seen = new Set();
  const uniqueVideos = videos.filter((video) => {
    if (seen.has(video.id)) return false;
    seen.add(video.id);
    return true;
  });

  const sheetCategories = raw.categories
    .filter(isPublished)
    .map(rowToCategory)
    .filter(Boolean);

  const categories = sheetCategories.length > 0 ? sheetCategories : deriveCategories(uniqueVideos);

  return { videos: uniqueVideos, categories };
}

/**
 * Catalog do — cache se ya Google se.
 * @param {boolean} force cache ignore karke fresh fetch
 */
export async function getCatalog(force = false) {
  const now = Date.now();

  if (!force && cache.data && cache.expiresAt > now) {
    return { ...cache.data, cached: true, fetchedAt: cache.fetchedAt };
  }

  if (!isConfigured()) {
    throw new Error('SHEET_ID ya APPS_SCRIPT_URL environment variable set nahi hai.');
  }

  try {
    const raw = await fetchRawRows();
    const catalog = buildCatalog(raw);

    cache = {
      data: catalog,
      expiresAt: now + config.cacheTtlSeconds * 1000,
      fetchedAt: now,
    };

    return { ...catalog, cached: false, fetchedAt: now };
  } catch (error) {
    // Google down ho to purana cache serve karna site down hone se behtar hai.
    if (cache.data) {
      return { ...cache.data, cached: true, stale: true, fetchedAt: cache.fetchedAt };
    }
    throw error;
  }
}

export function clearCache() {
  cache = { data: null, expiresAt: 0, fetchedAt: 0 };
}

export function cacheInfo() {
  return {
    source: sourceLabel(),
    hasCache: Boolean(cache.data),
    fetchedAt: cache.fetchedAt ? new Date(cache.fetchedAt).toISOString() : null,
    expiresInSeconds: cache.data ? Math.max(0, Math.round((cache.expiresAt - Date.now()) / 1000)) : 0,
    ttlSeconds: config.cacheTtlSeconds,
  };
}
