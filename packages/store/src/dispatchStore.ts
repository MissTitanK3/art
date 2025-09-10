// apps/region-template/store/dispatchStore.ts
'use client';

import { create } from 'zustand';
import { RosterEntry } from './types/pod.ts';

// -----------------------------------------------------------------------------
// Types (aligned with schema)
// -----------------------------------------------------------------------------
export type DispatchStatus =
  | 'preplanning'
  | 'unconfirmed'
  | 'confirmed'
  | 'mobilizing'
  | 'in_progress'
  | 'debriefing'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'archived';

export interface DispatchSubmission {
  id: string;
  location?: { lat: number; lng: number; [key: string]: any };
  timestamp: string;
  required_roles?: string[];
  encrypted_payload?: string;
  auto_delete_after?: string | null;
  integrity_hash?: string;
  submitted_by?: string | null;
  source?: 'dispatch' | 'manual' | 'system';
  visibility_radius_km?: number;
  status: DispatchStatus;
  assigned_volunteers?: Partial<RosterEntry>[];
  required_roles_by_type?: Record<string, number>;
  location_label?: string;
  point_of_contact?: string | null;
  state?: string;
  intended_action_preset?: string;
  intended_action_notes?: string;
  intended_actions?: string[];
  intended_actions_custom?: string;
  signal_link?: string;
  training?: boolean;
}

// -----------------------------------------------------------------------------
// Factory helper (still useful for new items)
// -----------------------------------------------------------------------------
export function makeDispatchSubmission(overrides: Partial<DispatchSubmission> = {}): DispatchSubmission {
  return {
    id: crypto.randomUUID(), // or fakeUUID if you prefer
    timestamp: new Date().toISOString(),
    source: 'dispatch',
    visibility_radius_km: 10,
    status: 'unconfirmed',
    training: false,
    ...overrides,
  };
}

// -----------------------------------------------------------------------------
// Dummy seed data (with stable hardcoded UUIDs)
// -----------------------------------------------------------------------------
export const seedDispatches: DispatchSubmission[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    timestamp: new Date().toISOString(),
    source: 'dispatch',
    status: 'unconfirmed',
    visibility_radius_km: 10,
    training: false,
    location: { lat: 37.7749, lng: -122.4194 },
    required_roles: ['medic', 'translator'],
    required_roles_by_type: {
      legal: 2,
      logistics: 2,
      translator: 1,
      deescalation: 2,
      dispatch_aide: 1,
      media_observer: 2,
      asl_interpreter: 1,
      rights_observer: 2,
      safety_marshall: 2,
    },
    location_label: 'Mission District, SF',
    state: 'CA',
    intended_action_preset: 'mutual_aid',
    intended_action_notes: 'Provide medical support at rally point.',
    intended_actions: [
      'Rights observation and legal witnessing',
      'Media or livestream monitoring and amplification',
      'Support community visibility and morale',
      'On-site emotional or mental health support',
      'Coordinate check-ins and mutual aid relay',
    ],
    signal_link: 'https://signal.group/#public_example_dispatch',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    timestamp: new Date().toISOString(),
    source: 'manual',
    status: 'mobilizing',
    visibility_radius_km: 10,
    training: true,
    location: { lat: 34.0522, lng: -118.2437 },
    required_roles: ['legal'],
    required_roles_by_type: { legal: 1 },
    location_label: 'Downtown LA',
    state: 'CA',
    intended_action_preset: 'legal_observer',
    intended_action_notes: 'Legal team to observe police interactions.',
    intended_actions: ['Witnessing / observation only'],
    signal_link: 'https://signal.group/#legal_support_example',
  },
];

// -----------------------------------------------------------------------------
// Store State
// -----------------------------------------------------------------------------
type DispatchState = {
  submissions: DispatchSubmission[];
  addSubmission: (d: DispatchSubmission) => void;
  updateSubmission: (id: string, patch: Partial<DispatchSubmission>) => void;
  removeSubmission: (id: string) => void;
};

export const useDispatchStore = create<DispatchState>((set) => ({
  submissions: seedDispatches,

  addSubmission: (d) => set((s) => ({ submissions: [...s.submissions, d] })),

  updateSubmission: (id, patch) =>
    set((s) => ({
      submissions: s.submissions.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)),
    })),

  removeSubmission: (id) =>
    set((s) => ({
      submissions: s.submissions.filter((sub) => sub.id !== id),
    })),
}));
