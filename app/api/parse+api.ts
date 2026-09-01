import { searchPlaces } from '../../lib/utils/mapbox';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return Response.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return Response.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';

    // Very naive extraction: take the first part of the title before common separators
    let extractedName = ogTitle.split('|')[0].split('-')[0].trim();
    if (!extractedName) extractedName = targetUrl;

    let sourceType = 'manual';
    if (targetUrl.includes('instagram.com')) sourceType = 'instagram';
    else if (targetUrl.includes('tiktok.com')) sourceType = 'tiktok';
    else if (targetUrl.includes('google.com/maps')) sourceType = 'maps';
    else sourceType = 'link';

    // Attempt geocoding with the extracted name
    const places = await searchPlaces(extractedName);
    
    // We take the top result as our "geocoded" location if available
    let location = null;
    let confidence = 'none';

    if (places && places.length > 0) {
      location = {
        name: extractedName,
        address: places[0].place_name,
        lat: places[0].center[1],
        lng: places[0].center[0],
      };
      // Simple confidence heuristic: if it found something, mark as partial. 
      // In a real app we'd compare the text strongly.
      confidence = 'partial';
    } else {
      location = {
        name: extractedName,
        address: '',
        lat: 0,
        lng: 0,
      };
    }

    return Response.json({
      success: true,
      data: {
        url: targetUrl,
        ogTitle,
        ogDescription,
        ogImage,
        sourceType,
        location,
        confidence,
      }
    });
  } catch (error: any) {
    console.error('Parsing error:', error);
    return Response.json({ error: error.message || 'Unknown parsing error' }, { status: 500 });
  }
}
