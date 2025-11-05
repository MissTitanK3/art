"use client"

import { useCallback, useMemo, useState } from "react"
import type { Map as LeafletMap } from 'leaflet'
import { MapContainer, CircleMarker, TileLayer, Circle } from "react-leaflet"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { Satellite, LifeBuoy } from "lucide-react"
import { useSignalsStore } from "@/store/useSignalsStore"
import type { ArtSignal } from "@/schemas/art_signals"
import { RepairPuzzle } from "@/components/puzzles/RepairPuzzle"
import { useProfileStore } from "@/store/useProfileStore"
import { useShipStore } from "@/store/useShipStore"
import { triggerResonance } from "@/lib/resonanceClient"
import { useSeasonStore } from "@/store/useSeasonStore"

// Extracted helpers and components
import { FilterKey } from "@/lib/map/utils"

import { GridOverlay } from "@/components/map/GridOverlay"
import { HomePulse } from "@/components/map/HomePulse"
import { ZoomGuard } from "@/components/map/ZoomGuard"
import { ZoomWatcher } from "@/components/map/ZoomWatcher"
import { useIsMobile } from "@/hooks/useIsMobile"
import { useSupabaseSession } from "@/hooks/useSupabaseSession"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useTileProvider } from "@/hooks/useTileProvider"
import { useDock } from "@/hooks/useDock"
import { usePingSignals } from "@/hooks/usePingSignals"
import { useMapCentering } from "@/hooks/useMapCentering"
import { MapOptionsPopover } from "@/components/map/MapOptionsPopover"
import { FiltersPopover } from "@/components/map/FiltersPopover"
import { EventsPopover } from "@/components/map/EventsPopover"
import { DockPopover } from "@/components/map/DockPopover"
import { MenuPopover } from "@/components/map/MenuPopover"
import { computeSignalPoints } from "@/lib/map/signalLayout"
import { HelpSheet } from "@/components/map/HelpSheet"
import { StatusPanel } from "@/components/map/StatusPanel"

// --- Helpers ---

export function FullScreenMap() {
  const { setLocation, setError, signals, loading, location, error } = useSignalsStore()
  const [active, setActive] = useState<ArtSignal | null>(null)
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({ Beacon: true, Cache: true, Assembly: true })
  const isMobile = useIsMobile()
  const [map, setMap] = useState<LeafletMap | null>(null)
  const session = useSupabaseSession()
  const { provider: activeProvider, providerId: tileProviderId, setProviderId: setTileProviderId, providers: tileProviders } = useTileProvider()
  const [zoom, setZoom] = useState<number>(location ? 13 : 5)
  const seasonReward = useSeasonStore((s) => s.reward_schema)

  const ship_condition = useShipStore((s) => s.ship_condition)
  const crew_morale = useShipStore((s) => s.crew_morale)
  const engineeringXp = useProfileStore((s) => s.engineering_xp)

  // Dock state via hook
  const { info: dockInfo, radiusKm: dock_radius_km, onDockRest, setDockHere, clearDock, goToDock, atDockFrom, canMoveDock, remainingMs } = useDock(activeProvider.maxNativeZoom)

  const center: [number, number] = [
    location?.lat ?? 37.8,
    location?.lng ?? -96,
  ]

  const level = Math.floor((engineeringXp ?? 0) / 100) + 1
  const xpIntoLevel = (engineeringXp ?? 0) % 100

  const { getPosition } = useGeolocation()
  const { onPing } = usePingSignals()

  const handleDockRest = useCallback(() => onDockRest(location), [onDockRest, location])

  const handleSetDockHere = useCallback(async () => {
    try {
      let loc = location
      if (!loc) {
        const p = await getPosition()
        loc = p
        setLocation(p)
      }
      await setDockHere(loc)
    } catch (e) {
      // Optional: show an error in the status panel or toast; for now we set map error
      const msg = e instanceof Error ? e.message : 'Unable to move Dock'
      setError(msg)
    }
  }, [location, getPosition, setLocation, setDockHere, setError])

  const goToDockHere = useCallback(() => { goToDock(map, activeProvider.maxNativeZoom) }, [goToDock, map, activeProvider])

  const onSupportNetwork = useCallback(async () => {
    try { await triggerResonance('support-network') } catch { /* no-op */ }
  }, [])

  const { centerOnMe } = useMapCentering()
  const handleCenterOnMe = useCallback(() => centerOnMe(map, getPosition, setLocation, setError, activeProvider.maxNativeZoom), [centerOnMe, map, getPosition, setLocation, setError, activeProvider])

  const handleMapRef = useCallback((m: LeafletMap | null) => {
    setMap(m)
  }, [])

  const points = useMemo(() => computeSignalPoints({
    signals,
    filters,
    center,
    ringStep: 0.02,
    seasonColors: (seasonReward && (seasonReward as any).colors) || null,
  }), [signals, filters, center, seasonReward])

  return (
    <div className="fixed inset-0 h-[100dvh] w-[100dvw]">

      <StatusPanel
        level={level}
        xpIntoLevel={xpIntoLevel}
        shipCondition={ship_condition}
        crewMorale={crew_morale}
        location={location}
        onCenter={handleCenterOnMe}
        zoom={zoom}
        error={error}
      />
      <div className="absolute top-1/2 left-2 -translate-y-1/2 z-40">
        <div className="mt-4 flex flex-col gap-3 items-center">
          <MapOptionsPopover providerId={tileProviderId} providers={tileProviders} setProviderId={setTileProviderId} isMobile={isMobile} />
          <FiltersPopover
            filters={filters}
            onToggle={(k) => setFilters((f) => ({ ...f, [k]: !f[k] }))}
            isMobile={isMobile}
          />

          <EventsPopover isMobile={isMobile} />

          <DockPopover
            info={dockInfo}
            atDock={atDockFrom(location)}
            onRest={handleDockRest}
            onSetHere={handleSetDockHere}
            onClear={clearDock}
            onGo={goToDockHere}
            isMobile={isMobile}
            canMove={canMoveDock}
            remainingMs={remainingMs}
          />
          <Button
            size="icon"
            variant="secondary"
            className="shadow-md"
            onClick={onSupportNetwork}
            aria-label="Support"
            title="Support"
          >
            <LifeBuoy className="w-4 h-4" />
          </Button>
          <MenuPopover session={session} isMobile={isMobile} />
        </div>

      </div>

      <div className="absolute top-2 right-2 z-40">
        <HelpSheet />
      </div>

      <div className="absolute inset-0">
        <MapContainer
          center={center}
          zoom={location ? 13 : 5}
          minZoom={3}
          maxZoom={(activeProvider.maxNativeZoom ?? 19) + 4}
          scrollWheelZoom
          preferCanvas
          worldCopyJump
          style={{ height: '100%', width: '100%', background: 'transparent' }}
          zoomControl={false}
          attributionControl
          ref={handleMapRef}
        >
          <TileLayer
            url={activeProvider.url}
            attribution={activeProvider.attribution}
            detectRetina
            crossOrigin="anonymous"
            maxNativeZoom={activeProvider.maxNativeZoom}
          />
          <ZoomGuard maxZoom={(activeProvider.maxNativeZoom ?? 19) - 2} />
          <ZoomWatcher onZoomChange={setZoom} />
          <GridOverlay />
          <HomePulse center={center} />
          {Number.isFinite(dockInfo.lat) && Number.isFinite(dockInfo.lng) && (
            <Circle
              center={[dockInfo.lat as number, dockInfo.lng as number]}
              radius={(dock_radius_km ?? 0.4023) * 1000}
              pathOptions={{ color: '#3b82f6', weight: 1, opacity: 0.6, fillColor: '#3b82f6', fillOpacity: 0.08 }}
            />
          )}
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

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
        <Button
          onClick={() => onPing(getPosition)}
          disabled={loading}
          size="icon"
          className="h-14 w-14 rounded-full shadow-xl border bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="Ping"
          title={loading ? 'Pinging…' : 'Ping'}
        >
          <Satellite className="w-6 h-6" />
        </Button>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-card/90 backdrop-blur">
          <DialogHeader>
            <DialogTitle>Repair Signal</DialogTitle>
          </DialogHeader>
          {active ? <RepairPuzzle signal={active} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
