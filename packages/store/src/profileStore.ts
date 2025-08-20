'use client';

import { AccessRole, FieldRole, VerifiedBy } from './../../ui/src/lib/constants/roles.js';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  contact_sms?: string;
  coordination_zone?: string;
  inserted_at: string;
  coverage_zones?: string[]; // ← store invariant: always string[]
  state: string; // status
  weekly_availability?: { blocks: Record<string, any> };
  self_risk_acknowledged: boolean;
  city?: string;
  operating_counties: string[]; // FIPS[]
};

type ProfileState = {
  profile: Profile | null;
  setProfile: (profile: Partial<Profile> & { id: string }) => void;
  clearProfile: () => void;

  setOperatingCounties: (fipsList: string[]) => void;
  toggleOperatingCounty: (fips: string) => void;

  restoreDemo: () => void;
};

// --- helpers ---
function toCoverageIds(input: unknown): string[] | undefined {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((z) => (typeof z === 'string' ? z : (z as any)?.id))
      .filter((v): v is string => typeof v === 'string' && v.length > 0);
  }
  return [];
}

function normalizeProfile(p: Partial<Profile>): Partial<Profile> {
  const normalized: Partial<Profile> = { ...p };
  normalized.coverage_zones = toCoverageIds(p.coverage_zones);
  // (Add other coercions here if needed in future)
  return normalized;
}

// --- seed ---
const dummyProfile: Profile = {
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
  contact_sms: '+1 555-123-4567',
  coordination_zone: 'PNW-Region-1',
  city: 'Seattle',
  weekly_availability: { blocks: {} },
  coverage_zones: ['Seattle', 'Tacoma'],
  operating_counties: [],
  inserted_at: '',
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: dummyProfile,

      // Accepts a partial (e.g., form output merged with existing)
      setProfile: (incoming) =>
        set((s) => {
          if (!incoming?.id) return s; // require identity to avoid nuking seed accidentally
          const current = s.profile ?? ({} as Profile);
          const next = { ...current, ...normalizeProfile(incoming) } as Profile;
          return { profile: next };
        }),

      clearProfile: () => set({ profile: null }),

      restoreDemo: () => set({ profile: dummyProfile }),

      setOperatingCounties: (fipsList) =>
        set((s) => (s.profile ? { profile: { ...s.profile, operating_counties: [...new Set(fipsList)] } } : s)),

      toggleOperatingCounty: (fips) =>
        set((s) => {
          if (!s.profile) return s;
          const setHas = new Set(s.profile.operating_counties);
          setHas.has(fips) ? setHas.delete(fips) : setHas.add(fips);
          return { profile: { ...s.profile, operating_counties: Array.from(setHas) } };
        }),
    }),
    {
      name: 'profile-store',
      storage: createJSONStorage(() => localStorage),
      // Clean old persisted shapes on load (e.g., null coverage_zones)
      onRehydrateStorage: () => (state) => {
        const p = state?.profile;
        if (p) {
          state!.profile = { ...p, coverage_zones: toCoverageIds(p.coverage_zones) } as Profile;
        }
      },
    },
  ),
);
