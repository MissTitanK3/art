"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PodsListLayout } from "@workspace/ui/layout/pods/PodsListLayout";
import type { PodsListLayoutPod } from "@workspace/ui/layout/pods/PodsListLayout";
import { usePodsStore } from "@workspace/store/podStore";

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
  const pods = usePodsStore((s) => s.pods);
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

  return (
    <PodsListLayout
      pods={podsToDisplay}
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
