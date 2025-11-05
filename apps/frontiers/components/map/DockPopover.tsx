"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { Button } from "@workspace/ui/components/button"
import { Anchor } from "lucide-react"

export function DockPopover({
  info,
  atDock,
  onRest,
  onSetHere,
  onClear,
  onGo,
  isMobile,
  canMove,
  remainingMs,
}: {
  info: { lat?: number; lng?: number; radiusKm: number }
  atDock: boolean
  onRest: () => void
  onSetHere: () => void
  onClear: () => void
  onGo: () => void
  isMobile: boolean
  canMove: boolean
  remainingMs?: number
}) {
  const hasDock = Number.isFinite(info.lat) && Number.isFinite(info.lng)
  const buttonVariant = hasDock && atDock ? 'default' : 'light'
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant={buttonVariant as any} className="shadow-md" aria-label="Dock" title="Dock">
          <Anchor className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={isMobile ? 'top' : 'right'}
        align={isMobile ? 'start' : 'start'}
        sideOffset={8}
        className="w-[min(100vw-1rem,16rem)] sm:w-[16rem] p-2"
      >
        <div className="flex flex-col gap-2 text-sm">
          <div className="text-xs text-muted-foreground">
            {hasDock ? (
              <div>
                Dock set at ~ {Number(info.lat).toFixed(4)}, {Number(info.lng).toFixed(4)}
                <br />Radius {info.radiusKm.toFixed(4)} km
              </div>
            ) : 'No dock set'}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="flex-1" onClick={onRest}>Rest now</Button>
            <Button size="sm" variant="outline" onClick={onGo} disabled={!hasDock}>Go</Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={onSetHere} disabled={!canMove}>
              {canMove ? 'Set Dock to here' : 'Move cooldown'}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClear} disabled={!hasDock}>Clear</Button>
          </div>
          {!canMove && typeof remainingMs === 'number' && remainingMs > 0 && (
            <div className="text-[11px] text-muted-foreground">
              You can move your Dock again in {formatDuration(remainingMs)}.
            </div>
          )}
          <div className="text-[11px] text-muted-foreground">
            Bonus applies within 0.25 mi (~0.4 km) of Dock.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function formatDuration(ms: number) {
  const total = Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
