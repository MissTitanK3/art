// components/maps/PinLayer.tsx
'use client'
import { Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { PublicReport } from '@workspace/store/types/maps.ts'

const pinIcon = new L.Icon({
  iconUrl: '/map/pin.svg',      // TODO: add to public/
  iconRetinaUrl: '/map/pin.svg',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -20]
})

export function PinLayer({ reports }: { reports: PublicReport[] }) {
  return (
    <MarkerClusterGroup chunkedLoading maxClusterRadius={48}>
      {reports.map(r => (
        <Marker key={r.id} position={[r.lat, r.lng]} icon={pinIcon}>
          <Popup>
            <div className="space-y-1 text-sm">
              <div><strong>Time:</strong> {new Date(r.time).toLocaleString()}</div>
              {r.category && <div><strong>Type:</strong> {r.category}</div>}
              {r.confidence && <div><strong>Confidence:</strong> {r.confidence}</div>}
              {/* No PII. No exact address. Keep it minimal. */}
            </div>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  )
}
