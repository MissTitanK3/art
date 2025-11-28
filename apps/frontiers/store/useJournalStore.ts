"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createIndexedDBStorage } from "./idbStorage";
import { migrateWithDefaults } from "./migrate";

export type JournalKind = "repair" | "dock" | "ping" | "other";

export type JournalEntry = {
  id: string;
  ts: string; // ISO timestamp
  kind: JournalKind;
  message: string;
};

type JournalState = {
  entries: JournalEntry[];
  add: (kind: JournalKind, message: string, ts?: string) => void;
  clear: () => void;
};

const defaults = {
  entries: [] as JournalEntry[],
};

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      ...defaults,
      add: (kind, message, ts) =>
        set((s) => ({
          entries: [
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              ts: ts ?? new Date().toISOString(),
              kind,
              message,
            },
            ...s.entries,
          ],
        })),
      clear: () => set({ entries: [] }),
    }),
    {
      name: "journal-store",
      storage: createIndexedDBStorage(),
      version: 1,
      migrate: migrateWithDefaults(defaults),
      partialize: (s) => ({ entries: s.entries }),
    },
  ),
);
