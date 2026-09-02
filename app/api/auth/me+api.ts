import { requireAuth } from '../../../lib/auth/jwt';
import { prisma } from '../../../lib/db/prisma';

/**
 * GET /api/auth/me
 *
 * Validates the session JWT and returns the current user's profile from Neon.
 * Called by AuthContext on app load to hydrate the in-memory user state.
 *
 * Returns: { user: { id, email, name, avatarUrl } }
 */
export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth(request);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ user });
  } catch (err: any) {
    // requireAuth throws a Response on 401 — Expo Router re-throws it
    if (err instanceof Response) throw err;
    console.error('[GET /api/auth/me]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
