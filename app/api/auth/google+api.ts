import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../../lib/db/prisma';
import { syncUserToNeon } from '../../../lib/db/syncUser';
import { signToken } from '../../../lib/auth/jwt';

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID || process.env.GOOGLE_OAUTH_IOS_CLIENT_ID;
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_ANDROID_CLIENT_ID || process.env.GOOGLE_OAUTH_ANDROID_CLIENT_ID;

// Build the list of valid audiences for verifyIdToken.
// At minimum the web client ID is required; native IDs are optional extras.
function getAudiences(): string[] {
  const audiences: string[] = [];
  if (webClientId) audiences.push(webClientId);
  if (iosClientId) audiences.push(iosClientId);
  if (androidClientId) audiences.push(androidClientId);
  if (audiences.length === 0) {
    throw new Error('No Google OAuth client IDs configured');
  }
  return audiences;
}

/**
 * POST /api/auth/google
 *
 * Body: { idToken: string }
 *
 * 1. Verifies the Google id_token against Google's public keys.
 * 2. Upserts the User row in Neon (keyed on googleId = Google "sub" claim).
 * 3. Issues a signed 30-day JWT containing { userId: User.id }.
 * 4. Returns { sessionToken, user }.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, mode } = body;

    if (!idToken || typeof idToken !== 'string') {
      return Response.json({ error: 'Missing idToken' }, { status: 400 });
    }

    // --- Verify id_token with Google ---
    const client = new OAuth2Client();
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: getAudiences(),
      });
    } catch (verifyErr: any) {
      console.error('[POST /api/auth/google] Token verification failed:', verifyErr.message);
      return Response.json({ error: 'Invalid Google id_token' }, { status: 401 });
    }

    const payload = ticket.getPayload();
    if (!payload) {
      return Response.json({ error: 'Empty token payload' }, { status: 401 });
    }

    const { sub: googleId, email, name, picture: avatarUrl } = payload;

    if (!googleId || !email) {
      return Response.json(
        { error: 'Token missing required claims (sub, email)' },
        { status: 401 }
      );
    }

    // --- Check user existence for sign-in / sign-up distinction ---
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email },
        ],
      },
    });

    if (mode === 'signin' && !existingUser) {
      return Response.json(
        { error: 'No account found. Please sign up.' },
        { status: 404 }
      );
    }

    if (mode === 'signup' && existingUser) {
      return Response.json(
        { error: 'Account already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // --- Upsert user in Neon ---
    const user = await syncUserToNeon({
      googleId,
      email,
      name: name ?? null,
      avatarUrl: avatarUrl ?? null,
    });

    // --- Issue our own JWT (30 days) ---
    const sessionToken = signToken({ userId: user.id });

    return Response.json(
      {
        sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[POST /api/auth/google]', err);
    return Response.json({ error: err.message ?? 'Internal server error' }, { status: 500 });
  }
}
