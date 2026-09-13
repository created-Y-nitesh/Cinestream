/**
 * CORS + JSON response helpers.
 *
 * Frontend har request par "Content-Type: application/json" bhejta hai, isliye
 * browser pehle OPTIONS (preflight) maarta hai — woh yaha handle hota hai.
 */

import { config } from './config.js';

function resolveOrigin(req) {
  const origin = req.headers.origin;
  if (config.allowedOrigins.includes('*')) return '*';
  if (origin && config.allowedOrigins.includes(origin.replace(/\/+$/, ''))) return origin;
  return config.allowedOrigins[0] || '*';
}

export function applyCors(req, res) {
  const origin = resolveOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Admin-Key');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/** Preflight ko yahi khatam kar do. true return kare to request aage nahi badhni chahiye. */
export function handlePreflight(req, res) {
  if (req.method !== 'OPTIONS') return false;
  applyCors(req, res);
  res.statusCode = 204;
  res.end();
  return true;
}

export function sendJson(req, res, statusCode, payload, { cacheSeconds = 0 } = {}) {
  applyCors(req, res);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (cacheSeconds > 0) {
    // Vercel CDN par cache — Google Sheet par load kam aur response instant.
    res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 4}`);
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }

  res.statusCode = statusCode;
  res.end(JSON.stringify(payload));
}

export function sendOk(req, res, data, extra = {}, options = {}) {
  sendJson(req, res, 200, { success: true, data, ...extra }, options);
}

export function sendError(req, res, statusCode, message, extra = {}) {
  sendJson(req, res, statusCode, { success: false, data: null, message, ...extra });
}
