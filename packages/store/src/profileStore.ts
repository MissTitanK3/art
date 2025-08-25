import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AccessRole, FieldRole, VerifiedBy } from './types/roles.ts';
import { WeeklyAvailability } from './types/profile.ts';
import { fakeUUID } from '../../ui/src/lib/utils.ts';

export type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  access_role: AccessRole;
  field_roles: FieldRole[];
  verified_by: VerifiedBy;
  affiliation?: string;
  availability: boolean;
  contact_signal?: string;
  coordination_zone?: string;
  inserted_at: string;
  coverage_zones: string[];
  state: string;
  weekly_availability?: WeeklyAvailability;
  self_risk_acknowledged: boolean;
  city?: string;
  operating_counties: string[];
};

interface ProfileState {
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  clearProfile: () => void;
  restoreDemo: () => void;
  setOperatingCounties: (counties: string[]) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
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
    }),
    {
      name: 'profile-store',
      version: 1, // bump this whenever Profile shape changes
      migrate: (persistedState: any, version) => {
        // Handle upgrades/downgrades here
        // For now, just return the old state directly
        return persistedState as ProfileState;
      },
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
);
