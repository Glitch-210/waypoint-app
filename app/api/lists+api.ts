import { requireAuth } from '../../lib/auth/jwt';
import { getUserLists, createList, updateList, deleteList, seedOnboardingList } from '../../lib/services/listService';

// GET /api/lists
// Returns all lists owned by (or collaborated on by) the authenticated user.
export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth(request);

    let lists = await getUserLists(userId);

    // Cold-start onboarding: seed sample list for brand-new users with no lists
    if (lists.length === 0) {
      const seeded = await seedOnboardingList(userId);
      if (seeded) {
        lists = await getUserLists(userId);
      }
    }

    return Response.json({ lists });
  } catch (err: any) {
    if (err instanceof Response) throw err; // re-throw 401s
    console.error('[GET /api/lists]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/lists  { name }
export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth(request);
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return Response.json({ error: 'Missing name' }, { status: 400 });
    }

    const list = await createList({ name, ownerId: userId });
    return Response.json({ list }, { status: 201 });
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error('[POST /api/lists]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/lists  { listId, name?, coverImageUrl? }
export async function PATCH(request: Request) {
  try {
    const { userId } = await requireAuth(request);
    const body = await request.json();
    const { listId, name, coverImageUrl } = body;

    if (!listId) {
      return Response.json({ error: 'Missing listId' }, { status: 400 });
    }

    const updated = await updateList(listId, userId, { name, coverImageUrl });
    return Response.json({ list: updated });
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error('[PATCH /api/lists]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/lists  { listId }
export async function DELETE(request: Request) {
  try {
    const { userId } = await requireAuth(request);
    const body = await request.json();
    const { listId } = body;

    if (!listId) {
      return Response.json({ error: 'Missing listId' }, { status: 400 });
    }

    const deleted = await deleteList(listId, userId);
    return Response.json({ list: deleted });
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error('[DELETE /api/lists]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
