"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  center: [number, number];
  zoom: number;
  lat: number | null;
  lng: number | null;
  open: boolean;
  onSelect: (lat: number, lng: number) => void;
};

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function LeafletPinMap({ center, zoom, lat, lng, open, onSelect }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
      key={open ? "drawer-open" : "drawer-closed"}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <InvalidateOnOpen open={open} />
      <ClickCapture onClick={onSelect} />
      {typeof lat === "number" && typeof lng === "number" ? (
        <Marker position={[lat, lng]} icon={defaultIcon} />
      ) : null}
    </MapContainer>
  );
}

function ClickCapture({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onClick(lat, lng);
    },
  });
  return null;
}

function InvalidateOnOpen({ open }: { open: boolean }) {
  const map = useMapEvents({});
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {}
    }, 150);
    return () => clearTimeout(t);
  }, [open, map]);
  return null;
}

