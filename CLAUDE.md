# Waypoint — CLAUDE.md
> Agent instructions. Read at the start of every session before touching any file.

---

## Project Summary

Waypoint — save travel places from any link/reel into shareable "playlists," view them on a map, get a route. India-only, mobile-only (iOS + Android), standalone product — **not** a Karvaan feature.

**Tagline:** "Spotify playlists, but for places."

---

## Read First, Every Session

1. `ROADMAP.md` — what's built, in progress, not started
2. `ARCHITECTURE.md` — stack + repo structure before touching code
3. `DATABASE.md` — schema before any Prisma/API change

---

## Tech Stack (Locked — Do Not Change Without Updating ARCHITECTURE.md)

Expo (React Native, iOS + Android) · Expo Router · Custom Google OAuth2 (expo-auth-session + backend JWT) · Neon Postgres + Prisma · Cloudflare R2 · Liveblocks (collab) · Mapbox (maps/geocode/directions) · Zustand · NativeWind.

**No Supabase. No Next.js/web. No AI/ML in MVP.**

---

## Hard Rules

- **RLS is manual here** (Neon/Prisma has no native row-level security like Supabase) — every API route touching `List`/`Place` must explicitly check `ownerId === currentUser.id` OR a matching `ListCollaborator` row. Never trust `list_id` from the client alone.
- **Ingestion parsing is server-side only.** Never call OG-tag scraping or geocoding directly from the client.
- **Every saved place requires user confirmation** before final write — never auto-save a geocoded guess silently. Show the confirm/edit sheet every time, even on high-confidence parses.
- **No `any` types** — interfaces in `types/index.ts`.
- **No dark mode** — canvas/surfaceSoft only, matches Karvaan tokens.
- **Never hardcode hex values** — import from `constants/colors.ts`.
- **Design tokens are shared with Karvaan by convention, not by import** — this is a separate repo; if Karvaan's tokens change, this file does not auto-update. Sync manually if desired.

---

## Out of Scope — Do Not Build (see PRD.md for full list)

Booking · payments/Pro tier · AI itinerary generation · quiz/archetype system · in-app reel video playback · public/discovery feed · web app · multi-route-per-list (post-MVP).

---

## Environment Variables

See `ARCHITECTURE.md` → Environment Variables section. Copy `.env.template` → `.env`. Never commit `.env`.

---

## Key Reference Files

| File | When to Read |
|---|---|
| `ROADMAP.md` | Every session — current phase, blockers |
| `PRD.md` | Scoping any new feature — is it in or out of MVP? |
| `DESIGN.md` | Building any screen/component |
| `ARCHITECTURE.md` | Touching stack, folder structure, API/data flow |
| `DATABASE.md` | Touching Prisma schema or writing queries |
