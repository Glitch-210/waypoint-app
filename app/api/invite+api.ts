import { requireAuth } from '../../lib/auth/jwt';
import { addCollaborator } from '../../lib/services/listService';

// POST /api/invite  { listId, role? }
export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth(request);
    const body = await request.json();
    const { listId, role = 'editor' } = body;

    if (!listId) {
      return Response.json({ error: 'Missing listId' }, { status: 400 });
    }

    const collaborator = await addCollaborator(listId, userId, role);
    return Response.json({ collaborator }, { status: 201 });
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error('[POST /api/invite]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
