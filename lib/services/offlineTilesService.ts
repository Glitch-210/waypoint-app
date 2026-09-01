import Mapbox from '@rnmapbox/maps';
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
    await Mapbox.offlineManager.deletePack(packName);
  } catch (_) {
    // Ignore — pack may not exist yet
  }

  await Mapbox.offlineManager.createPack(
    {
      name: packName,
      styleURL: Mapbox.StyleURL.Street,
      minZoom: 10,
      maxZoom: 14,
      bounds: [
        [bbox.minLng, bbox.minLat],
        [bbox.maxLng, bbox.maxLat],
      ],
    },
    (region, status) => {
      if (__DEV__) {
        console.log(`[offlineTiles] ${packName}: ${Math.round(status.percentage)}%`);
      }
    }
  );
}

export async function deleteTilePack(listId: string): Promise<void> {
  const packName = `waypoint-list-${listId}`;
  try {
    await Mapbox.offlineManager.deletePack(packName);
  } catch (err) {
    console.warn('[offlineTiles] deletePack failed:', err);
  }
}
