import { requireAuth } from '../../lib/auth/jwt';
import {
  getPlacesForList,
  createPlace,
  togglePlaceInRoute,
  deletePlace,
} from '../../lib/services/placeService';

// GET /api/places?listId=...
export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth(request);
    const url = new URL(request.url);
    const listId = url.searchParams.get('listId');

    if (!listId) {
      return Response.json({ error: 'Missing listId parameter' }, { status: 400 });
    }

    const places = await getPlacesForList(listId, userId);
    return Response.json({ places });
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error('[GET /api/places]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/places
export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth(request);
    const body = await request.json();
    const { listId, name, lat, lng, address, notes, sourceType, photoUrl, parseStatus } = body;

    if (!listId || !name) {
      return Response.json({ error: 'Missing required fields: listId and name' }, { status: 400 });
    }

    const place = await createPlace(userId, {
      listId,
      name,
      lat,
      lng,
      address,
      notes,
      sourceType: sourceType || 'manual',
      photoUrl,
      parseStatus: parseStatus || 'manual',
    });

    return Response.json({ place }, { status: 201 });
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error('[POST /api/places]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/places
export async function PATCH(request: Request) {
  try {
    const { userId } = await requireAuth(request);
    const body = await request.json();
    const { placeId, inRoute } = body;

    if (!placeId) {
      return Response.json({ error: 'Missing placeId' }, { status: 400 });
    }

    if (typeof inRoute === 'boolean') {
      const place = await togglePlaceInRoute(placeId, inRoute, userId);
      return Response.json({ place });
    }

    return Response.json({ error: 'No update parameters provided' }, { status: 400 });
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error('[PATCH /api/places]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/places
export async function DELETE(request: Request) {
  try {
    const { userId } = await requireAuth(request);
    const body = await request.json();
    const { placeId } = body;

    if (!placeId) {
      return Response.json({ error: 'Missing placeId' }, { status: 400 });
    }

    const place = await deletePlace(placeId, userId);
    return Response.json({ place });
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error('[DELETE /api/places]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
