import { getPlacesForList, createPlace, togglePlaceInRoute } from '../../lib/services/placeService';

// GET /api/places?listId=xxx&userId=xxx
export async function GET(request: Request) {
  const url = new URL(request.url);
  const listId = url.searchParams.get('listId');
  const userId = url.searchParams.get('userId');

  if (!listId || !userId) {
    return Response.json({ error: 'Missing listId or userId' }, { status: 400 });
  }

  try {
    const places = await getPlacesForList(listId, userId);
    return Response.json({ places });
  } catch (err: any) {
    console.error('[GET /api/places]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/places  { userId, ...placeData }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...placeData } = body;

    if (!userId || !placeData.listId || !placeData.name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const place = await createPlace(userId, placeData);
    return Response.json({ place }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/places]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/places  { placeId, inRoute, userId }
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { placeId, inRoute, userId } = body;

    if (!placeId || inRoute === undefined || !userId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const place = await togglePlaceInRoute(placeId, inRoute, userId);
    return Response.json({ place });
  } catch (err: any) {
    console.error('[PATCH /api/places]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
