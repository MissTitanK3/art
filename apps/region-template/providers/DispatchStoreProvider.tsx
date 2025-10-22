'use client';

import { PropsWithChildren, useRef, createContext, useContext } from 'react';
import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import {
  createDispatchStore,
  DispatchStoreState,
} from '@workspace/store/useDispatchStore';
import type { DispatchShift } from '@workspace/store/useDispatchStore';
import { demoDispatches } from '@/data/demoDispatches';
import { demoDispatchShifts } from '@/data/demoDispatchShifts';
import { DispatchSubmission } from '@workspace/store/types/global.ts';

type DispatchStoreProviderProps = PropsWithChildren<{
  initialSubmissions?: DispatchSubmission[];
  initialShifts?: DispatchShift[];
  storageKey?: string;
  persist?: boolean;
}>;

export const DispatchStoreContext = createContext<StoreApi<DispatchStoreState> | null>(null);

export function DispatchStoreProvider({
  children,
  initialSubmissions = demoDispatches,
  initialShifts = demoDispatchShifts,
  persist = true,
  storageKey = 'dispatch-store',
}: DispatchStoreProviderProps) {
  const storeRef = useRef<StoreApi<DispatchStoreState> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createDispatchStore({
      initialSubmissions,
      initialShifts,
      persist,
      storageKey,
    });
  }

  return <DispatchStoreContext.Provider value={storeRef.current}>{children}</DispatchStoreContext.Provider>;
}

export function useDispatchStore<T>(
  selector: (state: DispatchStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) {
  const store = useContext(DispatchStoreContext);
  if (!store) {
    throw new Error('useDispatchStore must be used within a DispatchStoreContext provider');
  }
  return equalityFn ? useStoreWithEqualityFn(store, selector, equalityFn) : useStore(store, selector);
}
