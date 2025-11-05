"use client"

import { CircleMarker } from 'react-leaflet'

export function HomePulse({ center }: { center: [number, number] }) {
  const color = '#a78bfa'
  return (
    <CircleMarker center={center} radius={8} pathOptions={{ color, weight: 2, opacity: 0.9, fillColor: color, fillOpacity: 0.35 }} className="animate-pulse" />
  )
}
