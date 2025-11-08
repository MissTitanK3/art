// lib/locationCache.ts
import { LatLngExpression } from 'leaflet';

let lastCoords: LatLngExpression | null = null;
let lastFetch = 0;

export function getCachedLocation() {
  return { coords: lastCoords, timestamp: lastFetch };
}

export function setCachedLocation(coords: LatLngExpression) {
  lastCoords = coords;
  lastFetch = Date.now();
}

export function clearCachedLocation() {
  lastCoords = null;
  lastFetch = 0;
}
