import { getUserLists, createList, updateList, deleteList, seedOnboardingList } from '../../lib/services/listService';
import { syncUserToNeon } from '../../lib/db/syncUser';
import { prisma } from '../../lib/db/prisma';

/**
 * Resolve Clerk ID → Neon User.id (UUID).
 * Always use this before any Prisma query that takes userId.
 */
async function resolveNeonUserId(clerkId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  return user?.id ?? null;
}

// GET /api/lists?clerkId=xxx
export async function GET(request: Request) {
  const url = new URL(request.url);
  const clerkId = url.searchParams.get('clerkId') || url.searchParams.get('userId');

  if (!clerkId) {
    return Response.json({ error: 'Missing clerkId' }, { status: 400 });
  }

  try {
    const neonUserId = await resolveNeonUserId(clerkId);

    if (!neonUserId) {
      // User not yet synced — return empty list (they haven't signed in & synced yet)
      return Response.json({ lists: [] });
    }

    let lists = await getUserLists(neonUserId);

    // Cold-start onboarding: seed sample list for brand-new users
    if (lists.length === 0) {
      const seeded = await seedOnboardingList(neonUserId);
      if (seeded) {
        lists = await getUserLists(neonUserId);
      }
    }

    return Response.json({ lists });
  } catch (err: any) {
    console.error('[GET /api/lists]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/lists  { name, clerkId, email, displayName, avatarUrl }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, clerkId, email, displayName, avatarUrl } = body;

    if (!name || !clerkId) {
      return Response.json({ error: 'Missing name or clerkId' }, { status: 400 });
    }

    if (!email) {
      return Response.json({ error: 'Missing email for user sync' }, { status: 400 });
    }

    // 1. Sync/upsert user to Neon first — returns the Neon User with UUID id
    const neonUser = await syncUserToNeon({
      clerkId,
      email,
      name: displayName,
      avatarUrl,
    });

    // 2. Create the list using the Neon UUID (not Clerk ID)
    const list = await createList({ name, ownerId: neonUser.id });
    return Response.json({ list }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/lists]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/lists  { listId, clerkId, name, coverImageUrl }
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { listId, clerkId, name, coverImageUrl } = body;

    if (!listId || !clerkId) {
      return Response.json({ error: 'Missing listId or clerkId' }, { status: 400 });
    }

    const neonUserId = await resolveNeonUserId(clerkId);
    if (!neonUserId) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const updated = await updateList(listId, neonUserId, { name, coverImageUrl });
    return Response.json({ list: updated });
  } catch (err: any) {
    console.error('[PATCH /api/lists]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/lists  { listId, clerkId }
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { listId, clerkId } = body;

    if (!listId || !clerkId) {
      return Response.json({ error: 'Missing listId or clerkId' }, { status: 400 });
    }

    const neonUserId = await resolveNeonUserId(clerkId);
    if (!neonUserId) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const deleted = await deleteList(listId, neonUserId);
    return Response.json({ list: deleted });
  } catch (err: any) {
    console.error('[DELETE /api/lists]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
