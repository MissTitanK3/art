// packages/ui/src/components/maps/CountySelectMap.tsx
"use client";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import type { Feature, FeatureCollection } from "geojson";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";

export type CountySelectMapProps = {
  geojson: FeatureCollection;                 // state-level counties
  selected: string[];                         // FIPS[]
  onChange(selected: string[]): void;
};

export function CountySelectMap({ geojson, selected, onChange }: CountySelectMapProps) {
  const [local, setLocal] = useState<string[]>(selected);
  useEffect(() => setLocal(selected), [selected]);

  const styles = useMemo(() => ({
    base: { color: "#666", weight: 1, fillOpacity: 0.05 } as L.PathOptions,
    active: { color: "#111", weight: 2, fillOpacity: 0.15 } as L.PathOptions,
    hover: { color: "#000", weight: 2, fillOpacity: 0.12 } as L.PathOptions,
  }), []);

  const layerRef = useRef<L.GeoJSON | null>(null);

  const styleFn = (f?: Feature) => {
    const fips = (f?.properties as any)?.fips as string | undefined;
    return fips && local.includes(fips) ? styles.active : styles.base;
  };

  const onEach = (feature: Feature, layer: L.Layer) => {
    const p = feature.properties as any;
    const fips = p?.fips as string;
    if (!fips) return;

    layer.on("mouseover", () => (layer as any).setStyle?.(styles.hover));
    layer.on("mouseout", () =>
      (layer as any).setStyle?.(local.includes(fips) ? styles.active : styles.base)
    );
    layer.on("click", () => {
      setLocal((prev) => {
        const next = prev.includes(fips) ? prev.filter(x => x !== fips) : [...prev, fips];
        onChange(next);
        (layer as any).setStyle?.(next.includes(fips) ? styles.active : styles.base);
        return next;
      });
    });

    if ((layer as any).bindTooltip && p?.name) {
      (layer as any).bindTooltip(`${p.name}, ${p.state}`, { direction: "auto", sticky: true });
    }
  };

  // Fit map to the geojson bounds on mount
  const bounds = useMemo(() => {
    try {
      const gj = L.geoJSON(geojson as any);
      return gj.getBounds();
    } catch { return undefined; }
  }, [geojson]);

  return (
    <MapContainer
      bounds={bounds}
      style={{ height: 400, width: "100%" }}
      zoomControl={true}
      preferCanvas
      worldCopyJump
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />
      <GeoJSON
        ref={(r) => { layerRef.current = r?.getLayer?.(0) ? (r as any) : r as any; }}
        data={geojson as any}
        style={styleFn}
        onEachFeature={onEach}
      />
    </MapContainer>
  );
}
