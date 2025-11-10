"use client";

import type { Map as LeafletMap } from "leaflet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { useShipStore } from "@/store/useShipStore";
import { useJournalStore } from "@/store/useJournalStore";
import { useAchievementsStore } from "@/store/useAchievementsStore";
import { resetShipState } from "@/lib/ship";
import { haversineKm, round2 } from "@/lib/map/utils";
import { useGeolocation } from "./useGeolocation";

export function useDock(activeMaxNativeZoom?: number) {
  const dock_lat = useProfileStore((s: any) => s.dock_lat as number | null);
  const dock_lng = useProfileStore((s: any) => s.dock_lng as number | null);
  const dock_radius_km = useProfileStore(
    (s: any) => s.dock_radius_km as number | null,
  );
  const setDock = useProfileStore(
    (s: any) =>
      s.setDock as (lat: number, lng: number, radiusKm?: number) => void,
  );
  const clearDock = useProfileStore((s: any) => s.clearDock as () => void);
  const setAllShip = useShipStore((s) => s.setAll);
  const setMorale = useShipStore((s) => s.setMorale);
  const crew_morale = useShipStore((s) => s.crew_morale);
  const setFatigue = useProfileStore((s) => s.setFatigue);
  const profileId = useProfileStore((s) => s.profile?.id ?? null);
  const { getPosition } = useGeolocation();

  const radiusKm = dock_radius_km ?? 0.4023;
  const hasDock = Number.isFinite(dock_lat) && Number.isFinite(dock_lng);

  // Cooldown state (24h)
  const [lastMoveAt, setLastMoveAt] = useState<number | null>(null);
  const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
  const storageKey = useMemo(
    () => `frontiers:dock:last-move:${profileId ?? "anon"}`,
    [profileId],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      setLastMoveAt(raw ? Number(raw) : null);
    } catch {}
  }, [storageKey]);

  const remainingMs = useMemo(() => {
    if (!lastMoveAt) return 0;
    return Math.max(0, lastMoveAt + COOLDOWN_MS - Date.now());
  }, [lastMoveAt]);

  const canMoveDock = remainingMs <= 0;
  const nextMoveAt = useMemo(
    () => (lastMoveAt ? new Date(lastMoveAt + COOLDOWN_MS) : null),
    [lastMoveAt],
  );

  const atDockFrom = useCallback(
    (loc?: { lat: number; lng: number } | null) => {
      if (!hasDock || !loc) return false;
      const distKm = haversineKm(
        [dock_lat as number, dock_lng as number],
        [loc.lat, loc.lng],
      );
      return distKm <= radiusKm;
    },
    [hasDock, dock_lat, dock_lng, radiusKm],
  );

  const onDockRest = useCallback(
    async (currentLocation?: { lat: number; lng: number } | null) => {
      const atDock = atDockFrom(currentLocation);
      if (!profileId) {
        const bonus = atDock ? 20 : 10;
        setMorale(Math.min(100, Math.round(crew_morale + bonus)));
        setFatigue("engineering", 0);
        setFatigue("navigation", 0);
        setFatigue("operations", 0);
        useJournalStore
          .getState()
          .add(
            "dock",
            atDock ? "Rested at Dock (morale +20%)" : "Rested (morale +10%)",
          );
        try {
          useAchievementsStore.getState().onRest();
        } catch {}
        return;
      }
      try {
        const after = await resetShipState(profileId);
        if (after) {
          const toPct = (v: number) =>
            v <= 1 ? Math.round(v * 100) : Math.round(v);
          const next = {
            ship_condition: toPct(after.ship_condition),
            crew_morale: toPct(after.morale),
            fatigue: Math.round((after.fatigue || 0) * 100),
          };
          if (atDock)
            next.crew_morale = Math.min(100, Math.round(next.crew_morale + 10));
          setAllShip(next);
        } else {
          const bonus = atDock ? 20 : 10;
          setMorale(Math.min(100, Math.round(crew_morale + bonus)));
        }
      } catch {
        const bonus = atDock ? 20 : 10;
        setMorale(Math.min(100, Math.round(crew_morale + bonus)));
      }
      setFatigue("engineering", 0);
      setFatigue("navigation", 0);
      setFatigue("operations", 0);
      useJournalStore
        .getState()
        .add(
          "dock",
          atDock ? "Rested at Dock (morale +20%)" : "Rested (morale +10%)",
        );
      try {
        useAchievementsStore.getState().onRest();
      } catch {}
    },
    [profileId, atDockFrom, setMorale, crew_morale, setAllShip, setFatigue],
  );

  const setDockHere = useCallback(
    async (currentLocation?: { lat: number; lng: number } | null) => {
      if (!canMoveDock) {
        throw new Error("Dock move is on cooldown");
      }
      let loc = currentLocation;
      try {
        if (!loc) loc = await getPosition();
        if (loc) {
          setDock(round2(loc.lat), round2(loc.lng), 0.4023);
          const now = Date.now();
          setLastMoveAt(now);
          if (typeof window !== "undefined") {
            try {
              window.localStorage.setItem(storageKey, String(now));
            } catch {}
          }
        }
      } catch {}
    },
    [getPosition, setDock, canMoveDock, storageKey],
  );

  const goToDock = useCallback(
    (map: LeafletMap | null, maxNativeZoom?: number) => {
      if (!map || !Number.isFinite(dock_lat) || !Number.isFinite(dock_lng))
        return;
      const targetZoom = Math.min((maxNativeZoom ?? 19) - 1, 15);
      map.flyTo([dock_lat as number, dock_lng as number], targetZoom, {
        animate: true,
      });
    },
    [dock_lat, dock_lng],
  );

  const info = useMemo(
    () => ({
      lat: hasDock ? (dock_lat as number) : undefined,
      lng: hasDock ? (dock_lng as number) : undefined,
      radiusKm,
    }),
    [hasDock, dock_lat, dock_lng, radiusKm],
  );

  return {
    info,
    hasDock,
    radiusKm,
    onDockRest,
    setDockHere,
    clearDock,
    goToDock,
    atDockFrom,
    canMoveDock,
    remainingMs,
    nextMoveAt,
  };
}
