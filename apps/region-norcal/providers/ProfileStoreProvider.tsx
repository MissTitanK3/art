'use client';

import { PropsWithChildren, useContext, useEffect, useRef, createContext } from 'react';
import { useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import type { StoreApi } from 'zustand';
import { createProfileStore, ProfileStoreState, ProfileStore, singletonProfileStore } from '@workspace/store/useProfileStore';
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
  storageKey = 'profile-store:region-norcal',
}: ProfileStoreProviderProps) {
  const storeRef = useRef<ProfileStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createProfileStore({
      initialProfile,
      persist,
      storageKey,
    });
  }

  useEffect(() => {
    const store = storeRef.current;
    if (!store) return;

    const initial = store.getState().profile;
    singletonProfileStore.setState({ profile: initial ?? null });

    const unsubscribe = store.subscribe((state) => {
      singletonProfileStore.setState({ profile: state.profile });
    });

    return () => unsubscribe();
  }, []);


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
