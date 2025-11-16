"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { WizardReport } from "@workspace/store/types/watch.ts";
import { Button } from "@workspace/ui/components/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn, humanize } from "@workspace/ui/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose,
} from "@workspace/ui/components/drawer";
import { useLocalStorage } from "@workspace/ui/hooks/use-local-storage";

type ActionMode = "create" | "view" | "none";

interface WatchMapProps {
  reports: WizardReport[];
  center?: [number, number];
  zoom?: number;
  onCreateDispatch?: (report: WizardReport) => void;
  onViewDispatch?: (report: WizardReport) => void;
  getViewHref?: (report: WizardReport) => string | undefined;
  actionMode?: ActionMode;
  focusPoint?: MapFocus | null;
  className?: string;
  // Optional external filter controls (when provided, render inside Map Options)
  filterQuery?: string;
  onFilterQueryChange?: (value: string) => void;
  filterTimeWindow?: string; // 'any' | '2' | '6' | '12' | '24' | '72'
  onFilterTimeWindowChange?: (value: string) => void;
  availableAgencies?: string[];
  selectedAgencies?: Set<string>;
  onToggleAgency?: (agency: string, checked: boolean) => void;
  hideTest?: boolean;
  onHideTestChange?: (value: boolean) => void;
  withMediaOnly?: boolean;
  onWithMediaOnlyChange?: (value: boolean) => void;
  lightsOnly?: boolean;
  onLightsOnlyChange?: (value: boolean) => void;
  sirensOnly?: boolean;
  onSirensOnlyChange?: (value: boolean) => void;
  movingOnly?: boolean;
  onMovingOnlyChange?: (value: boolean) => void;
  onResetFilters?: () => void;
  onVisibleReportsChange?: (reports: WizardReport[]) => void;
}

interface MapFocus {
  lat: number;
  lng: number;
  zoom?: number;
  token?: number;
}

interface TileProvider {
  id: string;
  label: string;
  url: string;
  attribution: string;
}

const TILE_PROVIDERS: TileProvider[] = [
  {
    id: "osm",
    label: "OpenStreetMap Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  },
  {
    id: "osm-hot",
    label: "OSM Humanitarian",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution:
      'Tiles courtesy of <a href="https://www.openstreetmap.fr/">OpenStreetMap France</a> &mdash; &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  },
  {
    id: "osm-fr",
    label: "OSM France",
    url: "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
    attribution:
      'Tiles courtesy of <a href="https://www.openstreetmap.fr/">OpenStreetMap France</a> &mdash; &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  },
  {
    id: "carto-positron",
    label: "CartoDB Positron",
    url: "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: "carto-dark-matter",
    label: "CartoDB Dark Matter",
    url: "https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: "carto-voyager",
    label: "Carto Voyager",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: "opentopomap",
    label: "OpenTopoMap",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://viewfinderpanoramas.org">SRTM</a>',
  },
  {
    id: "usgs-topo",
    label: "USGS Topo",
    url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Tiles courtesy of the <a href="https://www.usgs.gov/">USGS</a>',
  },
];

const DEFAULT_TILE_PROVIDER = TILE_PROVIDERS[0]!;
const TILE_PROVIDER_STORAGE_KEY = "watch-map-tile-provider";

const isValidTileProvider = (id: string): boolean =>
  TILE_PROVIDERS.some((provider) => provider.id === id);

// default icon for unconfirmed reports
const reportIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// distinct icon for confirmed watch reports (high-contrast green pin)
const confirmedIcon = L.divIcon({
  className: "confirmed-watch-pin",
  iconSize: [26, 38],
  iconAnchor: [13, 38],
  popupAnchor: [0, -32],
  html: `
    <svg width="26" height="38" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-opacity=".35"/>
        </filter>
      </defs>
      <path d="M13 0C6 0 0.8 5.2 0.8 12.1c0 8.7 10.5 16.7 11.0 17.1.3.2.7.2 1 0 .5-.4 11.0-8.4 11.0-17.1C23.2 5.2 18 0 13 0z" fill="#16a34a" filter="url(#dropShadow)"/>
      <circle cx="13" cy="12" r="5.5" fill="#ffffff"/>
    </svg>
  `,
});

export default function WatchMap({
  reports,
  center = [37.7749, -122.4194], // fallback center
  zoom = 12,
  onCreateDispatch,
  onViewDispatch,
  getViewHref,
  actionMode,
  focusPoint,
  className,
  filterQuery,
  onFilterQueryChange,
  filterTimeWindow,
  onFilterTimeWindowChange,
  availableAgencies,
  selectedAgencies,
  onToggleAgency,
  hideTest,
  onHideTestChange,
  withMediaOnly,
  onWithMediaOnlyChange,
  lightsOnly,
  onLightsOnlyChange,
  sirensOnly,
  onSirensOnlyChange,
  movingOnly,
  onMovingOnlyChange,
  onResetFilters,
  onVisibleReportsChange,
}: WatchMapProps): React.ReactElement {
  const [tileProviderId, setTileProviderId] = useLocalStorage<string>(
    TILE_PROVIDER_STORAGE_KEY,
    DEFAULT_TILE_PROVIDER.id,
    {
      sync: true,
      serialize: (value) => value,
      deserialize: (raw) =>
        typeof raw === "string" && isValidTileProvider(raw)
          ? raw
          : DEFAULT_TILE_PROVIDER.id,
      migrate: (payload) => {
        if (typeof payload === "string" && isValidTileProvider(payload)) {
          return payload;
        }
        return DEFAULT_TILE_PROVIDER.id;
      },
    },
  );
  const activeProvider = useMemo<TileProvider>(() => {
    return (
      TILE_PROVIDERS.find((provider) => provider.id === tileProviderId) ??
      DEFAULT_TILE_PROVIDER
    );
  }, [tileProviderId]);

  if (typeof window === "undefined") {
    return <></>;
  }
  const effectiveMode: ActionMode = actionMode
    ? actionMode
    : onCreateDispatch
      ? "create"
      : "none";

  const resolveCoords = useCallback((report: WizardReport): [number, number] | null => {
    const loc: any = (report as any)?.location ?? {};
    let lat: number | undefined = undefined;
    let lng: number | undefined = undefined;

    const num = (v: any) => {
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
      }
      return undefined;
    };

    lat = num(loc?.lat);
    lng = num(loc?.lng);

    if (
      (lat === undefined || lng === undefined) &&
      Array.isArray(loc?.coordinates) &&
      loc.coordinates.length >= 2
    ) {
      const c0 = num(loc.coordinates[0]);
      const c1 = num(loc.coordinates[1]);
      if (c0 !== undefined && c1 !== undefined) {
        lng = c0;
        lat = c1;
      }
    }

    if (
      (lat === undefined || lng === undefined) &&
      Array.isArray(loc?.coords) &&
      loc.coords.length >= 2
    ) {
      const c0 = num(loc.coords[0]);
      const c1 = num(loc.coords[1]);
      if (c0 !== undefined && c1 !== undefined) {
        lat = c0;
        lng = c1;
      }
    }

    if (
      (lat === undefined || lng === undefined) &&
      num(loc?.y) !== undefined &&
      num(loc?.x) !== undefined
    ) {
      lat = num(loc?.y);
      lng = num(loc?.x);
    }

    if (lat === undefined || lng === undefined) {
      const geog: any =
        (report as any)?.location_geog ?? (report as any)?.location_grog;
      if (geog && typeof geog === "object") {
        if (Array.isArray(geog.coordinates) && geog.coordinates.length >= 2) {
          const c0 = num(geog.coordinates[0]);
          const c1 = num(geog.coordinates[1]);
          if (c0 !== undefined && c1 !== undefined) {
            lng = c0;
            lat = c1;
          }
        }
        if (
          (lat === undefined || lng === undefined) &&
          num(geog?.y) !== undefined &&
          num(geog?.x) !== undefined
        ) {
          lat = num(geog?.y);
          lng = num(geog?.x);
        }
        if (
          (lat === undefined || lng === undefined) &&
          num(geog?.lat) !== undefined &&
          num(geog?.lng) !== undefined
        ) {
          lat = num(geog?.lat);
          lng = num(geog?.lng);
        }
      } else if (typeof geog === "string") {
        const m = geog.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
        if (m) {
          const c0 = num(m[1]);
          const c1 = num(m[2]);
          if (c0 !== undefined && c1 !== undefined) {
            lng = c0;
            lat = c1;
          }
        }
      }
    }

    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return null;
    }

    return [lat, lng];
  }, []);

  return (
    <div
      className={cn(
        "relative w-full h-[600px] lg:h-[90vh] rounded-2xl border",
        className,
      )}
    >
      <div className="absolute right-4 top-4 flex flex-col z-50 items-end gap-2">
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="bg-white text-black border-gray-300 shadow-sm hover:bg-white/90 dark:bg-white dark:text-black dark:border-gray-300"
            >
              Map Options
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-card text-card-foreground z-[99999]">
            <DrawerHeader>
              <DrawerTitle>Map Options</DrawerTitle>
              <DrawerDescription>
                Choose a base layer and view preferences.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label
                  className="mb-1 block text-xs text-muted-foreground"
                  htmlFor="map-style"
                >
                  Map style
                </label>
                <Select
                  value={tileProviderId}
                  onValueChange={setTileProviderId}
                >
                  <SelectTrigger id="map-style" className="w-full">
                    <SelectValue placeholder="Select map style" />
                  </SelectTrigger>
                  <SelectContent className="z-[100000]">
                    {TILE_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {typeof filterQuery !== "undefined" ||
                typeof filterTimeWindow !== "undefined" ? (
                <div className="space-y-4">
                  <div>
                    <label
                      className="mb-1 block text-xs text-muted-foreground"
                      htmlFor="filter-search"
                    >
                      Search
                    </label>
                    <Input
                      id="filter-search"
                      value={filterQuery ?? ""}
                      onChange={(e) => onFilterQueryChange?.(e.target.value)}
                      placeholder="Search agency, submitter, direction…"
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-xs text-muted-foreground"
                      htmlFor="time-window"
                    >
                      Time window
                    </label>
                    <Select
                      value={filterTimeWindow}
                      onValueChange={onFilterTimeWindowChange}
                    >
                      <SelectTrigger id="time-window" className="w-full">
                        <SelectValue placeholder="Last 24h" />
                      </SelectTrigger>
                      <SelectContent className="z-[100000]">
                        <SelectItem value="2">Last 2 hours</SelectItem>
                        <SelectItem value="6">Last 6 hours</SelectItem>
                        <SelectItem value="12">Last 12 hours</SelectItem>
                        <SelectItem value="24">Last 24 hours</SelectItem>
                        <SelectItem value="72">Last 72 hours</SelectItem>
                        <SelectItem value="any">All time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="mb-1 block text-xs text-muted-foreground">
                      Agencies
                    </div>
                    <div className="flex max-h-40 overflow-y-auto flex-wrap gap-3 p-2 rounded-md border bg-background">
                      {availableAgencies && availableAgencies.length > 0 ? (
                        availableAgencies.map((a) => {
                          const checked = selectedAgencies?.has(a) ?? false;
                          return (
                            <div
                              key={a}
                              className="inline-flex items-center gap-2 text-xs"
                            >
                              <Checkbox
                                aria-label={a}
                                checked={checked}
                                onCheckedChange={(v) =>
                                  onToggleAgency?.(a, Boolean(v))
                                }
                              />
                              <span>{a}</span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No agency labels
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="inline-flex items-center gap-2">
                      <Checkbox
                        aria-label="Hide test"
                        checked={!!hideTest}
                        onCheckedChange={(v) => onHideTestChange?.(Boolean(v))}
                      />
                      <span>Hide test</span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <Checkbox
                        aria-label="Media only"
                        checked={!!withMediaOnly}
                        onCheckedChange={(v) =>
                          onWithMediaOnlyChange?.(Boolean(v))
                        }
                      />
                      <span>Media only</span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <Checkbox
                        aria-label="Lights on"
                        checked={!!lightsOnly}
                        onCheckedChange={(v) =>
                          onLightsOnlyChange?.(Boolean(v))
                        }
                      />
                      <span>Lights on</span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <Checkbox
                        aria-label="Sirens on"
                        checked={!!sirensOnly}
                        onCheckedChange={(v) =>
                          onSirensOnlyChange?.(Boolean(v))
                        }
                      />
                      <span>Sirens on</span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <Checkbox
                        aria-label="Officer moving"
                        checked={!!movingOnly}
                        onCheckedChange={(v) =>
                          onMovingOnlyChange?.(Boolean(v))
                        }
                      />
                      <span>Officer moving</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onResetFilters}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button size="sm">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution={activeProvider.attribution}
          url={activeProvider.url}
        />

        <FocusController focus={focusPoint} fallbackZoom={zoom} />
        <ViewportReporter
          reports={reports}
          resolveCoords={resolveCoords}
          onVisibleReportsChange={onVisibleReportsChange}
        />

        {reports.map((r) => {
          const coords = resolveCoords(r);
          if (!coords) return null;
          const [lat, lng] = coords;

          const isConfirmed = Boolean(
            (r as any)?.vet_method || (r as any)?.vet_notes,
          );
          const markerIcon = isConfirmed ? confirmedIcon : reportIcon;
          return (
            <Marker key={r.id} position={[lat, lng]} icon={markerIcon}>
              <Popup maxWidth={220}>
                <div className="space-y-2">
                  <div className="font-semibold text-sm">
                    {Array.isArray(r.agency_type) && r.agency_type.length > 0
                      ? r.agency_type.map(humanize).join(", ")
                      : r.agency_other
                        ? humanize(r.agency_other)
                        : "Unknown presence"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.timestamp).toLocaleString()}
                  </div>
                  {r.media_url && (
                    <a
                      href={r.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline text-xs block"
                    >
                      View Media
                    </a>
                  )}
                  {effectiveMode === "create" && onCreateDispatch ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={() => onCreateDispatch?.(r)}
                    >
                      Create Dispatch
                    </Button>
                  ) : effectiveMode === "view" ? (
                    (() => {
                      const href = getViewHref?.(r);
                      if (href) {
                        return (
                          <Button
                            asChild
                            size="sm"
                            variant="secondary"
                            className="w-full"
                          >
                            <a href={href}>View Dispatch</a>
                          </Button>
                        );
                      }
                      if (onViewDispatch) {
                        return (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full"
                            onClick={() => onViewDispatch(r)}
                          >
                            View Dispatch
                          </Button>
                        );
                      }
                      return null;
                    })()
                  ) : null}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function FocusController({
  focus,
  fallbackZoom,
}: {
  focus?: MapFocus | null;
  fallbackZoom: number;
}) {
  const map = useMap();
  const lat = focus?.lat;
  const lng = focus?.lng;
  const zoom = focus?.zoom;
  const token = focus?.token;

  useEffect(() => {
    if (typeof lat !== "number" || typeof lng !== "number") return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    map.flyTo([lat, lng], zoom ?? Math.max(fallbackZoom, 10), {
      duration: 0.75,
    });
  }, [lat, lng, zoom, token, map, fallbackZoom]);

  return null;
}

function ViewportReporter({
  reports,
  resolveCoords,
  onVisibleReportsChange,
}: {
  reports: WizardReport[];
  resolveCoords: (report: WizardReport) => [number, number] | null;
  onVisibleReportsChange?: (reports: WizardReport[]) => void;
}) {
  const map = useMap();

  const computeVisible = useCallback(() => {
    if (!onVisibleReportsChange) return;
    const bounds = map.getBounds();
    const visible = reports.filter((report) => {
      const coords = resolveCoords(report);
      if (!coords) return false;
      const [lat, lng] = coords;
      return bounds.contains([lat, lng]);
    });
    onVisibleReportsChange(visible);
  }, [map, onVisibleReportsChange, reports, resolveCoords]);

  useEffect(() => {
    computeVisible();
  }, [computeVisible]);

  useEffect(() => {
    computeVisible();
  }, [reports, computeVisible]);

  useMapEvents({
    moveend: computeVisible,
    zoomend: computeVisible,
    resize: computeVisible,
  });

  return null;
}
