"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import {
  MapContainer,
  CircleMarker,
  TileLayer,
  Circle,
  Tooltip,
} from "react-leaflet";
import { Button } from "@workspace/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Satellite, LifeBuoy } from "lucide-react";
import { useSignalsStore } from "@/store/useSignalsStore";
import type { ArtSignal } from "@/schemas/art_signals";
import { RepairPuzzle } from "@/components/puzzles/RepairPuzzle";
import { useProfileStore } from "@/store/useProfileStore";
import { useShipStore } from "@/store/useShipStore";
import { triggerResonance } from "@/lib/resonanceClient";
import { useSeasonStore } from "@/store/useSeasonStore";

// Extracted helpers and components
import { FilterKey } from "@/lib/map/utils";

import { GridOverlay } from "@/components/map/GridOverlay";
import { HomePulse } from "@/components/map/HomePulse";
import { ZoomGuard } from "@/components/map/ZoomGuard";
import { ZoomWatcher } from "@/components/map/ZoomWatcher";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useTileProvider } from "@/hooks/useTileProvider";
import { useDock } from "@/hooks/useDock";
import { usePingSignals } from "@/hooks/usePingSignals";
import { useMapCentering } from "@/hooks/useMapCentering";
import { MapOptionsPopover } from "@/components/map/MapOptionsPopover";
import { FiltersPopover } from "@/components/map/FiltersPopover";
import { EventsPopover } from "@/components/map/EventsPopover";
import { DockPopover } from "@/components/map/DockPopover";
import { MenuPopover } from "@/components/map/MenuPopover";
import { computeSignalPoints } from "@/lib/map/signalLayout";
import { HelpSheet } from "@/components/map/HelpSheet";
import { StatusPanel } from "@/components/map/StatusPanel";
import {
  FogDiscoveryWatcher,
  FogOfWarOverlay,
} from "@/components/map/FogOfWarOverlay";
import { RealtimeLayer } from "@/components/map/RealtimeLayer";
import { MapControls } from "@/components/map/MapControls";
import { useFogOfWarStore } from "@/store/useFogOfWarStore";
import { useRealtimeMapStore } from "@/store/useRealtimeMapStore";
import { useJournalStore } from "@/store/useJournalStore";

// --- Helpers ---
const POI_FOG_RADIUS_KM = 8;

type SelectedPoi = {
  signal: ArtSignal;
  lat: number;
  lng: number;
  color: string;
};

export function FullScreenMap() {
  const { setLocation, setError, signals, loading, location, error } =
    useSignalsStore();
  const markSignalDiscovered = useSignalsStore((s) => s.markDiscovered);
  const [active, setActive] = useState<SelectedPoi | null>(null);
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({
    Beacon: true,
    Cache: true,
    Assembly: true,
  });
  const isMobile = useIsMobile();
  const [map, setMap] = useState<LeafletMap | null>(null);
  const session = useSupabaseSession();
  const {
    provider: activeProvider,
    providerId: tileProviderId,
    setProviderId: setTileProviderId,
    providers: tileProviders,
  } = useTileProvider();
  const [zoom, setZoom] = useState<number>(location ? 13 : 5);
  const maxZoom = 18;
  const minZoom = 11;
  const seasonReward = useSeasonStore((s) => s.reward_schema);
  const addJournalEntry = useJournalStore((s) => s.add);
  const markFog = useFogOfWarStore((s) => s.markDiscovered);
  const setFogAnchor = useFogOfWarStore((s) => s.setAnchor);
  const clearFog = useFogOfWarStore((s) => s.clear);
  const setRealtimeAnchor = useRealtimeMapStore((s) => s.setAnchor);
  const pushRealtimeEvent = useRealtimeMapStore((s) => s.addEvent);

  const ship_condition = useShipStore((s) => s.ship_condition);
  const crew_morale = useShipStore((s) => s.crew_morale);
  const engineeringXp = useProfileStore((s) => s.engineering_xp);

  // Dock state via hook
  const {
    info: dockInfo,
    radiusKm: dock_radius_km,
    onDockRest,
    setDockHere,
    clearDock,
    goToDock,
    atDockFrom,
    canMoveDock,
    remainingMs,
  } = useDock(activeProvider.maxNativeZoom);

  const center = useMemo<[number, number]>(
    () => [location?.lat ?? 37.8, location?.lng ?? -96],
    [location?.lat, location?.lng]
  );

  useEffect(() => {
    setFogAnchor(center);
    setRealtimeAnchor(center);
  }, [center, setFogAnchor, setRealtimeAnchor]);

  // Reveal fog only when the tracked location (not the view) actually moves
  useEffect(() => {
    if (location) {
      markFog(location.lat, location.lng, 0.8, "movement");
    }
  }, [location?.lat, location?.lng, markFog]);

  const level = Math.floor((engineeringXp ?? 0) / 100) + 1;
  const xpIntoLevel = (engineeringXp ?? 0) % 100;

  const { getPosition } = useGeolocation();
  const { onPing } = usePingSignals();

  const handleDockRest = useCallback(
    () => onDockRest(location),
    [onDockRest, location]
  );

  const handleSetDockHere = useCallback(async () => {
    try {
      let loc = location;
      if (!loc) {
        const p = await getPosition();
        loc = p;
        setLocation(p);
      }
      await setDockHere(loc);
    } catch (e) {
      // Optional: show an error in the status panel or toast; for now we set map error
      const msg = e instanceof Error ? e.message : "Unable to move Dock";
      setError(msg);
    }
  }, [location, getPosition, setLocation, setDockHere, setError]);

  const goToDockHere = useCallback(() => {
    goToDock(map, activeProvider.maxNativeZoom);
  }, [goToDock, map, activeProvider]);

  const onSupportNetwork = useCallback(async () => {
    try {
      await triggerResonance("support-network");
    } catch {
      /* no-op */
    }
  }, []);

  const { centerOnMe } = useMapCentering();
  const handleCenterOnMe = useCallback(
    () =>
      centerOnMe(
        map,
        getPosition,
        setLocation,
        setError,
        activeProvider.maxNativeZoom
      ),
    [centerOnMe, map, getPosition, setLocation, setError, activeProvider]
  );

  const handleMapRef = useCallback((m: LeafletMap | null) => {
    setMap(m);
  }, []);

  const points = useMemo(
    () =>
      computeSignalPoints({
        signals,
        filters,
        center,
        ringStep: 0.02,
        seasonColors: (seasonReward && (seasonReward as any).colors) || null,
      }),
    [signals, filters, center, seasonReward]
  );

  const zoomIn = useCallback(() => {
    if (!map) return;
    const nextZoom = Math.min(maxZoom, map.getZoom() + 1);
    map.flyTo(map.getCenter(), nextZoom, { animate: true });
  }, [map, maxZoom]);

  const zoomOut = useCallback(() => {
    if (!map) return;
    const nextZoom = Math.max(3, map.getZoom() - 1);
    map.flyTo(map.getCenter(), nextZoom, { animate: true });
  }, [map]);

  const panByDirection = useCallback(
    (dx: number, dy: number) => {
      if (!map) return;
      const c = map.getCenter();
      const meters = 850;
      const latDelta = (dy * meters) / 111320;
      const lngDelta =
        (dx * meters) /
        (111320 * Math.max(Math.cos((c.lat * Math.PI) / 180), 0.2));
      const next = { lat: c.lat + latDelta, lng: c.lng + lngDelta };
      map.flyTo([next.lat, next.lng], map.getZoom(), {
        animate: true,
        duration: 0.35,
      });
      // Do not reveal fog on camera pan; only reveal on actual location updates/POIs
    },
    [map]
  );

  const handlePoiSelect = useCallback(
    (poi: SelectedPoi) => {
      setActive(poi);
      markSignalDiscovered(poi.signal.id);
      // Clear fog around the POI when selected
      markFog(poi.lat, poi.lng, POI_FOG_RADIUS_KM, "poi");
      addJournalEntry("repair", `Scanned ${poi.signal.title}`);
      pushRealtimeEvent({
        id: `poi-${poi.signal.id}-${Date.now()}`,
        label: `${poi.signal.title} ping`,
        lat: poi.lat,
        lng: poi.lng,
        ts: new Date().toISOString(),
        kind: "poi",
      });
    },
    [addJournalEntry, markFog, markSignalDiscovered, pushRealtimeEvent]
  );

  const focusOnActive = useCallback(() => {
    if (!map || !active) return;
    const targetZoom = Math.min(maxZoom, Math.max(map.getZoom(), 14));
    map.flyTo([active.lat, active.lng], targetZoom, { animate: true });
    // Do not reveal fog on camera move alone; handled when location updates or explicit events
  }, [map, active, maxZoom]);

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
      <div className="absolute top-1/3 left-2 -translate-y-1/2 z-40">
        <div className="mt-4 flex flex-col gap-3 items-center">
          <MapOptionsPopover
            providerId={tileProviderId}
            providers={tileProviders}
            setProviderId={setTileProviderId}
            isMobile={isMobile}
          />
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
          minZoom={minZoom}
          maxZoom={maxZoom}
          scrollWheelZoom
          preferCanvas
          worldCopyJump
          style={{ height: "100%", width: "100%", background: "transparent" }}
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
          <ZoomGuard maxZoom={maxZoom} />
          <ZoomWatcher onZoomChange={setZoom} />
          <FogDiscoveryWatcher location={location} />
          <GridOverlay />
          <FogOfWarOverlay />
          <HomePulse center={center} />
          <RealtimeLayer />
          {Number.isFinite(dockInfo.lat) && Number.isFinite(dockInfo.lng) && (
            <Circle
              center={[dockInfo.lat as number, dockInfo.lng as number]}
              radius={(dock_radius_km ?? 0.4023) * 1000}
              pathOptions={{
                color: "#3b82f6",
                weight: 1,
                opacity: 0.6,
                fillColor: "#3b82f6",
                fillOpacity: 0.08,
              }}
            />
          )}
          {points.map((p) => (
            <CircleMarker
              key={p.signal.id}
              center={[p.lat, p.lng]}
              radius={7}
              pathOptions={{
                color: p.color,
                weight: 1.5,
                opacity: 0.9,
                fillColor: p.color,
                fillOpacity: 0.5,
              }}
              eventHandlers={{
                click: () =>
                  handlePoiSelect({
                    signal: p.signal,
                    lat: p.lat,
                    lng: p.lng,
                    color: p.color,
                  }),
              }}
              className="[filter:drop-shadow(0_0_6px_rgba(0,0,0,0.25))]"
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.92}>
                <div className="text-xs">
                  <div className="font-semibold">{p.signal.title}</div>
                  <div className="text-muted-foreground">
                    {p.signal.source_type}
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="absolute bottom-16 left-2 z-40">
        <MapControls
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onPan={panByDirection}
          onCenter={handleCenterOnMe}
          onResetFog={() => clearFog()}
        />
      </div>

      <div className="absolute bottom-18 left-1/2 -translate-x-1/2 z-40">
        <Button
          onClick={() => onPing(getPosition)}
          disabled={loading}
          size="icon"
          className="h-14 w-14 rounded-full shadow-xl border bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="Ping"
          title={loading ? "Pinging…" : "Ping"}
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
            <DialogTitle>{active?.signal.title ?? "Repair Signal"}</DialogTitle>
            {active ? (
              <DialogDescription>
                {active.signal.summary || "Unstable POI detected on the grid."}
              </DialogDescription>
            ) : null}
          </DialogHeader>
          {active ? (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground">
                {active.signal.source_type} · {active.lat.toFixed(3)},{" "}
                {active.lng.toFixed(3)}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={focusOnActive}>
                  Focus on map
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markSignalDiscovered(active.signal.id)}
                >
                  Mark discovered
                </Button>
              </div>
              <div className="rounded-md border p-3 bg-muted/40">
                <div className="text-sm font-semibold mb-1">Repair Puzzle</div>
                <RepairPuzzle signal={active.signal} />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
