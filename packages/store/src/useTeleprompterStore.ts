import { persist } from "zustand/middleware";
import { createStore, type StateCreator, type StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";
import {
  cleanupLegacyStorageKeys,
  legacyStorageKeyCandidates,
  resolveScopedStorageKey,
} from "./utils/storage";

const TELEPROMPTER_BASE_STORAGE_KEY = "teleprompter-store";

// A lightweight, app-agnostic store for the Teleprompter UI preferences and content.
// Note: keeps types generic (string/number) to avoid coupling with app unions.

export interface TeleprompterStoreState {
  // Content selection
  scriptId: string | null;
  text: string;

  // Reading controls
  speed: number; // current live speed (0.25..2)
  defaultSpeed: number; // preferred default speed

  // Visual settings
  fontSize: string; // e.g. text-xl
  lineHeight: string; // e.g. leading-8
  fontFace: string; // sans | serif | mono | dyslexic (free-form string)
  preset: string; // briefing | studio | night | custom
  mirrorH: boolean;
  mirrorV: boolean;

  // Custom theme colors (used when preset === 'custom')
  customTextColor: string;
  customBgColor: string;
  customHighlightColor: string;

  // Overlay
  overlayColor: string;
  overlayOpacity: number; // 0..0.95

  // Cache toggle (if off, we avoid persisting the script text)
  cacheEnabled: boolean;

  // Internal revision bump to force-save current state on demand
  rev: number;

  // Actions
  setScriptId: (id: string | null) => void;
  setText: (t: string) => void;
  setSpeed: (v: number) => void;
  setDefaultSpeed: (v: number) => void;
  setFontSize: (v: string) => void;
  setLineHeight: (v: string) => void;
  setFontFace: (v: string) => void;
  setPreset: (v: string) => void;
  setMirrorH: (v: boolean) => void;
  setMirrorV: (v: boolean) => void;
  setCustomTextColor: (v: string) => void;
  setCustomBgColor: (v: string) => void;
  setCustomHighlightColor: (v: string) => void;
  setOverlayColor: (v: string) => void;
  setOverlayOpacity: (v: number) => void;
  setCacheEnabled: (v: boolean) => void;
  bumpRev: () => void;
}

export interface CreateTeleprompterStoreOptions {
  initial?: Partial<
    Pick<
      TeleprompterStoreState,
      | "scriptId"
      | "text"
      | "speed"
      | "defaultSpeed"
      | "fontSize"
      | "lineHeight"
      | "fontFace"
      | "preset"
      | "mirrorH"
      | "mirrorV"
      | "customTextColor"
      | "customBgColor"
      | "customHighlightColor"
      | "overlayColor"
      | "overlayOpacity"
      | "cacheEnabled"
    >
  >;
  persist?: boolean;
  storageKey?: string;
}

const DEFAULTS: Omit<
  TeleprompterStoreState,
  | "setScriptId"
  | "setText"
  | "setSpeed"
  | "setDefaultSpeed"
  | "setFontSize"
  | "setLineHeight"
  | "setFontFace"
  | "setPreset"
  | "setMirrorH"
  | "setMirrorV"
  | "setCustomTextColor"
  | "setCustomBgColor"
  | "setCustomHighlightColor"
  | "setOverlayColor"
  | "setOverlayOpacity"
  | "setCacheEnabled"
  | "bumpRev"
> = {
  scriptId: null,
  text: "",
  speed: 1,
  defaultSpeed: 1,
  fontSize: "text-xl",
  lineHeight: "leading-8",
  fontFace: "sans",
  preset: "briefing",
  mirrorH: false,
  mirrorV: false,
  customTextColor: "#e5e7eb",
  customBgColor: "#0b0f18",
  customHighlightColor: "#22d3ee",
  overlayColor: "#000000",
  overlayOpacity: 0,
  cacheEnabled: true,
  rev: 0,
};

const createTeleprompterInitializer =
  (
    initial: Partial<TeleprompterStoreState>,
  ): StateCreator<TeleprompterStoreState> =>
  (set, get) => {
    // Legacy hydration from old localStorage keys (browser only)
    let legacy: Partial<TeleprompterStoreState> = {};
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("teleprompter:last");
        if (raw) {
          const { text, fontSize, lineHeight, preset } = JSON.parse(raw);
          if (typeof text === "string") legacy.text = text;
          if (typeof fontSize === "string") legacy.fontSize = fontSize;
          if (typeof lineHeight === "string") legacy.lineHeight = lineHeight;
          if (typeof preset === "string") legacy.preset = preset;
        }
        const dsRaw = window.localStorage.getItem("teleprompter:defaultSpeed");
        const ds = dsRaw ? Number(dsRaw) : NaN;
        if (!Number.isNaN(ds) && ds >= 0.25 && ds <= 2) {
          legacy.defaultSpeed = ds;
          legacy.speed = ds; // historically applied to current speed as well
        }
      } catch {}
    }

    const base = {
      ...DEFAULTS,
      ...legacy,
      ...initial,
    } as TeleprompterStoreState;

    return {
      ...base,
      setScriptId: (id) => set({ scriptId: id }),
      setText: (t) => set({ text: t }),
      setSpeed: (v) =>
        set({
          speed: Math.max(
            0.25,
            Math.min(2, Number(v.toFixed ? Number(v.toFixed(2)) : v)),
          ),
        }),
      setDefaultSpeed: (v) =>
        set({ defaultSpeed: Math.max(0.25, Math.min(2, v)) }),
      setFontSize: (v) => set({ fontSize: v }),
      setLineHeight: (v) => set({ lineHeight: v }),
      setFontFace: (v) => set({ fontFace: v }),
      setPreset: (v) => set({ preset: v }),
      setMirrorH: (v) => set({ mirrorH: v }),
      setMirrorV: (v) => set({ mirrorV: v }),
      setCustomTextColor: (v) => set({ customTextColor: v }),
      setCustomBgColor: (v) => set({ customBgColor: v }),
      setCustomHighlightColor: (v) => set({ customHighlightColor: v }),
      setOverlayColor: (v) => set({ overlayColor: v }),
      setOverlayOpacity: (v) =>
        set({ overlayOpacity: Math.max(0, Math.min(0.95, v)) }),
      setCacheEnabled: (v) => set({ cacheEnabled: v }),
      bumpRev: () => set((s) => ({ rev: s.rev + 1 })),
    };
  };

function withPersistence(
  initializer: StateCreator<TeleprompterStoreState>,
  storageKey: string,
) {
  return persist(initializer, {
    name: storageKey,
    version: 1,
    migrate: (persisted: any) => persisted as TeleprompterStoreState,
    partialize: (state) => ({
      // Always persist preferences
      speed: state.speed,
      defaultSpeed: state.defaultSpeed,
      fontSize: state.fontSize,
      lineHeight: state.lineHeight,
      fontFace: state.fontFace,
      preset: state.preset,
      mirrorH: state.mirrorH,
      mirrorV: state.mirrorV,
      customTextColor: state.customTextColor,
      customBgColor: state.customBgColor,
      customHighlightColor: state.customHighlightColor,
      overlayColor: state.overlayColor,
      overlayOpacity: state.overlayOpacity,
      cacheEnabled: state.cacheEnabled,
      scriptId: state.scriptId,
      // Only persist full text if caching is enabled
      text: state.cacheEnabled ? state.text : "",
      // Include rev to allow manual bump/save triggers
      rev: state.rev,
    }),
  });
}

export type TeleprompterStore = StoreApi<TeleprompterStoreState>;

export function createTeleprompterStore(
  opts: CreateTeleprompterStoreOptions = {},
): TeleprompterStore {
  const {
    initial = {},
    persist: enablePersist = true,
    storageKey,
  } = opts;
  const initializer = createTeleprompterInitializer(
    initial as TeleprompterStoreState,
  );
  const resolvedStorageKey = resolveScopedStorageKey(
    TELEPROMPTER_BASE_STORAGE_KEY,
    storageKey,
  );
  cleanupLegacyStorageKeys(
    resolvedStorageKey,
    legacyStorageKeyCandidates(TELEPROMPTER_BASE_STORAGE_KEY, storageKey),
  );
  const creator = enablePersist
    ? withPersistence(initializer, resolvedStorageKey)
    : initializer;
  return createStore<TeleprompterStoreState>(creator as any);
}

const singletonTeleprompterStore = createTeleprompterStore();
export const teleprompterStore = singletonTeleprompterStore;

export const useTeleprompterStore = <T>(
  selector: (state: TeleprompterStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStore(singletonTeleprompterStore, selector, equalityFn);
