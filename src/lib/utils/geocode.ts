const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AddressSuggestion {
  id: string;
  placeName: string;
  center: Coordinates;
  context?: {
    city?: string;
    region?: string;
    postcode?: string;
    country?: string;
  };
}

interface MapboxContextItem {
  id: string;
  text: string;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  context?: MapboxContextItem[];
}

function parseContext(context?: MapboxContextItem[]): AddressSuggestion["context"] {
  if (!context) return undefined;
  const find = (prefix: string) => context.find((c) => c.id.startsWith(prefix))?.text;
  return {
    city:     find("place") ?? find("locality"),
    region:   find("region"),
    postcode: find("postcode"),
    country:  find("country"),
  };
}

// Address-as-you-type suggestions (Mapbox Geocoding API, autocomplete=true).
// Debouncing/cancellation of stale requests is the caller's responsibility
// (see AddressAutocomplete) — this just does the fetch + shape the response.
export async function fetchAddressSuggestions(query: string, limit = 5): Promise<AddressSuggestion[]> {
  const trimmed = query.trim();
  if (!MAPBOX_TOKEN || trimmed.length < 3) return [];

  try {
    const q = encodeURIComponent(trimmed);
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json` +
      `?autocomplete=true&country=ca&limit=${limit}` +
      `&types=address,place,postcode,locality,neighborhood` +
      `&access_token=${MAPBOX_TOKEN}`,
    );
    if (!res.ok) return [];
    const json = await res.json();
    const features = (json?.features ?? []) as MapboxFeature[];
    return features.map((f) => ({
      id:        f.id,
      placeName: f.place_name,
      center:    { lng: f.center[0], lat: f.center[1] },
      context:   parseContext(f.context),
    }));
  } catch {
    return [];
  }
}

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const full = await geocodeAddressFull(address);
  return full?.center ?? null;
}

// Same lookup as geocodeAddress, but also returns the parsed city/region/
// postcode context — used on blur so a typed-and-tabbed-away address (never
// clicked from the suggestion dropdown) still gets its city/state/postcode
// filled in, not just coordinates. Without this, a form that requires those
// fields silently stays unsubmittable for anyone who didn't click a suggestion.
export async function geocodeAddressFull(address: string): Promise<AddressSuggestion | null> {
  const trimmed = address.trim();
  if (!MAPBOX_TOKEN || !trimmed) return null;

  try {
    const query = encodeURIComponent(trimmed);
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?country=ca&limit=1&access_token=${MAPBOX_TOKEN}`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    const feature = json?.features?.[0] as MapboxFeature | undefined;
    if (!feature?.center) return null;
    return {
      id:        feature.id,
      placeName: feature.place_name,
      center:    { lng: feature.center[0], lat: feature.center[1] },
      context:   parseContext(feature.context),
    };
  } catch {
    return null;
  }
}

export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
