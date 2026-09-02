# Waypoint — SETUP.md
> Consolidated setup reference: accounts, env vars, dev workflow, and phase-by-phase tooling map.
> Companion to PRD.md, ROADMAP.md, DATABASE.md, CLAUDE.md — this file covers **how to actually set the project up and run it**, which those don't.

---

## 1. Project Locations (avoid confusion)

You may have **two copies** of this project — keep track of which is which:

| Location | What it is |
|---|---|
| `D:\Karvaan\waypoint-app` (local, built step-by-step in chat) | Basic Expo + Router scaffold only, tested working in Expo Go |
| `github.com/Glitch-210/waypoint-app` | Further-along version with Google OAuth2, Prisma, Liveblocks, Mapbox SDK, Share Intent, SQLite already in `package.json` — likely built via a separate Claude Code session |

⚠️ **Decide which one is canonical before continuing.** The GitHub version already has native modules installed, which means it **cannot run in Expo Go** — it requires an EAS dev-client build from the start (see §4).

---

## 2. Required Accounts / Services

| Service | Used for | Roadmap Phase |
|---|---|---|
| **Google Cloud Console** | OAuth 2.0 Client IDs for sign-in | Phase 2 |
| **Neon** | Postgres database (via Prisma) | Phase 2 |
| **Mapbox** | Map rendering, geocoding, directions | Phase 3, 4, 6 |
| **Cloudinary** *(switched from Cloudflare R2)* | Image storage (place photos, list covers) | Phase 3, 4 |
| **Liveblocks** | Real-time collaboration | Phase 7 |
| **EAS (Expo Application Services)** | Cloud native builds (no local Android Studio needed) | Phase 5 onward |

---

## 3. Environment Variables (`.env`)

```env
# --- Google OAuth2 (Auth) ---
EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID=   # Web OAuth 2.0 Client ID (used by expo-auth-session on Expo Go)
GOOGLE_OAUTH_IOS_CLIENT_ID=              # iOS OAuth 2.0 Client ID  (server-side only — verifyIdToken audience)
GOOGLE_OAUTH_ANDROID_CLIENT_ID=          # Android OAuth 2.0 Client ID (server-side only)
JWT_SECRET=                              # Long random secret; generate with: openssl rand -hex 64

# --- Neon / Prisma (Database) ---
DATABASE_URL=

# --- Mapbox ---
EXPO_PUBLIC_MAPBOX_TOKEN=        # public token (pk.), client-side map rendering
MAPBOX_SECRET_TOKEN=             # secret token (sk.), server-side geocoding + directions
MAPBOX_DOWNLOADS_TOKEN=          # secret token (sk.), build-time only — pulls native SDK binaries

# --- Cloudinary (Image storage) ---
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# --- Liveblocks ---
EXPO_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=
LIVEBLOCKS_SECRET_KEY=
```

### Setting up Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an **OAuth 2.0 Client ID** for each platform:
   - **Web** — Authorized redirect URIs: `https://auth.expo.io/@<your-expo-username>/waypoint-app` (for Expo Go). This ID goes in `EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID`.
   - **iOS** — Bundle ID: `com.waypoint.app`. This ID goes in `GOOGLE_OAUTH_IOS_CLIENT_ID` (server-side only).
   - **Android** — Package: `com.waypoint.app`. Provide your SHA-1 fingerprint. This ID goes in `GOOGLE_OAUTH_ANDROID_CLIENT_ID` (server-side only).
3. Enable the **Google People API** (needed to return `profile` + `email` scopes).
4. Generate `JWT_SECRET`: `openssl rand -hex 64` — paste the output into `.env`.

**Rules:**
- Anything prefixed `EXPO_PUBLIC_` gets bundled into the client app — **never put a secret there**.
- Everything without that prefix is server-side only (API routes / backend).
- `.env` must be in `.gitignore` — never commit real values. Keep `.env.template` in the repo with empty values as a reference.

---

## 4. Local Dev Workflow — Expo Go vs. EAS Dev Client

| | Expo Go | EAS Dev Client |
|---|---|---|
| What it is | Pre-built generic app from Expo | Your own custom-built native app |
| Native modules | Only Expo's pre-bundled set | Any module you install |
| Rebuild needed on JS change | No — instant hot reload | No — same hot reload once built |
| Rebuild needed on native module change | N/A (can't add native modules) | Yes — one new EAS build |
| Needs Android Studio locally | No | No (cloud build via EAS) |
| Works for this project's | Phases 1–4 (if no native modules yet installed) | Phase 5 onward (Share Intent, Mapbox SDK, SQLite) |

### Setting up EAS Dev Client (cloud build, no local Android Studio)
```bash
npm install -g eas-cli
eas login
npx expo install expo-dev-client
eas build:configure
eas build --platform android --profile development
```
Install the resulting `.apk` on your phone via the QR code/link EAS gives you. Then day-to-day:
```bash
npx expo start --dev-client
```
Only re-run `eas build` when adding/changing a **native** dependency — not for regular JS/UI work.

---

## 5. Roadmap Phase → Tooling Map

| Phase | What's built | Key packages/services | Needs EAS build? |
|---|---|---|---|
| 1 — Setup | Project scaffold, accounts, env vars | expo, expo-router, nativewind, zustand | No |
| 2 — Auth + Data | Sign-in, user sync, Lists CRUD | expo-auth-session, google-auth-library, jsonwebtoken, @prisma/client, Neon | No |
| 3 — Manual Places | Place search, place cards | Mapbox Geocoding API (plain fetch) | No |
| 4 — Link Ingestion | OG-tag scrape, geocode, confirm sheet | cheerio, Mapbox Geocoding API | No |
| 5 — Native Share | Share-sheet target (iOS/Android) | expo-share-intent | **Yes** |
| 6 — Map + Route | Map rendering, route line | @rnmapbox/maps, Mapbox Directions API | **Yes** |
| 7 — Collaboration | Real-time co-editing | @liveblocks/client, @liveblocks/react | No |
| 8 — Offline | Local cache, offline tiles, sync | expo-sqlite, @react-native-community/netinfo | Maybe (depends on SQLite package) |
| 9 — Polish/Launch | Onboarding, empty states, store listings | eas.json (production profile) | Yes (production build) |

---

## 6. Data Storage Split (recap)

| Storage | Stores | Example |
|---|---|---|
| **Cloudinary** | Actual image files | `Place` photo bytes |
| **Neon (Postgres/Prisma)** | Structured data + references to files | `Place.photoUrl = "<cloudinary URL>"` |
| **Liveblocks** | Ephemeral real-time state (live cursors, presence) | Not the source of truth — writes through to Neon on mutation |
| **SQLite (on-device)** | Offline cache of lists/places | Phase 8 only |

---

## 7. Known Gotchas (from this project's setup so far)

- **Windows `cd` across drives:** `cd D:\path` does nothing if you're on `C:` — use `cd /d D:\path`.
- **`npm audit fix --force`:** avoid running this — it can silently downgrade major dependencies (happened with Expo in this project). Vulnerabilities in dev dependencies are safe to ignore for now.
- **`EPERM`/file lock errors on `npm install`:** usually caused by OneDrive sync or antivirus scanning the project folder. Exclude the project folder from both.
- **`ECONNRESET` on `npm install`:** flaky network, not a code issue. Retry, and set:
  ```bash
  npm config set fetch-retries 5
  npm config set fetch-retry-mintimeout 20000
  npm config set fetch-retry-maxtimeout 120000
  ```

---

## 8. Next Setup Steps (unchecked)

- [ ] Confirm canonical project copy (local vs. GitHub repo)
- [ ] Google Cloud OAuth2 Client IDs created (Web, iOS, Android) + authorized redirect URIs registered
- [ ] `JWT_SECRET` generated and set in `.env`
- [ ] Neon project created + `DATABASE_URL` in `.env`, `prisma migrate dev` run
- [ ] Mapbox account + all 3 tokens in `.env`
- [ ] Cloudinary account + credentials in `.env`
- [ ] Liveblocks project created + keys in `.env`
- [ ] EAS CLI installed, first dev-client build completed
