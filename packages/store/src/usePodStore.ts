import { persist } from 'zustand/middleware';
import { useStore } from 'zustand';
import { createStore, StateCreator, StoreApi } from 'zustand/vanilla';
import { NormalizedCertification, Pod, RosterEntry, Shift } from './types/pod.ts';
import { makeProfile, makeRosterEntry } from './utils/generator.ts';

// -----------------------------------------------------------------------------
// Store State
// -----------------------------------------------------------------------------
export type PodStoreState = {
  pods: Pod[];
  shifts: Shift[];

  activeRoster: RosterEntry[];

  addPod: (pod: Pod) => void;
  updatePod: (id: string, patch: Partial<Pod>) => void;
  removePod: (id: string) => void;

  addShift: (shift: Shift) => void;
  updateShift: (id: string, patch: Partial<Shift>) => void;
  removeShift: (id: string) => void;
  addCertification: (podId: string, rosterId: string, cert: NormalizedCertification) => void;
};

export interface CreatePodStoreOptions {
  initialPods?: Pod[];
  initialShifts?: Shift[];
  initialRoster?: RosterEntry[];
  persist?: boolean;
  storageKey?: string;
}

type PodStoreInitializerInput = {
  pods: Pod[];
  shifts: Shift[];
  activeRoster: RosterEntry[];
};

// -----------------------------------------------------------------------------
// Profile & Roster helpers
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Dummy Roster
// -----------------------------------------------------------------------------
const p1 = makeProfile('p1', 'Alice Johnson', ['medic'], 'Community Org');
const p2 = makeProfile('p2', 'Brian Lee', ['translator'], 'Mutual Aid Collective');
const p3 = makeProfile('p3', 'Carla Reyes', ['legal'], 'Partner Org');
const p4 = makeProfile('p4', 'Diego Martinez', ['tech_support']);
const p5 = makeProfile('p5', 'Ella Chen', ['safety_marshall']);

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

export const seedRoster: RosterEntry[] = [r1, r2, r3, r4, r5];

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
        link: 'https://signal.group/#CjQKIADTv-8bQiCFQ9uNpqdZVe8ngPlj8O4XSd1hnMBhdg-lEhAKlOr9EvjsnlQh9RXActF-',
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
        link: 'https://signal.group/#CjQKIADTv-8bQiCFQ9uNpqdZVe8ngPlj8O4XSd1hnMBhdg-lEhAKlOr9EvjsnlQh9RXActF-',
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

const createPodStoreInitializer =
  (initial: PodStoreInitializerInput): StateCreator<PodStoreState> =>
  (set) => ({
    pods: [...initial.pods],
    shifts: [...initial.shifts],
    activeRoster: [...initial.activeRoster],

    addPod: (pod) => set((s) => ({ pods: [...s.pods, pod] })),

    updatePod: (id, patch) =>
      set((s) => ({
        pods: s.pods.map((pod) => (pod.id === id ? { ...pod, ...patch } : pod)),
      })),

    removePod: (id) => set((s) => ({ pods: s.pods.filter((pod) => pod.id !== id) })),

    addShift: (shift) => set((s) => ({ shifts: [...s.shifts, shift] })),

    updateShift: (id, patch) =>
      set((s) => ({
        shifts: s.shifts.map((shift) => (shift.id === id ? { ...shift, ...patch } : shift)),
      })),

    removeShift: (id) => set((s) => ({ shifts: s.shifts.filter((shift) => shift.id !== id) })),

    addCertification: (podId, rosterId, cert) =>
      set((s) => ({
        pods: s.pods.map((pod) =>
          pod.id === podId
            ? {
                ...pod,
                team: pod.team.map((entry) =>
                  entry.id === rosterId ? { ...entry, certs: [...(entry.certs ?? []), cert] } : entry,
                ),
              }
            : pod,
        ),
      })),
  });

function withPersistence(initializer: StateCreator<PodStoreState>, storageKey: string) {
  return persist(initializer, {
    name: storageKey,
    version: 1,
    migrate: (persistedState: any) => persistedState as PodStoreState,
    partialize: (state) =>
      ({
        pods: state.pods,
        shifts: state.shifts,
        activeRoster: state.activeRoster,
      }) as unknown as PodStoreState,
  });
}

export type PodStore = StoreApi<PodStoreState>;

export function createPodStore(options?: CreatePodStoreOptions): PodStore {
  const {
    initialPods = seedPods,
    initialShifts = [],
    initialRoster = seedRoster,
    persist: enablePersist = false,
    storageKey = 'pod-store',
  } = options ?? {};

  const initializer = createPodStoreInitializer({
    pods: initialPods,
    shifts: initialShifts,
    activeRoster: initialRoster,
  });

  const creator = enablePersist ? withPersistence(initializer, storageKey) : initializer;
  return createStore<PodStoreState>(creator as any);
}

const singletonPodStore = createPodStore();
export function usePodStore<T>(selector: (state: PodStoreState) => T, equalityFn?: (a: T, b: T) => boolean) {
  return useStore(singletonPodStore, selector, equalityFn);
}

// -----------------------------------------------------------------------------
// Legacy export (temporary) - kept for compatibility while migrating naming
// -----------------------------------------------------------------------------
export const usePodsStore = usePodStore;
