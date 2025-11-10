import { persist } from "zustand/middleware";
import { useStore } from "zustand";
import { createStore, StateCreator, StoreApi } from "zustand/vanilla";
import { DispatchUpdate } from "./types/dispatch.ts";
import { DispatchSubmission } from "./types/global.ts";
import { fakeUUID } from "@workspace/ui/lib/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export interface DispatchShift {
  id: string;
  podId?: string;
  volunteerId?: string;
  volunteerName?: string;
  startsAt: string; // ISO string
  endsAt: string; // ISO string
  notes?: string;
}

// -----------------------------------------------------------------------------
// Store State
// -----------------------------------------------------------------------------
export type DispatchStoreState = {
  submissions: DispatchSubmission[];
  shifts: DispatchShift[];
  addSubmission: (d: DispatchSubmission) => void;
  replaceSubmissions: (subs: DispatchSubmission[]) => void;
  updateSubmission: (id: string, patch: Partial<DispatchSubmission>) => void;
  removeSubmission: (id: string) => void;
  addUpdate: (
    dispatchId: string,
    update: Omit<DispatchUpdate, "id" | "createdAt">,
  ) => void;
  editUpdate: (dispatchId: string, updateId: string, text: string) => void;
  removeUpdate: (dispatchId: string, updateId: string) => void;
  addShift: (shift: Omit<DispatchShift, "id">) => void;
  replaceShifts: (shifts: DispatchShift[]) => void;
  updateShift: (id: string, updates: Partial<DispatchShift>) => void;
  removeShift: (id: string) => void;
  getActiveShifts: () => DispatchShift[];
  getUpcomingShifts: (hoursAhead?: number) => DispatchShift[];
  getShiftsByVolunteer: (volunteerId: string) => DispatchShift[];
  isShiftActive: (shift: DispatchShift) => boolean;
};

export interface CreateDispatchStoreOptions {
  initialSubmissions?: DispatchSubmission[];
  initialShifts?: DispatchShift[];
  persist?: boolean;
  storageKey?: string;
}

const createDispatchStoreInitializer =
  (
    initialSubmissions: DispatchSubmission[],
    initialShifts: DispatchShift[],
  ): StateCreator<DispatchStoreState> =>
  (set, get) => ({
    submissions: initialSubmissions,
    shifts: initialShifts,

    addSubmission: (d) => set((s) => ({ submissions: [...s.submissions, d] })),

    replaceSubmissions: (subs) => set(() => ({ submissions: subs })),

    updateSubmission: (id, patch) =>
      set((s) => ({
        submissions: s.submissions.map((sub) =>
          sub.id === id ? { ...sub, ...patch } : sub,
        ),
      })),

    removeSubmission: (id) =>
      set((s) => ({
        submissions: s.submissions.filter((sub) => sub.id !== id),
      })),

    addUpdate: (dispatchId, update) =>
      set((s) => ({
        submissions: s.submissions.map((sub) =>
          sub.id === dispatchId
            ? {
                ...sub,
                updates: [
                  ...(sub.updates ?? []),
                  {
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    attachments: update.attachments ?? [],
                    ...update,
                  },
                ],
              }
            : sub,
        ),
      })),

    editUpdate: (dispatchId, updateId, text) =>
      set((s) => ({
        submissions: s.submissions.map((sub) =>
          sub.id === dispatchId
            ? {
                ...sub,
                updates: sub.updates?.map((u) =>
                  u.id === updateId ? { ...u, text } : u,
                ),
              }
            : sub,
        ),
      })),

    removeUpdate: (dispatchId, updateId) =>
      set((s) => ({
        submissions: s.submissions.map((sub) =>
          sub.id === dispatchId
            ? {
                ...sub,
                updates: sub.updates?.filter((u) => u.id !== updateId),
              }
            : sub,
        ),
      })),

    addShift: (shift) =>
      set((state) => ({
        shifts: [
          ...state.shifts,
          {
            ...shift,
            id: fakeUUID(),
          },
        ],
      })),

    replaceShifts: (shifts) => set(() => ({ shifts })),

    updateShift: (id, updates) =>
      set((state) => ({
        shifts: state.shifts.map((s) =>
          s.id === id ? { ...s, ...updates } : s,
        ),
      })),

    removeShift: (id) =>
      set((state) => ({
        shifts: state.shifts.filter((s) => s.id !== id),
      })),

    isShiftActive: (shift) => {
      const current = new Date();
      return (
        new Date(shift.startsAt) <= current && new Date(shift.endsAt) >= current
      );
    },

    getActiveShifts: () => {
      const current = new Date();
      return get().shifts.filter(
        (s) => new Date(s.startsAt) <= current && new Date(s.endsAt) >= current,
      );
    },

    getUpcomingShifts: (hoursAhead = 24) => {
      const current = new Date();
      const cutoff = new Date(current.getTime() + hoursAhead * 60 * 60 * 1000);
      return get()
        .shifts.filter(
          (s) =>
            new Date(s.startsAt) > current && new Date(s.startsAt) <= cutoff,
        )
        .sort(
          (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
        );
    },

    getShiftsByVolunteer: (volunteerId) =>
      get()
        .shifts.filter((s) => s.volunteerId === volunteerId)
        .sort(
          (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
        ),
  });

function withPersistence(
  initializer: StateCreator<DispatchStoreState>,
  storageKey: string,
) {
  return persist(initializer, {
    name: storageKey,
    version: 1,
    migrate: (persistedState: any) => persistedState as DispatchStoreState,
    partialize: (state) =>
      ({
        submissions: state.submissions,
        shifts: state.shifts,
      }) as unknown as DispatchStoreState,
  });
}

export type DispatchStore = StoreApi<DispatchStoreState>;

export function createDispatchStore(
  options?: CreateDispatchStoreOptions,
): DispatchStore {
  const {
    initialSubmissions,
    initialShifts,
    persist: enablePersist = true,
    storageKey = "dispatch-store",
  } = options ?? {};

  const initializer = createDispatchStoreInitializer(
    initialSubmissions ?? [],
    initialShifts ?? [],
  );
  const creator = enablePersist
    ? withPersistence(initializer, storageKey)
    : initializer;
  return createStore<DispatchStoreState>(creator as any);
}

const singletonDispatchStore = createDispatchStore();
export const dispatchStore = singletonDispatchStore;

export function useDispatchStore<T>(
  selector: (state: DispatchStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) {
  return useStore(singletonDispatchStore, selector, equalityFn);
}
