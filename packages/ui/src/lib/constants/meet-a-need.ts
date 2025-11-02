// Canonical Meet-A-Need categories for consistent filtering and entry
export const NEED_CATEGORIES: string[] = [
  'food_water',
  'shelter_housing',
  'clothing_warmth',
  'transportation',
  'medical_care',
  'mental_health_support',
  'legal_support',
  'childcare_eldercare',
  'funding_financial',
  'supplies_equipment',
  'communications',
  'translation_interpretation',
  'tech_support',
  'repairs_maintenance',
  'evacuation_relocation',
  'pet_animal_care',
  'documentation_media',
  'accessibility',
  'safety_deescalation',
  'education_training',
  'signal_boost',
  'other',
];

export function humanizeNeedCategory(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

