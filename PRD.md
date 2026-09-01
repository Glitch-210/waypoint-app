# Waypoint — PRD
> Playlists for travel places. Save from anywhere, route on a map, go.

---

## Problem

Travelers save places across Instagram Reels, TikTok, YouTube, WhatsApp forwards, and Google Maps — scattered, unsearchable, un-routable. No single place holds "everywhere I want to go in Goa" as an actionable, mappable list.

## Solution

Share any link (or paste text) → Waypoint extracts the place → it lands in a list ("playlist") → view all places in a list on a map → get a route between them → invite friends to co-build the list in real time.

**Tagline (draft):** "Spotify playlists, but for places."

## Users

India-based travelers, 18–34, who plan trips via Reels/social content and currently lose track of saved places across apps.

## Core Loop

```
Share/paste content → Parse (auto or manual) → Save to list → View on map → Route → Travel → (optional) collaborate with others on the list
```

## MVP Feature Set

1. **Lists ("Playlists")** — create, name, cover image, solo or shared.
2. **Ingestion** — native share-sheet target (iOS + Android) + in-app paste-link/text field. Auto-parse via OG-tag metadata + geocoding; falls back to manual place entry if parse fails.
3. **Place cards** — name, photo, address, source (original link/reel embed reference), notes.
4. **Map view** — all places in a list plotted; route/polyline between selected stops.
5. **Collaboration** — invite via link, shared lists, real-time updates when a collaborator adds/edits (Liveblocks).
6. **Offline** — saved lists + cached map region available without connectivity.

## Explicitly Out of Scope (MVP)

- Booking (flights/hotels/activities)
- Monetization / payments / Pro tier
- AI itinerary generation or day-by-day scheduling
- Personality quiz / archetypes
- In-app video playback of the original reel (link-out only)
- Public discovery feed / trending lists
- Android-first-only or iOS-first-only — both ship together
- Web app

## Success Signals (directional, no hard targets yet — pre-monetization)

- % of shared links that auto-parse successfully without manual fallback
- Lists with ≥2 collaborators (proxy for viral/organic growth)
- Places added per active list
- Retention: users returning to a list within 7 days of creating it

## Key Risks

| Risk | Mitigation |
|---|---|
| Instagram/TikTok block OG-tag scraping or change markup | Manual entry always available as fallback; treat parse as best-effort, not core dependency |
| Geocoding false-matches (wrong place from vague caption) | Always show a confirm/edit step before saving — never silent-save an unconfirmed location |
| Collab conflicts (two people edit same list) | Liveblocks CRDT-based sync handles this natively |
| Empty-app cold start | Onboarding seeds 1 example list ("Goa Weekend") so map/route features aren't empty on first open |

## Reference

Closest existing product: **Eighty Days | Travel Planner** (Phat Ventures) — validates demand, not a feature source to copy 1:1. Differentiate on collab + India-specific ingestion quality once live.
