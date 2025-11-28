"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createIndexedDBStorage } from "./idbStorage";
import { migrateWithDefaults } from "./migrate";

const TILE_DEG = 0.01; // ~1.1km at equator; finer grid for smaller fog circles (~0.5mi)
const EARTH_KM_PER_DEG = 111;

export type FogSource = "movement" | "ping" | "poi" | "realtime";

export type FogCell = {
  key: string;
  center: [number, number];
  discoveredAt: string;
  radiusKm: number;
  source: FogSource;
};

type FogState = {
  anchor: [number, number] | null;
  discovered: Record<string, FogCell>;
  setAnchor: (center: [number, number] | null) => void;
  markDiscovered: (
    lat: number,
    lng: number,
    radiusKm?: number,
    source?: FogSource,
  ) => void;
  clear: () => void;
};

const defaults = {
  anchor: null as [number, number] | null,
  discovered: {} as Record<string, FogCell>,
};

function toCellKey(lat: number, lng: number) {
  const latIdx = Math.floor(lat / TILE_DEG);
  const lngIdx = Math.floor(lng / TILE_DEG);
  return `cell:${latIdx}:${lngIdx}`;
}

function cellCenter(lat: number, lng: number): [number, number] {
  const latIdx = Math.floor(lat / TILE_DEG);
  const lngIdx = Math.floor(lng / TILE_DEG);
  return [
    (latIdx + 0.5) * TILE_DEG,
    (lngIdx + 0.5) * TILE_DEG,
  ] as [number, number];
}

function clampRadiusKm(v?: number) {
  if (!Number.isFinite(v)) return 0.8;
  return Math.max(0.25, Math.min(20, Math.round((v as number) * 100) / 100));
}

export const useFogOfWarStore = create<FogState>()(
  persist(
    (set, get) => ({
      ...defaults,
      setAnchor: (center) => set({ anchor: center }),
      markDiscovered: (lat, lng, radiusKm = 0.8, source = "movement") =>
        set((state) => {
          const rKm = clampRadiusKm(radiusKm);
          const latSpan = rKm / EARTH_KM_PER_DEG;
          const lngSpan = rKm / (EARTH_KM_PER_DEG * Math.max(Math.cos((lat * Math.PI) / 180), 0.2));
          const latCells = Math.max(1, Math.ceil(latSpan / TILE_DEG));
          const lngCells = Math.max(1, Math.ceil(lngSpan / TILE_DEG));
          const next = { ...state.discovered };
          const ts = new Date().toISOString();
          for (let i = -latCells; i <= latCells; i++) {
            for (let j = -lngCells; j <= lngCells; j++) {
              const latOffset = i * TILE_DEG;
              const lngOffset = j * TILE_DEG;
              const key = toCellKey(lat + latOffset, lng + lngOffset);
              if (next[key]) continue;
              next[key] = {
                key,
                center: cellCenter(lat + latOffset, lng + lngOffset),
                discoveredAt: ts,
                radiusKm: rKm,
                source,
              };
            }
          }
          return { discovered: next };
        }),
      clear: () => set({ discovered: {} }),
    }),
    {
      name: "fog-store",
      storage: createIndexedDBStorage(),
      version: 1,
      migrate: migrateWithDefaults(defaults),
      partialize: (s) => ({
        discovered: s.discovered,
        anchor: s.anchor,
      }),
    },
  ),
);

export const fogTileDegrees = TILE_DEG;
