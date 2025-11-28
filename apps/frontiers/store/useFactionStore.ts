"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createIndexedDBStorage } from "./idbStorage";
import { migrateWithDefaults } from "./migrate";
import type { Faction } from "@/schemas/factions";

export type Rank = "Outsider" | "Associate" | "Agent" | "Ally";

export function rankFor(rep: number): Rank {
  if (rep >= 200) return "Ally";
  if (rep >= 100) return "Agent";
  if (rep >= 50) return "Associate";
  return "Outsider";
}

type FactionState = {
  factions: Record<string, Faction>;
  reputations: Record<string, number>;
  upsertFaction: (f: Faction) => void;
  incrementReputation: (factionId: string, amount: number) => void;
  getReputation: (factionId: string) => number;
};

const defaults = {
  factions: {} as Record<string, Faction>,
  reputations: {} as Record<string, number>,
};

export const useFactionStore = create<FactionState>()(
  persist(
    (set, get) => ({
      ...defaults,
      upsertFaction: (f) =>
        set((s) => ({ factions: { ...s.factions, [f.id]: f } })),
      incrementReputation: (factionId, amount) =>
        set((s) => {
          const current = s.reputations[factionId] ?? 0;
          const next = Math.max(0, current + Math.round(amount));
          return { reputations: { ...s.reputations, [factionId]: next } };
        }),
      getReputation: (factionId) => get().reputations[factionId] ?? 0,
    }),
    {
      name: "faction-store",
      storage: createIndexedDBStorage(),
      version: 1,
      migrate: migrateWithDefaults(defaults),
      partialize: (s) => ({ factions: s.factions, reputations: s.reputations }),
    },
  ),
);
