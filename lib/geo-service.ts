import axios from 'axios';

export interface Location {
  lat: number;
  lon: number;
  display_name: string;
}

// Simple in-memory cache for the lifetime of the server process (or until restart)
const cache = new Map<string, any>();

async function withCache<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const result = await fn();
  cache.set(key, result);
  return result;
}

export async function geocode(address: string): Promise<Location | null> {
  const cacheKey = `geocode:${address}`;
  return withCache(cacheKey, async () => {
    try {
      const eircodeRegex = /^([A-Z][0-9][0-9W])\s?([0-9A-Z]{4})$/i;
      const match = address.trim().match(eircodeRegex);

      let query = address.trim();
      let fallbacks: string[] = [];

      if (match) {
        const routingKey = match[1].toUpperCase();
        // Nominatim is bad with Eircodes, use Dublin district fallback if applicable
        if (routingKey.startsWith('D')) {
          const district = routingKey === 'D6W' ? '6W' : parseInt(routingKey.substring(1)).toString();
          fallbacks.push(`Dublin ${district}, Ireland`);
        }
        // General fallback with Routing Key
        fallbacks.push(`${routingKey}, Ireland`);
      } else if (!query.toLowerCase().includes('ireland')) {
        query = query + ', Ireland';
      }

      // Try primary query
      let response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: query, format: 'json', limit: 1, countrycodes: 'ie' },
        headers: { 'User-Agent': 'VersaTemple-Housing-App-v2' }
      });

      // Try fallbacks if primary fails
      if ((!response.data || response.data.length === 0) && fallbacks.length > 0) {
        for (const fb of fallbacks) {
          response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: { q: fb, format: 'json', limit: 1, countrycodes: 'ie' },
            headers: { 'User-Agent': 'VersaTemple-Housing-App-v2' }
          });
          if (response.data && response.data.length > 0) break;
        }
      }

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
          display_name: response.data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  });
}

export async function getCommuteTime(
  start: { lat: number; lon: number },
  end: { lat: number; lon: number },
  mode: 'car' | 'public'
): Promise<number> {
  const cacheKey = `route:${start.lat},${start.lon}:${end.lat},${end.lon}:${mode}`;
  return withCache(cacheKey, async () => {
    try {
      const osrmMode = mode === 'car' ? 'driving' : 'foot';

      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/${osrmMode}/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`
      );

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const durationSeconds = response.data.routes[0].duration;

        if (mode === 'public') {
          return Math.floor((durationSeconds / 60) * 1.8);
        }

        return Math.floor(durationSeconds / 60);
      }
      return 30;
    } catch (error) {
      console.error('Routing error:', error);
      return 30;
    }
  });
}

export async function getDistanceToNearest(
  lat: number,
  lon: number,
  type: 'school' | 'hospital' | 'supermarket' | 'transport'
): Promise<number> {
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLon = Math.round(lon * 1000) / 1000;
  const cacheKey = `nearest_dist:${roundedLat},${roundedLon}:${type}`;

  return withCache(cacheKey, async () => {
    try {
      const queries = {
        school: `[out:json];node["amenity"="school"](around:5000,${lat},${lon});out body;`,
        hospital: `[out:json];node["amenity"="hospital"](around:10000,${lat},${lon});out body;`,
        supermarket: `[out:json];node["shop"="supermarket"](around:5000,${lat},${lon});out body;`,
        transport: `[out:json];(node["highway"="bus_stop"](around:2000,${lat},${lon});node["railway"="station"](around:3000,${lat},${lon}));out body;`
      };

      const query = queries[type];
      const response = await axios.get('https://overpass-api.de/api/interpreter', {
        params: { data: query },
        timeout: 10000
      });

      if (response.data && response.data.elements && response.data.elements.length > 0) {
        let minDistance = Infinity;
        for (const el of response.data.elements) {
          // Haversine approx
          const dLat = (el.lat - lat) * Math.PI / 180;
          const dLon = (el.lon - lon) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat * Math.PI / 180) * Math.cos(el.lat * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const dist = 6371000 * c; // meters
          if (dist < minDistance) minDistance = dist;
        }
        return Math.round(minDistance);
      }
      return 10000;
    } catch (error) {
      console.error('Overpass distance error:', error);
      return 10000;
    }
  });
}

export async function getNearbyAmenities(
  lat: number,
  lon: number,
  type: 'school' | 'hospital' | 'supermarket' | 'transport'
): Promise<number> {
  // Round lat/lon to 3 decimal places (~110m) to increase cache hits for nearby properties
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLon = Math.round(lon * 1000) / 1000;
  const cacheKey = `amenities:${roundedLat},${roundedLon}:${type}`;

  return withCache(cacheKey, async () => {
    try {
      const queries = {
        school: `[out:json];node["amenity"="school"](around:2000,${lat},${lon});out count;`,
        hospital: `[out:json];node["amenity"="hospital"](around:3000,${lat},${lon});out count;`,
        supermarket: `[out:json];node["shop"="supermarket"](around:1500,${lat},${lon});out count;`,
        transport: `[out:json];(node["highway"="bus_stop"](around:500,${lat},${lon});node["railway"="station"](around:1000,${lat},${lon}));out count;`
      };

      const query = queries[type];

      const response = await axios.get('https://overpass-api.de/api/interpreter', {
        params: { data: query },
        timeout: 5000
      });

      if (response.data && response.data.elements && response.data.elements.length > 0) {
        // Overpass count returns elements with a tags.count if using out count,
        // but often it just returns the elements themselves if query is simple.
        // For 'out count', it returns one element of type 'count'.
        const countElement = response.data.elements.find((e: any) => e.type === 'count');
        if (countElement) return parseInt(countElement.tags.total) || 0;

        return response.data.elements.length || 0;
      }
      return 0;
    } catch (error) {
      console.error('Overpass error:', error);
      return 0;
    }
  });
}
