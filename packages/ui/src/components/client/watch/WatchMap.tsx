"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { WizardReport } from "@workspace/store/types/watch.ts";
import { Button } from "@workspace/ui/components/button";
import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";


interface WatchMapProps {
  reports: WizardReport[];
  center?: [number, number];
  zoom?: number;
  onCreateDispatch?: (report: WizardReport) => void;
  focusPoint?: MapFocus | null;
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
  focusPoint,
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
  return (
    <div className="relative w-full h-[600px] lg:h-[90vh] rounded-2xl border">
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
          .filter((r) => (r.location as any)?.lat && (r.location as any)?.lng)
          .map((r) => {
            const lat = (r.location as any).lat;
            const lng = (r.location as any).lng;

            return (
              <Marker key={r.id} position={[lat, lng]} icon={reportIcon}>
                <Popup maxWidth={200}>
                  <div className="space-y-2">
                    <div className="font-semibold text-sm">
                      {r.agency_type?.join(", ") || r.agency_other || "Unknown presence"}
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
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={() => onCreateDispatch?.(r)}
                    >
                      Create Dispatch
                    </Button>
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
