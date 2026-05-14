'use server';

import { scrapeDaft } from '@/lib/daft-service';
import { scoreProperties, SearchCriteria, ScoredProperty } from '@/lib/scoring-engine';

export async function searchPropertiesAction(criteria: SearchCriteria): Promise<ScoredProperty[]> {
  try {
    // 1. Fetch properties from Daft (Server-side, no CORS issue)
    const rawProperties = await scrapeDaft({
      rooms: criteria.rooms,
      maxPrice: criteria.budget
    });

    // Limit to top 15 to avoid hitting API rate limits during scoring
    const limitedProperties = rawProperties.slice(0, 15);

    // 2. Score properties (Server-side, can use Node libraries and bypass client-side limits)
    const scoredProperties = await scoreProperties(limitedProperties, criteria);

    return scoredProperties;
  } catch (error) {
    console.error('Error in searchPropertiesAction:', error);
    throw new Error('Failed to search and score properties');
  }
}
