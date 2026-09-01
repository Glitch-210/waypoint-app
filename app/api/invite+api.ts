import { addCollaborator } from '../../lib/services/listService';
import { prisma } from '../../lib/db/prisma';

async function resolveNeonUserId(clerkId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  return user?.id ?? null;
}

// POST /api/invite  { listId, clerkId, role? }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { listId, clerkId, userId, role = 'editor' } = body;

    const resolveId = clerkId || userId;
    if (!listId || !resolveId) {
      return Response.json({ error: 'Missing listId or clerkId' }, { status: 400 });
    }

    const neonUserId = await resolveNeonUserId(resolveId);
    if (!neonUserId) {
      return Response.json({ error: 'User not found. Please sign in first.' }, { status: 404 });
    }

    const collaborator = await addCollaborator(listId, neonUserId, role);
    return Response.json({ collaborator }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/invite]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
