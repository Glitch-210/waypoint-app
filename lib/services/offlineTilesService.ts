import { OfflineManager } from '@maplibre/maplibre-react-native';
import { Place } from '../../types';

interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

function getBoundingBox(places: Place[]): BoundingBox | null {
  const withCoords = places.filter((p) => p.lat != null && p.lng != null);
  if (withCoords.length === 0) return null;

  const lats = withCoords.map((p) => p.lat!);
  const lngs = withCoords.map((p) => p.lng!);

  // Add ~5km padding (~0.045 degrees)
  const PAD = 0.045;
  return {
    minLat: Math.min(...lats) - PAD,
    maxLat: Math.max(...lats) + PAD,
    minLng: Math.min(...lngs) - PAD,
    maxLng: Math.max(...lngs) + PAD,
  };
}

export async function downloadTilePack(listId: string, places: Place[]): Promise<void> {
  const bbox = getBoundingBox(places);
  if (!bbox) {
    console.warn('[offlineTiles] No coordinates to derive bounding box from');
    return;
  }

  const packName = `waypoint-list-${listId}`;

  // Delete existing pack first to avoid duplicates
  try {
    await OfflineManager.deletePack(packName);
  } catch (_) {
    // Ignore — pack may not exist yet
  }

  const key = process.env.EXPO_PUBLIC_MAPTILER_API_KEY;
  const styleURL = key
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${key}`
    : 'https://demotiles.maplibre.org/style.json';

  await OfflineManager.createPack(
    {
      mapStyle: styleURL,
      minZoom: 10,
      maxZoom: 14,
      bounds: [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat],
      metadata: { name: packName },
    },
    (_region: any, status: any) => {
      if (__DEV__ && status) {
        console.log(`[offlineTiles] ${packName}: ${Math.round(status.percentage || 0)}%`);
      }
    },
    (_region: any, error: any) => {
      console.warn(`[offlineTiles] ${packName} error:`, error);
    }
  );
}

export async function deleteTilePack(listId: string): Promise<void> {
  const packName = `waypoint-list-${listId}`;
  try {
    await OfflineManager.deletePack(packName);
  } catch (err) {
    console.warn('[offlineTiles] deletePack failed:', err);
  }
}
