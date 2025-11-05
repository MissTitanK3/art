"use client"

import { useMemo, useState } from 'react'
import { MapContainer, CircleMarker, useMap } from 'react-leaflet'
import type { ArtSignal } from '@/schemas/art_signals'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { useSignalsStore } from '@/store/useSignalsStore'
import { RepairPuzzle } from '@/components/puzzles/RepairPuzzle'

type FilterKey = 'Beacon' | 'Cache' | 'Assembly'

const FILTERS: FilterKey[] = ['Beacon', 'Cache', 'Assembly']

function sourceToFilter(s?: string): FilterKey {
  const v = (s || '').toLowerCase()
  if (v.includes('dispatch') || v.includes('beacon')) return 'Beacon'
  if (v.includes('class') || v.includes('assembly')) return 'Assembly'
  return 'Cache'
}

function colorForFilter(f: FilterKey): string {
  switch (f) {
    case 'Beacon':
      return '#7c3aed' // purple
    case 'Assembly':
      return '#fb923c' // copper/orange
    case 'Cache':
    default:
      return '#06b6d4' // teal
  }
}

function GridOverlay() {
  useMap() // ensure this renders inside map panes
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-25"
      style={{
        backgroundImage:
          'linear-gradient(0deg, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    />
  )
}

function HomePulse({ center }: { center: [number, number] }) {
  const color = '#a78bfa'
  return (
    <CircleMarker
      center={center}
      radius={8}
      pathOptions={{ color, weight: 2, opacity: 0.9, fillColor: color, fillOpacity: 0.35 }}
      className="animate-pulse"
    />
  )
}

export function MapGrid({ signals }: { signals: ArtSignal[] }) {
  const { location } = useSignalsStore()
  const center: [number, number] = [location?.lat ?? 0, location?.lng ?? 0]
  const [active, setActive] = useState<ArtSignal | null>(null)
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({ Beacon: true, Cache: true, Assembly: true })

  const points = useMemo(() => {
    // Position nodes in concentric rings around center for now
    const enabled = new Set<FilterKey>(FILTERS.filter((k) => filters[k]))
    const visible = signals.filter((s) => enabled.has(sourceToFilter(s.source_type)))
    const result: { signal: ArtSignal; lat: number; lng: number; color: string }[] = []
    const ringStep = 0.02 // ~2km visually; not precise
    let ring = 1
    let idxInRing = 0
    for (const s of visible) {
      const f = sourceToFilter(s.source_type)
      const color = colorForFilter(f)
      const slots = 6 + ring * 6
      const angle = (idxInRing / slots) * Math.PI * 2
      const lat = center[0] + Math.sin(angle) * ring * ringStep
      const lng = center[1] + Math.cos(angle) * ring * ringStep
      result.push({ signal: s, lat, lng, color })
      idxInRing++
      if (idxInRing >= slots) {
        idxInRing = 0
        ring++
      }
    }
    return result
  }, [signals, filters, center])

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {FILTERS.map((k) => (
          <Button
            key={k}
            size="sm"
            variant={filters[k] ? 'secondary' : 'outline'}
            onClick={() => setFilters((f) => ({ ...f, [k]: !f[k] }))}
          >
            {k}
          </Button>
        ))}
      </div>
      <div className="relative w-full h-[320px] sm:h-[420px] rounded-md border overflow-hidden">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', background: 'rgba(255,255,255,0.8)' }}
          zoomControl={false}
          attributionControl={false}
        >
          <GridOverlay />
          <HomePulse center={center} />
          {points.map((p) => (
            <CircleMarker
              key={p.signal.id}
              center={[p.lat, p.lng]}
              radius={7}
              pathOptions={{ color: p.color, weight: 1.5, opacity: 0.9, fillColor: p.color, fillOpacity: 0.5 }}
              eventHandlers={{ click: () => setActive(p.signal) }}
              className="[filter:drop-shadow(0_0_6px_rgba(0,0,0,0.25))]"
            />
          ))}
        </MapContainer>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Repair Signal</DialogTitle>
          </DialogHeader>
          {active ? <RepairPuzzle signal={active} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
