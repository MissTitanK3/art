"use client";

import { useCallback } from "react";
import { Button } from "@workspace/ui/primitives/button";
import { supabase } from "@/lib/supabaseClient";
import { useSignalsStore } from "@/store/useSignalsStore";
import type { ArtSignal } from "@/schemas/art_signals";
import { MapGrid } from "@/components/MapGrid";
import { EventFeed } from "@/components/EventFeed";
import { useProfileStore } from "@/store/useProfileStore";
import { mapRegionToSector } from "@/lib/regions";
import { useShipStore } from "@/store/useShipStore";
import { toast } from "sonner";
import { fetchCurrentShipCached } from "@/lib/shipsApi";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

async function getPosition(): Promise<GeolocationPosition> {
  if (!("geolocation" in navigator)) {
    throw new Error("Geolocation not supported in this browser");
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

export function PingButton() {
  const {
    setSignals,
    setLocation,
    setLoading,
    setError,
    signals,
    loading,
    location,
    error,
  } = useSignalsStore();
  const markPing = useShipStore((s) => s.markPing);
  const regionIdFromStore = useProfileStore((s) => s.region_id);
  const sectorFromStore = useProfileStore(
    (s) => s.sector_code || s.profile?.sector_code || null
  );

  const onPing = useCallback(async () => {
    // Require a selected ship
    try {
      // Use cached call; we don't need sub-minute freshness for this guard
      const profileId = useProfileStore.getState().profile?.id || null;
      const json = profileId
        ? await fetchCurrentShipCached(profileId, 60_000)
        : null;
      const hasShip = Boolean(json?.current?.ship_id);
      if (!hasShip) {
        toast("You need to select a ship before pinging.");
        const el = document.getElementById("available-ships");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    } catch {
      // If we can’t verify, be safe and require selection
      toast("You need to select a ship before pinging.");
      const el = document.getElementById("available-ships");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      const pos = await getPosition();
      const lat = round2(pos.coords.latitude);
      const lng = round2(pos.coords.longitude);
      setLocation({ lat, lng });

      // Resolve region/sector from profile or env fallback
      // Default to seeded dev region so first‑run works: region-pnw / EOS-9
      const regionId =
        regionIdFromStore || process.env.NEXT_PUBLIC_REGION_ID || "region-pnw";
      const sectorCode = sectorFromStore || mapRegionToSector(regionId);

      let query = supabase
        .from("art_signals")
        .select("*")
        .gte("expires_at", new Date().toISOString());

      const ors: string[] = [];
      if (regionId) ors.push(`region_id.eq.${regionId}`);
      if (sectorCode) ors.push(`sector_code.eq.${sectorCode}`);
      if (ors.length > 0) {
        query = query.or(ors.join(","));
      }

      const { data, error } = await query;

      if (error) throw error;
      setSignals((data ?? []) as ArtSignal[]);
      markPing();
    } catch (err: any) {
      setError(err?.message || "Failed to ping");
    } finally {
      setLoading(false);
    }
  }, [
    setError,
    setLoading,
    setLocation,
    setSignals,
    regionIdFromStore,
    sectorFromStore,
  ]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      <Button onClick={onPing} disabled={loading}>
        {loading ? "Pinging…" : "Ping Verse"}
      </Button>
      {location && (
        <p className="text-xs text-muted-foreground">
          Location ~ {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
        </p>
      )}
      {/* Results */}
      {signals?.length > 0 && (
        <>
          <MapGrid signals={signals} />
          <EventFeed />
        </>
      )}
      {/* Empty/error states */}
      {!loading && signals.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No signals yet. Try pinging.
        </p>
      )}
      {!loading && error && (
        <p className="text-xs text-destructive/80">{error}</p>
      )}
    </div>
  );
}
