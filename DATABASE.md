# Waypoint — DATABASE.md
> Neon Postgres via Prisma. Source of truth for durable data; Liveblocks handles live/ephemeral collab state.

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  googleId     String   @unique  // Google sub claim from id_token
  email        String   @unique
  name         String?
  avatarUrl    String?
  createdAt    DateTime @default(now())

  lists        List[]            @relation("OwnedLists")
  collabOn     ListCollaborator[]
}

model List {
  id            String   @id @default(uuid())
  ownerId       String
  owner         User     @relation("OwnedLists", fields: [ownerId], references: [id])
  name          String
  coverImageUrl String?
  isOfflineCached Boolean @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  places        Place[]
  collaborators ListCollaborator[]
}

model ListCollaborator {
  listId    String
  userId    String
  role      String   @default("editor") // 'owner' | 'editor' | 'viewer'
  invitedAt DateTime @default(now())

  list      List     @relation(fields: [listId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])

  @@id([listId, userId])
}

model Place {
  id           String   @id @default(uuid())
  listId       String
  list         List     @relation(fields: [listId], references: [id], onDelete: Cascade)

  name         String
  lat          Float?
  lng          Float?
  address      String?
  notes        String?

  sourceUrl    String?
  sourceType   String   @default("manual") // 'instagram' | 'tiktok' | 'youtube' | 'maps' | 'manual'
  photoUrl     String?

  parseStatus  String   @default("manual") // 'parsed' | 'manual' | 'failed'
  orderIndex   Int      @default(0)
  inRoute      Boolean  @default(false)     // currently selected for active route

  addedById    String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([listId])
}

model OfflineTilePack {
  id        String   @id @default(uuid())
  listId    String
  boundsJson String  // serialized bbox used to generate the pack
  createdAt DateTime @default(now())

  @@index([listId])
}
```

## Notes

- **No `waitlist`/`archetypes`/`vibe_filters` tables** — this is a clean project, not a Karvaan fork.
- `User.googleId` stores the Google `sub` claim from the verified `id_token`. It is populated at first sign-in via `/api/auth/google` and never changes. Auth is handled by `google-auth-library`'s `verifyIdToken()` + our own signed JWT (see `lib/auth/jwt.ts`).
- `Place.inRoute` is a simple boolean toggle for MVP routing (which pins are included in the current route line). Multi-route-per-list (e.g., "Day 1 route" vs "Day 2 route") is a post-MVP extension — track in ROADMAP, not built now.
- `parseStatus = 'failed'` places still save (with `sourceUrl` + raw text in `notes`) so nothing is silently dropped — user completes the entry manually later.
- Real-time edits from Liveblocks write through to `Place`/`List` on mutation; Liveblocks storage is not itself the durable store.
- R2 stores actual image bytes; `photoUrl` is the R2 public/CDN URL, not raw upload.
- RLS-equivalent enforcement happens at the API layer (Prisma has no native RLS like Supabase) — every query must filter by `ownerId` or a `ListCollaborator` join. All protected API routes call `requireAuth(request)` from `lib/auth/jwt.ts` to extract the verified `userId` from the JWT — **never trust a user ID supplied in the request body or query string**.
