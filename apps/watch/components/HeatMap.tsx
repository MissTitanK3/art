'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngLiteral } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Report = {
  id: string;
  agency_type: string[];
  report_location: LatLngLiteral;
  timestamp: string;
};

// Fix icon path
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

export default function HeatmapMap({ reports }: { reports: Report[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [mapKey, setMapKey] = useState(Date.now());

  useEffect(() => {
    setIsMounted(true);
    setMapKey(Date.now());
  }, []);

  const center: LatLngLiteral = { lat: 47.6062, lng: -122.3321 };

  if (!isMounted) return <div className="h-[500px]">Loading map…</div>;

  return (
    <div className="h-[500px] rounded overflow-hidden">
      <MapContainer key={mapKey} center={center} zoom={9} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reports.map((r) => (
          <Marker key={r.id} position={r.report_location}>
            <Popup>
              <strong>Agencies:</strong> {r.agency_type.join(', ')}
              <br />
              <strong>Time:</strong> {new Date(r.timestamp).toLocaleString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
