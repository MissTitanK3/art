// components/maps/HeatLayer.tsx
'use client'
import 'leaflet.heat' // IMPORTANT: side-effect import registers L.heatLayer
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'
import { PublicReport } from './LeafletMapImpl.tsx'

function weightByRecency(tISO: string, now = Date.now()) {
  // 0..1 weight, fading over 24h (tweak as desired)
  const dt = (now - new Date(tISO).getTime()) / (1000 * 60 * 60) // hours
  const halfLife = 6 // hours
  return Math.max(0, Math.exp(-Math.log(2) * dt / halfLife))
}

export function HeatLayer({ reports }: { reports: PublicReport[] }) {
  const map = useMap()

  useEffect(() => {
    const points = reports.map(r => [r.lat, r.lng, weightByRecency(r.time)] as [number, number, number])
    const layer = (L as any).heatLayer(points, {
      radius: 18,    // tweak by zoom in a future enhancement
      blur: 16,
      maxZoom: 17,
      // gradient: { 0.2:'#..', 0.4:'#..', 0.6:'#..', 0.8:'#..', 1:'#..' } // keep default first
    })
    layer.addTo(map)
    return () => layer.remove()
  }, [map, reports])

  return null
}
