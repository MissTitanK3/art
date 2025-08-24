'use client';

import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import type {
  GeoJsonObject,
  Feature,
  FeatureCollection,
  Geometry,
  GeometryCollection,
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon,
  Position,
} from 'geojson';
import type { SelectedCounty } from '@workspace/store/types/maps.ts';
import * as L from 'leaflet';

/** ---------- Pure helpers (no Leaflet import) ---------- **/

export function fipsFromGeoId(geoId?: string): string | undefined {
  if (!geoId) return undefined;
  const m = /^0500000US(\d{5})$/.exec(geoId);
  return m ? m[1] : undefined;
}

export function geoIdFromFips(fips: string): string {
  return `0500000US${fips}`;
}

export function stateFipsFromFips(fips: string): string {
  return fips.slice(0, 2);
}

/** Styling constants (simple POJOs; no Leaflet types needed) */
export const STYLES = {
  base: { color: '#666', weight: 1, fillOpacity: 0.05 },
  active: { color: '#111', weight: 2, fillOpacity: 0.15 },
  hover: { color: '#000', weight: 2, fillOpacity: 0.12 },
} as const;

/** ---------- Bounds helpers (pure) ---------- **/

// Internal mutable bounds accumulator
type BoundsAcc = { minLat: number; minLng: number; maxLat: number; maxLng: number };

// Final bounds tuple: [south, west, north, east]
export type BoundsTuple = [number, number, number, number];

function accInit(): BoundsAcc {
  return { minLat: Infinity, minLng: Infinity, maxLat: -Infinity, maxLng: -Infinity };
}
function accAdd(acc: BoundsAcc, coord: Position) {
  const [lng, lat] = coord; // GeoJSON is [lng, lat]
  if (!lat || !lng) return;
  if (lat < acc.minLat) acc.minLat = lat;
  if (lat > acc.maxLat) acc.maxLat = lat;
  if (lng < acc.minLng) acc.minLng = lng;
  if (lng > acc.maxLng) acc.maxLng = lng;
}
function accToTuple(acc: BoundsAcc): BoundsTuple | null {
  if (!isFinite(acc.minLat) || !isFinite(acc.minLng) || !isFinite(acc.maxLat) || !isFinite(acc.maxLng)) {
    return null;
  }
  return [acc.minLat, acc.minLng, acc.maxLat, acc.maxLng];
}

function walkCoords(coordinates: any, acc: BoundsAcc) {
  // Handles nested arrays of positions for all geometry types
  if (typeof coordinates[0] === 'number') {
    accAdd(acc, coordinates as Position);
    return;
  }
  for (const c of coordinates) walkCoords(c, acc);
}

function boundsOfGeometry(geom: Geometry, acc: BoundsAcc) {
  switch (geom.type) {
    case 'Point':
      accAdd(acc, (geom as Point).coordinates);
      break;
    case 'MultiPoint':
      for (const p of (geom as MultiPoint).coordinates) accAdd(acc, p);
      break;
    case 'LineString':
      walkCoords((geom as LineString).coordinates, acc);
      break;
    case 'MultiLineString':
      walkCoords((geom as MultiLineString).coordinates, acc);
      break;
    case 'Polygon':
      walkCoords((geom as Polygon).coordinates, acc);
      break;
    case 'MultiPolygon':
      walkCoords((geom as MultiPolygon).coordinates, acc);
      break;
    case 'GeometryCollection':
      for (const g of (geom as GeometryCollection).geometries) boundsOfGeometry(g, acc);
      break;
    default:
      break;
  }
}

/** Compute bounds from any GeoJSON object (pure) */
export function computeBounds(geojson?: GeoJsonObject): L.LatLngBounds | null {
  if (!geojson) return null;

  const acc = accInit();

  if ((geojson as FeatureCollection).type === 'FeatureCollection') {
    for (const f of (geojson as FeatureCollection).features) {
      if (f.geometry) boundsOfGeometry(f.geometry, acc);
    }
  } else if ((geojson as Feature).type === 'Feature') {
    const f = geojson as Feature;
    if (f.geometry) boundsOfGeometry(f.geometry, acc);
  } else {
    boundsOfGeometry(geojson as Geometry, acc);
  }

  const tuple = accToTuple(acc);
  if (!tuple) return null;

  const [south, west, north, east] = tuple;
  return L.latLngBounds([
    [south, west],
    [north, east],
  ] as L.LatLngBoundsLiteral);
}

/** Fit bounds once (accepts our tuple or a Leaflet LatLngBounds-like object) */
export function fitBoundsOnce(
  map: any /* Leaflet.Map */,
  bounds: BoundsTuple | { isValid?: () => boolean } | null | undefined,
  padding: [number, number] = [12, 12],
) {
  if (!map || !bounds) return;

  // If a Leaflet LatLngBounds-like was passed:
  if (typeof (bounds as any).isValid === 'function') {
    if ((bounds as any).isValid()) map.fitBounds(bounds, { padding });
    return;
  }

  // Our pure tuple form: [south, west, north, east]
  const [south, west, north, east] = bounds as BoundsTuple;
  if ([south, west, north, east].some((n) => !isFinite(n))) return;
  map.fitBounds(
    [
      [south, west],
      [north, east],
    ],
    { padding },
  );
}

/** ---------- React helpers (still Leaflet-free) ---------- **/

/**
 * AutoFit: on mount/update, fits the map to the given GeoJSON geometry.
 * Uses pure bounds + map.fitBounds with array form (no Leaflet import).
 */
export function AutoFit({ data, padding = [12, 12] }: { data: GeoJsonObject; padding?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (!data || !map) return;
    const b = computeBounds(data);
    if (b) {
      fitBoundsOnce(map, b, padding);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, data, padding[0], padding[1]]);
  return null;
}

/**
 * DoOnceOnReady: runs a callback once when the map finishes its initial load.
 * Still uses only the Leaflet API present on `map`, no imports needed here.
 */
export function DoOnceOnReady({ run }: { run: (m: any /* Leaflet.Map */) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const handler = () => run(map);
    map.once('load', handler);
    return () => {
      map.off('load', handler);
    };
  }, [map, run]);
  return null;
}

/** Placeholder that keeps a hook-anchored lifecycle if you need it later. */
export function FitHandler() {
  useMap(); // intentionally referenced to tie into the map tree
  return null;
}

/** Toggle a county in a list (pure) */
export function toggleCounty(list: SelectedCounty[], county: SelectedCounty) {
  const idx = list.findIndex((c) => c.GEO_ID === county.GEO_ID);
  return idx >= 0
    ? [...list.slice(0, idx), ...list.slice(idx + 1)] // remove
    : [...list, county]; // add
}

/** Optional: dedupe just in case of rapid double-clicks */
export function dedupeByGeoId(list: SelectedCounty[]) {
  const seen = new Set<string>();
  const out: SelectedCounty[] = [];
  for (const c of list) {
    if (!seen.has(c.GEO_ID)) {
      seen.add(c.GEO_ID);
      out.push(c);
    }
  }
  return out;
}

export const GEO_TO_FIPS = (geoId: string) => {
  const m = /^0500000US(\d{2})(\d{3})$/.exec(geoId);
  return m ? `${m[1]}${m[2]}` : null;
};

// export function computeBounds(geojson?: FeatureCollection): L.LatLngBounds | null {
//   if (!geojson) return null;
//   const bounds = L.geoJSON(geojson).getBounds();
//   return bounds.isValid() ? bounds : null;
// }

export function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoom(map.getZoom()),
  });
  // set once on mount, so UI is correct even before the first zoom
  useEffect(() => {
    onZoom(map.getZoom());
  }, [map, onZoom]);
  return null;
}
