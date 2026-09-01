import { prisma } from '../db/prisma';

export async function getUserLists(userId: string) {
  return prisma.list.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { collaborators: { some: { userId } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      collaborators: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      _count: { select: { places: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getListById(listId: string, userId: string) {
  const list = await prisma.list.findFirst({
    where: {
      id: listId,
      OR: [
        { ownerId: userId },
        { collaborators: { some: { userId } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      collaborators: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      places: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!list) {
    throw new Error('List not found or access denied');
  }

  return list;
}

export async function createList(data: { name: string; coverImageUrl?: string; ownerId: string }) {
  return prisma.list.create({
    data: {
      name: data.name,
      coverImageUrl: data.coverImageUrl,
      ownerId: data.ownerId,
      collaborators: {
        create: {
          userId: data.ownerId,
          role: 'owner',
        },
      },
    },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      collaborators: true,
      _count: { select: { places: true } },
    },
  });
}

export async function updateList(
  listId: string,
  userId: string,
  data: { name?: string; coverImageUrl?: string }
) {
  // Enforce ownership or editor role
  const existing = await prisma.list.findFirst({
    where: {
      id: listId,
      OR: [
        { ownerId: userId },
        { collaborators: { some: { userId, role: { in: ['owner', 'editor'] } } } },
      ],
    },
  });

  if (!existing) {
    throw new Error('Unauthorized to edit this list');
  }

  return prisma.list.update({
    where: { id: listId },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.coverImageUrl !== undefined ? { coverImageUrl: data.coverImageUrl } : {}),
    },
  });
}

export async function deleteList(listId: string, userId: string) {
  // Only owner can delete list
  const existing = await prisma.list.findFirst({
    where: { id: listId, ownerId: userId },
  });

  if (!existing) {
    throw new Error('Only the owner can delete this list');
  }

  return prisma.list.delete({
    where: { id: listId },
  });
}

export async function addCollaborator(listId: string, userId: string, role: string = 'editor') {
  // Check if they already exist
  const existing = await prisma.listCollaborator.findFirst({
    where: { listId, userId }
  });

  if (existing) {
    return existing;
  }

  return prisma.listCollaborator.create({
    data: {
      listId,
      userId,
      role,
    }
  });
}

/**
 * Seeds a "Goa Weekend" sample list for brand-new users.
 * Only runs if the user has zero existing lists.
 */
export async function seedOnboardingList(userId: string) {
  const existingCount = await prisma.list.count({
    where: { ownerId: userId },
  });

  if (existingCount > 0) return null;

  const list = await prisma.list.create({
    data: {
      name: 'Goa Weekend 🌊',
      ownerId: userId,
      isOfflineCached: false,
      collaborators: {
        create: { userId, role: 'owner' },
      },
      places: {
        create: [
          {
            name: 'Baga Beach',
            address: 'Baga, Goa 403516',
            lat: 15.5555,
            lng: 73.7516,
            sourceType: 'manual',
            parseStatus: 'manual',
            orderIndex: 0,
            inRoute: true,
            addedById: userId,
          },
          {
            name: 'Panjim Market',
            address: 'Panaji, Goa 403001',
            lat: 15.4909,
            lng: 73.8278,
            sourceType: 'manual',
            parseStatus: 'manual',
            orderIndex: 1,
            inRoute: true,
            addedById: userId,
          },
          {
            name: 'Dudhsagar Falls',
            address: 'Sanguem, Goa 403406',
            lat: 15.3144,
            lng: 74.3143,
            sourceType: 'manual',
            parseStatus: 'manual',
            orderIndex: 2,
            inRoute: false,
            addedById: userId,
          },
          {
            name: 'Anjuna Flea Market',
            address: 'Anjuna, Goa 403509',
            lat: 15.5748,
            lng: 73.7427,
            sourceType: 'manual',
            parseStatus: 'manual',
            orderIndex: 3,
            inRoute: false,
            addedById: userId,
          },
        ],
      },
    },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      collaborators: true,
      _count: { select: { places: true } },
    },
  });

  return list;
}

