import { getUserLists, createList, seedOnboardingList } from '../../lib/services/listService';
import { syncUserToNeon } from '../../lib/db/syncUser';

// GET /api/lists?userId=xxx
// POST /api/lists  { name, ownerId }
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
