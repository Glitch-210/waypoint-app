import { syncUserToNeon } from '../../../lib/db/syncUser';

// POST /api/user/sync  { clerkId, email, name, avatarUrl }
// Called on sign-in to upsert Clerk user into Neon Postgres User table.
// Returns the Neon User record including the UUID id field.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerkId, email, name, avatarUrl } = body;

    if (!clerkId || !email) {
      return Response.json({ error: 'Missing clerkId or email' }, { status: 400 });
    }

    // upsert user → always returns Neon User with UUID id
    const user = await syncUserToNeon({ clerkId, email, name, avatarUrl });
    return Response.json({ user }, { status: 200 });
  } catch (err: any) {
    console.error('[POST /api/user/sync]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
