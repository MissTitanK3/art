"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileStore } from "@/store/useProfileStore";
import { useShipStore } from "@/store/useShipStore";
import Link from "next/link";
import { Button } from "@workspace/ui/primitives/button";
import { fetchCurrentShipCached } from "@/lib/shipsApi";

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 w-24">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${color}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function ShipSelectionBanner() {
  const { session } = useAuth();
  const storeProfileId = useProfileStore((s) => s.profile?.id ?? null);
  const profileId = storeProfileId || session?.user?.id || null;
  const [hasShip, setHasShip] = React.useState<boolean | null>(null);
  const [shipName, setShipName] = React.useState<string | null>(null);

  // Store stats
  const condition = useShipStore((s) => s.ship_condition);
  const morale = useShipStore((s) => s.crew_morale);
  const fatigue = useShipStore((s) => s.fatigue);

  React.useEffect(() => {
    let active = true;
    const check = async () => {
      if (!profileId) {
        setHasShip(false);
        return;
      }
      try {
        const json = await fetchCurrentShipCached(profileId, 60_000);
        if (!active) return;
        setHasShip(!!json?.current);
        if (json?.current?.ship?.name) {
          setShipName(json.current.ship.name);
        }
      } catch {
        if (active) setHasShip(false);
      }
    };
    check();
    const id = setInterval(check, 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [profileId]);

  if (hasShip === null) return null; // Loading

  if (!hasShip) {
    return (
      <div className="fixed bottom-3 inset-x-0 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto max-w-xl w-[92%] sm:w-[640px] rounded-md border bg-card/95 backdrop-blur px-3 py-2 shadow-lg animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between gap-2 text-sm">
            <div>Select a ship to begin exploring.</div>
            <Button asChild size="sm">
              <Link href="/fleet#available-ships">Select ship</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show stats if ship exists
  return (
    <div className="fixed bottom-3 inset-x-0 flex justify-center z-50 pointer-events-none">
      <div className="pointer-events-auto max-w-3xl w-[95%] rounded-md border bg-card/95 backdrop-blur px-4 py-2 shadow-lg flex items-center justify-between gap-4 animate-in slide-in-from-bottom-2">
        <div className="flex items-center gap-4">
          <div className="font-medium text-sm hidden sm:block">
            {shipName || "Current Ship"}
          </div>
          <div className="flex items-center gap-3">
            <MiniStat
              label="Hull"
              value={condition}
              color={condition < 30 ? "bg-red-500" : "bg-green-500"}
            />
            <MiniStat
              label="Morale"
              value={morale}
              color={morale < 30 ? "bg-red-500" : "bg-blue-500"}
            />
            <MiniStat
              label="Fatigue"
              value={fatigue}
              color={fatigue > 70 ? "bg-red-500" : "bg-yellow-500"}
            />
          </div>
        </div>
        <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
          <Link href="/fleet">Manage Fleet</Link>
        </Button>
      </div>
    </div>
  );
}
