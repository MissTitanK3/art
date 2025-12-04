"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@workspace/ui/primitives/button";
import { Separator } from "@workspace/ui/primitives/separator";
import { ArrowLeft } from "lucide-react";
import { usePodStore } from "@/providers/PodStoreProvider";
import type { RosterEntry } from "@workspace/store/types/pod.ts";
import { AddMemberButton } from "@workspace/ui/patterns/features/buttons/add-member-button";
import {
  PodRosterLayout,
  PodRosterLayoutProps,
} from "@workspace/ui/layout/pods/pod-roster-layout";
import type { RosterEditorSection } from "@workspace/ui/patterns/features/roster/types";
function mapRowToRosterEntry(row: any): RosterEntry {
  return {
    id: String(row.id),
    profile_id:
      typeof row.profile_id === "string" ? row.profile_id : row.profile?.id,
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
async function fetchPodRosterFromDatabase(
  slug: string,
): Promise<RosterEntry[] | null> {
  try {
    const response = await fetch(
      `/api/pods/${encodeURIComponent(slug)}/roster`,
    );
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch roster");
    }
    const { roster } = await response.json();
    return (Array.isArray(roster) ? roster : []).map(mapRowToRosterEntry);
  } catch (e) {
    console.warn("[PodRosterDataLayer] fetch error", e);
    return null;
  }
}
async function persistRosterEntryToDatabase(
  podSlug: string,
  entry: RosterEntry,
): Promise<void> {
  try {
    const response = await fetch(
      `/api/pods/${encodeURIComponent(podSlug)}/roster`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry }),
      },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save roster entry");
    }
  } catch (e: any) {
    throw new Error(e?.message ?? "Failed to save roster entry");
  }
}
async function deleteRosterEntryFromDatabase(
  podSlug: string,
  rosterId: string,
): Promise<void> {
  try {
    const response = await fetch(
      `/api/pods/${encodeURIComponent(podSlug)}/roster/${encodeURIComponent(rosterId)}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to delete roster entry");
    }
  } catch (e: any) {
    throw new Error(e?.message ?? "Failed to delete roster entry");
  }
}
export default function PodRosterPage() {
  const router = useRouter();
  const { id } = useParams<{
    id: string;
  }>();
  const podId = decodeURIComponent(id ?? "");
  const pods = usePodStore((state) => state.pods);
  const updatePod = usePodStore((state) => state.updatePod);
  const activeRoster = usePodStore((state) => state.activeRoster);
  const pod = pods.find((p) => p.slug === podId);
  const storePodId = pod?.id;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] =
    useState<RosterEditorSection | null>(null);
  const [remoteRoster, setRemoteRoster] = useState<RosterEntry[] | null>(null);
  const [loadingRemoteRoster, setLoadingRemoteRoster] =
    useState<boolean>(false);
  useEffect(() => {
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
      await persistRosterEntryToDatabase(podId, entry);
    } catch (error) {
      console.warn("PodRosterDataLayer: failed to persist roster entry", error);
    }
    const patched: RosterEntry = {
      ...entry,
      profile_id:
        entry.profile_id ??
        (entry.profile?.id ? String(entry.profile.id) : undefined),
    };
    updatePod(pod.id, {
      team: pod.team.map((r) => (r.id === entry.id ? patched : r)),
    });
    setRemoteRoster((prev) =>
      prev ? prev.map((r) => (r.id === entry.id ? patched : r)) : prev,
    );
    setSelectedId(null); // close sheet after save
    setSelectedSection(null);
  };
  const handleAddMember = async (entry: RosterEntry) => {
    if (!pod) return;
    try {
      await persistRosterEntryToDatabase(podId, entry);
    } catch (error) {
      console.warn("PodRosterDataLayer: failed to add roster entry", error);
    }
    const patched: RosterEntry = {
      ...entry,
      profile_id:
        entry.profile_id ??
        (entry.profile?.id ? String(entry.profile.id) : undefined),
    };
    updatePod(pod.id, { team: [...pod.team, patched] });
    setRemoteRoster((prev) => (prev ? [...prev, patched] : prev));
  };
  const handleRemoveMember = async (memberId: string) => {
    if (!pod) return;
    try {
      await deleteRosterEntryFromDatabase(podId, memberId);
    } catch (error) {
      console.warn("PodRosterDataLayer: failed to remove roster entry", error);
    }
    updatePod(pod.id, {
      team: pod.team.filter((r) => r.id !== memberId),
    });
    setRemoteRoster((prev) =>
      prev ? prev.filter((r) => r.id !== memberId) : prev,
    );
  };
  const addMemberAction = pod ? (
    <AddMemberButton
      pod={pod}
      activeRoster={activeRoster}
      onAddMember={handleAddMember}
    />
  ) : null;
  const layoutProps: PodRosterLayoutProps = {
    podSlug: podId,
    podId: pod?.id,
    podName: pod?.name,
    rows,
    editingEntry: editing,
    editingSection: selectedSection,
    onEdit: (entryId, section = "details") => {
      setSelectedId(entryId);
      setSelectedSection(section);
    },
    onCloseEditor: () => {
      setSelectedId(null);
      setSelectedSection(null);
    },
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
  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-l font-bold">{pod?.name} Pod Roster</h1>
      </div>
      <Separator className="my-4" />
      <PodRosterLayout {...layoutProps} />
    </section>
  );
}
