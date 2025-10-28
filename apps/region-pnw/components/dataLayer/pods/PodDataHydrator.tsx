"use client";

import * as React from "react";
import { usePodStore } from "@/providers/PodStoreProvider";
import type { Pod } from "@workspace/store/types/pod.ts";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";

function mapRowToPod(row: any): Pod {
  const channels = Array.isArray(row?.channels) ? row.channels : [];
  return {
    id: String(row.id ?? row.slug ?? crypto.randomUUID()),
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    area: String(row.area ?? ""),
    channels,
    team: [],
  } as Pod;
}

async function fetchPods(): Promise<Pod[]> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client
      .from("pods")
      .select("id, slug, name, area, channels")
      .order("name", { ascending: true });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    return rows.map(mapRowToPod);
  } catch (e) {
    console.warn("[PodDataHydrator] supabase fetch error", e);
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
  }, []);

  return null;
}

