"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { WizardReport } from "@workspace/store/types/watch.ts";
import { Button } from "@workspace/ui/components/button";


interface WatchMapProps {
  reports: WizardReport[];
  center?: [number, number];
  zoom?: number;
  onCreateDispatch?: (report: WizardReport) => void;
}

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
}: WatchMapProps) {
  if (window === undefined) {
    return null;
  }
  return (
    <div className="h-[600px] w-full rounded-2xl border">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
                      variant='destructive'
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
