import { PropertyRecord } from './db';
import { getCommuteTime } from './geo-service';

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

export interface ScoredProperty {
  id: string;
  title: string;
  address: string;
  price: number;
  image: string;
  url: string;
  bedrooms: number;
  bathrooms: number;
  score: number;
  commuteTimes: number[];
  amenitiesCount: {
    schools: number;
    hospitals: number;
    supermarkets: number;
    transport: number;
  };
  lat: number;
  lon: number;
  description?: string;
  ber?: string;
  availableFrom?: string;
  features?: {
    garden: boolean;
    parking: boolean;
    accessible: boolean;
  }
}

export async function scoreProperty(p: PropertyRecord, criteria: SearchCriteria): Promise<ScoredProperty> {
  // 1. Calculate commutes
  const commuteTimes = await Promise.all(
    criteria.workers.map(worker =>
      getCommuteTime({ lat: p.lat, lon: p.lon }, { lat: worker.lat, lon: worker.lon }, worker.transport)
    )
  );

  // 2. Base Score from commutes
  const avgCommute = commuteTimes.reduce((a, b) => a + b, 0) / (commuteTimes.length || 1);

  // Equidistance penalty (fairness)
  let fairnessScore = 0;
  if (commuteTimes.length > 1) {
    const variance = commuteTimes.reduce((a, b) => a + Math.pow(b - avgCommute, 2), 0) / commuteTimes.length;
    const stdDev = Math.sqrt(variance);
    fairnessScore = stdDev * 2.5; // Penalty for large differences
  }

  let totalScore = 100 - (avgCommute * 0.4) - fairnessScore;

  // 3. Amenities Score (1 = High, 2 = Med, 3 = Low)
  const getWeight = (prio?: number) => {
    if (prio === 1) return 1.5;
    if (prio === 2) return 1.0;
    return 0.5;
  };

  const amenityScores = [
    { dist: p.dist_hospital, weight: getWeight(criteria.priorities?.hospitals), threshold: 3000 },
    { dist: p.dist_transport, weight: getWeight(criteria.priorities?.transport), threshold: 1000 },
    { dist: p.dist_supermarket, weight: getWeight(criteria.priorities?.supermarkets), threshold: 1500 },
    { dist: p.dist_school, weight: getWeight(criteria.priorities?.schools), threshold: 2000 },
  ];

  amenityScores.forEach(s => {
    if (s.dist <= s.threshold) totalScore += 12 * s.weight;
    else if (s.dist <= s.threshold * 2) totalScore += 6 * s.weight;
  });

  const finalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

  return {
    id: p.id.toString(),
    title: p.is_apartment ? 'Appartamento' : 'Casa',
    address: p.address || p.eircode,
    price: p.price,
    image: p.image_url || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800',
    url: '', // Local property
    bedrooms: p.rooms,
    bathrooms: p.bathrooms,
    score: finalScore,
    commuteTimes,
    amenitiesCount: {
      schools: p.dist_school <= 2000 ? 1 : 0,
      hospitals: p.dist_hospital <= 3000 ? 1 : 0,
      supermarkets: p.dist_supermarket <= 1500 ? 1 : 0,
      transport: p.dist_transport <= 800 ? 1 : 0
    },
    lat: p.lat,
    lon: p.lon,
    description: p.description,
    ber: p.ber,
    availableFrom: p.available_from,
    features: {
      garden: !!p.garden,
      parking: !!p.parking,
      accessible: !!p.is_accessible
    }
  };
}
