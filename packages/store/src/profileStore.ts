'use client';

import { AccessRole, FieldRole, VerifiedBy } from './../../ui/src/lib/constants/roles.js';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/** 5-digit county FIPS */
const FIPS_RE = /^\d{5}$/;
/** Signal username: starts with @, then letters/digits/._- (min 2 total after @); allows dots digits like @name.01 */
const SIGNAL_RE = /^@[A-Za-z0-9._-]{2,}$/;

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

type ProfileState = {
  profile: Profile | null;
  setProfile: (profile: Partial<Profile> & { id: string }) => void;
  clearProfile: () => void;

  setOperatingCounties: (fipsList: string[]) => void;
  toggleOperatingCounty: (fips: string) => void;

  restoreDemo: () => void;
};

// ---------- helpers ----------
function toCoverageIds(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return Array.from(
      new Set(
        input
          .map((z) => (typeof z === 'string' ? z : (z as any)?.id))
          .filter((v): v is string => typeof v === 'string' && v.trim().length > 0),
      ),
    );
  }
  return [];
}

function normalizeFipsList(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  const out = new Set<string>();
  for (const v of list) {
    const s = String(v ?? '').trim();
    if (FIPS_RE.test(s)) out.add(s);
  }
  return Array.from(out);
}

function normalizeSignal(handle?: string): string | undefined {
  if (!handle) return undefined;
  const trimmed = handle.trim();
  if (SIGNAL_RE.test(trimmed)) return trimmed;
  // If not valid, drop it rather than persisting a bad value.
  return undefined;
}

function normalizeProfile(p: Partial<Profile>): Partial<Profile> {
  const next: Partial<Profile> = { ...p };
  // enforce invariants/coercions
  next.coverage_zones = toCoverageIds(p.coverage_zones);
  if (p.operating_counties) next.operating_counties = normalizeFipsList(p.operating_counties);
  if (p.contact_signal !== undefined) next.contact_signal = normalizeSignal(p.contact_signal);
  return next;
}

// ---------- seed ----------
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
  coordination_zone: 'PNW-Region-1',
  city: 'Seattle',
  weekly_availability: { blocks: {} },
  coverage_zones: ['Seattle', 'Tacoma'],
  operating_counties: [],
  inserted_at: '',
};

// ---------- persisted store with versioned migrations ----------
type PersistShape = ProfileState & { _v?: number };
const STORE_VERSION = 2;

export const useProfileStore = create<ProfileState>()(
  persist<ProfileState>(
    (set, get) => ({
      profile: dummyProfile,

      setProfile: (incoming) =>
        set((s) => {
          if (!incoming?.id) return s; // require identity to avoid nuking seed accidentally
          const current = s.profile ?? ({} as Profile);
          const next = { ...current, ...normalizeProfile(incoming) } as Profile;
          // Ensure invariants after merge:
          next.coverage_zones = toCoverageIds(next.coverage_zones);
          next.operating_counties = normalizeFipsList(next.operating_counties);
          next.contact_signal = normalizeSignal(next.contact_signal);
          return { profile: next };
        }),

      clearProfile: () => set({ profile: null }),

      restoreDemo: () => set({ profile: { ...dummyProfile } }), // clone to avoid shared reference

      setOperatingCounties: (fipsList) =>
        set((s) => {
          if (!s.profile) return s;
          return {
            profile: {
              ...s.profile,
              operating_counties: normalizeFipsList(fipsList),
            },
          };
        }),

      toggleOperatingCounty: (fips?: string) =>
        set((s) => {
          if (!s.profile || !fips) return s;
          const norm = normalizeFipsList([fips]);
          const [code] = norm;
          if (!code) return s;
          const setHas = new Set(s.profile.operating_counties);
          setHas.has(code) ? setHas.delete(code) : setHas.add(code);
          return { profile: { ...s.profile, operating_counties: Array.from(setHas) } };
        }),
    }),
    {
      name: 'profile-store',
      storage: createJSONStorage(() => localStorage),
      version: STORE_VERSION,
      migrate: (state: any, fromVersion?: number) => {
        const s = state as PersistShape | undefined;
        if (!s) return s;

        // v1 → v2: enforce invariants, remove SMS if you’ve deprecated it
        if (!fromVersion || fromVersion < 2) {
          const p = s.profile;
          if (p) {
            p.coverage_zones = toCoverageIds(p.coverage_zones);
            p.operating_counties = normalizeFipsList(p.operating_counties);
            p.contact_signal = normalizeSignal(p.contact_signal);
            // If SMS is disallowed, drop it; otherwise leave as-is.
            // delete (p as any).contact_sms;
          }
        }
        return s as any;
      },
      // Prefer versioned migrations over mutating state post-load.
      // Leaving onRehydrateStorage empty to avoid double-writes.
    },
  ),
);
