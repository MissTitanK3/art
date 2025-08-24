'use client';

import { create } from 'zustand';
import { NormalizedCertification, Pod, RosterEntry, Shift } from './types/pod.ts';
import { FieldRole } from './types/roles.ts';
import { Profile } from './profileStore.ts';
import { NormalizedLanguage } from './types/language.ts';

// -----------------------------------------------------------------------------
// Store State
// -----------------------------------------------------------------------------
type PodState = {
  pods: Pod[];
  shifts: Shift[];

  activeProfiles: Profile[];

  addPod: (pod: Pod) => void;
  updatePod: (id: string, patch: Partial<Pod>) => void;
  removePod: (id: string) => void;

  addShift: (shift: Shift) => void;
  updateShift: (id: string, patch: Partial<Shift>) => void;
  removeShift: (id: string) => void;
  addCertification: (podId: string, rosterId: string, cert: NormalizedCertification) => void;
};

// -----------------------------------------------------------------------------
// Profile & Roster helpers
// -----------------------------------------------------------------------------
export const makeProfile = (id: string, display: string, role: FieldRole[], affiliation?: string): Profile => ({
  id,
  user_id: `user-${id}`,
  display_name: display,
  access_role: 'team_member',
  field_roles: role,
  verified_by: 'self',
  affiliation,
  availability: true,
  contact_signal: `${display.toLowerCase().replace(/\s+/g, '_')}@signal`,
  coordination_zone: 'zone-1',
  inserted_at: new Date().toISOString(),
  coverage_zones: ['06001'],
  state: 'active',
  self_risk_acknowledged: true,
  operating_counties: ['06001'],
});

export const makeRosterEntry = (
  id: string,
  profile: Profile,
  role: 'lead' | 'member' | 'trainee',
  status: 'active' | 'inactive' | 'suspended',
  langs: NormalizedLanguage[],
  skills: string[],
  fieldRoles: FieldRole[],
  certs: NormalizedCertification[] = [],
  lastShiftAt?: string,
  notes?: string,
): RosterEntry => ({
  id,
  volunteer: profile,
  role,
  status,
  langs,
  skills,
  fieldRoles,
  handle: profile.display_name.toLowerCase().replace(/\s+/g, '-'),
  joinedAt: new Date().toISOString(),
  certs,
  lastShiftAt,
  notes,
});

// -----------------------------------------------------------------------------
// Dummy Profiles
// -----------------------------------------------------------------------------
const p1 = makeProfile('p1', 'Alice Johnson', ['medic'], 'Community Org');
const p2 = makeProfile('p2', 'Brian Lee', ['translator'], 'Mutual Aid Collective');
const p3 = makeProfile('p3', 'Carla Reyes', ['legal'], 'Partner Org');
const p4 = makeProfile('p4', 'Diego Martinez', ['tech_support']);
const p5 = makeProfile('p5', 'Ella Chen', ['safety_marshall']);
export const activeProfiles = [p1, p2, p3, p4, p5];

// -----------------------------------------------------------------------------
// Roster Entries (with certs + lastShiftAt)
// -----------------------------------------------------------------------------
const r1 = makeRosterEntry(
  'r1',
  p1,
  'lead',
  'active',
  [{ tag: 'en', display_name: 'English', proficiency: 'native' }],
  ['first aid'],
  ['medic'],
  [
    { id: 'dispatch-level1', display_name: 'Dispatch Level 1', level: 'completed' },
    { id: 'medic-basic', display_name: 'Medic Basic', level: 'completed' },
  ],
  new Date().toISOString(),
);

const r2 = makeRosterEntry(
  'r2',
  p2,
  'member',
  'active',
  [{ tag: 'es', display_name: 'Spanish', proficiency: 'fluent' }],
  ['translation'],
  ['translator'],
  [{ id: 'dispatch-level1', display_name: 'Dispatch Level 1', level: 'completed' }],
);

const r3 = makeRosterEntry(
  'r3',
  p3,
  'member',
  'inactive',
  [{ tag: 'en', display_name: 'English' }],
  ['legal observer'],
  ['legal'],
  [
    { id: 'dispatch-level1', display_name: 'Dispatch Level 1', level: 'completed' },
    { id: 'legal-basic', display_name: 'Legal Basics', level: 'completed' },
  ],
  undefined,
  'Currently unavailable — last active 2 months ago.',
);

const r4 = makeRosterEntry(
  'r4',
  p4,
  'trainee',
  'active',
  [
    { tag: 'en', display_name: 'English' },
    { tag: 'pt', display_name: 'Portuguese', proficiency: 'conversational' },
  ],
  ['IT'],
  ['tech_support'],
  [],
);

const r5 = makeRosterEntry(
  'r5',
  p5,
  'member',
  'suspended',
  [{ tag: 'yue', display_name: 'Cantonese', proficiency: 'conversational' }],
  ['de-escalation'],
  ['safety_marshall'],
  [{ id: 'dispatch-level1', display_name: 'Dispatch Level 1', level: 'expired' }],
  undefined,
  'Suspended pending security review.',
);

// -----------------------------------------------------------------------------
// Seed Pods
// -----------------------------------------------------------------------------
export const seedPods: Pod[] = [
  {
    id: 'c3f7b0dc-6c2a-4a9f-82c5-001',
    slug: 'pod-downtown',
    name: 'Downtown',
    area: 'Core & East Bay',
    channels: [
      {
        type: 'Signal',
        link: 'https://signal.group/#CjQKICdowntown_public_recruiting_placeholder',
      },
    ],
    team: [r1, r2],
  },
  {
    id: '7d1d1c9f-3a22-47e2-9b0f-002',
    slug: 'pod-westside',
    name: 'Westside',
    area: 'West District',
    channels: [
      {
        type: 'Matrix',
        link: 'https://matrix.to/#/#westside-public:example.org',
      },
    ],
    team: [r3, r4],
  },
  {
    id: 'a2b94fbe-91b1-4b6a-9923-003',
    slug: 'pod-hilltop',
    name: 'Hilltop',
    area: 'North Ridge',
    channels: [{ type: 'LoRa' }],
    team: [r5],
  },
];

// -----------------------------------------------------------------------------
// Zustand Store
// -----------------------------------------------------------------------------
export const usePodsStore = create<PodState>((set) => ({
  pods: seedPods,
  shifts: [],
  activeProfiles,

  addPod: (pod) => set((s) => ({ pods: [...s.pods, pod] })),
  updatePod: (id, patch) =>
    set((s) => ({
      pods: s.pods.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
  removePod: (id) => set((s) => ({ pods: s.pods.filter((p) => p.id !== id) })),

  addShift: (shift) => set((s) => ({ shifts: [...s.shifts, shift] })),
  updateShift: (id, patch) =>
    set((s) => ({
      shifts: s.shifts.map((sh) => (sh.id === id ? { ...sh, ...patch } : sh)),
    })),
  removeShift: (id) => set((s) => ({ shifts: s.shifts.filter((sh) => sh.id !== id) })),

  addCertification: (podId, rosterId, cert) =>
    set((s) => ({
      pods: s.pods.map((pod) =>
        pod.id === podId
          ? {
              ...pod,
              team: pod.team.map((entry) =>
                entry.id === rosterId
                  ? {
                      ...entry,
                      certs: [...entry.certs, cert],
                    }
                  : entry,
              ),
            }
          : pod,
      ),
    })),
}));
