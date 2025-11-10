export type LatLng = { lat: number; lng: number };

export function distanceM(a: LatLng, b: LatLng): number {
  const R = 6371e3;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function formatDistance(meters: number, unit: "km" | "mi") {
  const km = meters / 1000;
  const mi = meters / 1609.344;
  const v = unit === "km" ? km : mi;
  return `${v.toFixed(v < 10 ? 2 : 1)} ${unit}`;
}
