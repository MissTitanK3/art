"use client";

import {
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
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

type ProfileStoreProviderProps = PropsWithChildren<{
  initialProfile?: Profile | null;
  persist?: boolean;
  storageKey?: string;
}>;

const ProfileStoreContext = createContext<StoreApi<ProfileStoreState> | null>(
  null,
);

export function ProfileStoreProvider({
  children,
  initialProfile = null,
  persist = true,
  storageKey = `profile-store:${process.env.NEXT_PUBLIC_BRAND_NAME}`,
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

  // Centralized hydrator: if profile role is missing, try to fetch profile from adapter
  // and populate the profile store. This mirrors the behavior users see when visiting
  // the profile page but keeps it centralized for the app.
  const { session } = useAuth();
  const { profileAdapter } = useRegionAdapters();

  useEffect(() => {
    const store = storeRef.current;
    if (!store) return;

    let cancelled = false;
    const isFetching = { current: false } as { current: boolean };

    async function ensureProfile() {
      if (cancelled) return;
      const s = store!; // narrowed, provider ensures storeRef.current exists
      const state = s.getState();
      const profile = state.profile;

      // consider either legacy `role` or typed `access_role`
      const hasRole =
        (profile as any)?.role != null || profile?.access_role != null;
      const userId = session?.user?.id ?? profile?.user_id;

      if (hasRole) return;
      if (!userId) return;
      if (!profileAdapter?.loadProfile) return;
      if (isFetching.current) return;

      try {
        isFetching.current = true;
        const remote = await profileAdapter.loadProfile(userId);
        if (cancelled) return;
        if (remote) {
          // set into the per-app store; provider's subscription will mirror to singleton
          s.getState().setProfile(remote as Profile);
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
      "useProfileStore must be used within a ProfileStoreProvider",
    );
  return store;
}

export function useProfileStore<T>(
  selector: (state: ProfileStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) {
  const store = useProfileStoreContext();
  return equalityFn
    ? useStoreWithEqualityFn(store, selector, equalityFn)
    : useStore(store, selector);
}
