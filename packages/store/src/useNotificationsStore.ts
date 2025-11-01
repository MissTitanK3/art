import { useStore } from 'zustand';
import { createStore, StateCreator, StoreApi } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export type AppNotification = {
  id: string;
  title: string;
  body?: string;
  level: NotificationLevel;
  channel?: string; // e.g., 'dispatch' | 'academy' | 'system'
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
    n: Omit<AppNotification, 'id' | 'createdAt' | 'readAt'> & { id?: string }
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
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? (crypto as any).randomUUID()
    : Math.random().toString(36).slice(2);

const createNotificationsInitializer = (
  initialItems: AppNotification[],
  initialMuted: Record<string, boolean>,
): StateCreator<NotificationsStoreState> =>
  (set, get) => ({
    items: initialItems,
    mutedChannels: initialMuted,
    add: (n) => {
      const id = n.id ?? genId();
      const now = new Date().toISOString();
      const chan = n.channel ?? 'system';
      if (get().mutedChannels[chan]) return id;
      set((s) => ({ items: [{ ...n, id, createdAt: now, readAt: null }, ...s.items] }));
      return id;
    },
    markRead: (id) =>
      set((s) => ({
        items: s.items.map((i) =>
          i.id === id ? { ...i, readAt: i.readAt ?? new Date().toISOString() } : i,
        ),
      })),
    markAllRead: () =>
      set((s) => ({
        items: s.items.map((i) => (i.readAt ? i : { ...i, readAt: new Date().toISOString() })),
      })),
    remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    clear: () => set({ items: [] }),
    toggleMute: (channel) =>
      set((s) => ({
        mutedChannels: { ...s.mutedChannels, [channel]: !s.mutedChannels[channel] },
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
    partialize: (state) => ({ items: state.items, mutedChannels: state.mutedChannels }),
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
    storageKey = 'notifications-store-v1',
  } = options ?? {};
  const initializer = createNotificationsInitializer(initialItems, initialMuted);
  const creator = enablePersist ? withPersistence(initializer, storageKey) : initializer;
  return createStore<NotificationsStoreState>(creator as any);
}

const singletonNotificationsStore = createNotificationsStore();
export const notificationsStore = singletonNotificationsStore;

export function useNotificationsStore<T>(
  selector: (state: NotificationsStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) {
  return useStore(singletonNotificationsStore, selector, equalityFn);
}

