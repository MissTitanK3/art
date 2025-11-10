"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createIndexedDBStorage } from "./idbStorage";
import type { Profile } from "@/schemas/profiles";

type ProfileState = {
  profile: Profile | null;
  region_id: string | null;
  sector_code: string | null;
  engineering_xp: number;
  fatigue_engineering: number; // 0-100
  fatigue_navigation: number; // 0-100
  fatigue_operations: number; // 0-100
  // Dock location and radius (km) for rest bonuses
  dock_lat: number | null;
  dock_lng: number | null;
  dock_radius_km: number | null;
  setProfile: (p: Profile | null) => void;
  setRegion: (id: string | null) => void;
  setSector: (sector: string | null) => void;
  addEngineeringXp: (amount: number) => void;
  setFatigue: (
    kind: "engineering" | "navigation" | "operations",
    value: number,
  ) => void;
  setDock: (lat: number, lng: number, radiusKm?: number) => void;
  clearDock: () => void;
  restoreDefaults: () => void;
};

const defaults = {
  profile: null as Profile | null,
  region_id: null as string | null,
  sector_code: null as string | null,
  engineering_xp: 0,
  fatigue_engineering: 0,
  fatigue_navigation: 0,
  fatigue_operations: 0,
  dock_lat: null as number | null,
  dock_lng: null as number | null,
  dock_radius_km: null as number | null,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...defaults,
      setProfile: (p) =>
        set({
          profile: p,
          region_id: p?.region_id ?? null,
          sector_code: p?.sector_code ?? null,
        }),
      setRegion: (id) => set({ region_id: id }),
      setSector: (sector) => set({ sector_code: sector }),
      addEngineeringXp: (amount) =>
        set((state) => ({
          engineering_xp: Math.max(
            0,
            Math.round((state.engineering_xp ?? 0) + amount),
          ),
        })),
      setFatigue: (kind, value) =>
        set((state) => {
          const v = Math.max(0, Math.min(100, Math.round(value)));
          if (kind === "engineering") return { fatigue_engineering: v };
          if (kind === "navigation") return { fatigue_navigation: v };
          return { fatigue_operations: v };
        }),
      setDock: (lat, lng, radiusKm) =>
        set(() => ({
          dock_lat: Math.round(lat * 1e6) / 1e6,
          dock_lng: Math.round(lng * 1e6) / 1e6,
          dock_radius_km:
            typeof radiusKm === "number"
              ? Math.max(0, Math.round(radiusKm * 1e4) / 1e4)
              : 0.4023,
        })),
      clearDock: () =>
        set({ dock_lat: null, dock_lng: null, dock_radius_km: null }),
      restoreDefaults: () => set({ ...defaults }),
    }),
    {
      name: "profile-store",
      storage: createIndexedDBStorage(),
      version: 1,
      partialize: (s) => ({
        profile: s.profile,
        region_id: s.region_id,
        sector_code: s.sector_code,
        engineering_xp: s.engineering_xp,
        fatigue_engineering: s.fatigue_engineering,
        fatigue_navigation: s.fatigue_navigation,
        fatigue_operations: s.fatigue_operations,
        dock_lat: s.dock_lat,
        dock_lng: s.dock_lng,
        dock_radius_km: s.dock_radius_km,
      }),
    },
  ),
);
