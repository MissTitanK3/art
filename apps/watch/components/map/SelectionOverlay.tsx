'use client';

import { Marker, Polyline } from 'react-leaflet';

export default function SelectionOverlay({
  user,
  target,
  radius,
}: {
  user: { lat: number; lng: number };
  target: { lat: number; lng: number };
  radius: number;
}) {
  const ok = withinRadius(user, target, radius);
  return (
    <>
      <Marker position={target as any} />
      <Polyline
        positions={[
          [user.lat, user.lng],
          [target.lat, target.lng],
        ] as any}
        pathOptions={{ color: ok ? '#22c55e' : '#ef4444' }}
      />
    </>
  );
}

function withinRadius(a: { lat: number; lng: number }, b: { lat: number; lng: number }, r: number) {
  const R = 6371e3;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const d = R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return d <= r;
}

