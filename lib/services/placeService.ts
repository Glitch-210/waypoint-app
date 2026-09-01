import { prisma } from '../db/prisma';

export async function getPlacesForList(listId: string, userId: string) {
  // Enforce ownership or collaborator access
  const list = await prisma.list.findFirst({
    where: {
      id: listId,
      OR: [
        { ownerId: userId },
        { collaborators: { some: { userId } } },
      ],
    },
  });

  if (!list) {
    throw new Error('List not found or access denied');
  }

  return prisma.place.findMany({
    where: { listId },
    orderBy: { orderIndex: 'asc' },
  });
}

export async function createPlace(
  userId: string,
  data: {
    listId: string;
    name: string;
    lat?: number;
    lng?: number;
    address?: string;
    notes?: string;
    sourceType: 'instagram' | 'tiktok' | 'youtube' | 'maps' | 'manual';
    photoUrl?: string;
    parseStatus: 'parsed' | 'manual' | 'failed';
  }
) {
  // Enforce ownership or editor role
  const list = await prisma.list.findFirst({
    where: {
      id: data.listId,
      OR: [
        { ownerId: userId },
        { collaborators: { some: { userId, role: { in: ['owner', 'editor'] } } } },
      ],
    },
    include: {
      _count: { select: { places: true } },
    }
  });

  if (!list) {
    throw new Error('Unauthorized to add places to this list');
  }

  // Put at the end of the list
  const orderIndex = list._count.places;

  return prisma.place.create({
    data: {
      ...data,
      addedById: userId,
      orderIndex,
    },
  });
}

export async function deletePlace(placeId: string, userId: string) {
  // Find place and its list to check permissions
  const place = await prisma.place.findUnique({
    where: { id: placeId },
    include: { list: true },
  });

  if (!place) {
    throw new Error('Place not found');
  }

  const hasAccess = await prisma.list.findFirst({
    where: {
      id: place.listId,
      OR: [
        { ownerId: userId },
        { collaborators: { some: { userId, role: { in: ['owner', 'editor'] } } } },
      ],
    },
  });

  if (!hasAccess) {
    throw new Error('Unauthorized to delete this place');
  }

  return prisma.place.delete({
    where: { id: placeId },
  });
}

export async function togglePlaceInRoute(placeId: string, inRoute: boolean, userId: string) {
  // Find place to check permissions
  const place = await prisma.place.findUnique({
    where: { id: placeId },
    include: { list: true },
  });

  if (!place) {
    throw new Error('Place not found');
  }

  const hasAccess = await prisma.list.findFirst({
    where: {
      id: place.listId,
      OR: [
        { ownerId: userId },
        { collaborators: { some: { userId, role: { in: ['owner', 'editor'] } } } },
      ],
    },
  });

  if (!hasAccess) {
    throw new Error('Unauthorized to edit this place');
  }

  return prisma.place.update({
    where: { id: placeId },
    data: { inRoute },
  });
}
