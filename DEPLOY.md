# CineStream — Deploy Guide

Do alag-alag cheezein deploy karni hain:

| Kya | Kahan | Folder |
|---|---|---|
| **Backend** (API) | Vercel | `Backend/` |
| **Frontend** (website) | InfinityFree | `cinestream---premium-video-streaming/` |

Order zaroori hai: **pehle backend**, kyunki uska URL frontend ke build me daalna hai.

---

## STEP 1 — Google Sheet taiyaar karo

1. [sheets.new](https://sheets.new) par nayi sheet banao, naam `CineStream DB`.
2. Neeche tab ka naam `Sheet1` se badal kar **`Videos`** karo.
3. Pehli row me yeh headers daalo (copy-paste):

```
id	title	description	type	drive_link	thumbnail	backdrop	genre	year	duration	language	quality	rating	cast	director	featured	trending	tags	status	added_on
```

4. Ek test row bharo:

| id | title | type | drive_link | genre | year | quality | featured | status |
|---|---|---|---|---|---|---|---|---|
| test-1 | Test Movie | movie | *(apni Drive video ka share link)* | Action | 2025 | 1080p Full HD | TRUE | published |

5. Series chahiye to ek aur tab banao **`Episodes`** in headers ke saath:

```
series_id	season	episode	title	description	duration	drive_link	thumbnail	status
```

6. **Share → General access → Anyone with the link → Viewer**
7. URL se sheet ID note karo:
   `https://docs.google.com/spreadsheets/d/`**`YEH_LAMBA_ID`**`/edit`

> **Drive videos ki sharing**: har video file par bhi Right click → Share →
> General access → **Anyone with the link → Viewer**. Sirf folder share karna
> kaafi nahi hai — file khud share honi chahiye, warna player black rahega.

*(Sheet private rakhni hai? To `Backend/README.md` ka "Option B — Apps Script mode" dekho.
Wahan `Backend/google-apps-script/Code.gs` sheet me paste karke deploy karna hota hai,
aur woh script sheet ke tabs bhi apne aap bana deta hai.)*

---

## STEP 2 — Backend Vercel par

### 2a. Deploy

```bash
cd Backend
npx vercel login
npx vercel          # sawaalon ke jawab: scope chuno, project name do, Enter dabate jao
npx vercel --prod
```

> GitHub se karna ho to repo push karke Vercel dashboard → Add New Project → Import →
> **Root Directory** me `Backend` chuno.

### 2b. Environment variables

Vercel dashboard → apna project → **Settings → Environment Variables**:

| Name | Value |
|---|---|
| `SHEET_ID` | Step 1 wala sheet ID |
| `ADMIN_KEY` | koi bhi random string, e.g. `mera-secret-123` |
| `ALLOWED_ORIGINS` | abhi ke liye `*` (Step 3 ke baad badlenge) |

**Save karne ke baad Deployments → latest → ⋯ → Redeploy** zaroor karo.

### 2c. Test

Browser me kholo:

```
https://<tumhara-project>.vercel.app/health
```

Aisa dikhna chahiye:
```json
{"success":true,"status":"ok","videos":1,"categories":1, ...}
```

`videos: 0` aaye to sheet me row ka `status` `published` hai kya, aur sharing
"Anyone with the link" hai kya — dono check karo.

Yeh URL note kar lo, agle step me chahiye.

---

## STEP 3 — Frontend build karo

```bash
cd cinestream---premium-video-streaming
```

`.env.production` file kholo aur apna backend URL daalo (**aakhir me slash nahi**):

```env
VITE_API_BASE_URL="https://tumhara-project.vercel.app"
```

Phir:

```bash
npm install
npm run build
```

`dist/` folder ban jayega — yahi upload hoga.

> **Yaad rakho:** URL build time par bundle me bake hota hai. `.env.production`
> badalne ke baad `npm run build` dobara chalana aur `dist/` phir se upload karna
> zaroori hai.

Upload se pehle local par check kar lo:
```bash
npm run preview     # http://localhost:4173
```

---

## STEP 4 — InfinityFree par upload

1. InfinityFree account → **Control Panel → Online File Manager**
   (ya FTP: FileZilla, credentials cPanel me milte hain).
2. **`htdocs/`** folder me jao. Jo default `index2.html` / placeholder files hain,
   unhe **delete** kar do.
3. `dist/` ka **poora content** `htdocs/` me upload karo — `dist` folder khud nahi,
   uske andar ki cheezein:

```
htdocs/
├── .htaccess            ← hidden file, ise chhodna mat!
├── index.html
├── icon.svg
├── manifest.webmanifest
├── robots.txt
└── assets/
    ├── index-xxxx.js
    ├── index-xxxx.css
    └── ...
```

> **`.htaccess` sabse important hai.** Iske bina `/movies` ya `/watch/abc` par
> refresh karne se **404** aayega. FileZilla me Server → *Force showing hidden files*
> on karo, warna yeh file dikhegi hi nahi.
>
> Zip upload karna ho to File Manager ka "Upload → zip" + "Extract" use karo —
> InfinityFree ka file manager hidden files extract kar deta hai.

4. **SSL on karo**: Control Panel → SSL/TLS → Free SSL certificate → issue karo
   (10–20 min lagte hain). HTTPS zaroori hai — HTTP page se HTTPS backend ko call
   karne par kuch browsers mixed-content block kar dete hain.

5. SSL aane ke baad `htdocs/.htaccess` ke aakhir me HTTPS redirect wala block
   uncomment kar do (file me comment ke saath likha hai).

---

## STEP 5 — CORS lock karo

Ab jab frontend ka domain pata hai, Vercel me `ALLOWED_ORIGINS` ko `*` se badal do:

```
ALLOWED_ORIGINS = https://tumhara-site.infinityfreeapp.com
```

(comma se aur origins bhi add kar sakte ho, e.g. `,http://localhost:3000`)

Save → **Redeploy**.

---

## Roz-marra ka kaam

**Nayi movie add karni hai**
Google Sheet me ek row add karo → bas. 5 min me site par aa jayegi
(ya `https://<backend>.vercel.app/refresh?key=<ADMIN_KEY>` se turant).

**Website ka design badla**
`npm run build` → `dist/` ka content dobara `htdocs/` me upload.
Purane `assets/` files delete kar dena (naam hash se badalte hain).

**Backend code badla**
`cd Backend && npx vercel --prod`

---

## Local development

Do terminals:

```bash
# Terminal 1 — backend
cd Backend
cp .env.example .env      # SHEET_ID daalo
npm run dev               # http://localhost:4000

# Terminal 2 — frontend
cd cinestream---premium-video-streaming
npm run dev               # http://localhost:3000
```

Frontend ki `.env.development` pehle se `http://localhost:4000` par point karti hai.
Phone se test karna ho to laptop ka LAN IP use karo (`npm run dev` output me dikhta hai)
aur `.env.development` me `VITE_API_BASE_URL` bhi wahi IP kar do.

---

## Troubleshooting

| Problem | Wajah / Fix |
|---|---|
| Homepage khulta hai, `/movies` par refresh karne se **404** | `.htaccess` upload nahi hui. Hidden files dikhao aur upload karo. |
| Site khaali hai, koi movie nahi | Settings page kholo → "Test Connection". Offline/CORS dikhe to `ALLOWED_ORIGINS` check karo. |
| Demo/fake movies dikh rahi hain | `VITE_API_BASE_URL` khaali tha build ke waqt. `.env.production` bharo aur rebuild karo. |
| Player black, "Playback shuru nahi ho paya" | Drive **file** ki sharing "Anyone with the link — Viewer" nahi hai. |
| Sheet me row add ki, site par nahi aayi | `status` column me `published` likha hai? Cache ke liye `/refresh` maaro. |
| Console me "Mixed Content" error | Site HTTP par hai. InfinityFree me free SSL issue karo. |
| Thumbnails nahi aa rahe | `thumbnail` column khaali hai to Drive auto-thumbnail use hota hai, jo naye upload par kuch der baad ready hota hai. |
