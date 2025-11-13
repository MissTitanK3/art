import { useStore } from "zustand";
import { createStore, StateCreator, StoreApi } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import {
  cleanupLegacyStorageKeys,
  legacyStorageKeyCandidates,
  resolveScopedStorageKey,
} from "./utils/storage";

const NOTIFICATIONS_BASE_STORAGE_KEY = "notifications-store-v1";

export type NotificationLevel = "info" | "success" | "warning" | "error";

export type AppNotification = {
  id: string;
  title: string;
  body?: string;
  level: NotificationLevel;
  channel?: import("./types/notifications").NotificationChannel; // centralized channel type
  link?: string;
  icon?: string;
  createdAt: string; // ISO string
  readAt?: string | null;
  sticky?: boolean;
  ttlMs?: number;
  meta?: Record<string, unknown>;
};

export type NotificationsStoreState = {
  items: AppNotification[];
  mutedChannels: Record<string, boolean>;
  add: (
    n: Omit<AppNotification, "id" | "createdAt" | "readAt"> & { id?: string },
  ) => string;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
  toggleMute: (channel: string) => void;
  sweep: () => void; // drop expired non-sticky notes
};

export interface CreateNotificationsStoreOptions {
  initialItems?: AppNotification[];
  initialMuted?: Record<string, boolean>;
  persist?: boolean;
  storageKey?: string;
}

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as any).randomUUID()
    : Math.random().toString(36).slice(2);

const createNotificationsInitializer =
  (
    initialItems: AppNotification[],
    initialMuted: Record<string, boolean>,
  ): StateCreator<NotificationsStoreState> =>
  (set, get) => ({
    items: initialItems,
    mutedChannels: initialMuted,
    add: (n) => {
      const id = n.id ?? genId();
      const now = new Date().toISOString();
      const chan = n.channel ?? "system";
      if (get().mutedChannels[chan]) return id;
      set((s) => ({
        items: [{ ...n, id, createdAt: now, readAt: null }, ...s.items],
      }));
      return id;
    },
    markRead: (id) =>
      set((s) => ({
        items: s.items.map((i) =>
          i.id === id
            ? { ...i, readAt: i.readAt ?? new Date().toISOString() }
            : i,
        ),
      })),
    markAllRead: () =>
      set((s) => ({
        items: s.items.map((i) =>
          i.readAt ? i : { ...i, readAt: new Date().toISOString() },
        ),
      })),
    remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    clear: () => set({ items: [] }),
    toggleMute: (channel) =>
      set((s) => ({
        mutedChannels: {
          ...s.mutedChannels,
          [channel]: !s.mutedChannels[channel],
        },
      })),
    sweep: () =>
      set((s) => {
        const now = Date.now();
        return {
          items: s.items.filter((i) => {
            if (i.sticky) return true;
            if (!i.ttlMs) return true;
            const age = now - new Date(i.createdAt).getTime();
            return age < i.ttlMs;
          }),
        };
      }),
  });

function withPersistence(
  initializer: StateCreator<NotificationsStoreState>,
  storageKey: string,
) {
  return persist(initializer, {
    name: storageKey,
    version: 1,
    migrate: (persistedState: any) => persistedState as NotificationsStoreState,
    partialize: (state) => ({
      items: state.items,
      mutedChannels: state.mutedChannels,
    }),
  });
}

export type NotificationsStore = StoreApi<NotificationsStoreState>;

export function createNotificationsStore(
  options?: CreateNotificationsStoreOptions,
): NotificationsStore {
  const {
    initialItems = [],
    initialMuted = {},
    persist: enablePersist = true,
    storageKey,
  } = options ?? {};
  const initializer = createNotificationsInitializer(
    initialItems,
    initialMuted,
  );
  const resolvedStorageKey = resolveScopedStorageKey(
    NOTIFICATIONS_BASE_STORAGE_KEY,
    storageKey,
  );
  cleanupLegacyStorageKeys(
    resolvedStorageKey,
    legacyStorageKeyCandidates(NOTIFICATIONS_BASE_STORAGE_KEY, storageKey),
  );
  const creator = enablePersist
    ? withPersistence(initializer, resolvedStorageKey)
    : initializer;
  return createStore<NotificationsStoreState>(creator as any);
}

// Allow apps to override the persisted storage key (or provide a prebuilt store) via a global
// This helps isolate notifications per region/app when multiple Next.js apps share the same origin.
// If a global store instance is provided, prefer it; else, use a storageKey override when available.
const GLOBAL_STORE: NotificationsStore | undefined =
  (typeof globalThis !== "undefined" &&
    (globalThis as any).__ART_NOTIFICATIONS_STORE) ||
  undefined;

const GLOBAL_STORAGE_KEY: string | undefined =
  (typeof globalThis !== "undefined" &&
    (globalThis as any).__ART_NOTIFICATIONS_STORAGE_KEY) ||
  undefined;

const singletonNotificationsStore =
  GLOBAL_STORE ??
  createNotificationsStore({
    storageKey: GLOBAL_STORAGE_KEY ?? NOTIFICATIONS_BASE_STORAGE_KEY,
  });
export const notificationsStore = singletonNotificationsStore;

export function useNotificationsStore<T>(
  selector: (state: NotificationsStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) {
  return useStore(singletonNotificationsStore, selector, equalityFn);
}
