import type { DistanceUnit } from "@workspace/store/usePreferencesStore";

export const MI_PER_KM = 0.621371;
export const KM_PER_MI = 1 / MI_PER_KM; // ~1.609344

export function kmToMi(km: number): number {
  return km * MI_PER_KM;
}

export function miToKm(mi: number): number {
  return mi * KM_PER_MI;
}

export function formatDistance(
  valueKm: number,
  unit: DistanceUnit,
  digits = 1,
): string {
  const v = unit === "mi" ? kmToMi(valueKm) : valueKm;
  return `${Number(v.toFixed(digits))} ${unit}`;
}

export function normalizeDistanceToKm(
  value: number,
  unit: DistanceUnit,
): number {
  return unit === "mi" ? miToKm(value) : value;
}
