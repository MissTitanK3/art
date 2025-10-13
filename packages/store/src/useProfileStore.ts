import { useStore } from 'zustand';
import { createStore, StateCreator, StoreApi } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { fakeUUID } from '../../ui/src/lib/utils.ts';
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
}

const createProfileStoreInitializer =
  (initialProfile: Profile | null): StateCreator<ProfileStoreState> =>
  (set) => ({
    profile: initialProfile,
    setProfile: (p) => set({ profile: p }),
    clearProfile: () => set({ profile: null }),
    restoreDemo: () =>
      set({
        profile: {
          id: fakeUUID(),
          user_id: fakeUUID(),
          display_name: 'Demo User',
          access_role: 'dispatcher_basic',
          verified_by: 'self',
          field_roles: ['translator', 'logistics'],
          state: 'active',
          availability: true,
          self_risk_acknowledged: false,
          affiliation: 'Always Ready Tools',
          contact_signal: '@demo_user',
          coordination_zone: 'PNW-Region-1',
          city: 'Seattle',
          weekly_availability: { blocks: {} },
          coverage_zones: ['Seattle', 'Tacoma'],
          operating_counties: [],
          inserted_at: new Date().toISOString(),
        },
      }),
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
  const { initialProfile = null, persist: enablePersist = true, storageKey = 'profile-store' } = options ?? {};
  const initializer = createProfileStoreInitializer(initialProfile);
  const creator = enablePersist ? withPersistence(initializer, storageKey) : initializer;
  return createStore<ProfileStoreState>(creator as any);
}

// Temporary compatibility hook until we wire contexts per app.
const singletonProfileStore = createProfileStore();
export function useProfileStore<T>(
  selector: (state: ProfileStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) {
  return useStore(singletonProfileStore, selector, equalityFn);
}
