'use client';

import { PropsWithChildren, useRef, createContext, useContext } from 'react';
import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import {
  createPodStore,
  PodStoreState,
  seedPods,
  seedRoster,
} from '@workspace/store/usePodStore';
import type { Pod, RosterEntry, Shift } from '@workspace/store/types/pod.ts';

type PodStoreProviderProps = PropsWithChildren<{
  initialPods?: Pod[];
  initialShifts?: Shift[];
  initialRoster?: RosterEntry[];
  storageKey?: string;
  persist?: boolean;
}>;

export const PodStoreContext = createContext<StoreApi<PodStoreState> | null>(null);

export function PodStoreProvider({
  children,
  initialPods = seedPods,
  initialShifts = [],
  initialRoster = seedRoster,
  persist = false,
  storageKey = 'pod-store',
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

  return <PodStoreContext.Provider value={storeRef.current}>{children}</PodStoreContext.Provider>;
}

export function usePodStore<T>(
  selector: (state: PodStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) {
  const store = useContext(PodStoreContext);

  if (!store) {
    throw new Error('usePodStore must be used within a PodStoreProvider');
  }

  return equalityFn ? useStoreWithEqualityFn(store, selector, equalityFn) : useStore(store, selector);
}
