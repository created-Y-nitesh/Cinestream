/**
 * Local development server — backend ko alag chalane ke liye.
 *
 *   cd Backend
 *   cp .env.example .env      (aur usme apna SHEET_ID daalo)
 *   npm run dev               -> http://localhost:4000
 *
 * Vercel par yeh file use nahi hoti; wahan api/index.js seedha serverless function hai.
 * Yani local aur production dono me exactly same handler chalta hai.
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// ---- .env load karo (Node 18 me built-in nahi hai) -------------------------
const envPath = join(here, '.env');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    });
  console.log('  .env loaded');
}

// env set hone ke baad hi handler import karo (config.js load time par env padhta hai).
const { default: handler } = await import('./api/index.js');

const PORT = Number(process.env.PORT) || 4000;

const server = createServer(async (req, res) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    console.log(`  ${req.method} ${req.url} -> ${res.statusCode} (${Date.now() - startedAt}ms)`);
  });

  try {
    await handler(req, res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
    }
    res.end(JSON.stringify({ success: false, message: error.message }));
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('  CineStream API (local)');
  console.log(`  http://localhost:${PORT}`);
  console.log('');
  console.log(`  Source : ${process.env.APPS_SCRIPT_URL ? 'Apps Script Web App' : process.env.SHEET_ID ? 'Google Sheet CSV' : 'NOT CONFIGURED — .env me SHEET_ID daalo'}`);
  console.log('');
  console.log('  Try:');
  console.log(`    http://localhost:${PORT}/health`);
  console.log(`    http://localhost:${PORT}/videos`);
  console.log(`    http://localhost:${PORT}/categories`);
  console.log('');
});
