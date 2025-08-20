// components/maps/LeafletMapImpl.tsx
'use client'
import { MapContainer, TileLayer } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'

export type PublicReport = {
  id: string
  lat: number
  lng: number
  time: string   // ISO
  category?: 'sighting' | 'checkpoint' | 'activity'
  confidence?: 'low' | 'med' | 'high'
}

export interface SelectedCounty {
  GEO_ID: string;   // e.g. "0500000US01029"
  NAME: string;     // human name
  STATE: string;    // 2-digit FIPS state string (e.g. "01")
  ZONE: number[];   // optional grid cells marked as partial coverage
}


type BaseProps = {
  center?: LatLngExpression
  zoom?: number
  children?: React.ReactNode
}

export default function LeafletMapImpl({
  center = [37.8, -96], // CONUS-ish
  zoom = 5,
  children
}: BaseProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={3}
      maxZoom={18}
      style={{ height: '100%', width: '100%' }}
      preferCanvas
      worldCopyJump
      scrollWheelZoom
    >
      <TileLayer
        // Use your own tile server later; this is fine to start:
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
        detectRetina
      />
      {children}
    </MapContainer>
  )
}
