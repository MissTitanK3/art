import type { RegionOperationalMinimumSnapshot } from '@workspace/store/types/academy-readiness.ts';

export function formatStaffingRange(range?: [number, number?]): string | undefined {
  if (!range) return undefined;
  const [min, max] = range;
  if (typeof max === 'number' && max > 0) {
    return `${min}-${max}`;
  }
  return String(min);
}
