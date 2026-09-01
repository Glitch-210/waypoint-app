# Waypoint — ROADMAP.md
> Tracks what's built, in progress, and not started. Update after every session.

---

## Current Status

| Field | Value |
|---|---|
| **Phase** | 0 — Planning complete, pre-build |
| **Next action** | Init Expo project + Prisma/Neon setup |
| **Blocker** | None |

---

## What's Done ✅

- [x] Product decision: standalone app (not a Karvaan feature)
- [x] PRD — MVP scope locked
- [x] Design system — reusing Karvaan tokens
- [x] Architecture — stack decided (Expo, Clerk, Neon/Prisma, R2, Liveblocks, Mapbox)
- [x] Database schema drafted (Prisma)

---

## What's Not Started ❌

### Phase 1 — Project Setup
- [ ] `npx create-expo-app waypoint-app`
- [ ] Expo Router + NativeWind + Zustand installed
- [ ] Clerk configured (new Clerk project, separate from Karvaan)
- [ ] Neon project created, `DATABASE_URL` set
- [ ] Prisma initialized, schema from `DATABASE.md` migrated
- [ ] Cloudflare R2 bucket created + credentials
- [ ] Mapbox account + token (map + geocoding + directions APIs enabled)
- [ ] Liveblocks project created
- [ ] `constants/colors.ts` + `typography.ts` ported from Karvaan
- [ ] `.env.template` created

### Phase 2 — Auth + Core Data Model
- [ ] Sign-in/sign-up screens (Clerk)
- [ ] User synced to Neon on first sign-in (Clerk webhook → Prisma upsert)
- [ ] Lists CRUD (create/rename/delete) — API routes + Prisma queries with ownership checks

### Phase 3 — Places + Manual Entry
- [ ] Add place manually (Mapbox place autocomplete search)
- [ ] Place card component
- [ ] List detail screen — places feed

### Phase 4 — Ingestion (Link Parsing)
- [ ] Server-side OG-tag fetch endpoint
- [ ] Geocoding + confidence scoring
- [ ] Confirm/edit sheet before save
- [ ] Paste-link flow in app (`add.tsx`)
- [ ] Failure fallback → manual entry path

### Phase 5 — Native Share Target
- [ ] iOS Share Extension (config plugin or bare native module)
- [ ] Android Share Intent filter
- [ ] Share → lands in "choose list" picker → ingestion sheet

### Phase 6 — Map + Route
- [ ] Map view rendering all places in a list (Mapbox)
- [ ] Select/deselect places for route (`inRoute` toggle)
- [ ] Route line via Mapbox Directions API
- [ ] Numbered waypoint markers

### Phase 7 — Collaboration
- [ ] Liveblocks room per list
- [ ] Invite-link generation + join flow
- [ ] `ListCollaborator` role enforcement (editor/viewer)
- [ ] Presence UI (avatar stack, live cursors on map)
- [ ] Write-through: Liveblocks mutations → Neon persistence

### Phase 8 — Offline
- [ ] Local SQLite cache of lists/places
- [ ] "Make available offline" toggle
- [ ] Mapbox offline tile pack download per list bounding box
- [ ] Sync-on-reconnect (delta sync via `updatedAt`)

### Phase 9 — Polish / Launch Prep
- [ ] Onboarding seed list ("Goa Weekend" example) for cold-start
- [ ] Empty states for every screen
- [ ] EAS Build config (iOS + Android)
- [ ] App Store + Play Store listings

---

## Explicitly Deferred (Not MVP — Do Not Build Early)

- Monetization / Pro tier / payments
- Multi-route-per-list (e.g. separate "Day 1" / "Day 2" routes within one list)
- Public discovery / trending lists feed
- In-app reel video playback
- AI-assisted itinerary generation
- Web app

---

## Known Risks to Track

| # | Risk | Status |
|---|---|---|
| 1 | IG/TikTok may block OG-tag scraping (ToS/technical) | Open — manual fallback is the mitigation, not a fix |
| 2 | Liveblocks + Neon write-through consistency (race conditions on simultaneous edits) | Open — design write-through pattern carefully in Phase 7 |
| 3 | Cold-start empty app | Open — seed list planned for Phase 9, could pull earlier if needed |

---

## Session Log

| Date | What happened |
|---|---|
| Aug 2026 | Product scoped (standalone app, not Karvaan feature). PRD, DESIGN, ARCHITECTURE, DATABASE, CLAUDE, ROADMAP all drafted. Ready for Phase 1. |

---

## How to Start Next Session

```
1. Open Claude Code in the waypoint-app/ project folder
2. Say: "Read CLAUDE.md and ROADMAP.md, tell me what to build next"
3. Claude will pick up exactly where this left off
```
