"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { WizardReport } from "@workspace/store/types/watch.ts";
import { Button } from "@workspace/ui/components/button";
import { useEffect, useMemo, useState } from "react";
import { cn, humanize } from "@workspace/ui/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";


type ActionMode = 'create' | 'view' | 'none'

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
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
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

// custom icon so all markers are consistent
const reportIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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
}: WatchMapProps) {
  const [tileProviderId, setTileProviderId] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_TILE_PROVIDER.id;
    const stored = window.localStorage.getItem(TILE_PROVIDER_STORAGE_KEY);
    if (!stored) return DEFAULT_TILE_PROVIDER.id;
    return TILE_PROVIDERS.some((provider) => provider.id === stored)
      ? stored
      : DEFAULT_TILE_PROVIDER.id;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TILE_PROVIDER_STORAGE_KEY, tileProviderId);
  }, [tileProviderId]);
  const activeProvider = useMemo<TileProvider>(() => {
    return TILE_PROVIDERS.find((provider) => provider.id === tileProviderId) ?? DEFAULT_TILE_PROVIDER;
  }, [tileProviderId]);

  if (window === undefined) {
    return null;
  }
  const effectiveMode: ActionMode = actionMode
    ? actionMode
    : onCreateDispatch
    ? 'create'
    : 'none'

  return (
    <div className={cn("relative w-full h-[600px] lg:h-[90vh] rounded-2xl border", className)}>
      <div className="absolute right-4 top-4 z-10">
        <Select value={tileProviderId} onValueChange={setTileProviderId}>
          <SelectTrigger className="w-[220px] bg-background/80 backdrop-blur border">
            <SelectValue placeholder="Select map style" />
          </SelectTrigger>
          <SelectContent align="end">
            {TILE_PROVIDERS.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

        {reports
          .map((r) => {
            // Resolve coordinates from multiple possible shapes, including location_geog
            const loc: any = (r as any)?.location ?? {};
            let lat: number | undefined = undefined;
            let lng: number | undefined = undefined;

            const num = (v: any) => {
              if (typeof v === 'number') return v;
              if (typeof v === 'string') {
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
              }
              return undefined;
            };

            // 1) Direct lat/lng on location
            lat = num(loc?.lat);
            lng = num(loc?.lng);

            // 2) GeoJSON-like coordinates [lng, lat]
            if ((lat === undefined || lng === undefined) && Array.isArray(loc?.coordinates) && loc.coordinates.length >= 2) {
              const c0 = num(loc.coordinates[0]);
              const c1 = num(loc.coordinates[1]);
              if (c0 !== undefined && c1 !== undefined) {
                lng = c0; lat = c1;
              }
            }

            // 3) coords array [lat, lng] (legacy JSON pattern)
            if ((lat === undefined || lng === undefined) && Array.isArray(loc?.coords) && loc.coords.length >= 2) {
              const c0 = num(loc.coords[0]);
              const c1 = num(loc.coords[1]);
              if (c0 !== undefined && c1 !== undefined) {
                lat = c0; lng = c1;
              }
            }

            // 4) x/y style
            if ((lat === undefined || lng === undefined) && (num(loc?.y) !== undefined) && (num(loc?.x) !== undefined)) {
              lat = num(loc?.y);
              lng = num(loc?.x);
            }

            // 5) location_geog from DB (object or WKT string)
            if ((lat === undefined || lng === undefined)) {
              const geog: any = (r as any)?.location_geog ?? (r as any)?.location_grog; // tolerate common typo
              if (geog && typeof geog === 'object') {
                // GeoJSON-like
                if (Array.isArray(geog.coordinates) && geog.coordinates.length >= 2) {
                  const c0 = num(geog.coordinates[0]);
                  const c1 = num(geog.coordinates[1]);
                  if (c0 !== undefined && c1 !== undefined) {
                    lng = c0; lat = c1;
                  }
                }
                if ((lat === undefined || lng === undefined) && (num(geog?.y) !== undefined) && (num(geog?.x) !== undefined)) {
                  lat = num(geog?.y);
                  lng = num(geog?.x);
                }
                if ((lat === undefined || lng === undefined) && (num(geog?.lat) !== undefined) && (num(geog?.lng) !== undefined)) {
                  lat = num(geog?.lat);
                  lng = num(geog?.lng);
                }
              } else if (typeof geog === 'string') {
                // Try parsing WKT-like: "POINT(lng lat)" or with SRID prefix
                const m = geog.match(/POINT\s*\(\s*([\-\d\.]+)\s+([\-\d\.]+)\s*\)/i);
                if (m) {
                  const c0 = num(m[1]);
                  const c1 = num(m[2]);
                  if (c0 !== undefined && c1 !== undefined) {
                    lng = c0; lat = c1;
                  }
                }
              }
            }

            if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
              return null;
            }

            return (
              <Marker key={r.id} position={[lat, lng]} icon={reportIcon}>
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
                    {effectiveMode === 'create' && onCreateDispatch ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full"
                        onClick={() => onCreateDispatch?.(r)}
                      >
                        Create Dispatch
                      </Button>
                    ) : effectiveMode === 'view' ? (
                      (() => {
                        const href = getViewHref?.(r);
                        if (href) {
                          return (
                            <Button asChild size="sm" variant="secondary" className="w-full">
                              <a href={href}>View Dispatch</a>
                            </Button>
                          );
                        }
                        if (onViewDispatch) {
                          return (
                            <Button size="sm" variant="secondary" className="w-full" onClick={() => onViewDispatch(r)}>
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
