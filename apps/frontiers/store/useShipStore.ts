"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createIndexedDBStorage } from "./idbStorage";
import { migrateWithDefaults } from "./migrate";

type ShipState = {
  ship_condition: number; // 1–100
  crew_morale: number; // 1–100
  last_ping_at: string | null;
  fatigue: number; // 0–100 mirror of server fatigue*100
  customization: Record<string, any>;
  component_integrity: Record<string, number>; // component_id -> integrity 0-100
  setCondition: (v: number) => void;
  setMorale: (v: number) => void;
  markPing: () => void;
  setAll: (next: Partial<ShipState>) => void;
  restoreDefaults: () => void;
  applyPulse: (strength: number) => void;
  addFatigue: (delta: number) => void;
  setCustomization: (c: Record<string, any>) => void;
  setComponentIntegrity: (id: string, integrity: number) => void;
  repairComponent: (id: string, amount: number) => void;
  resupply: (type: "fuel" | "supplies", amount: number) => void;
};

const defaults = {
  ship_condition: 100,
  crew_morale: 100,
  last_ping_at: null as string | null,
  fatigue: 0,
  customization: {},
  component_integrity: {},
};

export const useShipStore = create<ShipState>()(
  persist(
    (set) => ({
      ...defaults,
      setCondition: (v) => set({ ship_condition: clamp100(v) }),
      setMorale: (v) => set({ crew_morale: clamp100(v) }),
      markPing: () => set({ last_ping_at: new Date().toISOString() }),
      setAll: (next) => set(next),
      restoreDefaults: () => set({ ...defaults }),
      applyPulse: (strength: number) =>
        set((s) => {
          const n = normalize01(strength);
          const delta = Math.round(n * 10); // map 0..1 -> 0..10 points
          return {
            fatigue: Math.max(0, s.fatigue - delta),
            crew_morale: clamp100(s.crew_morale + delta),
          };
        }),
      addFatigue: (delta: number) =>
        set((s) => ({
          fatigue: Math.max(0, Math.min(100, Math.round(s.fatigue + delta))),
        })),
      setCustomization: (c) => set({ customization: c }),
      setComponentIntegrity: (id, integrity) =>
        set((s) => ({
          component_integrity: {
            ...s.component_integrity,
            [id]: clamp100(integrity),
          },
        })),
      repairComponent: (id, amount) =>
        set((s) => ({
          component_integrity: {
            ...s.component_integrity,
            [id]: clamp100((s.component_integrity[id] || 0) + amount),
          },
        })),
      resupply: (type, amount) => {
        // Placeholder for resupply logic, might affect morale or other stats
        // For now, just logging or doing nothing as it might be handled by server/ledger
        console.log(`Resupplying ${type} by ${amount}`);
      },
    }),
    {
      name: "ship-store",
      storage: createIndexedDBStorage(),
      version: 2, // Increment version
      migrate: migrateWithDefaults(defaults),
      partialize: (s) => ({
        ship_condition: s.ship_condition,
        crew_morale: s.crew_morale,
        last_ping_at: s.last_ping_at,
        fatigue: s.fatigue,
        customization: s.customization,
        component_integrity: s.component_integrity,
      }),
    },
  ),
);

function clamp100(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

// Client no longer degrades; server cron owns the schedule.

function normalize01(v: number) {
  const n = Number.isFinite(v) ? (v as number) : 0;
  return Math.max(0, Math.min(1, n));
}
