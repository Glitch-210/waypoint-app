import { prisma } from './prisma';

export interface SyncUserData {
  googleId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

/**
 * Upserts a User row in Neon via googleId.
 * Called from /api/auth/google after verifying the Google id_token.
 * Returns the full User record (including the UUID id used for all downstream queries).
 */
export async function syncUserToNeon(userData: SyncUserData) {
  try {
    // If a record with this email already exists, update its googleId and profile
    const existingByEmail = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingByEmail) {
      return await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          googleId: userData.googleId,
          email: userData.email,
          name: userData.name ?? undefined,
          avatarUrl: userData.avatarUrl ?? undefined,
        },
      });
    }

    const user = await prisma.user.upsert({
      where: { googleId: userData.googleId },
      update: {
        email: userData.email,
        name: userData.name ?? undefined,
        avatarUrl: userData.avatarUrl ?? undefined,
      },
      create: {
        googleId: userData.googleId,
        email: userData.email,
        name: userData.name ?? undefined,
        avatarUrl: userData.avatarUrl ?? undefined,
      },
    });
    return user;
  } catch (error) {
    console.error('Failed to sync user to Neon:', error);
    throw error;
  }
}
