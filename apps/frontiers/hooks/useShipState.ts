"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchShipState, resetShipState } from "@/lib/ship";
export function useShipState(profileId: string | null) {
  const [shipLoading, setShipLoading] = useState(false);
  const [ship, setShip] = useState<{
    ship_condition: number;
    morale: number;
    fatigue: number;
  } | null>(null);
  const [resetting, setResetting] = useState(false);
  useEffect(() => {
    const run = async () => {
      if (!profileId) {
        setShip(null);
        return;
      }
      setShipLoading(true);
      try {
        const s = await fetchShipState(profileId);
        const norm = (v: number) => Math.round(v <= 1 ? v * 100 : v);
        setShip({
          ship_condition: norm((s as any).ship_condition ?? 0),
          morale: norm((s as any).morale ?? 0),
          fatigue: norm((s as any).fatigue ?? 0),
        });
      } catch {
        setShip(null);
      } finally {
        setShipLoading(false);
      }
    };
    run();
  }, [profileId]);
  const onDockRepair = useCallback(async () => {
    if (!profileId) return;
    setResetting(true);
    try {
      const s = await resetShipState(profileId);
      const norm = (v: number) => Math.round(v <= 1 ? v * 100 : v);
      if (s)
        setShip({
          ship_condition: norm((s as any).ship_condition ?? 0),
          morale: norm((s as any).morale ?? 0),
          fatigue: norm((s as any).fatigue ?? 0),
        });
      toast.success("Docked and repaired. Ship status updated.");
    } catch (e: any) {
      toast.error(e?.message || "Failed to dock/repair");
    } finally {
      setResetting(false);
    }
  }, [profileId]);
  return { shipLoading, ship, setShip, resetting, onDockRepair };
}
