'use server';

import db, { PropertyRecord } from '@/lib/db';
import { SearchCriteria, ScoredProperty, scoreProperty } from '@/lib/scoring-engine';

export async function searchPropertiesAction(criteria: SearchCriteria): Promise<ScoredProperty[]> {
  try {
    // 1. Fetch all properties from local SQLite
    const properties = db.prepare('SELECT * FROM properties WHERE price <= ? AND rooms >= ?').all(criteria.budget, criteria.rooms) as PropertyRecord[];

    // 2. Score them
    const scoredProperties: ScoredProperty[] = await Promise.all(
      properties.map(p => scoreProperty(p, criteria))
    );

    // 3. Sort by score
    return scoredProperties.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Search action error:', error);
    return [];
  }
}
