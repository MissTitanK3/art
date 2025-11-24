"use client";

import * as React from "react";
import { usePodStore } from "@/providers/PodStoreProvider";
import type { RosterEntry } from "@workspace/store/types/pod";


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
    const response = await fetch("/api/roster");
    if (!response.ok) throw new Error("Failed to fetch roster");
    const { roster } = await response.json();
    const rows = (Array.isArray(roster) ? roster : []) as RosterRow[];
    return rows.map((row) => ({
      podId: String(row.pod_id ?? ""),
      entry: mapRowToRosterEntry(row),
    }));
  } catch (e) {
    console.warn("[ActiveRosterHydrator] fetch error", e);
    return [];
  }
}

async function fetchProfilesAsEntries(): Promise<RosterEntry[]> {
  try {
    // Try dispatch profiles first (admin view)
    let rows: any[] | null = null;
    try {
      const res = await fetch("/api/dispatch/profiles", {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        rows = Array.isArray(json?.profiles) ? json.profiles : [];
      }
    } catch {
      /* ignore */
    }

    // Fallback to general profiles endpoint (user view)
    if (!rows) {
      try {
        const res = await fetch("/api/profiles", {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          rows = Array.isArray(json?.profiles) ? json.profiles : [];
        }
      } catch {
        /* ignore */
      }
    }

    if (!rows) return [];

    // Convert each profile to a synthetic roster entry for selection purposes
    const entries: RosterEntry[] = rows.map((profile: any) => ({
      id: String(profile.id), // synthetic id for selection; real id will be generated on add
      profile,
      role: "member",
      status: "active",
      langs: [],
      skills: [],
      certs: [],
      notes: undefined,
      handle: profile.display_name ?? "",
      joinedAt: new Date().toISOString(),
      lastShiftAt: undefined,
      signal_handle: profile.contact_signal ?? undefined,
    }));
    return entries;
  } catch (e) {
    console.warn("[ActiveRosterHydrator] profiles fetch error", e);
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
      if (cancelled) return;

      // Also fetch all profiles (RLS allows dispatchers to view all; team_members will see their own only)
      const profileEntries = await fetchProfilesAsEntries();
      if (cancelled) return;

      // Set global active roster for other views
      const rosterOnly = rows.map((r) => r.entry);
      // Merge in profiles not already represented by an existing roster entry (by profile.id)
      const existingProfileIds = new Set(
        rosterOnly.map((e) => e.profile?.id).filter(Boolean),
      );
      const merged = rosterOnly.concat(
        profileEntries.filter((e) => !existingProfileIds.has(e.profile?.id)),
      );
      setActiveRoster(merged);

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
