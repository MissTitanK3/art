'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { Polygon } from 'leaflet';
import CountyLayer, { type CountyProps, type SelectedCounty } from '@workspace/ui/components/maps/CountyLayer';
import GridOverlay from '@workspace/ui/components/maps/GridOverlay';
import { Feature, Geometry, MultiPolygon } from 'geojson';
import { Button } from '@workspace/ui/components/button';

/** Public props */
type Props = {
  selected: SelectedCounty[];
  onChange: (counties: SelectedCounty[]) => void;
};

interface FeatureLayer extends L.Polygon {
  feature?: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, CountyProps>;
}

/** Fix: cleanup returns void; don’t return the map itself */
function ResizeMapHack() {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => map?.getContainer() && map.invalidateSize(), 100);
    return () => clearTimeout(id);
  }, [map]);
  return null;
}

function MapRefForwarder({
  onMapReady,
  onZoomChange,
}: {
  onMapReady: (map: L.Map) => void;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
    const handleZoom = () => onZoomChange(map.getZoom());
    map.on('zoomend', handleZoom);
    handleZoom();
    return () => {
      map.off('zoomend', handleZoom); // ✅ cleanup only; do NOT return `map`
    };
  }, [map, onMapReady, onZoomChange]);

  return null;
}

export function CountySelectMap({ selected = [], onChange }: Props) {
  const [selectedCounties, setSelectedCounties] = useState<SelectedCounty[]>(selected);
  const [activeCounty, setActiveCounty] = useState<SelectedCounty | null>(null);
  const [zoom, setZoom] = useState<number>(5);

  const mapRef = useRef<L.Map | null>(null);
  const countyLayerRef = useRef<L.GeoJSON | null>(null);

  // report changes upward
  useEffect(() => {
    onChange(selectedCounties);
  }, [selectedCounties, onChange]);

  // normalize ZONE arrays
  useEffect(() => {
    setSelectedCounties(prev => prev.map(c => ({ ...c, ZONE: Array.isArray(c.ZONE) ? c.ZONE : [] })));
  }, []);

  const handleToggleCounty = useCallback(
    (
      county: SelectedCounty,
      bounds: L.LatLngBounds,
      _feature?: Feature<Geometry | null, CountyProps>
    ) => {
      setSelectedCounties((prev) => {
        const exists = prev.find((c) => c.GEO_ID === county.GEO_ID);
        return exists
          ? prev.filter((c) => c.GEO_ID !== county.GEO_ID)
          : [...prev, { ...county, ZONE: [] }];
      });
      setActiveCounty(county);
      mapRef.current?.fitBounds(bounds, { animate: true, padding: [20, 20] });
    },
    []
  );

  const toggleEditCounty = useCallback((county: SelectedCounty) => {
    if (activeCounty?.GEO_ID === county.GEO_ID) {
      setActiveCounty(null);
      return;
    }
    const layer = countyLayerRef.current
      ?.getLayers()
      .find((l): l is FeatureLayer => (l as FeatureLayer).feature?.properties?.GEO_ID === county.GEO_ID);

    if (layer) {
      const bounds = layer.getBounds();
      setActiveCounty(county);
      mapRef.current?.fitBounds(bounds, { animate: true, padding: [20, 20] });
    }
  }, [activeCounty]);

  const handleUpdateZones = useCallback((zones: number[]) => {
    if (!activeCounty) return;
    setSelectedCounties(prev =>
      prev.map(c => (c.GEO_ID === activeCounty.GEO_ID ? { ...c, ZONE: zones } : c)),
    );
  }, [activeCounty]);

  const countyList = useMemo(
    () =>
      selectedCounties.map((county, i) => (
        <div
          key={county.GEO_ID}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-lg p-3 text-sm"
        >
          {/* Left: name + meta */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground shrink-0">#{i + 1}</span>
              <span className="font-medium truncate">
                {county.NAME} County
              </span>

              {Array.isArray(county.ZONE) && county.ZONE.length > 0 && (
                <span className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] leading-none text-blue-600">
                  {county.ZONE.length} zone{county.ZONE.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Optional tertiary line for long county names on tiny screens */}
            {Array.isArray(county.ZONE) && county.ZONE.length > 0 && (
              <div className="mt-1 text-xs text-muted-foreground sm:hidden">
                Partial coverage enabled
              </div>
            )}
          </div>

          {/* Right: actions (stack on mobile) */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-1.5 sm:gap-2">
            <Button
              onClick={() => toggleEditCounty(county)}
              aria-pressed={activeCounty?.GEO_ID === county.GEO_ID}
              aria-label={activeCounty?.GEO_ID === county.GEO_ID ? 'Finish editing zones' : 'Edit zones'}
            >
              {activeCounty?.GEO_ID === county.GEO_ID ? 'Done editing' : 'Edit zones'}
            </Button>

            <Button
              onClick={() => setSelectedCounties(prev => prev.filter(c => c.GEO_ID !== county.GEO_ID))}
              variant='destructive'
              aria-label={`Remove ${county.NAME} County`}
            >
              Remove
            </Button>
          </div>
        </div >
      )),
    [selectedCounties, activeCounty, toggleEditCounty],
  );

  return (
    <div className="flex flex-col space-y-4 mb-16">
      <div className="relative w-full rounded">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-gray-400">
            Current Zoom: <span className="font-mono text-white">{zoom}</span>
          </p>
          <p className="text-xs text-gray-400">
            Tip: Zoom to <span className="font-bold">7+</span> to edit grid cells.
          </p>
        </div>

        <div style={{ height: 384 }} className="rounded overflow-hidden border">
          <MapContainer center={[39.8283, -98.5795]} zoom={4} className="h-full w-full z-0" scrollWheelZoom>
            <MapRefForwarder onMapReady={(map) => (mapRef.current = map)} onZoomChange={setZoom} />
            <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ResizeMapHack />

            {/* ✅ Use the fixed CountyLayer with forwardRef */}
            <CountyLayer ref={countyLayerRef} selected={selectedCounties} onToggleCounty={handleToggleCounty} />

            {/* Per-county editable grid overlays */}
            {selectedCounties.map((county) => (
              <GridOverlay
                key={county.GEO_ID}
                gridSize={16}
                selectedCounty={county}
                editable={activeCounty?.GEO_ID === county.GEO_ID}
                clipEdges
                onUpdateZones={handleUpdateZones}
              />
            ))}
          </MapContainer>
        </div>
      </div>
      <div className="space-y-4">
        {selectedCounties.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No counties selected yet. Zoom in and click on a county to select it.
          </p>
        ) : (
          countyList
        )}
      </div>
    </div>
  );
}

export default CountySelectMap;
