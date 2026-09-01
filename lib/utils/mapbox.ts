export interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

export async function searchPlaces(query: string): Promise<MapboxFeature[]> {
  if (!query) return [];

  const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  
  if (!token) {
    console.warn('EXPO_PUBLIC_MAPBOX_TOKEN is missing. Returning mock data.');
    return getMockPlaces(query);
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${token}&autocomplete=true&limit=5&country=in`
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();
    return data.features as MapboxFeature[];
  } catch (error) {
    console.error('Error fetching from Mapbox:', error);
    return getMockPlaces(query);
  }
}

function getMockPlaces(query: string): MapboxFeature[] {
  return [
    {
      id: 'mock-1',
      text: 'Gateway of India',
      place_name: 'Gateway of India, Apollo Bandar, Colaba, Mumbai, Maharashtra 400001, India',
      center: [72.8347, 18.9220],
    },
    {
      id: 'mock-2',
      text: 'Taj Mahal',
      place_name: 'Taj Mahal, Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001, India',
      center: [78.0421, 27.1751],
    },
    {
      id: 'mock-3',
      text: 'Qutub Minar',
      place_name: 'Qutub Minar, Mehrauli, New Delhi, Delhi 110030, India',
      center: [77.1855, 28.5245],
    },
    {
      id: 'mock-4',
      text: `${query} Cafe`,
      place_name: `${query} Cafe, Indiranagar, Bengaluru, Karnataka, India`,
      center: [77.6412, 12.9716],
    },
  ];
}
