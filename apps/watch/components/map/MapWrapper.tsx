"use client";

import { useRef, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  Circle,
} from "react-leaflet";
import { LatLngLiteral, Map as LeafletMap } from "leaflet";

import L from "leaflet";
import { useMapTile } from "@/lib/MapTileContext";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

type Props = {
  position: LatLngLiteral;
  zoom: number;
  onZoomChange: (z: number) => void;
  onSelect: (pos: LatLngLiteral) => void;
  showRadius?: boolean;
  radiusMeters?: number;
  radiusCenter?: LatLngLiteral;
  showPositionMarker?: boolean;
  onBoundsChange?: (b: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  onBoundsIdle?: (b: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  children?: React.ReactNode;
};

function ClickHandler({
  onSelect,
}: {
  onSelect: (pos: LatLngLiteral) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

function FlyToCenter({
  center,
  zoom,
}: {
  center: LatLngLiteral;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.flyTo(center, zoom ?? map.getZoom(), { animate: true, duration: 1 });
  }, [center, map, zoom]);

  return null;
}

export default function MapWrapper({
  position,
  zoom,
  onZoomChange,
  onSelect,
  showRadius,
  radiusMeters,
  radiusCenter,
  showPositionMarker = false,
  onBoundsChange,
  onBoundsIdle,
  children,
}: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const { tile } = useMapTile();
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };

    map.on("zoomend", handleZoom);
    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [onZoomChange]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || (!onBoundsChange && !onBoundsIdle))
      return;
    const map = mapRef.current;
    const emit = () => {
      const b = map.getBounds();
      const payload = {
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      };
      onBoundsChange?.(payload);
    };
    const emitEnd = () => {
      const b = map.getBounds();
      const payload = {
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      };
      onBoundsIdle?.(payload);
    };
    // Emit immediately and on any movement/zoom changes
    emit();
    emitEnd();
    map.on("move", emit);
    map.on("zoom", emit);
    map.on("moveend", emitEnd);
    map.on("zoomend", emitEnd);
    return () => {
      map.off("move", emit);
      map.off("zoom", emit);
      map.off("moveend", emitEnd);
      map.off("zoomend", emitEnd);
    };
  }, [mapReady, onBoundsChange, onBoundsIdle, position, zoom]);

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      maxZoom={19}
      minZoom={3}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      ref={(ref) => {
        mapRef.current = ref;
        setMapReady(!!ref);
      }}
    >
      <TileLayer attribution={tile.attribution} url={tile.url} />
      <FlyToCenter center={position} zoom={zoom} />
      <ClickHandler onSelect={onSelect} />
      {showPositionMarker && <Marker position={position} />}
      {showRadius && (
        <Circle
          center={radiusCenter ?? position}
          radius={radiusMeters ?? 200}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b83f652",
            fillOpacity: 0.15,
          }}
        />
      )}
      {children}
    </MapContainer>
  );
}
