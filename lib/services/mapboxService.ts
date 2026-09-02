export type RouteGeometry = {
  type: 'LineString';
  coordinates: number[][];
};

export async function getRoute(coordinates: { lat: number; lng: number }[]): Promise<RouteGeometry | null> {
  if (coordinates.length < 2) return null;

  // Directions API expects coordinates in longitude,latitude format
  const coordString = coordinates.map(c => `${c.lng},${c.lat}`).join(';');
  
  // Use open OSRM routing engine (returns GeoJSON LineString geometry)
  const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Routing API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry as RouteGeometry;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching route:', error);
    return null;
  }
}
