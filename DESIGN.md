# Waypoint — DESIGN.md
> Reuses Karvaan's Airbnb-inspired design system as-is. Do not fork tokens without updating both projects intentionally.

---

## Design Tokens (identical to Karvaan)

| Token | Value |
|---|---|
| `canvas` | `#FFFFFF` |
| `surfaceSoft` | `#F7F7F7` |
| `surfaceStrong` | `#F2F2F2` |
| `ink` | `#222222` |
| `body` | `#3F3F3F` |
| `muted` | `#6A6A6A` |
| `primary` | `#BA0036` |
| `rausch` | `#FF385C` |
| `rauschActive` | `#E00B41` |
| `rauschDisabled` | `#FFD1DA` |
| `hairline` | `#DDDDDD` |
| Font | Plus Jakarta Sans, 400/500/600/700 |
| Radius | `sm` 4 · `DEFAULT` 8 · `md` 12 · `lg` 16 · `full` 9999 |
| Spacing | 4pt base: `xs` 4 · `sm` 8 · `md` 12 · `base` 16 · `lg` 24 · `xl` 32 |

## Waypoint-Specific Components (new)

**`playlist-card`** — cover image (list's first/pinned place photo), list name (`titleMd`), place count + collaborator avatars stacked bottom-right, `rounded.md`.

**`place-pin-card`** — bottom-sheet card shown on map pin tap: photo thumbnail, name, address, source-type icon (Instagram/TikTok/YouTube/Maps/manual), "Add to route" toggle.

**`ingestion-sheet`** — half-screen sheet on share-target trigger or "+Add" tap: paste field (auto-focused) OR shows parsed preview card (photo + title pulled from OG tags) with editable name/location before confirming save. Manual fallback: search-style place input (Mapbox place autocomplete) when parse fails.

**`parse-status-badge`** — small pill on place cards: green "Verified" (parsed + geocoded), amber "Check location" (manual/uncertain), shown only when relevant — don't clutter confirmed places.

**`collab-avatar-stack`** — overlapping circular avatars (max 4 + "+N"), top-right of list header. Tapping opens collaborator list + invite-link share sheet.

**`route-line`** — Rausch-colored polyline on map connecting selected stops in order; numbered circular waypoint markers (1, 2, 3…) in ink-on-white, replacing default map pins for routed stops.

**`offline-badge`** — small cloud-slash icon on list header when list + map region is cached for offline; tap to trigger/refresh caching.

## Map Styling

- Base map: clean/light Mapbox style (not satellite) matching the white-canvas aesthetic — avoid busy default POI clutter (disable default labels layer where possible; show only Waypoint pins).
- Selected/routed stops: Rausch numbered markers.
- Unselected saved places (in list but not on current route): ink outline pins, white fill.

## Motion

- Consistent with Karvaan: no elaborate transitions. Bottom sheets slide 300ms ease-out. New pin drop: subtle scale-in (1.0 → 1.1 → 1.0, 200ms) on save confirmation.

## Icons

Material Symbols, same as Karvaan, `FILL 1` for active/selected states.
