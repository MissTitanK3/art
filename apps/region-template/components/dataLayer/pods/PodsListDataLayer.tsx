"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PodsListLayout } from "@workspace/ui/layout/pods/PodsListLayout";
import type { PodsListLayoutPod } from "@workspace/ui/layout/pods/PodsListLayout";
import { usePodStore } from "@/providers/PodStoreProvider";
import type { Pod } from "@workspace/store/types/pod.ts";

type NormalizedPod = Pod & PodsListLayoutPod;

function normalizePod(pod: Pod | PodsListLayoutPod): NormalizedPod {
  const rawId = "id" in pod && pod.id != null ? pod.id : pod.slug;
  const id = typeof rawId === "number" ? String(rawId) : rawId;

  const channels: Pod["channels"] =
    "channels" in pod && Array.isArray(pod.channels)
      ? (pod.channels as Pod["channels"])
      : [];

  const team: Pod["team"] =
    "team" in pod && Array.isArray(pod.team)
      ? (pod.team as Pod["team"])
      : [];

  const area =
    "area" in pod && typeof pod.area === "string" ? pod.area : "";

  const normalized: NormalizedPod = {
    ...(pod as Record<string, unknown>),
    id: id ?? pod.slug,
    slug: pod.slug,
    name: pod.name,
    area,
    channels,
    team,
  };

  if (normalized.channel === undefined && channels[0]?.type) {
    normalized.channel = channels[0].type;
  }

  if (normalized.channelLink === undefined && channels[0]?.link) {
    normalized.channelLink = channels[0].link;
  }

  return normalized;
}

async function fetchPodsFromDatabase(): Promise<PodsListLayoutPod[]> {
  // Placeholder: swap this with your database client once persistence is ready.
  // Example:
  // const client = createSupabaseClient();
  // const { data } = await client.from("pods").select("*");
  // return transformPods(data);
  await Promise.resolve();
  return [];
}

export default function PodsListDataLayer() {
  const pods = usePodStore((state) => state.pods);
  const [remotePods, setRemotePods] = useState<PodsListLayoutPod[] | null>(null);
  const [loadingRemotePods, setLoadingRemotePods] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrateFromDatabase() {
      setLoadingRemotePods(true);
      try {
        const result = await fetchPodsFromDatabase();

        if (mounted && result.length > 0) {
          setRemotePods(result);
        }
      } catch (error) {
        console.warn("PodsListDataLayer: failed to fetch pods from database", error);
      } finally {
        if (mounted) {
          setLoadingRemotePods(false);
        }
      }
    }

    hydrateFromDatabase();

    return () => {
      mounted = false;
    };
  }, []);

  const podsToDisplay = remotePods && remotePods.length > 0 ? remotePods : pods;
  const normalizedPods = podsToDisplay.map(normalizePod);

  return (
    <PodsListLayout
      pods={normalizedPods}
      emptyState={
        loadingRemotePods ? (
          <p className="text-sm text-muted-foreground">Loading pods from database...</p>
        ) : undefined
      }
      renderPod={({ pod, DefaultCard }) => (
        <Link href={`/pods/${pod.slug}`}>
          {DefaultCard}
        </Link>
      )}
    />
  );
}
