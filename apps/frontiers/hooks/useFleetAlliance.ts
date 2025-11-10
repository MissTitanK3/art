"use client";

import * as React from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

export type Fleet = {
  id: string;
  name: string;
  region_id: string | null;
  leader_id: string | null;
  members: string[] | null;
};

export function useFleetAlliance(profileId: string | null) {
  const [fleetsLoading, setFleetsLoading] = React.useState(false);
  const [fleets, setFleets] = React.useState<Fleet[]>([]);

  const loadFleets = React.useCallback(async () => {
    if (!profileId) {
      setFleets([]);
      return;
    }
    setFleetsLoading(true);
    try {
      const cols = "id,name,region_id,leader_id,members";
      const [l1, l2] = await Promise.all([
        supabase.from("fleets").select(cols).eq("leader_id", profileId),
        supabase.from("fleets").select(cols).contains("members", [profileId]),
      ]);
      const a = Array.isArray(l1.data) ? l1.data : [];
      const b = Array.isArray(l2.data) ? l2.data : [];
      const map = new Map<string, Fleet>();
      for (const f of [...a, ...b])
        map.set(String((f as any).id), {
          id: String((f as any).id),
          name: (f as any).name,
          region_id: (f as any).region_id ?? null,
          leader_id: (f as any).leader_id ? String((f as any).leader_id) : null,
          members: Array.isArray((f as any).members)
            ? (f as any).members.map(String)
            : null,
        });
      setFleets(Array.from(map.values()));
    } catch (e: any) {
      toast.error(e?.message || "Failed to load fleets");
    } finally {
      setFleetsLoading(false);
    }
  }, [profileId]);

  React.useEffect(() => {
    loadFleets();
  }, [loadFleets]);

  return { fleetsLoading, fleets, reloadFleets: loadFleets };
}
