"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PodsListLayout } from "@workspace/ui/layout/pods/PodsListLayout";
import type { PodsListLayoutPod } from "@workspace/ui/layout/pods/PodsListLayout";
import { usePodStore } from "@/providers/PodStoreProvider";
import type { Pod } from "@workspace/store/types/pod.ts";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import { REGION_IDENTIFIER } from "@/app/brand_settings";

type NormalizedPod = Pod & PodsListLayoutPod;

function normalizePod(pod: Pod | PodsListLayoutPod): NormalizedPod {
  const rawId = "id" in pod && pod.id != null ? pod.id : pod.slug;
  const id = typeof rawId === "number" ? String(rawId) : rawId;

  const channels: Pod["channels"] =
    "channels" in pod && Array.isArray(pod.channels)
      ? (pod.channels as Pod["channels"])
      : [];

  const team: Pod["team"] =
    "team" in pod && Array.isArray(pod.team) ? (pod.team as Pod["team"]) : [];

  const area = "area" in pod && typeof pod.area === "string" ? pod.area : "";

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

function mapRowToPod(row: any): PodsListLayoutPod {
  const channels = Array.isArray(row?.channels) ? row.channels : [];
  const first = channels[0] ?? {};
  return {
    id: String(row.id ?? row.slug ?? crypto.randomUUID()),
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    area: String(row.area ?? ""),
    channels,
    team: Array.isArray(row.team) ? row.team : [],
    channel: first?.type,
    channelLink: first?.link,
  } as PodsListLayoutPod;
}

type ListFilters = {
  q?: string;
  area?: string;
  channel?: string;
};

async function fetchPodsFromDatabase(
  filters?: ListFilters,
): Promise<PodsListLayoutPod[]> {
  try {
    const client = getSupabaseBrowserClient();
    let query = client
      .from("pods")
      .select("id, slug, name, area, channels")
      .order("name", { ascending: true });

    if (filters) {
      const { q, area, channel } = filters;
      if (area && area !== "all") query = query.eq("area", area);
      if (channel && channel !== "all") {
        // channels is likely jsonb array of { type, link }
        try {
          query = query.contains("channels", [{ type: channel }]);
        } catch {
          // fallback: no-op if backend doesn't support jsonb contains
        }
      }
      if (q && q.trim().length > 0) {
        const like = `%${q}%`;
        query = query.or(
          `name.ilike.${like},slug.ilike.${like},area.ilike.${like}`,
        );
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    return rows.map(mapRowToPod);
  } catch (e) {
    console.warn("[PodsListDataLayer] supabase fetch error", e);
    return [];
  }
}

export default function PodsListDataLayer() {
  const pods = usePodStore((state) => state.pods);
  const setPods = usePodStore((state) => state.setPods);
  const [remotePods, setRemotePods] = useState<PodsListLayoutPod[] | null>(
    null,
  );
  const [loadingRemotePods, setLoadingRemotePods] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function hydrateFromDatabase() {
      setLoadingRemotePods(true);
      try {
        const paramsRecord = Object.fromEntries(
          (searchParams ?? new URLSearchParams()).entries(),
        );
        const filters: ListFilters = {
          q: paramsRecord.q,
          area: paramsRecord.area,
          channel: paramsRecord.channel,
        };
        const result = await fetchPodsFromDatabase(filters);

        if (mounted && result.length > 0) {
          setRemotePods(result);
          // Also hydrate the pod store so other areas can use pods
          const corePods: Pod[] = result.map((row) => ({
            id: String(row.id),
            slug: String(row.slug),
            name: String(row.name),
            area: String(row.area ?? ""),
            channels: Array.isArray(row.channels) ? row.channels : [],
            team: [],
          }));
          setPods(corePods);
        }
      } catch (error) {
        console.warn(
          "PodsListDataLayer: failed to fetch pods from database",
          error,
        );
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
  }, [setPods, searchParams]);

  const podsToDisplay = remotePods && remotePods.length > 0 ? remotePods : pods;
  const normalizedPods = podsToDisplay.map(normalizePod);

  return (
    <PodsListLayout
      pods={normalizedPods}
      initialUrlParams={Object.fromEntries(
        (searchParams ?? new URLSearchParams()).entries(),
      )}
      onUrlChange={(url) => router.replace(url)}
      persistKey={`podsList.filters:${REGION_IDENTIFIER}`}
      emptyState={
        loadingRemotePods ? (
          <p className="text-sm text-muted-foreground">
            Loading pods from database...
          </p>
        ) : undefined
      }
      renderPod={({ pod, DefaultCard }) => (
        <Link href={`/pods/${pod.slug}`}>{DefaultCard}</Link>
      )}
    />
  );
}
