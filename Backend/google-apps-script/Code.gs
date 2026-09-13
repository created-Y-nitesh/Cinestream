/**
 * ============================================================================
 *  CineStream — Google Apps Script (Google Sheet ko JSON API banata hai)
 * ============================================================================
 *
 *  ISTEMAAL KAISE KAREIN
 *  ---------------------
 *  1. Apni Google Sheet kholo -> Extensions -> Apps Script
 *  2. Code.gs ka saara content delete karke yeh paste kar do -> Save
 *  3. Upar function dropdown me "setupSheets" chuno -> Run
 *     (pehli baar permission maangega -> Allow)
 *     Yeh Videos / Episodes / Categories tabs headers ke saath bana dega.
 *  4. Deploy -> New deployment -> Type: Web app
 *       Execute as        : Me
 *       Who has access    : Anyone
 *     -> Deploy -> Web app URL copy karo (…/exec par khatam hota hai)
 *  5. Wahi URL Vercel me APPS_SCRIPT_URL environment variable me daal do.
 *
 *  Sheet public karne ki zaroorat NAHI hai — script hi data serve karta hai.
 *
 *  Sheet edit karne ke baad site par turant dikhe iske liye:
 *  Backend ka  /refresh?key=<ADMIN_KEY>  ek baar hit kar do.
 * ============================================================================
 */

/** Optional: agar set kiya to Web App ?key=<yeh value> maangega. */
var API_KEY = '';

/** Sheet tab ke naam — Vercel ke SHEET_* env vars se match hone chahiye. */
var SHEETS = {
  videos: 'Videos',
  episodes: 'Episodes',
  categories: 'Categories',
};

/** Apps Script side cache (seconds). Backend ka apna cache alag hai. */
var CACHE_SECONDS = 120;

// ---------------------------------------------------------------------------
//  WEB APP ENTRY POINT
// ---------------------------------------------------------------------------

function doGet(e) {
  var params = (e && e.parameter) || {};

  if (API_KEY && params.key !== API_KEY) {
    return jsonOutput({ error: 'Unauthorized — galat ya missing key.' });
  }

  try {
    // ?refresh=1 se cache bypass
    if (params.refresh !== '1') {
      var cached = CacheService.getScriptCache().get('cinestream_payload');
      if (cached) return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = {
      ok: true,
      generatedAt: new Date().toISOString(),
      videos: readSheet(SHEETS.videos),
      episodes: readSheet(SHEETS.episodes),
      categories: readSheet(SHEETS.categories),
    };

    var text = JSON.stringify(payload);

    // 100KB se chhota ho tabhi cache karo (Apps Script cache limit).
    if (text.length < 95000) {
      CacheService.getScriptCache().put('cinestream_payload', text, CACHE_SECONDS);
    }

    return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return jsonOutput({ error: String(err && err.message ? err.message : err) });
  }
}

/**
 * Optional: Telegram bot / form se naya video add karne ke liye.
 * POST body (JSON): { key: "...", sheet: "Videos", row: { title: "...", drive_link: "..." } }
 */
function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (API_KEY && body.key !== API_KEY) {
      return jsonOutput({ error: 'Unauthorized' });
    }

    var sheetName = body.sheet || SHEETS.videos;
    var added = appendRow(sheetName, body.row || {});

    CacheService.getScriptCache().remove('cinestream_payload');
    return jsonOutput({ ok: true, sheet: sheetName, added: added });
  } catch (err) {
    return jsonOutput({ error: String(err && err.message ? err.message : err) });
  }
}

// ---------------------------------------------------------------------------
//  SHEET HELPERS
// ---------------------------------------------------------------------------

/** Ek tab ko objects ki array me padhta hai. Tab na ho to []. */
function readSheet(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) return [];

  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  var headers = values[0].map(function (header) {
    return String(header || '').trim();
  });

  var rows = [];

  for (var i = 1; i < values.length; i++) {
    var row = {};
    var hasContent = false;

    for (var j = 0; j < headers.length; j++) {
      if (!headers[j]) continue;
      var cell = String(values[i][j] === null || values[i][j] === undefined ? '' : values[i][j]).trim();
      row[headers[j]] = cell;
      if (cell !== '') hasContent = true;
    }

    if (hasContent) rows.push(row);
  }

  return rows;
}

/** Header order ke hisaab se ek row append karta hai. */
function appendRow(sheetName, data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet "' + sheetName + '" nahi mila.');

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];

  var normalized = {};
  Object.keys(data).forEach(function (key) {
    normalized[normalizeKey(key)] = data[key];
  });

  var line = headers.map(function (header) {
    var value = normalized[normalizeKey(header)];
    return value === undefined || value === null ? '' : value;
  });

  sheet.appendRow(line);
  return line;
}

function normalizeKey(key) {
  return String(key || '').toLowerCase().replace(/[\s\-_.]+/g, '');
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
//  ONE-TIME SETUP — is function ko editor se "Run" karo
// ---------------------------------------------------------------------------

var VIDEO_HEADERS = [
  'id', 'title', 'description', 'type', 'drive_link', 'thumbnail', 'backdrop',
  'genre', 'year', 'duration', 'language', 'quality', 'rating', 'cast',
  'director', 'featured', 'trending', 'tags', 'status', 'added_on',
];

var EPISODE_HEADERS = [
  'series_id', 'season', 'episode', 'title', 'description', 'duration',
  'drive_link', 'thumbnail', 'released_at', 'status',
];

var CATEGORY_HEADERS = ['id', 'name', 'slug', 'icon', 'backdrop', 'description', 'status'];

function setupSheets() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  ensureSheet(spreadsheet, SHEETS.videos, VIDEO_HEADERS);
  ensureSheet(spreadsheet, SHEETS.episodes, EPISODE_HEADERS);
  ensureSheet(spreadsheet, SHEETS.categories, CATEGORY_HEADERS);

  addSampleRowIfEmpty(spreadsheet);

  SpreadsheetApp.getUi().alert(
    'Ho gaya!\n\n' +
    'Videos / Episodes / Categories tabs ready hain.\n\n' +
    'Ab: Deploy -> New deployment -> Web app -> Anyone -> Deploy\n' +
    'Aur us /exec URL ko Vercel me APPS_SCRIPT_URL me daal do.'
  );
}

function ensureSheet(spreadsheet, name, headers) {
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);

  var existing = sheet.getLastColumn() > 0
    ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]
    : [];

  var hasHeaders = existing.some(function (value) {
    return String(value || '').trim() !== '';
  });

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  sheet.getRange(1, 1, 1, Math.max(headers.length, sheet.getLastColumn()))
    .setFontWeight('bold')
    .setBackground('#1f1f28')
    .setFontColor('#ffffff');

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}

function addSampleRowIfEmpty(spreadsheet) {
  var sheet = spreadsheet.getSheetByName(SHEETS.videos);
  if (!sheet || sheet.getLastRow() > 1) return;

  sheet.appendRow([
    'demo-1',
    'Sample Movie',
    'Yeh ek demo row hai. drive_link column me apni Google Drive video ka share link daalo aur is row ko edit kar do.',
    'movie',
    'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345/view?usp=sharing',
    '', '',
    'Action, Thriller',
    '2025',
    '2h 05m',
    'Hindi',
    '1080p Full HD',
    '8.4',
    'Actor One, Actor Two',
    'Director Name',
    'TRUE',
    'TRUE',
    'demo, sample',
    'published',
    new Date(),
  ]);
}

// ---------------------------------------------------------------------------
//  SHEET MENU (kholne par upar "CineStream" menu aa jayega)
// ---------------------------------------------------------------------------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('CineStream')
    .addItem('1. Sheets setup karo', 'setupSheets')
    .addItem('2. Cache clear karo', 'clearScriptCache')
    .addItem('Web App URL dikhao', 'showWebAppUrl')
    .addToUi();
}

function clearScriptCache() {
  CacheService.getScriptCache().remove('cinestream_payload');
  SpreadsheetApp.getUi().alert('Cache clear ho gaya. Site par ~1 min me naya data dikhega.');
}

function showWebAppUrl() {
  var url = ScriptApp.getService().getUrl();
  SpreadsheetApp.getUi().alert(
    url
      ? 'Web App URL:\n\n' + url + '\n\nIse Vercel ke APPS_SCRIPT_URL me paste karo.'
      : 'Abhi deploy nahi hua. Deploy -> New deployment -> Web app se deploy karo.'
  );
}
