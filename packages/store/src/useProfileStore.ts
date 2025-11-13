import { useStore } from "zustand";
import { createStore, StateCreator, StoreApi } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import { Profile } from "./types/global.ts";

export interface ProfileStoreState {
  profile: Profile | null;
  profileSyncedAt: string | null;
  setProfile: (p: Profile | null, syncedAt?: string | number | Date) => void;
  setProfileSyncedAt: (syncedAt?: string | number | Date | null) => void;
  clearProfile: () => void;
  restoreDemo: () => void;
  setOperatingCounties: (counties: string[]) => void;
}

export interface CreateProfileStoreOptions {
  initialProfile?: Profile | null;
  persist?: boolean;
  storageKey?: string;
  demoProfileFactory?: () => Profile;
}

function toIsoString(input?: string | number | Date | null): string | null {
  if (!input && input !== 0) return new Date().toISOString();
  if (typeof input === "string") {
    const date = new Date(input);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }
  if (typeof input === "number") {
    const date = new Date(input);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? new Date().toISOString() : input.toISOString();
  }
  return new Date().toISOString();
}

const createProfileStoreInitializer =
  (
    initialProfile: Profile | null,
    demoProfileFactory?: () => Profile,
  ): StateCreator<ProfileStoreState> =>
  (set) => ({
    profile: initialProfile,
    profileSyncedAt: initialProfile ? new Date().toISOString() : null,
    setProfile: (p, syncedAt) =>
      set({
        profile: p,
        profileSyncedAt:
          syncedAt === null ? null : toIsoString(syncedAt),
      }),
    setProfileSyncedAt: (syncedAt) =>
      set({
        profileSyncedAt: syncedAt == null ? null : toIsoString(syncedAt),
      }),
    clearProfile: () => set({ profile: null, profileSyncedAt: null }),
    restoreDemo: () => {
      if (!demoProfileFactory) {
        return;
      }
      set({
        profile: demoProfileFactory(),
        profileSyncedAt: new Date().toISOString(),
      });
    },
    setOperatingCounties: (counties) =>
      set((state) =>
        state.profile
          ? { profile: { ...state.profile, operating_counties: counties } }
          : state,
      ),
  });

function withPersistence(
  initializer: StateCreator<ProfileStoreState>,
  storageKey: string,
) {
  return persist(initializer, {
    name: storageKey,
    version: 1,
    migrate: (persistedState: any) => {
      if (
        persistedState &&
        typeof persistedState === "object" &&
        !("profileSyncedAt" in persistedState)
      ) {
        return {
          ...persistedState,
          profileSyncedAt: null,
        } as ProfileStoreState;
      }
      return persistedState as ProfileStoreState;
    },
    partialize: (state) => ({
      profile: state.profile,
      profileSyncedAt: state.profileSyncedAt,
    }),
  });
}

export type ProfileStore = StoreApi<ProfileStoreState>;

export function createProfileStore(
  options?: CreateProfileStoreOptions,
): ProfileStore {
  const {
    initialProfile = null,
    persist: enablePersist = true,
    storageKey = "profile-store",
    demoProfileFactory,
  } = options ?? {};
  const initializer = createProfileStoreInitializer(
    initialProfile,
    demoProfileFactory,
  );
  const creator = enablePersist
    ? withPersistence(initializer, storageKey)
    : initializer;
  return createStore<ProfileStoreState>(creator as any);
}

// Temporary compatibility hook until we wire contexts per app.
// Singleton instance shares profile data across packages but should not persist
// to localStorage directly. Persistence is handled by per-app providers.
export const singletonProfileStore = createProfileStore({ persist: false });
export function useProfileStore<T>(
  selector: (state: ProfileStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) {
  return useStore(singletonProfileStore, selector, equalityFn);
}
