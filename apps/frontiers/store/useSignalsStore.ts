import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createIndexedDBStorage } from "./idbStorage";
import type { ArtSignal } from "@/schemas/art_signals";

type Location = { lat: number; lng: number } | null;

type SignalsState = {
  signals: ArtSignal[];
  location: Location;
  loading: boolean;
  error?: string;
  completedIds: string[];
  setSignals: (s: ArtSignal[]) => void;
  setLocation: (l: Location) => void;
  setLoading: (v: boolean) => void;
  setError: (e?: string) => void;
  markDiscovered: (id: string) => void;
};

export const useSignalsStore = create<SignalsState>()(
  persist(
    (set, get) => ({
      signals: [],
      location: null,
      loading: false,
      error: undefined,
      completedIds: [],
      setSignals: (s) => set({ signals: s }),
      setLocation: (l) => set({ location: l }),
      setLoading: (v) => set({ loading: v }),
      setError: (e) => set({ error: e }),
      markDiscovered: (id) =>
        set((state) => ({
          signals: state.signals.map((sig) =>
            sig.id === id ? { ...sig, is_discovered: true } : sig,
          ),
          completedIds: state.completedIds.includes(id)
            ? state.completedIds
            : [...state.completedIds, id],
        })),
    }),
    {
      name: "signals-store",
      storage: createIndexedDBStorage(),
      version: 1,
      partialize: (state) => ({
        signals: state.signals,
        completedIds: state.completedIds,
        location: state.location,
      }),
    },
  ),
);
