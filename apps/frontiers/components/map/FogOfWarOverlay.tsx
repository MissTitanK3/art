"use client";

import { useEffect, useMemo, useState } from "react";
import type { LatLngBounds } from "leaflet";
import { Pane, Rectangle, useMap, useMapEvents } from "react-leaflet";
import { fogTileDegrees, useFogOfWarStore } from "@/store/useFogOfWarStore";

// Config for fog sizing and padding (edit here for quick tuning)
const FOG_CONFIG = {
  marginTiles: 1.5, // how many tiles beyond viewport to render
  tileDegrees: fogTileDegrees, // pulled from store settings
  tileHalfSideDegrees: fogTileDegrees * 0.5, // derived size for square bounds
  fillOpacity: 0.5,
};

type Cell = {
  key: string;
  center: [number, number];
};

function computeCells(bounds: LatLngBounds): Cell[] {
  const step = FOG_CONFIG.tileDegrees;
  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const west = bounds.getWest();
  const east = bounds.getEast();

  // Work in tile indices to avoid floating point drift and duplicate keys
  const minLatIdx = Math.floor(south / step - FOG_CONFIG.marginTiles);
  const maxLatIdx = Math.ceil(north / step + FOG_CONFIG.marginTiles);
  const minLngIdx = Math.floor(west / step - FOG_CONFIG.marginTiles);
  const maxLngIdx = Math.ceil(east / step + FOG_CONFIG.marginTiles);

  const cells: Cell[] = [];
  for (let latIdx = minLatIdx; latIdx <= maxLatIdx; latIdx++) {
    for (let lngIdx = minLngIdx; lngIdx <= maxLngIdx; lngIdx++) {
      const key = `cell:${latIdx}:${lngIdx}`;
      const center: [number, number] = [
        (latIdx + 0.5) * step,
        (lngIdx + 0.5) * step,
      ];
      cells.push({
        key,
        center,
      });
    }
  }
  return cells;
}

export function FogOfWarOverlay() {
  const map = useMap();
  const discovered = useFogOfWarStore((s) => s.discovered);
  const [cells, setCells] = useState<Cell[]>([]);
  const halfSideDegrees = FOG_CONFIG.tileHalfSideDegrees; // square size derived from tile

  useEffect(() => {
    const update = () => setCells(computeCells(map.getBounds()));
    update();
    map.on("moveend zoomend", update);
    return () => {
      map.off("moveend", update);
      map.off("zoomend", update);
    };
  }, [map]);

  const fogCells = useMemo(
    () => cells.filter((c) => !discovered[c.key]),
    [cells, discovered],
  );

  if (!map) return null;

  return (
    <>
      <Pane name="fog-overlay" style={{ zIndex: 390 }}>
        {fogCells.map((c) => (
          <Rectangle
            key={c.key}
            bounds={[
              [c.center[0] - halfSideDegrees, c.center[1] - halfSideDegrees],
              [c.center[0] + halfSideDegrees, c.center[1] + halfSideDegrees],
            ]}
            pathOptions={{
              color: "transparent",
              fillColor: "#0f172a",
              fillOpacity: FOG_CONFIG.fillOpacity,
              weight: 0,
            }}
            pane="fog-overlay"
          />
        ))}
      </Pane>
    </>
  );
}

export function FogDiscoveryWatcher({
  radiusKm = 0.8,
  location,
}: {
  radiusKm?: number;
  location?: { lat: number; lng: number } | null;
}) {
  const mark = useFogOfWarStore((s) => s.markDiscovered);
  const map = useMapEvents({});

  // If a device/location is provided, only reveal when that location changes.
  useEffect(() => {
    if (location) {
      mark(location.lat, location.lng, radiusKm, "movement");
    }
  }, [location?.lat, location?.lng, mark, radiusKm]);

  // Fallback: if no location provided, use the map center as before
  useEffect(() => {
    if (location) return;
    const c = map.getCenter();
    mark(c.lat, c.lng, radiusKm, "movement");
    const handler = () => {
      const center = map.getCenter();
      mark(center.lat, center.lng, radiusKm, "movement");
    };
    map.on("moveend", handler);
    map.on("zoomend", handler);
    return () => {
      map.off("moveend", handler);
      map.off("zoomend", handler);
    };
  }, [location, map, mark, radiusKm]);

  return null;
}
