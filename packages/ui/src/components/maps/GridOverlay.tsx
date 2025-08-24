'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMap, Polygon as LeafletPolygon } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import type { BBox, Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { SelectedCounty } from '@workspace/store/types/maps.ts';

interface GridOverlayProps {
  gridSize: number; // higher = smaller hexes
  selectedCounty: SelectedCounty;
  editable?: boolean;
  clipEdges?: boolean;
  onUpdateZones: (zones: number[]) => void; // <- same contract
}

// at top of GridOverlay.tsx
function stableIdForFeature(shape: Feature<Polygon | MultiPolygon>): number {
  const [lng = 0, lat = 0] = turf.centerOfMass(shape).geometry.coordinates; // [lng, lat]
  const qLng = Math.round((lng) * 1e6);   // <-- parens
  const qLat = Math.round((lat) * 1e6);
  let h = 5381;
  h = ((h << 5) + h) ^ qLng;
  h = ((h << 5) + h) ^ qLat;
  return h >>> 0;
}



const gridCache = new Map<string, { cells: { id: number; coords: L.LatLngTuple[][] }[] }>();

// --- tiny helpers ---
const toSet = (arr: number[]) => new Set<number>(arr);
const toArray = (s: Set<number>) => Array.from(s).sort((a, b) => a - b);
const toggle = (s: Set<number>, id: number) => (s.has(id) ? s.delete(id) : s.add(id));

export default function GridOverlay({
  gridSize,
  selectedCounty,
  editable = false,
  clipEdges = false,
  onUpdateZones,
}: GridOverlayProps) {
  const map = useMap();
  const [visible, setVisible] = useState(false);
  const [countyFeature, setCountyFeature] = useState<Feature<Polygon | MultiPolygon> | null>(null);
  const [gridCells, setGridCells] = useState<{ id: number; coords: L.LatLngTuple[][] }[]>([]);
  const [loading, setLoading] = useState(false);
  const seen = new Set<number>();

  // --- NEW: edit state for multi-select painting ---
  const zonesRef = useRef<Set<number>>(toSet(selectedCounty.ZONE));   // live working set
  const paintingRef = useRef(false);                                   // is mouse down
  const eraseModeRef = useRef(false);                                  // alt = erase mode

  // keep working set in sync when props change externally
  useEffect(() => {
    zonesRef.current = toSet(selectedCounty.ZONE);
  }, [selectedCounty.GEO_ID, selectedCounty.ZONE]);

  // Only show grid when zoomed in
  useEffect(() => {
    const checkZoom = () => setVisible(map.getZoom() >= 7);
    checkZoom();
    map.on('zoomend', checkZoom);

    // ✅ cleanup must return void
    return () => {
      map.off('zoomend', checkZoom);
    };
  }, [map]);

  // Idle callback polyfill
  const requestIdle: (cb: () => void) => number =
    typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? (window as any).requestIdleCallback
      : (cb: () => void) => window.setTimeout(cb, 1);

  const cancelIdle: (id: number) => void =
    typeof window !== 'undefined' && 'cancelIdleCallback' in window
      ? (window as any).cancelIdleCallback
      : (id: number) => window.clearTimeout(id);

  // Load county data for the active county
  useEffect(() => {
    let alive = true;
    fetch('/us-counties.json')
      .then((res) => res.json())
      .then((geo: FeatureCollection<Polygon | MultiPolygon>) => {
        if (!alive) return;
        const feature = geo.features.find((f) => f.properties?.GEO_ID === selectedCounty.GEO_ID) || null;
        setCountyFeature(feature);
      })
      .catch((err) => console.error('Failed to load county data:', err));
    return () => { alive = false; };
  }, [selectedCounty.GEO_ID]);

  // Build hex grid (km-based) with caching + chunking
  useEffect(() => {
    if (!countyFeature || gridSize <= 0 || !visible) {
      setGridCells([]);
      return;
    }
    const cf = countyFeature as Feature<Polygon | MultiPolygon>; // <- local non-null

    const cacheKey = `${selectedCounty.GEO_ID}-hex-${gridSize}-${clipEdges}`;
    const cached = gridCache.get(cacheKey);
    if (cached) {
      setGridCells(cached.cells);
      return;
    }

    setLoading(true);

    const idleId = requestIdle(() => {
      const [minX, minY, maxX, maxY] = turf.bbox(cf);
      const widthKm = turf.distance([minX, minY], [maxX, minY], { units: 'kilometers' });
      const hexSizeKm = Math.max(widthKm / gridSize, 3);

      const hexGrid = turf.hexGrid([minX, minY, maxX, maxY], hexSizeKm, { units: 'kilometers' });
      const cells: { id: number; coords: L.LatLngTuple[][] }[] = [];

      const hexes = hexGrid.features.filter((h) => turf.booleanIntersects(h, cf));
      const batchSize = 200;
      let index = 0;

      const normalizeCoords = (coords: number[][][] | number[][][][]): L.LatLngTuple[][] =>
        (coords as number[][][]).map((ring) => ring.map(([lng, lat]) => [lat, lng] as L.LatLngTuple));

      function processBatch() {
        const pushCell = (coords: L.LatLngTuple[][], base: Feature<Polygon | MultiPolygon>) => {
          const id = stableIdForFeature(base);
          if (seen.has(id)) return; // skip dup if clipping produced same centroid
          seen.add(id);
          cells.push({ id, coords });
        };
        const slice = hexes.slice(index, index + batchSize);
        for (const hex of slice) {
          let shape: Feature<Polygon | MultiPolygon> | null = hex;

          if (clipEdges) {
            try {
              const clipped = turf.intersect(
                turf.featureCollection([cf, hex]) as FeatureCollection<Polygon | MultiPolygon>
              );
              if (!clipped || turf.area(clipped) === 0) {
                continue;   // don't advance index or schedule next batch here
              }
              shape = clipped;
            } catch {
              // skip malformed intersections
            }
          }

          if (!shape) continue;

          if (shape.geometry.type === 'Polygon') {
            pushCell(normalizeCoords(shape.geometry.coordinates), shape);
          } else {
            shape.geometry.coordinates.forEach((poly) => {
              // turn each MultiPolygon part into a temp Polygon feature just for ID + coords
              const tmp = turf.polygon(poly) as Feature<Polygon | MultiPolygon>;
              pushCell(normalizeCoords(poly), tmp);
            });
          }
        }

        index += batchSize;
        if (index < hexes.length) requestIdle(processBatch);
        else {
          gridCache.set(cacheKey, { cells });
          setGridCells(cells);
          setLoading(false);
        }
      }

      processBatch();
    });

    return () => cancelIdle(idleId);
  }, [countyFeature, gridSize, clipEdges, selectedCounty.GEO_ID, visible]);

  // 3) Mask useMemo — same pattern
  const maskCoords = useMemo(() => {
    if (!countyFeature || !editable) return null;
    const cf = countyFeature as Feature<Polygon | MultiPolygon>; // <- local non-null

    const worldPoly = turf.polygon([[[-200, -95], [200, -95], [200, 95], [-200, 95], [-200, -95]]]);
    const cleanedCounty = turf.rewind(cf, { reverse: true }) as Feature<Polygon | MultiPolygon>;

    try {
      const mask = turf.difference(
        turf.featureCollection([worldPoly, cleanedCounty]) as FeatureCollection<Polygon | MultiPolygon>
      );
      if (!mask) return null;

      const normalizeCoords = (coords: number[][][] | number[][][][]): L.LatLngTuple[][] =>
        (coords as number[][][]).map((ring) => ring.map(([lng, lat]) => [lat, lng] as L.LatLngTuple));

      if (mask.geometry.type === 'Polygon') return [normalizeCoords(mask.geometry.coordinates)];
      if (mask.geometry.type === 'MultiPolygon') return mask.geometry.coordinates.map(normalizeCoords);
    } catch {
      return null;
    }
    return null;
  }, [countyFeature, editable]);

  // --- NEW: drag paint wiring (only when editable) ---
  useEffect(() => {
    if (!editable) return;
    const down = (e: L.LeafletMouseEvent) => {
      paintingRef.current = true;
      eraseModeRef.current = !!(e.originalEvent as MouseEvent).altKey;
      map.dragging.disable();
    };
    const up = () => {
      if (!paintingRef.current) return;
      paintingRef.current = false;
      eraseModeRef.current = false;
      map.dragging.enable();
      onUpdateZones(toArray(zonesRef.current));
    };
    const upWindow = () => up(); // commit even if pointer leaves the map

    map.on('mousedown', down);
    map.on('mouseup', up);
    map.on('mouseout', up);
    window.addEventListener('mouseup', upWindow);

    return () => {
      map.off('mousedown', down);
      map.off('mouseup', up);
      map.off('mouseout', up);
      window.removeEventListener('mouseup', upWindow);
      map.dragging.enable();
    };
  }, [map, editable, onUpdateZones]);


  if (!countyFeature || !visible) return null;

  return (
    <>
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-white" />
        </div>
      )}

      {editable && maskCoords?.map((poly, i) => (
        <LeafletPolygon
          key={`mask-${i}`}
          positions={poly}
          pathOptions={{ color: 'black', weight: 0, fillColor: 'black', fillOpacity: 0.5 }}
          interactive={false}
        />
      ))}

      {editable
        ? gridCells.map((cell) => {
          const selected = zonesRef.current.has(cell.id);
          return (
            <LeafletPolygon
              key={cell.id}
              positions={cell.coords}
              pathOptions={{
                color: zonesRef.current.has(cell.id) ? 'green' : 'gray',
                weight: 1,
                fillOpacity: zonesRef.current.has(cell.id) ? 0.3 : 0.05,
              }}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  const next = new Set(zonesRef.current);
                  toggle(next, cell.id);
                  zonesRef.current = next;
                  onUpdateZones(toArray(next));
                },
                mousemove: () => {
                  if (!paintingRef.current) return;
                  const next = new Set(zonesRef.current);
                  if (eraseModeRef.current) next.delete(cell.id); else next.add(cell.id);
                  zonesRef.current = next;
                  // commit on mouseup for fewer renders
                },
              }}
            />
          );
        })
        : gridCells
          .filter((cell) => selectedCounty.ZONE.includes(cell.id))
          .map((cell) => (
            <LeafletPolygon
              key={`zone-${cell.id}`}
              positions={cell.coords}
              pathOptions={{ color: 'green', weight: 2, fillColor: 'green', fillOpacity: 0.3 }}
              interactive={false}
            />
          ))}
    </>
  );
}
