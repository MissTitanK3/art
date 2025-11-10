import { persist } from 'zustand/middleware';
import { useStore } from 'zustand';
import { createStore, StateCreator, StoreApi } from 'zustand/vanilla';
import { NormalizedCertification, Pod, RosterEntry, Shift } from './types/pod.ts';

// -----------------------------------------------------------------------------
// Store State
// -----------------------------------------------------------------------------
export type AcademyClassStatus = 'draft' | 'needs_instructor' | 'scheduled' | 'completed';

export type EngagementLevel = 'low' | 'medium' | 'high';
export type UnderstandingLevel = 'needs_support' | 'building' | 'confident';

export type AcademyClassMember = {
  id: string;
  name: string;
  notes?: string;
  participationCount: number;
  lastEngagement?: EngagementLevel;
  lastUnderstanding?: UnderstandingLevel;
};

export type AcademyClass = {
  id: string;
  pathwayId: string;
  pathwayLabel: string;
  trackLabel?: string;
  variant?: string;
  title: string;
  description: string;
  modality: 'in_person' | 'online' | 'hybrid';
  instructorType: 'dispatcher' | 'mentor' | 'expert';
  durationHours: number;
  capacity?: number;
  startDate?: string;
  startTime?: string;
  location?: string;
  meetingUrl?: string;
  notes?: string;
  instructorName?: string;
  members: AcademyClassMember[];
  sessions: AcademyClassSession[];
  sessionsScheduled: number;
  nextSession?: string;
  status: AcademyClassStatus;
  createdAt: string;
  updatedAt: string;
};

export type AcademyClassSessionParticipant = {
  memberId: string;
  present: boolean;
  engagement: EngagementLevel;
  understanding: UnderstandingLevel;
  notes?: string;
};

export type AcademyClassSession = {
  id: string;
  label: string;
  date?: string;
  durationHours?: number;
  notes?: string;
  participants: AcademyClassSessionParticipant[];
};

export type PodStoreState = {
  pods: Pod[];
  shifts: Shift[];

  activeRoster: RosterEntry[];
  academyClasses: AcademyClass[];

  addPod: (pod: Pod) => void;
  setPods: (pods: Pod[]) => void;
  updatePod: (id: string, patch: Partial<Pod>) => void;
  removePod: (id: string) => void;

  addShift: (shift: Shift) => void;
  updateShift: (id: string, patch: Partial<Shift>) => void;
  removeShift: (id: string) => void;
  addCertification: (podId: string, rosterId: string, cert: NormalizedCertification) => void;
  setActiveRoster: (entries: RosterEntry[]) => void;
  upsertActiveRosterEntry: (entry: RosterEntry) => void;
  removeActiveRosterEntry: (id: string) => void;

  addAcademyClass: (academyClass: AcademyClass) => void;
  updateAcademyClass: (id: string, patch: Partial<AcademyClass>) => void;
  removeAcademyClass: (id: string) => void;
};

export interface CreatePodStoreOptions {
  initialPods?: Pod[];
  initialShifts?: Shift[];
  initialRoster?: RosterEntry[];
  initialAcademyClasses?: AcademyClass[];
  persist?: boolean;
  storageKey?: string;
}

type PodStoreInitializerInput = {
  pods: Pod[];
  shifts: Shift[];
  activeRoster: RosterEntry[];
  academyClasses: AcademyClass[];
};

const createPodStoreInitializer =
  (initial: PodStoreInitializerInput): StateCreator<PodStoreState> =>
  (set) => ({
    pods: [...initial.pods],
    shifts: [...initial.shifts],
    activeRoster: [...initial.activeRoster],
    academyClasses: [...initial.academyClasses],

    addPod: (pod) => set((s) => ({ pods: [...s.pods, pod] })),

    setPods: (pods) => set(() => ({ pods: [...pods] })),

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

    setActiveRoster: (entries) => set({ activeRoster: [...entries] }),

    upsertActiveRosterEntry: (entry) =>
      set((s) => {
        const idx = s.activeRoster.findIndex((existing) => existing.id === entry.id);
        if (idx >= 0) {
          const next = [...s.activeRoster];
          next[idx] = entry;
          return { activeRoster: next };
        }
        return { activeRoster: [...s.activeRoster, entry] };
      }),

    removeActiveRosterEntry: (id) =>
      set((s) => ({
        activeRoster: s.activeRoster.filter((entry) => entry.id !== id),
      })),

    addAcademyClass: (academyClass) =>
      set((s) => ({
        academyClasses: [...s.academyClasses, academyClass],
      })),

    updateAcademyClass: (id, patch) => {
      const timestamp = new Date().toISOString();
      return set((s) => {
        const next = s.academyClasses.map((entry) => {
          if (entry.id !== id) return entry;

          const merged = {
            ...entry,
            ...patch,
            updatedAt: patch.updatedAt ?? timestamp,
          } as typeof entry;

          // Shallow-compare merged vs existing entry. If nothing changed, return original
          const keys = new Set([...Object.keys(entry), ...Object.keys(merged)]);
          const changedKeys: string[] = [];
          for (const k of keys) {
            // @ts-ignore - dynamic key access
            if (entry[k] !== (merged as any)[k]) {
              changedKeys.push(k);
            }
          }
          if (changedKeys.length === 0) {
            // No-op: avoid unnecessary state update
            return entry;
          }

          return merged;
        });
        return { academyClasses: next } as Partial<PodStoreState> as any;
      });
    },

    removeAcademyClass: (id) =>
      set((s) => ({
        academyClasses: s.academyClasses.filter((entry) => entry.id !== id),
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
        academyClasses: state.academyClasses,
      }) as unknown as PodStoreState,
  });
}

export type PodStore = StoreApi<PodStoreState>;

export function createPodStore(options?: CreatePodStoreOptions): PodStore {
  const {
    initialPods = [],
    initialShifts = [],
    initialRoster = [],
    initialAcademyClasses = [],
    persist: enablePersist = false,
    storageKey = 'pod-store',
  } = options ?? {};

  const initializer = createPodStoreInitializer({
    pods: initialPods,
    shifts: initialShifts,
    activeRoster: initialRoster,
    academyClasses: initialAcademyClasses,
  });

  const creator = enablePersist ? withPersistence(initializer, storageKey) : initializer;
  return createStore<PodStoreState>(creator as any);
}

const singletonPodStore = createPodStore();
export function usePodStore<T>(selector: (state: PodStoreState) => T, equalityFn?: (a: T, b: T) => boolean) {
  return useStore(singletonPodStore, selector, equalityFn);
}
