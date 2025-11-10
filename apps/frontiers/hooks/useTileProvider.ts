"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_TILE_PROVIDER,
  TILE_PROVIDER_STORAGE_KEY,
  TILE_PROVIDERS,
  type TileProvider,
} from "@/lib/map/tiles";

export function useTileProvider() {
  const [providerId, setProviderIdState] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_TILE_PROVIDER.id;
    const stored = window.localStorage.getItem(TILE_PROVIDER_STORAGE_KEY);
    return TILE_PROVIDERS.some((p) => p.id === stored)
      ? (stored as string)
      : DEFAULT_TILE_PROVIDER.id;
  });

  // persist selection
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(TILE_PROVIDER_STORAGE_KEY, providerId);
      } catch {}
    }
  }, [providerId]);

  const provider = useMemo(
    () =>
      TILE_PROVIDERS.find((p) => p.id === providerId) ?? DEFAULT_TILE_PROVIDER,
    [providerId],
  );

  const setProviderId = (id: string) => setProviderIdState(id);

  return {
    providerId,
    provider,
    providers: TILE_PROVIDERS as ReadonlyArray<TileProvider>,
    setProviderId,
  };
}
