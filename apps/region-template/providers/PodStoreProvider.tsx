"use client";

import {
  PropsWithChildren,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import type { StoreApi } from "zustand";
import { useStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { createPodStore, PodStoreState } from "@workspace/store/usePodStore";
import type { Pod, RosterEntry, Shift } from "@workspace/store/types/pod.ts";
import type { Profile } from "@workspace/store/types/global.ts";
import { makeRosterEntry } from "@workspace/store/utils/generator.ts";
import { useProfileStore as useGlobalProfileStore } from "@workspace/store/useProfileStore";
import { demoPods, demoRoster } from "@/data/demoPods";

type PodStoreProviderProps = PropsWithChildren<{
  initialPods?: Pod[];
  initialShifts?: Shift[];
  initialRoster?: RosterEntry[];
  storageKey?: string;
  persist?: boolean;
}>;

export const PodStoreContext = createContext<StoreApi<PodStoreState> | null>(
  null,
);

export function PodStoreProvider({
  children,
  initialPods = demoPods,
  initialShifts = [],
  initialRoster = demoRoster,
  persist = false,
  storageKey = "pod-store",
}: PodStoreProviderProps) {
  const storeRef = useRef<StoreApi<PodStoreState> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createPodStore({
      initialPods,
      initialShifts,
      initialRoster,
      persist,
      storageKey,
    });
  }

  return (
    <PodStoreContext.Provider value={storeRef.current}>
      <RegisteredRosterSync />
      {children}
    </PodStoreContext.Provider>
  );
}

export function usePodStore<T>(
  selector: (state: PodStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) {
  const store = useContext(PodStoreContext);

  if (!store) {
    throw new Error("usePodStore must be used within a PodStoreProvider");
  }

  return equalityFn
    ? useStoreWithEqualityFn(store, selector, equalityFn)
    : useStore(store, selector);
}

const REGISTERED_ROSTER_PREFIX = "registered-profile";

function profileToRosterEntry(profile: Profile): RosterEntry {
  const rosterId = `${REGISTERED_ROSTER_PREFIX}-${profile.id}`;
  const affiliationNote = profile.affiliation
    ? `Affiliation: ${profile.affiliation}`
    : undefined;
  const baseEntry = makeRosterEntry(
    rosterId,
    profile,
    "member",
    profile.availability ? "active" : "inactive",
    [],
    [],
    [],
    undefined,
    affiliationNote,
  );

  return {
    ...baseEntry,
    joinedAt: profile.inserted_at ?? baseEntry.joinedAt,
    signal_handle: profile.contact_signal ?? baseEntry.signal_handle,
  };
}

function RegisteredRosterSync() {
  const profile = useGlobalProfileStore((s) => s.profile);
  const upsertActiveRosterEntry = usePodStore(
    (state) => state.upsertActiveRosterEntry,
  );
  const removeActiveRosterEntry = usePodStore(
    (state) => state.removeActiveRosterEntry,
  );
  const lastRegisteredId = useRef<string | null>(null);

  useEffect(() => {
    if (!profile) {
      if (lastRegisteredId.current) {
        removeActiveRosterEntry(lastRegisteredId.current);
        lastRegisteredId.current = null;
      }
      return;
    }

    const entry = profileToRosterEntry(profile);
    if (lastRegisteredId.current && lastRegisteredId.current !== entry.id) {
      removeActiveRosterEntry(lastRegisteredId.current);
    }
    lastRegisteredId.current = entry.id;
    upsertActiveRosterEntry(entry);
  }, [profile, removeActiveRosterEntry, upsertActiveRosterEntry]);

  return null;
}
