import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export interface JwtPayload {
  userId: string;
}

/**
 * Signs a JWT containing { userId } with a 30-day expiry.
 * Call this server-side only (JWT_SECRET is never exposed to the client).
 */
export function signToken(payload: JwtPayload): string {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

/**
 * requireAuth — reads the Authorization: Bearer <token> header from a Request,
 * verifies it with JWT_SECRET, and returns the decoded { userId }.
 *
 * Throws a Response with status 401 if the header is missing or the token is invalid.
 * Usage (in any API route handler):
 *   const { userId } = await requireAuth(request);
 */
export async function requireAuth(request: Request): Promise<JwtPayload> {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');

  const authHeader = request.headers.get('Authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw Response.json({ error: 'Unauthorized — missing token' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!decoded?.userId) {
      throw new Error('Invalid payload');
    }
    return decoded;
  } catch {
    throw Response.json({ error: 'Unauthorized — invalid or expired token' }, { status: 401 });
  }
}
