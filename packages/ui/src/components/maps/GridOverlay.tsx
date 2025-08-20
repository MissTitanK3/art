'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMap, Polygon as LeafletPolygon } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { BBox, Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { SelectedCounty } from './LeafletMapImpl.tsx';

interface GridOverlayProps {
  gridSize: number; // higher = smaller hexes
  selectedCounty: SelectedCounty;
  editable?: boolean;
  clipEdges?: boolean;
  onUpdateZones: (zones: number[]) => void;
}

const gridCache = new Map<string, { cells: { id: number; coords: L.LatLngTuple[][] }[] }>();

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

  // Only show grid when zoomed in
  useEffect(() => {
    const checkZoom = () => setVisible(map.getZoom() >= 7);
    checkZoom();
    map.on('zoomend', checkZoom);
    return () => {
      map.off('zoomend', checkZoom);
    };
  }, [map]);

  // Idle callback polyfill
  const requestIdle: (cb: () => void) => number =
    typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? window.requestIdleCallback
      : (cb: () => void) => window.setTimeout(cb, 1);

  const cancelIdle: (id: number) => void =
    typeof window !== 'undefined' && 'cancelIdleCallback' in window
      ? window.cancelIdleCallback
      : (id: number) => window.clearTimeout(id);

  // Load county data
  useEffect(() => {
    fetch('/us-counties.json')
      .then((res) => res.json())
      .then((geo: FeatureCollection<Polygon | MultiPolygon>) => {
        const feature = geo.features.find((f) => f.properties?.GEO_ID === selectedCounty.GEO_ID) || null;
        setCountyFeature(feature);
      })
      .catch((err) => console.error('Failed to load county data:', err));
  }, [selectedCounty.GEO_ID]);

  // Build hex grid using kilometers (more consistent)
  useEffect(() => {
    if (!countyFeature || gridSize <= 0 || !visible) {
      setGridCells([]);
      return;
    }

    const cacheKey = `${selectedCounty.GEO_ID}-hex-${gridSize}-${clipEdges}`;
    const cached = gridCache.get(cacheKey);
    if (cached) {
      setGridCells(cached.cells);
      return;
    }

    setLoading(true);

    const idleId = requestIdle(() => {
      const [minX, minY, maxX, maxY] = turf.bbox(countyFeature);

      const widthKm = turf.distance([minX, minY], [maxX, minY], { units: 'kilometers' });
      const hexSizeKm = Math.max(widthKm / gridSize, 3); // don't go smaller than 1 km per hex

      const hexRadius = hexSizeKm / 50;
      const horizontalPad = hexRadius * 3; // one full width
      const verticalPad = hexRadius * 1.732; // ~sqrt(3) for hex height

      const paddedBbox: BBox = [minX - horizontalPad, minY - verticalPad, maxX + horizontalPad, maxY + verticalPad];

      const hexGrid = turf.hexGrid(paddedBbox, hexSizeKm, { units: 'kilometers' });
      const cells: { id: number; coords: L.LatLngTuple[][] }[] = [];
      let id = 0;

      // Process in chunks to avoid freezing
      const hexes = hexGrid.features.filter((h) => turf.booleanIntersects(h, countyFeature));
      const batchSize = 200;
      let index = 0;

      function processBatch() {
        const slice = hexes.slice(index, index + batchSize);
        for (const hex of slice) {
          let shape: Feature<Polygon | MultiPolygon> | null = hex;

          if (clipEdges && countyFeature) {
            try {
              const clipped = turf.intersect(
                turf.featureCollection([countyFeature, hex]) as FeatureCollection<Polygon | MultiPolygon>,
              );
              if (!clipped || turf.area(clipped) === 0) continue;
              shape = clipped;
            } catch {
              continue;
            }
          }

          if (!shape) continue;

          const normalizeCoords = (coords: number[][][] | number[][][][]): L.LatLngTuple[][] =>
            (coords as number[][][]).map((ring) => ring.map(([lng, lat]) => [lat, lng] as L.LatLngTuple));

          if (shape.geometry.type === 'Polygon') {
            cells.push({ id: id++, coords: normalizeCoords(shape.geometry.coordinates) });
          } else if (shape.geometry.type === 'MultiPolygon') {
            shape.geometry.coordinates.forEach((poly) => {
              cells.push({ id: id++, coords: normalizeCoords(poly) });
            });
          }
        }

        index += batchSize;
        if (index < hexes.length) {
          requestIdle(processBatch);
        } else {
          gridCache.set(cacheKey, { cells });
          setGridCells(cells);
          setLoading(false);
        }
      }

      processBatch();
    });

    return () => cancelIdle(idleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countyFeature, gridSize, clipEdges, selectedCounty.GEO_ID, visible]);

  // Mask outside the county
  const maskCoords = useMemo(() => {
    if (!countyFeature || !editable) return null;

    const worldPoly = turf.polygon([
      [
        [-200, -95],
        [200, -95],
        [200, 95],
        [-200, 95],
        [-200, -95],
      ],
    ]);

    const cleanedCounty = turf.rewind(countyFeature, { reverse: true }) as Feature<Polygon | MultiPolygon>;
    try {
      const mask = turf.difference(
        turf.featureCollection([worldPoly, cleanedCounty]) as FeatureCollection<Polygon | MultiPolygon>,
      );
      if (!mask) return null;

      const normalizeCoords = (coords: number[][][] | number[][][][]): L.LatLngTuple[][] =>
        (coords as number[][][]).map((ring) => ring.map(([lng, lat]) => [lat, lng] as L.LatLngTuple));

      if (mask.geometry.type === 'Polygon') {
        return [normalizeCoords(mask.geometry.coordinates)];
      } else if (mask.geometry.type === 'MultiPolygon') {
        return mask.geometry.coordinates.map(normalizeCoords);
      }
    } catch {
      return null;
    }
    return null;
  }, [countyFeature, editable]);

  if (!countyFeature || !visible) return null;

  return (
    <>
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-white"></div>
        </div>
      )}

      {editable &&
        maskCoords?.map((poly, i) => (
          <LeafletPolygon
            key={`mask-${i}`}
            positions={poly}
            pathOptions={{
              color: 'black',
              weight: 0,
              fillColor: 'black',
              fillOpacity: 0.5,
            }}
            interactive={false}
          />
        ))}

      {editable &&
        gridCells.map((cell) => (
          <LeafletPolygon
            key={cell.id}
            positions={cell.coords}
            pathOptions={{
              color: selectedCounty.ZONE.includes(cell.id) ? 'green' : 'gray',
              weight: 1,
              fillOpacity: selectedCounty.ZONE.includes(cell.id) ? 0.3 : 0.05,
            }}
            eventHandlers={{
              click: () => {
                const updated = selectedCounty.ZONE.includes(cell.id)
                  ? selectedCounty.ZONE.filter((id) => id !== cell.id)
                  : [...selectedCounty.ZONE, cell.id];
                onUpdateZones(updated);
              },
            }}
          />
        ))}

      {!editable &&
        gridCells
          .filter((cell) => selectedCounty.ZONE.includes(cell.id))
          .map((cell) => (
            <LeafletPolygon
              key={`zone-${cell.id}`}
              positions={cell.coords}
              pathOptions={{
                color: 'green',
                weight: 2,
                fillColor: 'green',
                fillOpacity: 0.3,
              }}
              interactive={false}
            />
          ))}
    </>
  );
}
