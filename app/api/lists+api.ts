import { getUserLists, createList, updateList, deleteList, seedOnboardingList } from '../../lib/services/listService';
import { syncUserToNeon } from '../../lib/db/syncUser';

// GET /api/lists?userId=xxx
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return Response.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    let lists = await getUserLists(userId);

    // Cold-start onboarding: seed sample list for brand-new users
    if (lists.length === 0) {
      const seeded = await seedOnboardingList(userId);
      if (seeded) {
        lists = await getUserLists(userId);
      }
    }

    return Response.json({ lists });
  } catch (err: any) {
    console.error('[GET /api/lists]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/lists  { name, ownerId, clerkId, email, displayName, avatarUrl }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, ownerId, clerkId, email, displayName, avatarUrl } = body;

    if (!name || !ownerId) {
      return Response.json({ error: 'Missing name or ownerId' }, { status: 400 });
    }

    // Ensure user exists in DB before creating a list
    if (clerkId && email) {
      await syncUserToNeon({ clerkId, email, name: displayName, avatarUrl });
    }

    const list = await createList({ name, ownerId });
    return Response.json({ list }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/lists]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/lists  { listId, userId, name, coverImageUrl }
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { listId, userId, name, coverImageUrl } = body;

    if (!listId || !userId) {
      return Response.json({ error: 'Missing listId or userId' }, { status: 400 });
    }

    const updated = await updateList(listId, userId, { name, coverImageUrl });
    return Response.json({ list: updated });
  } catch (err: any) {
    console.error('[PATCH /api/lists]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/lists  { listId, userId }
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { listId, userId } = body;

    if (!listId || !userId) {
      return Response.json({ error: 'Missing listId or userId' }, { status: 400 });
    }

    const deleted = await deleteList(listId, userId);
    return Response.json({ list: deleted });
  } catch (err: any) {
    console.error('[DELETE /api/lists]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
