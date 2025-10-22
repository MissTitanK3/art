import { useStore } from 'zustand';
import { createStore, StateCreator, StoreApi } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { Profile } from './types/global.ts';

export interface ProfileStoreState {
  profile: Profile | null;
  setProfile: (p: Profile) => void;
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

const createProfileStoreInitializer =
  (initialProfile: Profile | null, demoProfileFactory?: () => Profile): StateCreator<ProfileStoreState> =>
  (set) => ({
    profile: initialProfile,
    setProfile: (p) => set({ profile: p }),
    clearProfile: () => set({ profile: null }),
    restoreDemo: () => {
      if (!demoProfileFactory) {
        return;
      }
      set({ profile: demoProfileFactory() });
    },
    setOperatingCounties: (counties) =>
      set((state) => (state.profile ? { profile: { ...state.profile, operating_counties: counties } } : state)),
  });

function withPersistence(initializer: StateCreator<ProfileStoreState>, storageKey: string) {
  return persist(initializer, {
    name: storageKey,
    version: 1,
    migrate: (persistedState: any) => persistedState as ProfileStoreState,
    partialize: (state) => ({ profile: state.profile }),
  });
}

export type ProfileStore = StoreApi<ProfileStoreState>;

export function createProfileStore(options?: CreateProfileStoreOptions): ProfileStore {
  const {
    initialProfile = null,
    persist: enablePersist = true,
    storageKey = 'profile-store',
    demoProfileFactory,
  } = options ?? {};
  const initializer = createProfileStoreInitializer(initialProfile, demoProfileFactory);
  const creator = enablePersist ? withPersistence(initializer, storageKey) : initializer;
  return createStore<ProfileStoreState>(creator as any);
}

// Temporary compatibility hook until we wire contexts per app.
export const singletonProfileStore = createProfileStore();
export function useProfileStore<T>(
  selector: (state: ProfileStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) {
  return useStore(singletonProfileStore, selector, equalityFn);
}
