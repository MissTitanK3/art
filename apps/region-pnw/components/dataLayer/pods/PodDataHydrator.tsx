"use client";

import * as React from "react";
import { usePodStore } from "@/providers/PodStoreProvider";
import type { Pod } from "@workspace/store/types/pod.ts";


async function fetchPods(): Promise<Pod[]> {
  try {
    const response = await fetch("/api/pods");
    if (!response.ok) {
      throw new Error("Failed to fetch pods");
    }
    const { pods } = await response.json();
    return Array.isArray(pods) ? pods : [];
  } catch (e) {
    console.warn("[PodDataHydrator] fetch error", e);
    return [];
  }
}

export default function PodDataHydrator() {
  const pods = usePodStore((s) => s.pods);
  const setPods = usePodStore((s) => s.setPods);

  React.useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      // Avoid refetch if already hydrated
      if (pods && pods.length > 0) return;
      const result = await fetchPods();
      if (!cancelled && result.length > 0) {
        setPods(result);
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [pods, setPods]);

  return null;
}
