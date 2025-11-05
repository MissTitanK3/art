import type { ArtSignal } from '@/schemas/art_signals';
import { FILTERS, FilterKey, colorForFilter, sourceToFilter } from './utils';

export function computeSignalPoints({
  signals,
  filters,
  center,
  ringStep = 0.02,
  seasonColors,
}: {
  signals: ArtSignal[];
  filters: Record<FilterKey, boolean>;
  center: [number, number];
  ringStep?: number;
  seasonColors?: Record<string, string> | null;
}) {
  const enabled = new Set<FilterKey>(FILTERS.filter((k) => filters[k]));
  const visible = signals.filter((s) => enabled.has(sourceToFilter(s.source_type)));
  const result: { signal: ArtSignal; lat: number; lng: number; color: string }[] = [];
  let ring = 1;
  let idxInRing = 0;
  for (const s of visible) {
    const f = sourceToFilter(s.source_type);
    const color = (seasonColors && (seasonColors as any)[f]) || colorForFilter(f);
    const slots = 6 + ring * 6;
    const angle = (idxInRing / slots) * Math.PI * 2;
    const lat = center[0] + Math.sin(angle) * ring * ringStep;
    const lng = center[1] + Math.cos(angle) * ring * ringStep;
    result.push({ signal: s, lat, lng, color });
    idxInRing++;
    if (idxInRing >= slots) {
      idxInRing = 0;
      ring++;
    }
  }
  return result;
}
