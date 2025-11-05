"use client"

import { Button } from "@workspace/ui/components/button"
import { Satellite } from "lucide-react"
import { FactionBadge } from "@/components/FactionBadge"
import { StatBar } from "@/components/map/StatBar"

export function StatusPanel({
  level,
  xpIntoLevel,
  shipCondition,
  crewMorale,
  location,
  onCenter,
  zoom,
  error,
}: {
  level: number
  xpIntoLevel: number
  shipCondition: number
  crewMorale: number
  location?: { lat: number; lng: number } | null
  onCenter: () => void
  zoom: number
  error?: string
}) {
  return (
    <div className="absolute top-2 left-2 z-40">
      <div className="rounded-md border bg-card/90 backdrop-blur px-3 py-2 shadow-sm max-w-[22rem]">
        <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between gap-4">
          <span>Lv {level} · {xpIntoLevel}/100 XP</span>
          <div><FactionBadge /></div>
        </div>
        <div className="flex flex-col gap-2">
          <StatBar value={shipCondition} label="Ship" />
          <StatBar value={crewMorale} label="Morale" />
          <div className="flex justify-between items-center">
            {location && (
              <div className="text-xs text-muted-foreground">~ {location.lat.toFixed(2)}, {location.lng.toFixed(2)}</div>
            )}
            <div>
              <Button
                size="icon"
                className="h-6 w-6 p-0 rounded-full opacity-70 hover:opacity-100"
                onClick={onCenter}
                aria-label="Center on My Location"
                title="Center on My Location"
              >
                <Satellite className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">Zoom {zoom.toFixed(1)}</div>
          </div>
          {error && <div className="text-xs text-destructive/80">{error}</div>}
        </div>
      </div>
    </div>
  )
}
