// packages/store/src/profileStore.ts
import { create } from 'zustand';
import { AccessRole, FieldRole, VerifiedBy } from './types/roles.ts';

export type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  access_role: AccessRole;
  field_roles: FieldRole[];
  verified_by: VerifiedBy;
  affiliation?: string;
  availability: boolean;
  contact_signal?: string; // Only Signal (per product decision)
  coordination_zone?: string;
  inserted_at: string;
  coverage_zones: string[]; // ← invariant: always string[]
  state: string; // status in your domain model
  weekly_availability?: { blocks: Record<string, any> };
  self_risk_acknowledged: boolean;
  city?: string;
  operating_counties: string[]; // FIPS[]
};
interface ProfileState {
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  clearProfile: () => void;
  restoreDemo: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  setProfile: (p) => set({ profile: p }),
  clearProfile: () => set({ profile: null }),
  restoreDemo: () =>
    set({
      profile: {
        id: 'demo-1',
        user_id: '',
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
        inserted_at: '',
      },
    }),
}));
