'use client';

import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useMemo, useRef, useCallback, useEffect, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import CountyLayer, { SelectedCounty } from './CountyLayer.tsx';
import { fitBoundsOnce, toggleCounty } from './utils.ts';
import GridOverlay from './GridOverlay.tsx';

export function computeBounds(geojson?: FeatureCollection): L.LatLngBounds | null {
  if (!geojson) return null;
  const bounds = L.geoJSON(geojson).getBounds();
  return bounds.isValid() ? bounds : null;
}

export type CountySelectMapProps = {
  geojson?: FeatureCollection;
  selected: SelectedCounty[];
  onChange(next: SelectedCounty[]): void;
  onMapReady?: (map: L.Map) => void;
  editor?: {
    county: SelectedCounty;
    gridSize?: number;
    clipEdges?: boolean;
    onUpdateZones: (geoId: string, zones: number[]) => void;
  };
};

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoom(map.getZoom()),
  });
  // set once on mount, so UI is correct even before the first zoom
  useEffect(() => {
    onZoom(map.getZoom());
  }, [map, onZoom]);
  return null;
}

export default function CountySelectMap({
  geojson,
  selected,
  onChange,
  onMapReady,
  editor,
}: CountySelectMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const { center, zoom, initialBounds } = useMemo(() => {
    const b = computeBounds(geojson);
    if (b) return { center: b.getCenter() as L.LatLngExpression, zoom: 6, initialBounds: b };
    return { center: [37.8, -96] as L.LatLngExpression, zoom: 4, initialBounds: null as L.LatLngBounds | null };
  }, [geojson]);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);

  const handleToggleCounty = useCallback(
    (county: SelectedCounty, bounds: L.LatLngBounds) => {
      const next = toggleCounty(selected, county);
      onChange(next);
      fitBoundsOnce(mapRef.current, bounds, [24, 24]);
    },
    [selected, onChange]
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-gray-400">
          Current Zoom: <span className="font-mono text-white">{currentZoom}</span>
        </p>
        <p className="text-sm text-gray-400">
          Tip: Zoom to <span className="font-bold">7+</span> to edit grid cells.
        </p>
      </div>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: 500, width: '100%' }}
        zoomControl
        minZoom={2}
        worldCopyJump
        whenReady={() => {
          if (initialBounds) fitBoundsOnce(mapRef.current, initialBounds, [12, 12]);
          if (mapRef.current && onMapReady) onMapReady(mapRef.current);
        }}
        ref={(m) => {
          mapRef.current = (m as unknown as L.Map) ?? null;
        }}
      >
        <ZoomWatcher onZoom={setCurrentZoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <CountyLayer selected={selected} onToggleCounty={handleToggleCounty} />
        {editor?.county && (
          <GridOverlay
            gridSize={editor.gridSize ?? 10}
            selectedCounty={editor.county}
            editable
            clipEdges={editor.clipEdges ?? true}
            onUpdateZones={(zones) => editor.onUpdateZones(editor.county.GEO_ID, zones)}
          />
        )}

        {selected.filter(c => c.ZONE.length > 0).map(c => (
          <GridOverlay
            key={`view-${c.GEO_ID}`}
            gridSize={editor?.gridSize ?? 40}
            selectedCounty={c}
            editable={false}
            onUpdateZones={() => { }}
          />
        ))}
      </MapContainer>
    </>
  );
}
