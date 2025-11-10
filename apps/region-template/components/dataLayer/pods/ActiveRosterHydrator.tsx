"use client";

import * as React from "react";
import { usePodStore } from "@/providers/PodStoreProvider";
import type { RosterEntry } from "@workspace/store/types/pod";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";

function mapRowToRosterEntry(row: any): RosterEntry {
  return {
    id: String(row.id),
    profile: row.profile,
    role: row.role,
    status: row.status,
    langs: Array.isArray(row.langs) ? row.langs : [],
    skills: Array.isArray(row.skills) ? row.skills : [],
    certs: Array.isArray(row.certs) ? row.certs : [],
    notes: row.notes ?? undefined,
    handle: row.handle ?? row.profile?.display_name ?? "",
    joinedAt: String(row.joined_at ?? row.joinedAt ?? new Date().toISOString()),
    lastShiftAt: row.last_shift_at ?? row.lastShiftAt ?? undefined,
    signal_handle: row.signal_handle ?? undefined,
  } as RosterEntry;
}

type RosterRow = { pod_id?: string } & Record<string, any>;

async function fetchActiveRoster(): Promise<
  Array<{ podId: string; entry: RosterEntry }>
> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client
      .from("roster_entries")
      .select("*, profile:profiles(*)")
      .order("joined_at", { ascending: true });
    if (error) throw error;
    const rows = (Array.isArray(data) ? data : []) as RosterRow[];
    return rows.map((row) => ({
      podId: String(row.pod_id ?? ""),
      entry: mapRowToRosterEntry(row),
    }));
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[ActiveRosterHydrator] supabase fetch error", e);
    }
    return [];
  }
}

export default function ActiveRosterHydrator() {
  const setActiveRoster = usePodStore((s) => s.setActiveRoster);
  const updatePod = usePodStore((s) => s.updatePod);
  const pods = usePodStore((s) => s.pods);
  const hydratedRef = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      // Only run once, after pods are loaded
      if (hydratedRef.current) return;
      if (!pods || pods.length === 0) return;
      const rows = await fetchActiveRoster();
      if (cancelled || rows.length === 0) return;

      // Set global active roster for other views
      const rosterOnly = rows.map((r) => r.entry);
      setActiveRoster(rosterOnly);

      // Group roster by podId and attach to pods in store
      const byPod = new Map<string, RosterEntry[]>();
      for (const { podId, entry } of rows) {
        if (!podId) continue;
        const list = byPod.get(podId) ?? [];
        list.push(entry);
        byPod.set(podId, list);
      }
      for (const [podId, team] of byPod) {
        // Only update if pod exists in store
        if (pods.some((p) => p.id === podId)) {
          updatePod(podId, { team });
        }
      }

      hydratedRef.current = true;
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [pods, setActiveRoster, updatePod]);

  return null;
}
