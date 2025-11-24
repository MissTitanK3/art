"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodsListLayout } from "@workspace/ui/layout/pods/PodsListLayout";
import type { PodsListLayoutPod } from "@workspace/ui/layout/pods/PodsListLayout";
import {
  PodCreatorLayout,
  PodCreatorLayoutErrors,
} from "@workspace/ui/layout/pods/PodCreatorLayout";
import { usePodStore } from "@/providers/PodStoreProvider";
import type { Pod } from "@workspace/store/types/pod.ts";
import { channels, slugify } from "@workspace/store/types/pod.ts";
import { REGION_IDENTIFIER } from "@/app/brand_settings";

const podCreationSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Keep it under 50 characters")
    .regex(
      /^[\p{L}\p{N}\s''-]+$/u,
      "Only letters, numbers, spaces, and - ' allowed",
    ),
  area: z
    .string()
    .min(3, "Coverage area is required")
    .max(80, "Keep it under 80 characters"),
  channel: z.enum(channels, { required_error: "Select a primary channel" }),
  channelLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});


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
    const params = new URLSearchParams();

    if (filters) {
      if (filters.q) params.set("q", filters.q);
      if (filters.area && filters.area !== "all") params.set("area", filters.area);
      if (filters.channel && filters.channel !== "all") params.set("channel", filters.channel);
    }

    const url = `/api/pods${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch pods");
    }

    const { pods } = await response.json();
    const rows = Array.isArray(pods) ? pods : [];
    return rows.map(mapRowToPod);
  } catch (e) {
    console.warn("[PodsListDataLayer] fetch error", e);
    return [];
  }
}

export default function PodsListDataLayer() {
  const pods = usePodStore((state) => state.pods);
  const setPods = usePodStore((state) => state.setPods);
  const addPod = usePodStore((state) => state.addPod);
  const [remotePods, setRemotePods] = useState<PodsListLayoutPod[] | null>(
    null,
  );
  const [loadingRemotePods, setLoadingRemotePods] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Pod creation form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<z.infer<typeof podCreationSchema>>({
    resolver: zodResolver(podCreationSchema),
    mode: "onChange",
    defaultValues: { name: "", area: "", channel: "Signal" },
  });

  const name = watch("name");
  const channel = watch("channel");
  const liveSlug = slugify(name);

  const onSubmitPodCreation = async (
    values: z.infer<typeof podCreationSchema>,
  ) => {
    const payload: Pod = {
      id: crypto.randomUUID(),
      slug: slugify(values.name),
      name: values.name.trim(),
      area: values.area.trim(),
      channels: [
        {
          type: values.channel,
          ...(values.channelLink ? { link: values.channelLink } : {}),
        },
      ],
      team: [],
    };

    try {
      const response = await fetch("/api/admin/pods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          area: payload.area,
          channels: payload.channels,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create pod");
      }

      const { pod } = await response.json();
      addPod(pod || payload);
      setIsCreatorModalOpen(false);
      reset();
      router.push(`/pods/${(pod || payload).slug}`);
    } catch (error) {
      console.warn("PodsListDataLayer: failed to persist pod", error);
      // Still add to local store and navigate even if API fails
      addPod(payload);
      setIsCreatorModalOpen(false);
      reset();
      router.push(`/pods/${payload.slug}`);
    }
  };

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

  const fieldBindings = {
    name: register("name"),
    area: register("area"),
    channelLink: register("channelLink"),
  };

  const formErrors: PodCreatorLayoutErrors = {
    name: errors.name?.message,
    area: errors.area?.message,
    channel: errors.channel?.message,
    channelLink: errors.channelLink?.message,
  };

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
      createPodModal={{
        isOpen: isCreatorModalOpen,
        onOpenChange: setIsCreatorModalOpen,
        content: (
          <PodCreatorLayout
            heading={null}
            fieldBindings={fieldBindings}
            channelField={{
              value: channel,
              onChange: (value) =>
                setValue("channel", value as (typeof channels)[number], {
                  shouldValidate: true,
                  shouldDirty: true,
                }),
            }}
            channelOptions={[...channels]}
            liveSlug={liveSlug}
            nameLength={name.length}
            maxNameLength={50}
            isSubmitting={isSubmitting}
            submitDisabled={!isDirty || !isValid || isSubmitting}
            errors={formErrors}
            onSubmit={handleSubmit(onSubmitPodCreation)}
          />
        ),
      }}
    />
  );
}
