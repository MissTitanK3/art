// packages/ui/src/components/maps/utils.ts
'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L, { Polygon } from 'leaflet';
import type { GeoJsonObject, FeatureCollection, Feature, MultiPolygon } from 'geojson';
import { SelectedCounty } from './CountyLayer.tsx';

/** ---------- Pure helpers (no React hooks) ---------- **/

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

/** Leaflet path styles (constant so it can be imported anywhere) */
export const STYLES = {
  base: { color: '#666', weight: 1, fillOpacity: 0.05 } as L.PathOptions,
  active: { color: '#111', weight: 2, fillOpacity: 0.15 } as L.PathOptions,
  hover: { color: '#000', weight: 2, fillOpacity: 0.12 } as L.PathOptions,
} as const;

/** Compute bounds from any GeoJSON object */
export function computeBounds(geojson?: GeoJSON.FeatureCollection) {
  try {
    if (!geojson) return null;
    const gj = L.geoJSON(geojson as any);
    const b = gj.getBounds();
    gj.remove();
    return b.isValid() ? b : null;
  } catch {
    return null;
  }
}

/** Fit bounds once safely (explicit map + bounds) */
export function fitBoundsOnce(
  map: L.Map | null | undefined,
  bounds: L.LatLngBounds | null | undefined,
  padding: [number, number] = [12, 12],
) {
  if (!map || !bounds || !bounds.isValid?.()) return;
  map.fitBounds(bounds, { padding });
}

/** ---------- React components (hooks live here) ---------- **/

/**
 * AutoFit: on mount/update, fits the map to the given GeoJSON geometry.
 * Use only inside a <MapContainer> tree.
 */
export function AutoFit({ data, padding = [12, 12] }: { data: GeoJsonObject; padding?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (!data) return;
    try {
      const gj = L.geoJSON(data as any);
      const b = gj.getBounds();
      gj.remove();
      if (b.isValid()) map.fitBounds(b, { padding });
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, data, padding[0], padding[1]]);
  return null;
}

/**
 * DoOnceOnReady: runs a callback once when the map finishes its initial load.
 * This avoids relying on MapContainer.whenReady’s () => void signature in TS.
 */
export function DoOnceOnReady({ run }: { run: (m: L.Map) => void }) {
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
  // You can keep side-effects related to the map lifecycle here.
  // Keeping it as a component avoids calling hooks at module scope.
  useMap(); // intentionally referenced to tie into the map tree
  return null;
}

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
  for (const c of list)
    if (!seen.has(c.GEO_ID)) {
      seen.add(c.GEO_ID);
      out.push(c);
    }
  return out;
}
