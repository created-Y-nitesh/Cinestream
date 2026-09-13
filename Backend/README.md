# CineStream Backend

Google Sheet ko video-catalog REST API banata hai. Vercel serverless par chalta hai,
koi npm dependency nahi (cold start fast).

```
Google Drive (video files)
      ↓  share links
Google Sheet (links + metadata)
      ↓  CSV export ya Apps Script
Vercel API  ← yeh folder
      ↓  JSON
CineStream frontend (InfinityFree)
```

---

## Folder structure

| File | Kaam |
|---|---|
| `api/index.js` | Saare routes ka single entry point (Vercel function) |
| `lib/config.js` | Environment variables |
| `lib/csv.js` | CSV parser (Google gviz export ke liye) |
| `lib/drive.js` | Drive link → file id → embed/thumbnail URL |
| `lib/normalize.js` | Sheet rows → frontend ka VideoItem shape |
| `lib/sheets.js` | Google se data laana + caching |
| `lib/query.js` | Filter / sort / search / related |
| `lib/http.js` | CORS + JSON responses |
| `local-server.js` | Local dev server (Vercel ke bina chalane ke liye) |
| `google-apps-script/Code.gs` | Sheet me paste karne wala script |
| `vercel.json` | Saari requests `api/index.js` par bhejta hai |

---

## Endpoints

| Method | Path | Kya deta hai |
|---|---|---|
| GET | `/health` | Status, kitne videos mile, cache info |
| GET | `/videos` | Poora catalog. Query: `type, genre, year, quality, language, sort_by, q, limit, page` |
| GET | `/videos/featured` | `featured = TRUE` wali rows (hero banner) |
| GET | `/videos/trending` | `trending = TRUE` wali rows |
| GET | `/videos/recent` | Naye add kiye gaye (date column ya sheet order) |
| GET | `/videos/popular` | Rating ke hisaab se |
| GET | `/videos/:id` | Ek title — series ho to `seasons[].episodes[]` ke saath |
| GET | `/videos/:id/related` | Genre/tag overlap wale titles |
| GET | `/categories` | Categories sheet, ya genres se auto-derived |
| GET | `/search?q=` | Title, description, genre, cast, tags me search |
| GET | `/refresh?key=ADMIN_KEY` | Cache turant clear (sheet edit ke baad) |

Response shape: `{ "success": true, "data": [...], "total": 12 }`

---

## Setup — Option A (aasan): Public sheet, CSV mode

1. Google Sheet banao, `Videos` naam ka tab (columns neeche diye hain).
2. **Share → General access → Anyone with the link → Viewer**
3. URL se sheet ID copy karo:
   `https://docs.google.com/spreadsheets/d/`**`YEH_HISSA`**`/edit`
4. Vercel me env var: `SHEET_ID = YEH_HISSA`

Bas. Backend `gviz` CSV export se sheet padh lega.

## Setup — Option B: Private sheet, Apps Script mode

Sheet public nahi karni? To:

1. Sheet → **Extensions → Apps Script**
2. `google-apps-script/Code.gs` ka poora content paste karo → Save
3. Function dropdown me `setupSheets` chuno → **Run** → permissions Allow
   (Videos / Episodes / Categories tabs headers ke saath ban jayenge)
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. `/exec` wala URL copy karke Vercel me `APPS_SCRIPT_URL` env var me daalo.

`APPS_SCRIPT_URL` set hone par `SHEET_ID` ignore ho jata hai.

---

## Sheet columns

### `Videos` tab

Sirf **title** aur **drive_link** zaroori hain; baaki optional.
Column names case/space/underscore-insensitive hain (`Drive Link` = `drive_link` = `drivelink`).

| Column | Example | Note |
|---|---|---|
| `id` | `jawan-2025` | Na do to title se auto ban jayega |
| `title` | `Jawan` | **Zaroori** |
| `description` | `Ek action thriller…` | |
| `type` | `movie` / `series` | Default `movie` |
| `drive_link` | `https://drive.google.com/file/d/ABC.../view` | **Zaroori** (movie ke liye). YouTube link bhi chalega |
| `thumbnail` | image URL | Khaali ho to Drive thumbnail auto |
| `backdrop` | image URL | Khaali ho to thumbnail |
| `genre` | `Action, Thriller` | Comma separated |
| `year` | `2025` | |
| `duration` | `2h 15m` | |
| `language` | `Hindi` | |
| `quality` | `1080p Full HD` | |
| `rating` | `8.6` | |
| `cast` | `Actor A, Actor B` | Comma separated |
| `director` | `Dir Name` | |
| `featured` | `TRUE` | Hero banner me dikhega |
| `trending` | `TRUE` | Trending row me dikhega |
| `tags` | `blockbuster, hindi` | |
| `status` | `published` / `draft` | `draft` wali rows site par nahi aayengi |
| `added_on` | `2025-01-10` | "Recently added" sorting ke liye |

### `Episodes` tab (sirf series ke liye)

| Column | Example |
|---|---|
| `series_id` | `mystery-nights` ← Videos sheet ki `id` se match hona chahiye |
| `season` | `1` |
| `episode` | `1` |
| `title` | `Pehla Raaz` |
| `description` | … |
| `duration` | `42m` |
| `drive_link` | Us episode ka Drive link |
| `thumbnail` | optional |
| `status` | `published` |

Series ki parent row me `drive_link` khaali chhod sakte ho — backend pehle episode ka
link aur thumbnail utha lega.

### `Categories` tab (optional)

Na banao to backend genres se apne aap categories bana deta hai (count ke saath).

---

## Environment variables

`.env.example` dekho. Zaroori sirf ek:

| Var | Default | Kaam |
|---|---|---|
| `SHEET_ID` | — | Google Sheet ID (Option A) |
| `APPS_SCRIPT_URL` | — | Apps Script `/exec` URL (Option B) |
| `SHEET_VIDEOS` | `Videos` | Tab ka naam |
| `SHEET_EPISODES` | `Episodes` | Tab ka naam |
| `SHEET_CATEGORIES` | `Categories` | Tab ka naam |
| `CACHE_TTL_SECONDS` | `300` | Sheet kitni der cache rahe |
| `RESPECT_PUBLISHED` | `true` | `status` column follow kare ya nahi |
| `ALLOWED_ORIGINS` | `*` | Live hone ke baad apna frontend domain daalo |
| `ADMIN_KEY` | — | `/refresh` ko protect karta hai |

---

## Local par chalana

```bash
cd Backend
cp .env.example .env      # .env me SHEET_ID daalo
npm run dev               # http://localhost:4000
```

Check:
```bash
curl http://localhost:4000/health
curl http://localhost:4000/videos
```

Frontend `.env.development` me pehle se `VITE_API_BASE_URL=http://localhost:4000` hai,
to `npm run dev` (frontend folder me) isi backend se baat karega.

---

## Vercel par deploy

```bash
cd Backend
npx vercel        # pehli baar — project link karo
npx vercel --prod
```

Ya GitHub push karke Vercel dashboard se import karo — **Root Directory = `Backend`** set karna.

Deploy ke baad **Settings → Environment Variables** me `SHEET_ID` (ya `APPS_SCRIPT_URL`)
daalo aur **Redeploy** karo (env vars build par baked nahi hote, lekin redeploy se
function turant naye vars uthata hai).

Test: `https://your-project.vercel.app/health`

---

## Caching kaise kaam karta hai

Do layers:
1. **Function memory** — `CACHE_TTL_SECONDS` (default 5 min)
2. **Vercel CDN** — list endpoints par `s-maxage=60`

Matlab sheet edit karne ke baad site par change dikhne me ~1–5 min lag sakte hain.
Turant chahiye to:

```
https://your-project.vercel.app/refresh?key=<ADMIN_KEY>
```

---

## Common problems

**`/health` par "Sheet fetch fail (HTTP 400)"**
Sheet sharing "Anyone with the link — Viewer" par nahi hai, ya `SHEET_ID` galat hai.

**Videos aate hain par player black**
Drive **file** ki sharing bhi "Anyone with the link" honi chahiye — folder share karna
kaafi nahi hai. File → Share → General access → Anyone with the link.

**Frontend par CORS error**
`ALLOWED_ORIGINS` me apna exact frontend origin daalo, e.g.
`https://mysite.infinityfreeapp.com` (path ya trailing slash ke bina).

**Sheet me row add ki par site par nahi dikhi**
`status` column `published` hai? Cache expire hua? `/refresh` maaro.
