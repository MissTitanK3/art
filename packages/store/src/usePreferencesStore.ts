import { useStore } from "zustand";
import { createStore, StateCreator, StoreApi } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import {
  cleanupLegacyStorageKeys,
  legacyStorageKeyCandidates,
  resolveScopedStorageKey,
} from "./utils/storage";

const PREFERENCES_BASE_STORAGE_KEY = "preferences-store-v1";

export type DistanceUnit = "mi" | "km";

export type PreferencesStoreState = {
  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
  toggleDistanceUnit: () => void; // cycles mi -> km -> mi
};

export interface CreatePreferencesStoreOptions {
  initialUnit?: DistanceUnit;
  persist?: boolean;
  storageKey?: string;
}

const createPreferencesInitializer =
  (initialUnit: DistanceUnit): StateCreator<PreferencesStoreState> =>
  (set, get) => ({
    distanceUnit: initialUnit,
    setDistanceUnit: (unit) => set({ distanceUnit: unit }),
    toggleDistanceUnit: () =>
      set({ distanceUnit: get().distanceUnit === "mi" ? "km" : "mi" }),
  });

function withPersistence(
  initializer: StateCreator<PreferencesStoreState>,
  storageKey: string,
) {
  return persist(initializer, {
    name: storageKey,
    version: 1,
    migrate: (persisted: any) => persisted as PreferencesStoreState,
    partialize: (state) => ({ distanceUnit: state.distanceUnit }),
  });
}

export type PreferencesStore = StoreApi<PreferencesStoreState>;

export function createPreferencesStore(
  options?: CreatePreferencesStoreOptions,
): PreferencesStore {
  const {
    initialUnit = "mi",
    persist: enablePersist = true,
    storageKey,
  } = options ?? {};

  const initializer = createPreferencesInitializer(initialUnit);
  const resolvedStorageKey = resolveScopedStorageKey(
    PREFERENCES_BASE_STORAGE_KEY,
    storageKey,
  );
  cleanupLegacyStorageKeys(
    resolvedStorageKey,
    legacyStorageKeyCandidates(PREFERENCES_BASE_STORAGE_KEY, storageKey),
  );
  const creator = enablePersist
    ? withPersistence(initializer, resolvedStorageKey)
    : initializer;
  return createStore<PreferencesStoreState>(creator as any);
}

// Allow apps to override the persisted storage key or provide a global instance
const GLOBAL_STORE: PreferencesStore | undefined =
  (typeof globalThis !== "undefined" &&
    (globalThis as any).__ART_PREFERENCES_STORE) ||
  undefined;

const GLOBAL_STORAGE_KEY: string | undefined =
  (typeof globalThis !== "undefined" &&
    (globalThis as any).__ART_PREFERENCES_STORAGE_KEY) ||
  undefined;

const singletonPreferencesStore =
  GLOBAL_STORE ??
  createPreferencesStore({
    storageKey: GLOBAL_STORAGE_KEY ?? PREFERENCES_BASE_STORAGE_KEY,
  });

export const preferencesStore = singletonPreferencesStore;

export function usePreferencesStore<T>(
  selector: (state: PreferencesStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) {
  return useStore(singletonPreferencesStore, selector, equalityFn);
}
