'use client';

import { PropsWithChildren, useContext, useRef, createContext } from 'react';
import { useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import type { StoreApi } from 'zustand';
import { createProfileStore, ProfileStoreState, ProfileStore } from '@workspace/store/useProfileStore';
import type { Profile } from '@workspace/store/types/global.ts';

type ProfileStoreProviderProps = PropsWithChildren<{
  initialProfile?: Profile | null;
  persist?: boolean;
  storageKey?: string;
}>;

const ProfileStoreContext = createContext<StoreApi<ProfileStoreState> | null>(null);

export function ProfileStoreProvider({
  children,
  initialProfile = null,
  persist = true,
  storageKey = 'profile-store',
}: ProfileStoreProviderProps) {
  const storeRef = useRef<ProfileStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createProfileStore({
      initialProfile,
      persist,
      storageKey,
    });
  }

  return <ProfileStoreContext.Provider value={storeRef.current}>{children}</ProfileStoreContext.Provider>;
}

function useProfileStoreContext() {
  const store = useContext(ProfileStoreContext);
  if (!store) throw new Error('useProfileStore must be used within a ProfileStoreProvider');
  return store;
}

export function useProfileStore<T>(selector: (state: ProfileStoreState) => T, equalityFn?: (a: T, b: T) => boolean) {
  const store = useProfileStoreContext();
  return equalityFn ? useStoreWithEqualityFn(store, selector, equalityFn) : useStore(store, selector);
}
