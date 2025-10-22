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

async function fetchPodRosterFromDatabase(
  slug: string
): Promise<RosterEntry[] | null> {
  console.log("Fetching pod roster from database for slug:", slug);
  // TODO: swap with real database call when persistence is introduced.
  // Example:
  // const { data } = await client.from("pod_roster").select("*").eq("pod_slug", slug);
  // return data?.map(transformRowToRosterEntry) ?? [];
  await Promise.resolve();
  return null;
}

async function persistRosterEntryToDatabase(
  podId: string,
  entry: RosterEntry
): Promise<void> {
  console.log("Persisting roster entry to database for podId:", podId, entry);
  // TODO: implement proper persistence once a database is available.
  // Example:
  // await client.from("pod_roster").upsert(transformRosterEntry(entry, podId));
  await Promise.resolve();
}

async function deleteRosterEntryFromDatabase(podId: string, rosterId: string): Promise<void> {
  console.log("Deleting roster entry from database for podId:", podId, "rosterId:", rosterId);
  // TODO: replace with real deletion once persistence is added.
  // Example:
  // await client.from("pod_roster").delete().eq("pod_id", podId).eq("id", rosterId);
  await Promise.resolve();
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
