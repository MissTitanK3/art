'use client';

import { PropsWithChildren, useRef, createContext, useContext } from 'react';
import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createMeetANeedStore, type MeetANeedStoreState } from '@workspace/store/useMeetANeedStore';
import type { MeetANeed } from '@workspace/store/types/meet-a-need';

type MeetANeedStoreProviderProps = PropsWithChildren<{
  initialNeeds?: MeetANeed[];
  storageKey?: string;
  persist?: boolean;
}>;

export const MeetANeedStoreContext = createContext<StoreApi<MeetANeedStoreState> | null>(null);

export function MeetANeedStoreProvider({
  children,
  initialNeeds = [],
  persist = true,
  storageKey = 'meet-a-need-store:region-wap',
}: MeetANeedStoreProviderProps) {
  const storeRef = useRef<StoreApi<MeetANeedStoreState> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createMeetANeedStore({ initialNeeds, persist, storageKey });
  }
  return <MeetANeedStoreContext.Provider value={storeRef.current}>{children}</MeetANeedStoreContext.Provider>;
}

export function useMeetANeedStoreProvider<T>(selector: (state: MeetANeedStoreState) => T, equalityFn?: (a: T, b: T) => boolean) {
  const store = useContext(MeetANeedStoreContext);
  if (!store) throw new Error('useMeetANeedStoreProvider must be used within MeetANeedStoreProvider');
  return equalityFn ? useStoreWithEqualityFn(store, selector, equalityFn) : useStore(store, selector);
}

