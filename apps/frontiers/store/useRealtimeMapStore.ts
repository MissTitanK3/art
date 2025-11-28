"use client";

import { create } from "zustand";

export type MapEntity = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  lastSeen: string;
  kind: "player" | "event";
  note?: string;
  strength?: number;
};

export type MapEvent = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  ts: string;
  kind: "resonance" | "poi" | "other";
};

type RealtimeMapState = {
  anchor: [number, number] | null;
  entities: Record<string, MapEntity>;
  events: MapEvent[];
  setAnchor: (center: [number, number] | null) => void;
  ingestResonance: (row: any) => void;
  addEvent: (e: MapEvent) => void;
  clear: () => void;
};

const defaults = {
  anchor: null as [number, number] | null,
  entities: {} as Record<string, MapEntity>,
  events: [] as MapEvent[],
};

function fallbackAnchor(anchor: [number, number] | null): [number, number] {
  if (anchor && Number.isFinite(anchor[0]) && Number.isFinite(anchor[1])) {
    return anchor;
  }
  return [37.8, -96];
}

function jitterAround(
  anchor: [number, number],
  seed: string,
): { lat: number; lng: number } {
  // Deterministic-ish jitter based on seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const angle = ((hash % 360) * Math.PI) / 180;
  const km = 3 + Math.abs(hash % 7); // 3–9 km from anchor
  const latOffset = (km / 111) * Math.sin(angle);
  const lngOffset =
    (km / (111 * Math.max(Math.cos((anchor[0] * Math.PI) / 180), 0.2))) *
    Math.cos(angle);
  return {
    lat: anchor[0] + latOffset,
    lng: anchor[1] + lngOffset,
  };
}

function blend(prev: { lat: number; lng: number }, next: { lat: number; lng: number }) {
  return {
    lat: prev.lat * 0.65 + next.lat * 0.35,
    lng: prev.lng * 0.65 + next.lng * 0.35,
  };
}

export const useRealtimeMapStore = create<RealtimeMapState>()((set, get) => ({
  ...defaults,
  setAnchor: (center) => set({ anchor: center }),
  ingestResonance: (row: any) => {
    const now = new Date().toISOString();
    const anchor = fallbackAnchor(get().anchor);
    const seed = String(row?.source_id || row?.id || row?.recipient_id || now);
    const coords = jitterAround(anchor, seed);
    set((state) => {
      const id = seed;
      const existing = state.entities[id];
      const pos = existing ? blend(existing, coords) : coords;
      const label =
        (row?.source_email as string) ||
        (row?.source_id as string) ||
        "Ally";
      const entity: MapEntity = {
        id,
        label,
        lat: pos.lat,
        lng: pos.lng,
        lastSeen: now,
        kind: "player",
        note: row?.region_id ? `Region ${row.region_id}` : undefined,
        strength: typeof row?.strength === "number" ? row.strength : undefined,
      };
      const events: MapEvent[] = [
        {
          id: String(row?.id || `${seed}-${now}`),
          label: `${label} resonance`,
          lat: pos.lat,
          lng: pos.lng,
          ts: now,
          kind: "resonance",
        },
        ...state.events.filter((e) => Date.now() - new Date(e.ts).getTime() < 1000 * 60 * 20).slice(0, 30),
      ];
      return {
        entities: { ...state.entities, [id]: entity },
        events,
      };
    });
  },
  addEvent: (e) =>
    set((state) => ({
      events: [
        e,
        ...state.events
          .filter((x) => Date.now() - new Date(x.ts).getTime() < 1000 * 60 * 20)
          .slice(0, 30),
      ],
    })),
  clear: () => set({ ...defaults }),
}));
