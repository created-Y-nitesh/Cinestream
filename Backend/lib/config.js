/**
 * Central configuration — sab kuch Vercel Environment Variables se aata hai.
 * Local development ke liye Backend/.env file bana lo (local-server.js use karta hai).
 */

function env(key, fallback = '') {
  const value = process.env[key];
  return value === undefined || value === null || value === '' ? fallback : String(value).trim();
}

function num(key, fallback) {
  const parsed = Number(env(key, ''));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const config = {
  // ---- Google Sheet source ----------------------------------------------
  // Sheet URL: https://docs.google.com/spreadsheets/d/<YEH_HISSA_SHEET_ID_HAI>/edit
  sheetId: env('SHEET_ID'),

  // Tab (sheet) names — apni sheet ke tab names se match hone chahiye.
  videosSheet: env('SHEET_VIDEOS', 'Videos'),
  episodesSheet: env('SHEET_EPISODES', 'Episodes'),
  categoriesSheet: env('SHEET_CATEGORIES', 'Categories'),

  // Agar Apps Script Web App deploy kiya hai to uska /exec URL yaha daalo.
  // Set hone par yeh gviz CSV ki jagah use hoga (private sheet ke liye behtar).
  appsScriptUrl: env('APPS_SCRIPT_URL'),

  // Apps Script me agar API_KEY set kiya hai to wahi value yaha bhi daalo.
  appsScriptKey: env('APPS_SCRIPT_KEY'),

  // ---- Behaviour ---------------------------------------------------------
  cacheTtlSeconds: num('CACHE_TTL_SECONDS', 300),
  // Sheet me "status"/"published" column ho to sirf published rows dikhti hain.
  // false karne par saari rows aa jayengi.
  respectPublishedColumn: env('RESPECT_PUBLISHED', 'true') !== 'false',

  // ---- Security ----------------------------------------------------------
  // Comma separated origins, ya '*' sabke liye.
  // Example: "https://mysite.infinityfreeapp.com,http://localhost:3000"
  allowedOrigins: env('ALLOWED_ORIGINS', '*')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean),

  // /refresh endpoint ko protect karta hai (cache turant clear karne ke liye).
  adminKey: env('ADMIN_KEY'),
};

export function isConfigured() {
  return Boolean(config.appsScriptUrl || config.sheetId);
}

export function sourceLabel() {
  if (config.appsScriptUrl) return 'google_apps_script';
  if (config.sheetId) return 'google_sheet_csv';
  return 'not_configured';
}
