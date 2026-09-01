export interface ParsedPlaceCandidate {
  url: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  sourceType: string;
  location: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  confidence: 'none' | 'partial' | 'high';
}

export async function parseUrl(url: string): Promise<ParsedPlaceCandidate> {
  if (!url) throw new Error('No URL provided');

  // We fetch our own API route. 
  // In development, we can use a relative URL if running in Expo web, or absolute if running on mobile.
  // Since we don't have a configured host yet, we assume the API route is running on localhost/relative.
  // For Expo development on devices, relative paths to API routes do not work easily without knowing the dev server IP.
  // Assuming process.env.EXPO_PUBLIC_API_URL or similar, but for now we fallback to localhost if missing.
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081';
  
  const response = await fetch(`${baseUrl}/api/parse?url=${encodeURIComponent(url)}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to parse URL: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error('Failed to parse URL');
  }

  return data.data as ParsedPlaceCandidate;
}
