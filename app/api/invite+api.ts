import { addCollaborator } from '../../lib/services/listService';

// POST /api/invite  { listId, userId, role? }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { listId, userId, role = 'editor' } = body;

    if (!listId || !userId) {
      return Response.json({ error: 'Missing listId or userId' }, { status: 400 });
    }

    const collaborator = await addCollaborator(listId, userId, role);
    return Response.json({ collaborator }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/invite]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
