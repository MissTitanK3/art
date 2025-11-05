// Shared map utilities and types

export type FilterKey = 'Beacon' | 'Cache' | 'Assembly';

export const FILTERS: FilterKey[] = ['Beacon', 'Cache', 'Assembly'];

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function sourceToFilter(s?: string): FilterKey {
  const v = (s || '').toLowerCase();
  if (v.includes('dispatch') || v.includes('beacon')) return 'Beacon';
  if (v.includes('class') || v.includes('assembly')) return 'Assembly';
  return 'Cache';
}

export function colorForFilter(f: FilterKey): string {
  switch (f) {
    case 'Beacon':
      return '#7c3aed';
    case 'Assembly':
      return '#fb923c';
    case 'Cache':
    default:
      return '#06b6d4';
  }
}

// Haversine distance in kilometers
export function haversineKm(a: [number, number], b: [number, number]) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
