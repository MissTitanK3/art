"use client";
import { useCallback, useEffect, useRef, useState } from "react";
type UseLocalStorageOptions<T> = {
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T;
  version?: number;
  migrate?: (raw: unknown, storedVersion: number | undefined) => T | undefined;
  sync?: boolean;
  storage?: Storage;
  persist?: boolean;
  debounceMs?: number;
  onError?: (err: unknown) => void;
};
export function useLocalStorage<T>(
  key: string,
  initial: T,
  {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    version,
    migrate,
    sync = false,
    storage,
    persist = true,
    debounceMs = 0,
    onError,
  }: UseLocalStorageOptions<T> = {},
) {
  const initialRef = useRef(initial);
  useEffect(() => {
    initialRef.current = initial;
  }, [initial]);
  const serializeRef = useRef(serialize);
  useEffect(() => {
    serializeRef.current = serialize;
  }, [serialize]);
  const deserializeRef = useRef(deserialize);
  useEffect(() => {
    deserializeRef.current = deserialize;
  }, [deserialize]);
  const migrateRef = useRef(migrate);
  useEffect(() => {
    migrateRef.current = migrate;
  }, [migrate]);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  const [state, setState] = useState<T>(() => initialRef.current);
  const hydratedRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const selfWriteRef = useRef(false);
  const lastStoredRef = useRef<string | null>(null);
  const persistEnabled = persist ?? true;
  const readRaw = useCallback(
    (raw: string | null) => {
      if (raw == null) {
        lastStoredRef.current = null;
        setState((prev) =>
          Object.is(prev, initialRef.current) ? prev : initialRef.current,
        );
        return;
      }
      lastStoredRef.current = raw;
      let parsed: unknown = raw;
      let storedVersion: number | undefined;
      try {
        parsed = JSON.parse(raw);
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "v" in (parsed as any)
        ) {
          storedVersion = Number((parsed as any).v);
        } else if (
          typeof parsed === "object" &&
          parsed !== null &&
          "version" in (parsed as any)
        ) {
          storedVersion = Number((parsed as any).version);
        }
      } catch {
        /* raw was a primitive/legacy string */
      }
      const payload =
        typeof parsed === "object" &&
        parsed !== null &&
        "data" in (parsed as any)
          ? (parsed as any).data
          : typeof parsed === "object" &&
              parsed !== null &&
              "value" in (parsed as any)
            ? (parsed as any).value
            : parsed;
      const migrateFn = migrateRef.current;
      if (migrateFn) {
        try {
          const maybeMigrated = migrateFn(payload, storedVersion);
          if (maybeMigrated !== undefined) {
            setState((prev) =>
              Object.is(prev, maybeMigrated) ? prev : maybeMigrated,
            );
            return;
          }
        } catch (err) {
          onErrorRef.current?.(err);
          setState(initialRef.current);
          return;
        }
      }
      const isVersioned = version !== undefined || storedVersion !== undefined;
      if (
        isVersioned &&
        storedVersion !== undefined &&
        version !== undefined &&
        storedVersion !== version
      ) {
        setState(initialRef.current);
        return;
      }
      if (isVersioned) {
        setState((prev) =>
          Object.is(prev, payload as T) ? prev : (payload as T),
        );
        return;
      }
      setState((prev) => {
        try {
          const deserializeFn = deserializeRef.current ?? JSON.parse;
          const next = deserializeFn(raw);
          return Object.is(prev, next) ? prev : next;
        } catch (err) {
          onErrorRef.current?.(err);
          return initialRef.current;
        }
      });
    },
    [initialRef, version],
  );
  const getStorage = useCallback(() => {
    if (!persistEnabled) return undefined;
    if (storage) return storage;
    if (typeof window === "undefined") return undefined;
    return window.localStorage;
  }, [persistEnabled, storage]);
  useEffect(() => {
    if (!persistEnabled) {
      hydratedRef.current = true;
      return;
    }
    const store = getStorage();
    if (!store) {
      hydratedRef.current = true;
      return;
    }
    try {
      readRaw(store.getItem(key));
    } catch (err) {
      onErrorRef.current?.(err);
    } finally {
      hydratedRef.current = true;
    }
  }, [getStorage, key, persistEnabled, readRaw]);
  useEffect(() => {
    if (!persistEnabled) {
      if (timerRef.current && typeof window !== "undefined") {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      return;
    }
    if (!hydratedRef.current) return;
    const store = getStorage();
    if (!store) return;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    const write = () => {
      try {
        const serializer = serializeRef.current ?? JSON.stringify;
        const payload =
          version !== undefined
            ? JSON.stringify({ v: version, data: state })
            : serializer(state);
        if (lastStoredRef.current === payload) return;
        selfWriteRef.current = true;
        store.setItem(key, payload);
        lastStoredRef.current = payload;
      } catch (err) {
        onErrorRef.current?.(err);
      } finally {
        if (selfWriteRef.current) selfWriteRef.current = false;
      }
    };
    if (debounceMs > 0) {
      timerRef.current = window.setTimeout(write, debounceMs);
    } else {
      write();
    }
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [debounceMs, getStorage, key, persistEnabled, state, version]);
  useEffect(() => {
    if (!persistEnabled || !sync) return;
    const store = getStorage();
    if (!store || typeof window === "undefined") return;
    const handler = (e: StorageEvent) => {
      if (e.key !== key) return;
      if (selfWriteRef.current) return;
      try {
        readRaw(e.newValue);
      } catch (err) {
        onErrorRef.current?.(err);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [getStorage, key, persistEnabled, readRaw, sync]);
  return [state, setState] as const;
}
