"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { usePodsStore } from "@workspace/store/podStore";
import { RosterEntry } from "@workspace/store/types/pod.ts";
import { AddMemberButton } from "@workspace/ui/components/client/buttons/AddMemberButton";
import {
  PodRosterLayout,
  PodRosterLayoutProps,
} from "@workspace/ui/layout/pods/PodRosterLayout";

async function fetchPodRosterFromDatabase(
  slug: string
): Promise<RosterEntry[] | null> {
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
  // TODO: implement proper persistence once a database is available.
  // Example:
  // await client.from("pod_roster").upsert(transformRosterEntry(entry, podId));
  await Promise.resolve();
}

export default function PodRosterDataLayer() {
  const { id } = useParams<{ id: string }>();
  const podId = decodeURIComponent(id ?? "");

  const { pods, updatePod } = usePodsStore();
  const pod = pods.find((p) => p.slug === podId);

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
  }, [podId]);

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

  const addMemberAction = pod ? <AddMemberButton id={id} /> : null;

  const layoutProps: PodRosterLayoutProps = {
    podSlug: podId,
    podId: pod?.id,
    rows,
    editingEntry: editing,
    onEdit: (entryId) => setSelectedId(entryId),
    onCloseEditor: () => setSelectedId(null),
    onSaveEntry: handleSave,
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
