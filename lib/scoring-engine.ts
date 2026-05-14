import { Property } from './daft-service';
import { getCommuteTime, getNearbyAmenities } from './geo-service';

export interface SearchCriteria {
  numPeople: number;
  numWorkers: number;
  budget: number;
  rooms: number;
  workers: Array<{
    address: string;
    lat: number;
    lon: number;
    transport: 'car' | 'public';
  }>;
  priorities: {
    schools: number;
    hospitals: number;
    supermarkets: number;
    transport: number;
  };
}

export interface ScoredProperty extends Property {
  score: number;
  commuteTimes: number[];
  amenitiesCount: {
    schools: number;
    hospitals: number;
    supermarkets: number;
    transport: number;
  };
}

// Utility to add delay between requests to avoid rate limits
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function scoreProperties(
  properties: Property[],
  criteria: SearchCriteria
): Promise<ScoredProperty[]> {
  const scored: ScoredProperty[] = [];

  for (const p of properties) {
    try {
      // 1. Commute Score
      // Run commute times in parallel for a single property
      const commuteTimes = await Promise.all(
        criteria.workers.map(w => getCommuteTime({ lat: p.latitude, lon: p.longitude }, { lat: w.lat, lon: w.lon }, w.transport))
      );

      const avgCommute = commuteTimes.length > 0
        ? commuteTimes.reduce((a, b) => a + b, 0) / commuteTimes.length
        : 0;

      let equidistancePenalty = 0;
      if (commuteTimes.length > 1) {
        const max = Math.max(...commuteTimes);
        const min = Math.min(...commuteTimes);
        equidistancePenalty = (max - min) * 1.5;
      }

      const commuteScore = Math.max(0, 150 - (avgCommute * 2) - equidistancePenalty);

      // 2. Amenities Score
      // Only fetch amenities if the priority is not 'Low' (3) or if it's the only way to rank
      const fetchAmenity = async (type: 'school' | 'hospital' | 'supermarket' | 'transport', priority: number) => {
        if (priority === 3 && Math.random() > 0.3) return 0; // Heuristic: skip 70% of low priority amenity checks to save API calls
        return await getNearbyAmenities(p.latitude, p.longitude, type);
      };

      const amenities = {
        schools: await fetchAmenity('school', criteria.priorities.schools),
        hospitals: await fetchAmenity('hospital', criteria.priorities.hospitals),
        supermarkets: await fetchAmenity('supermarket', criteria.priorities.supermarkets),
        transport: await fetchAmenity('transport', criteria.priorities.transport),
      };

      const getWeight = (prio: number) => {
        if (prio === 1) return 10;
        if (prio === 2) return 5;
        return 1;
      };

      const amenitiesScore = (
        (Math.min(amenities.schools, 3) * getWeight(criteria.priorities.schools)) +
        (Math.min(amenities.hospitals, 2) * getWeight(criteria.priorities.hospitals)) +
        (Math.min(amenities.supermarkets, 3) * getWeight(criteria.priorities.supermarkets)) +
        (Math.min(amenities.transport, 5) * getWeight(criteria.priorities.transport))
      );

      scored.push({
        ...p,
        score: Math.round(commuteScore + amenitiesScore),
        commuteTimes,
        amenitiesCount: amenities
      });

      // Small delay between properties to be nice to APIs
      await delay(200);
    } catch (err) {
      console.error(`Failed to score property ${p.id}:`, err);
      // Fallback with neutral score
      scored.push({
        ...p,
        score: 50,
        commuteTimes: criteria.workers.map(() => 30),
        amenitiesCount: { schools: 0, hospitals: 0, supermarkets: 0, transport: 0 }
      });
    }
  }

  return scored.sort((a, b) => b.score - a.score);
}
