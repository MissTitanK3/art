"use client";

import { useMemo } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";
import { useRealtimeMapStore } from "@/store/useRealtimeMapStore";

function rel(ts: string) {
  const diff = Math.max(0, Date.now() - new Date(ts).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export function RealtimeLayer() {
  const entities = useRealtimeMapStore((s) => s.entities);
  const events = useRealtimeMapStore((s) => s.events);
  const entityList = useMemo(
    () => Object.values(entities).slice(0, 50),
    [entities],
  );

  return (
    <>
      {entityList.map((e) => (
        <CircleMarker
          key={e.id}
          center={[e.lat, e.lng]}
          radius={6}
          pathOptions={{
            color: "#0ea5e9",
            weight: 2,
            opacity: 0.8,
            fillColor: "#38bdf8",
            fillOpacity: 0.35,
          }}
          className="[filter:drop-shadow(0_0_4px_rgba(14,165,233,0.45))]"
        >
          <Tooltip direction="top" offset={[0, -4]} opacity={0.9}>
            <div className="text-xs">
              <div className="font-semibold">{e.label}</div>
              <div className="text-muted-foreground">Seen {rel(e.lastSeen)}</div>
              {typeof e.strength === "number" ? (
                <div className="text-muted-foreground">
                  Resonance {Math.round(e.strength * 100)}%
                </div>
              ) : null}
              {e.note ? (
                <div className="text-muted-foreground">{e.note}</div>
              ) : null}
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
      {events.slice(0, 30).map((e) => (
        <CircleMarker
          key={e.id}
          center={[e.lat, e.lng]}
          radius={4}
          pathOptions={{
            color: "#f97316",
            weight: 1,
            opacity: 0.8,
            fillColor: "#fdba74",
            fillOpacity: 0.6,
          }}
          className="animate-pulse"
        >
          <Tooltip direction="top" offset={[0, -4]} opacity={0.9}>
            <div className="text-xs">
              <div className="font-semibold">{e.label}</div>
              <div className="text-muted-foreground">{rel(e.ts)}</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
