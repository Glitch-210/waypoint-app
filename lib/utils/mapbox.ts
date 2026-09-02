export interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

export async function searchPlaces(query: string): Promise<MapboxFeature[]> {
  if (!query) return [];

  const token = process.env.EXPO_PUBLIC_MAPTILER_API_KEY;
  
  if (!token) {
    console.warn('EXPO_PUBLIC_MAPTILER_API_KEY is missing. Returning mock data.');
    return getMockPlaces(query);
  }

  try {
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${token}&limit=5`
    );

    if (!response.ok) {
      throw new Error(`MapTiler Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.features) {
      return data.features.map((f: any) => ({
        id: f.id,
        text: f.text || f.place_name,
        place_name: f.place_name,
        center: f.center || f.geometry?.coordinates || [0, 0],
      }));
    }
    return getMockPlaces(query);
  } catch (error) {
    console.error('Error fetching from MapTiler geocoding:', error);
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
