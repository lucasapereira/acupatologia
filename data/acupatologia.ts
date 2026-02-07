const jsonData = require('./acupatologia_v2.json');

export type CategoryType = 'Patologia' | 'Síndrome' | 'Ponto';

export interface AcupunctureException {
  id: string;
  name: string;
  description: string;
  points: string;
  category: CategoryType;
}

// Cast the imported data to ensures it matches the interface
export const acupunctureData: AcupunctureException[] = (jsonData as any[]).map(item => ({
  id: String(item.id),
  name: item.name,
  description: item.description || item.name,
  points: item.points,
  category: (item.category as CategoryType) || 'Patologia'
}));
