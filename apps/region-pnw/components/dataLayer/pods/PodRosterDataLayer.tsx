"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { usePodStore } from "@/providers/PodStoreProvider";
import type { RosterEntry } from "@workspace/store/types/pod.ts";
import { AddMemberButton } from "@workspace/ui/components/client/buttons/AddMemberButton";
import {
  PodRosterLayout,
  PodRosterLayoutProps,
} from "@workspace/ui/layout/pods/PodRosterLayout";
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
  };
}

async function fetchPodRosterFromDatabase(slug: string): Promise<RosterEntry[] | null> {
  try {
    const client = getSupabaseBrowserClient();
    // first fetch pod id from slug
    const { data: pod, error: podErr } = await client
      .from("pods")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (podErr) throw podErr;
    if (!pod?.id) return null;

    const { data, error } = await client
      .from("roster_entries")
      .select("*, profile:profiles(*)")
      .eq("pod_id", pod.id)
      .order("joined_at", { ascending: true });
    if (error) throw error;
    return (Array.isArray(data) ? data : []).map(mapRowToRosterEntry);
  } catch (e) {
    console.warn("[PodRosterDataLayer] supabase fetch error", e);
    return null;
  }
}

async function persistRosterEntryToDatabase(podId: string, entry: RosterEntry): Promise<void> {
  try {
    const client = getSupabaseBrowserClient();
    const payload = {
      id: entry.id,
      pod_id: podId,
      // DB stores a FK to profiles; send the id only
      profile_id: entry.profile?.id,
      role: entry.role,
      status: entry.status,
      langs: entry.langs,
      skills: entry.skills,
      certs: entry.certs,
      notes: entry.notes,
      handle: entry.handle,
      joined_at: entry.joinedAt,
      last_shift_at: entry.lastShiftAt,
      signal_handle: entry.signal_handle,
    };
    const { error } = await client.from("roster_entries").upsert(payload);
    if (error) throw error;
  } catch (e: any) {
    throw new Error(e?.message ?? "Failed to save roster entry");
  }
}

async function deleteRosterEntryFromDatabase(podId: string, rosterId: string): Promise<void> {
  try {
    const client = getSupabaseBrowserClient();
    const { error } = await client.from("roster_entries").delete().eq("pod_id", podId).eq("id", rosterId);
    if (error) throw error;
  } catch (e: any) {
    throw new Error(e?.message ?? "Failed to delete roster entry");
  }
}

export default function PodRosterDataLayer() {
  const { id } = useParams<{ id: string }>();
  const podId = decodeURIComponent(id ?? "");

  const pods = usePodStore((state) => state.pods);
  const updatePod = usePodStore((state) => state.updatePod);
  const activeRoster = usePodStore((state) => state.activeRoster);
  const pod = pods.find((p) => p.slug === podId);
  const storePodId = pod?.id;

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [remoteRoster, setRemoteRoster] = React.useState<RosterEntry[] | null>(
    null
  );
  const [loadingRemoteRoster, setLoadingRemoteRoster] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    let cancelled = false;

    async function loadRemoteRoster() {
      if (!podId) return;
      setLoadingRemoteRoster(true);
      try {
        const result = await fetchPodRosterFromDatabase(podId);
        if (!cancelled && result) {
          setRemoteRoster(result);
          if (storePodId) {
            updatePod(storePodId, { team: result });
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("PodRosterDataLayer: failed to fetch roster", error);
        }
      } finally {
        if (!cancelled) {
          setLoadingRemoteRoster(false);
        }
      }
    }

    loadRemoteRoster();
    return () => {
      cancelled = true;
    };
  }, [podId, storePodId, updatePod]);

  const rows = remoteRoster ?? pod?.team ?? [];
  const editing = rows.find((r) => r.id === selectedId) ?? null;

  const handleSave = async (entry: RosterEntry) => {
    if (!pod) return;

    try {
      await persistRosterEntryToDatabase(pod.id, entry);
    } catch (error) {
      console.warn("PodRosterDataLayer: failed to persist roster entry", error);
    }

    updatePod(pod.id, {
      team: pod.team.map((r) => (r.id === entry.id ? entry : r)),
    });

    setRemoteRoster((prev) =>
      prev ? prev.map((r) => (r.id === entry.id ? entry : r)) : prev
    );

    setSelectedId(null); // close sheet after save
  };

  const handleAddMember = async (entry: RosterEntry) => {
    if (!pod) return;

    try {
      await persistRosterEntryToDatabase(pod.id, entry);
    } catch (error) {
      console.warn("PodRosterDataLayer: failed to add roster entry", error);
    }

    updatePod(pod.id, { team: [...pod.team, entry] });
    setRemoteRoster((prev) => (prev ? [...prev, entry] : prev));
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!pod) return;

    try {
      await deleteRosterEntryFromDatabase(pod.id, memberId);
    } catch (error) {
      console.warn("PodRosterDataLayer: failed to remove roster entry", error);
    }

    updatePod(pod.id, {
      team: pod.team.filter((r) => r.id !== memberId),
    });
    setRemoteRoster((prev) => (prev ? prev.filter((r) => r.id !== memberId) : prev));
  };

  const addMemberAction = pod ? (
    <AddMemberButton pod={pod} activeRoster={activeRoster} onAddMember={handleAddMember} />
  ) : null;

  const layoutProps: PodRosterLayoutProps = {
    podSlug: podId,
    podId: pod?.id,
    podName: pod?.name,
    rows,
    editingEntry: editing,
    onEdit: (entryId) => setSelectedId(entryId),
    onCloseEditor: () => setSelectedId(null),
    onSaveEntry: handleSave,
    onRemoveMember: handleRemoveMember,
    addMemberAction,
    loadingMessage: loadingRemoteRoster
      ? "Loading roster from database..."
      : undefined,
    notFoundMessage: (
      <div className="rounded-md border border-dashed p-4">
        <p className="text-sm text-muted-foreground">
          Pod not found. Return to the pods directory to select a valid pod.
        </p>
      </div>
    ),
  };

  return <PodRosterLayout {...layoutProps} />;
}
