"use client";

import {
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useMemo,
  createContext,
} from "react";
import { useStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
import type { StoreApi } from "zustand";
import {
  createProfileStore,
  ProfileStoreState,
  ProfileStore,
  singletonProfileStore,
} from "@workspace/store/useProfileStore";
import type { Profile } from "@workspace/store/types/global.ts";
import { useAuth } from "@/hooks/useAuth";
import { useRegionAdapters } from "@/providers/RegionProvider";
import {
  cleanupLegacyStorageKeys,
  legacyStorageKeyCandidates,
  resolveScopedStorageKey,
} from "@workspace/store/utils/storage";

type ProfileStoreProviderProps = PropsWithChildren<{
  initialProfile?: Profile | null;
  persist?: boolean;
  storageKey?: string;
}>;

const ProfileStoreContext = createContext<StoreApi<ProfileStoreState> | null>(
  null
);

const PROFILE_SYNC_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PROFILE_BASE_STORAGE_KEY = "profile-store";

export function ProfileStoreProvider({
  children,
  initialProfile = null,
  persist = true,
  storageKey,
}: ProfileStoreProviderProps) {
  const storeRef = useRef<ProfileStore | null>(null);
  const resolvedStorageKey = useMemo(
    () => resolveScopedStorageKey(PROFILE_BASE_STORAGE_KEY, storageKey),
    [storageKey]
  );
  const legacyKeys = useMemo(
    () => legacyStorageKeyCandidates(PROFILE_BASE_STORAGE_KEY, storageKey),
    [storageKey]
  );

  if (!storeRef.current) {
    storeRef.current = createProfileStore({
      initialProfile,
      persist,
      storageKey: resolvedStorageKey,
    });
  }

  useEffect(() => {
    cleanupLegacyStorageKeys(resolvedStorageKey, legacyKeys);
  }, [resolvedStorageKey, legacyKeys]);

  useEffect(() => {
    const store = storeRef.current;
    if (!store) return;

    const initial = store.getState();
    singletonProfileStore.setState({
      profile: initial.profile ?? null,
      profileSyncedAt: initial.profileSyncedAt ?? null,
    });

    const unsubscribe = store.subscribe((state) => {
      singletonProfileStore.setState({
        profile: state.profile,
        profileSyncedAt: state.profileSyncedAt ?? null,
      });
    });

    return () => unsubscribe();
  }, []);

  const { session } = useAuth();
  const { profileAdapter } = useRegionAdapters();

  useEffect(() => {
    const store = storeRef.current;
    if (!store) return;

    let cancelled = false;
    const isFetching = { current: false } as { current: boolean };

    async function ensureProfile() {
      if (cancelled) return;
      const s = store!;
      const state = s.getState();
      const profile = state.profile;
      const userId = session?.user?.id ?? profile?.user_id;

      if (!userId) return;
      if (!profileAdapter?.loadProfile) return;
      const lastSyncedAt = state.profileSyncedAt
        ? Date.parse(state.profileSyncedAt)
        : null;
      const now = Date.now();
      const needsInitialProfile = profile == null;
      const isStale =
        !!profile &&
        (!lastSyncedAt || now - lastSyncedAt > PROFILE_SYNC_TTL_MS);
      if (!needsInitialProfile && !isStale) return;
      if (isFetching.current) return;

      try {
        isFetching.current = true;
        const remote = await profileAdapter.loadProfile(userId);
        if (cancelled) return;
        if (remote) {
          s.getState().setProfile(remote as Profile, new Date().toISOString());
        }
      } catch (err) {
        // swallow - non-critical
      } finally {
        isFetching.current = false;
      }
    }

    ensureProfile();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, profileAdapter]);

  return (
    <ProfileStoreContext.Provider value={storeRef.current}>
      {children}
    </ProfileStoreContext.Provider>
  );
}

function useProfileStoreContext() {
  const store = useContext(ProfileStoreContext);
  if (!store)
    throw new Error(
      "useProfileStore must be used within a ProfileStoreProvider"
    );
  return store;
}

export function useProfileStore<T>(
  selector: (state: ProfileStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean
) {
  const store = useProfileStoreContext();
  return equalityFn
    ? useStoreWithEqualityFn(store, selector, equalityFn)
    : useStore(store, selector);
}
