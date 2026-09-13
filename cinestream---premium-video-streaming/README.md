# CineStream — Frontend

React 19 + Vite + Tailwind v4 streaming site. Mobile-first. Static build,
InfinityFree (ya kisi bhi shared hosting / Netlify / Cloudflare Pages) par deploy hoti hai.

Data `Backend/` folder wale Vercel API se aata hai, jo Google Sheet padhta hai.
Poora deploy process → repo root ki [`DEPLOY.md`](../DEPLOY.md).

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

`.env.development` pehle se `http://localhost:4000` (local backend) par point karti hai.
Backend na chal raha ho to catalog khaali dikhega — demo data dekhna ho to
`/settings` me **Force Local Mock Store** on karo.

```bash
npm run build      # dist/ banata hai
npm run preview    # build ko locally check karo
npm run typecheck  # TypeScript errors
```

---

## Environment

| File | Kab use hoti hai |
|---|---|
| `.env.development` | `npm run dev` |
| `.env.production` | `npm run build` ← **yahan apna Vercel backend URL daalo** |

| Var | Matlab |
|---|---|
| `VITE_API_BASE_URL` | Backend ka URL, bina trailing slash. Khaali = mock data mode. |
| `VITE_ALLOWED_IFRAME_DOMAINS` | Video embed ke liye trusted domains (security allowlist) |

> Vite ki env values **build time par bundle me bake** hoti hain. Badalne ke baad
> `npm run build` dobara chalao aur `dist/` phir se upload karo.

---

## Structure

```
src/
├── api/
│   ├── client.ts        Backend calls + mock fallback
│   ├── config.ts        Base URL, iframe allowlist, Drive URL helpers
│   └── mockData.ts      Demo catalog (backend na ho tab)
├── components/
│   ├── video/
│   │   ├── VideoPlayer.tsx        Source dekh kar sahi player chunta hai
│   │   ├── GoogleDrivePlayer.tsx  Drive/YouTube iframe streaming
│   │   ├── HTML5Player.tsx        Direct mp4 ke liye custom player
│   │   ├── VideoCard/Grid/Row     Catalog UI
│   │   └── EpisodeList.tsx        Series seasons accordion
│   ├── layout/          Navbar, MobileNav (bottom bar), Footer
│   ├── search/          Debounced search + dropdown
│   ├── hero/            Homepage banner
│   └── ui/              Button, Badge, Modal, Skeleton, SmartImage
├── context/             Theme, Toast, Watchlist, WatchHistory (localStorage)
├── pages/               Home, Movies, Series, Categories, VideoDetails,
│                        Watch, Search, Favorites, Settings, NotFound
└── index.css            Tailwind theme + dark/light variants + safe-area utils

public/
├── .htaccess            Apache SPA routing + caching (InfinityFree ke liye zaroori)
├── manifest.webmanifest PWA / "Add to home screen"
├── icon.svg
└── robots.txt
```

---

## Streaming kaise hota hai

`VideoPlayer` `source_type` dekh kar player chunta hai:

| `source_type` | Player | Kab |
|---|---|---|
| `google_drive` | `GoogleDrivePlayer` (iframe `/preview`) | Sheet me `drive_link` hai |
| `youtube` | `GoogleDrivePlayer` (YouTube embed) | Link YouTube ka hai |
| `html5` | `HTML5Player` | Sheet me direct `.mp4` / HLS diya ho |

Backend Drive ke har tarah ke link se file id nikal kar `/preview` embed URL bana deta
hai (`/view?usp=sharing`, `?id=`, ya plain file id — sab chalte hain).

Security: `isSafeEmbedUrl()` sirf allowlist ke domains ko iframe me load karta hai.

---

## Theme

`ThemeContext` `<html>` par `.dark` / `.light` class lagata hai, aur `index.css` me
`@custom-variant dark` / `@custom-variant light` un classes ko Tailwind variants se
jodte hain. **In do lines ke bina theme toggle kaam nahi karta** (Tailwind v4 default me
`dark:` ko `prefers-color-scheme` se jodta hai, class se nahi).

`index.html` me ek chhota inline script bundle load hone se pehle theme laga deta hai,
taki dark mode users ko white flash na dikhe.

---

## Mobile notes

- Bottom nav ke liye `pb-mobile-nav` utility (safe-area inset ke saath)
- Catalog grid mobile par 2 columns, horizontal shelves snap-scroll karti hain
- Hero/backdrop `svh` units use karte hain — mobile URL bar se layout jump nahi hota
- Inputs 16px font — iOS focus par zoom nahi karta
- Play/watchlist buttons touch devices par hamesha visible (hover nahi hota)

---

## Settings page

`/settings` par:
- Theme (dark / light / auto) aur reduced-motion
- **Test Connection** — backend health, latency, kitne titles mile
- Backend URL ka temporary override (sirf is browser me, testing ke liye)
- Force mock mode
