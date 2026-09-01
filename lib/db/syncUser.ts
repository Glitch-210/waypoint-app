import { prisma } from './prisma';

export interface SyncUserData {
  clerkId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export async function syncUserToNeon(userData: SyncUserData) {
  try {
    const user = await prisma.user.upsert({
      where: { clerkId: userData.clerkId },
      update: {
        email: userData.email,
        name: userData.name ?? undefined,
        avatarUrl: userData.avatarUrl ?? undefined,
      },
      create: {
        clerkId: userData.clerkId,
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
