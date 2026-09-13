/**
 * CineStream API — Vercel Serverless Function (single entry point).
 *
 * vercel.json saari requests yaha rewrite karta hai, isliye routing yahi hoti hai.
 *
 * Endpoints (frontend src/api/client.ts ke hisaab se):
 *   GET /health                 -> service + sheet status
 *   GET /videos                 -> ?type&genre&year&quality&language&sort_by&q&limit&page
 *   GET /videos/featured        -> hero banner ke liye
 *   GET /videos/trending
 *   GET /videos/recent
 *   GET /videos/popular
 *   GET /videos/:id             -> ek video (series ho to seasons+episodes ke saath)
 *   GET /videos/:id/related
 *   GET /categories
 *   GET /search?q=...
 *   GET /refresh?key=ADMIN_KEY  -> cache turant clear (sheet update karne ke baad)
 */

import { config, isConfigured, sourceLabel } from '../lib/config.js';
import { handlePreflight, sendError, sendOk, sendJson } from '../lib/http.js';
import { cacheInfo, clearCache, getCatalog } from '../lib/sheets.js';
import { stripInternal } from '../lib/normalize.js';
import { filterVideos, relatedVideos, sortByRecent, sortVideos } from '../lib/query.js';

/** CDN cache — list endpoints thodi der cache ho sakti hain. */
const LIST_CACHE_SECONDS = 60;

function clean(list) {
  return list.map(stripInternal);
}

function paginate(list, query) {
  const limit = Number(query.limit);
  const page = Number(query.page);

  if (!Number.isFinite(limit) || limit <= 0) return { items: list, page: 1, perPage: list.length };

  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const start = (currentPage - 1) * limit;

  return { items: list.slice(start, start + limit), page: currentPage, perPage: limit };
}

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendError(req, res, 405, `Method ${req.method} allowed nahi hai. Sirf GET use karein.`);
  }

  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const query = Object.fromEntries(url.searchParams.entries());

  // "/videos/abc/related" -> ["videos", "abc", "related"]
  const segments = url.pathname.split('/').filter(Boolean);
  const [root, second, third] = segments;

  try {
    // ---------------------------------------------------------------- root
    if (segments.length === 0) {
      return sendOk(req, res, {
        name: 'CineStream API',
        version: '1.0.0',
        source: sourceLabel(),
        endpoints: [
          '/health',
          '/videos',
          '/videos/featured',
          '/videos/trending',
          '/videos/recent',
          '/videos/popular',
          '/videos/:id',
          '/videos/:id/related',
          '/categories',
          '/search?q=',
        ],
      });
    }

    // -------------------------------------------------------------- /health
    if (root === 'health' || root === 'healthz') {
      if (!isConfigured()) {
        return sendJson(req, res, 503, {
          success: false,
          status: 'misconfigured',
          message: 'SHEET_ID ya APPS_SCRIPT_URL environment variable set nahi hai.',
          source: sourceLabel(),
        });
      }

      const started = Date.now();
      const catalog = await getCatalog();

      return sendJson(req, res, 200, {
        success: true,
        status: 'ok',
        message: 'Google Sheet se connected.',
        source: sourceLabel(),
        videos: catalog.videos.length,
        series: catalog.videos.filter((video) => video.type === 'series').length,
        categories: catalog.categories.length,
        latencyMs: Date.now() - started,
        cache: cacheInfo(),
        stale: Boolean(catalog.stale),
      });
    }

    // ------------------------------------------------------------- /refresh
    if (root === 'refresh') {
      if (config.adminKey && query.key !== config.adminKey && req.headers['x-admin-key'] !== config.adminKey) {
        return sendError(req, res, 401, 'Galat admin key.');
      }
      clearCache();
      const catalog = await getCatalog(true);
      return sendOk(req, res, { refreshed: true, videos: catalog.videos.length, categories: catalog.categories.length });
    }

    // Baaki sab endpoints ko catalog chahiye.
    const catalog = await getCatalog();
    const { videos, categories } = catalog;

    // ----------------------------------------------------------- /categories
    if (root === 'categories') {
      return sendOk(req, res, clean(categories), { total: categories.length }, { cacheSeconds: LIST_CACHE_SECONDS });
    }

    // --------------------------------------------------------------- /search
    if (root === 'search') {
      const q = query.q || query.query || '';
      if (!q.trim()) return sendOk(req, res, [], { total: 0 });

      const results = filterVideos(videos, { search: q, sortBy: query.sort_by });
      return sendOk(req, res, clean(results), { total: results.length, query: q }, { cacheSeconds: LIST_CACHE_SECONDS });
    }

    // --------------------------------------------------------------- /videos
    if (root === 'videos' || root === 'movies' || root === 'series') {
      // /videos/featured | trending | recent | popular
      if (second && ['featured', 'trending', 'recent', 'latest', 'popular', 'new'].includes(second)) {
        let list;

        if (second === 'featured') {
          list = videos.filter((video) => video.featured);
          if (list.length === 0) list = sortVideos(videos, 'rating').slice(0, 5); // fallback: hero khaali na rahe
        } else if (second === 'trending') {
          list = videos.filter((video) => video.trending);
          if (list.length === 0) list = sortVideos(videos, 'rating').slice(0, 12);
        } else if (second === 'recent' || second === 'latest' || second === 'new') {
          list = sortByRecent(videos);
        } else {
          list = sortVideos(videos, 'rating');
        }

        const { items, page, perPage } = paginate(list, query);
        return sendOk(req, res, clean(items), { total: list.length, page, per_page: perPage }, { cacheSeconds: LIST_CACHE_SECONDS });
      }

      // /videos/:id  aur  /videos/:id/related
      if (second) {
        const video = videos.find((item) => item.id === second) ||
          videos.find((item) => item.id.toLowerCase() === second.toLowerCase());

        if (!video) {
          return sendError(req, res, 404, `Video "${second}" nahi mila.`);
        }

        if (third === 'related') {
          const related = relatedVideos(videos, video);
          return sendOk(req, res, clean(related), { total: related.length }, { cacheSeconds: LIST_CACHE_SECONDS });
        }

        return sendOk(req, res, stripInternal(video), {}, { cacheSeconds: LIST_CACHE_SECONDS });
      }

      // /videos  (filters ke saath)
      const filtered = filterVideos(videos, {
        type: root === 'movies' ? 'movie' : root === 'series' ? 'series' : query.type,
        genre: query.genre,
        year: query.year,
        quality: query.quality,
        language: query.language,
        sortBy: query.sort_by || query.sortBy,
        search: query.q || query.search,
      });

      const { items, page, perPage } = paginate(filtered, query);
      return sendOk(req, res, clean(items), { total: filtered.length, page, per_page: perPage }, { cacheSeconds: LIST_CACHE_SECONDS });
    }

    return sendError(req, res, 404, `Route "${url.pathname}" exist nahi karta.`);
  } catch (error) {
    console.error('[CineStream API]', error);
    return sendError(req, res, 500, error.message || 'Internal server error', {
      hint: 'Sheet sharing "Anyone with the link — Viewer" par set hai? Aur SHEET_ID sahi hai?',
    });
  }
}
