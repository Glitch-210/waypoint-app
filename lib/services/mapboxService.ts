const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN!;

export type RouteGeometry = {
  type: 'LineString';
  coordinates: number[][];
};

export async function getRoute(coordinates: { lat: number; lng: number }[]): Promise<RouteGeometry | null> {
  if (coordinates.length < 2) return null;

  // Directions API expects coordinates in longitude,latitude format
  const coordString = coordinates.map(c => `${c.lng},${c.lat}`).join(';');
  
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordString}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry as RouteGeometry;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Mapbox route:', error);
    return null;
  }
}
