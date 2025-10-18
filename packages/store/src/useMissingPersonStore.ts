import { persist } from "zustand/middleware";
import { createStore, type StateCreator } from "zustand/vanilla";
import { useStore } from "zustand";

import type { MissingPersonRecord } from "./types/missing-person";

const DEFAULT_STORAGE_KEY = "missing-person-records";

export interface MissingPersonStoreState {
  records: MissingPersonRecord[];
  addRecord: (record: MissingPersonRecord) => void;
  updateRecord: (caseId: string, patch: Partial<MissingPersonRecord>) => void;
  setAll: (records: MissingPersonRecord[]) => void;
  clear: () => void;
  removeRecord: (caseId: string) => void;
  hasRecord: (caseId: string) => boolean;
}

export interface CreateMissingPersonStoreOptions {
  initialRecords?: MissingPersonRecord[];
  persist?: boolean;
  storageKey?: string;
}

const createMissingPersonStoreInitializer = (
  initialRecords: MissingPersonRecord[]
): StateCreator<MissingPersonStoreState> =>
  (set, get) => ({
    records: initialRecords,
    addRecord: (record) =>
      set((state) => ({
        records: [record, ...state.records.filter((r) => r.caseId !== record.caseId)],
      })),
    updateRecord: (caseId, patch) =>
      set((state) => ({
        records: state.records.map((record) =>
          record.caseId === caseId ? { ...record, ...patch } : record
        ),
      })),
    removeRecord: (caseId) =>
      set((state) => ({
        records: state.records.filter((record) => record.caseId !== caseId),
      })),
    hasRecord: (caseId) =>
      !!get().records.find((record) => record.caseId === caseId),
    setAll: (records) => set({ records }),
    clear: () => set({ records: [] }),
  });

function withPersistence(
  initializer: StateCreator<MissingPersonStoreState>,
  storageKey: string
) {
  return persist(initializer, {
    name: storageKey,
    version: 1,
  });
}

export function createMissingPersonStore({
  initialRecords = [],
  persist: shouldPersist = true,
  storageKey = DEFAULT_STORAGE_KEY,
}: CreateMissingPersonStoreOptions = {}) {
  const initializer = createMissingPersonStoreInitializer(initialRecords);
  return shouldPersist
    ? createStore(withPersistence(initializer, storageKey))
    : createStore(initializer);
}

const store = createMissingPersonStore();

export const useMissingPersonStore = <T>(selector: (state: MissingPersonStoreState) => T) =>
  useStore(store, selector);
