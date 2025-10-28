"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { usePodStore } from "@/providers/PodStoreProvider";
import { Channel, Pod } from "@workspace/store/types/pod.ts";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import {
  PodManagementLayout,
  PodManagementLayoutErrors,
} from "@workspace/ui/layout/pods/PodManagementLayout";

// Schema uses new channels model
const schema = z.object({
  name: z.string().min(2).max(60),
  area: z.string().min(2),
  slug: z.string().min(6).regex(/^pod-[a-z0-9-]+$/),
  channelType: z.enum(["Signal", "Matrix", "LoRa"]),
  channelLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

type FormValues = z.infer<typeof schema>;
const channelTypes: Channel["type"][] = ["Signal", "Matrix", "LoRa"];

function mapRowToPod(row: any): Pod {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name ?? ""),
    area: String(row.area ?? ""),
    channels: Array.isArray(row.channels) ? row.channels : [],
    team: Array.isArray(row.team) ? row.team : [],
  };
}

async function fetchPodFromDatabase(slug: string): Promise<Pod | null> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client
      .from("pods")
      .select("id, slug, name, area, channels")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapRowToPod(data);
  } catch (e) {
    console.warn("[PodManagementDataLayer] supabase fetch error", e);
    return null;
  }
}

async function persistPodToDatabase(pod: Pod): Promise<void> {
  try {
    const client = getSupabaseBrowserClient();
    const payload = {
      id: pod.id,
      slug: pod.slug,
      name: pod.name,
      area: pod.area,
      channels: pod.channels,
    };
    const { error } = await client.from("pods").upsert(payload);
    if (error) throw error;
  } catch (e: any) {
    throw new Error(e?.message ?? "Failed to save pod");
  }
}

async function archivePodInDatabase(podId: string): Promise<void> {
  try {
    const client = getSupabaseBrowserClient();
    const { error } = await client.from("pods").delete().eq("id", podId);
    if (error) throw error;
  } catch (e: any) {
    throw new Error(e?.message ?? "Failed to archive pod");
  }
}

export default function PodManagementDataLayer() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id ?? "");

  const pods = usePodStore((state) => state.pods);
  const addPod = usePodStore((state) => state.addPod);
  const updatePod = usePodStore((state) => state.updatePod);
  const removePod = usePodStore((state) => state.removePod);
  const storePod = pods.find((p) => p.slug === id);

  const fallbackPod = React.useMemo<Pod>(
    () => ({
      id: crypto.randomUUID(),
      slug: id.startsWith("pod-") ? id : `pod-${id}`,
      name: "",
      area: "",
      channels: [{ type: "Signal" as Channel["type"], link: "" }],
      team: [],
    }),
    [id]
  );

  const initialPod = storePod ?? fallbackPod;
  const initialPrimaryChannel = initialPod.channels[0];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialPod.name,
      area: initialPod.area,
      slug: initialPod.slug,
      channelType: initialPrimaryChannel?.type ?? "Signal",
      channelLink: initialPrimaryChannel?.link ?? "",
    },
    mode: "onChange",
  });

  const [remotePod, setRemotePod] = React.useState<Pod | null>(null);
  const [loadingRemotePod, setLoadingRemotePod] = React.useState(false);

  const slug = watch("slug");
  React.useEffect(() => {
    if (!slug.startsWith("pod-")) {
      setValue("slug", `pod-${slug.replace(/^pod-/, "")}`, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [slug, setValue]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadRemotePod() {
      if (!id) return;

      setLoadingRemotePod(true);
      try {
        const result = await fetchPodFromDatabase(id);
        if (!cancelled && result) {
          setRemotePod(result);
          const channel = result.channels[0];
          reset(
            {
              name: result.name,
              area: result.area,
              slug: result.slug,
              channelType: channel?.type ?? "Signal",
              channelLink: channel?.link ?? "",
            },
            { keepDirty: false }
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("PodManagementDataLayer: failed to fetch pod", error);
        }
      } finally {
        if (!cancelled) {
          setLoadingRemotePod(false);
        }
      }
    }

    loadRemotePod();
    return () => {
      cancelled = true;
    };
  }, [id, reset]);

  const activePod = remotePod ?? storePod ?? fallbackPod;

  const onSubmit = async (data: FormValues) => {
    const updatedChannels: Channel[] = [
      {
        type: data.channelType,
        link: data.channelLink,
      },
    ];

    const patch = { ...data, channels: updatedChannels };
    delete (patch as any).channelType;
    delete (patch as any).channelLink;

    const nextPod = { ...activePod, ...patch };

    try {
      await persistPodToDatabase(nextPod);
    } catch (error) {
      console.warn("PodManagementDataLayer: failed to persist pod", error);
    }

    if (pods.find((p) => p.id === activePod.id)) {
      updatePod(activePod.id, patch);
    } else {
      addPod(nextPod);
    }
    router.push("/pods");
  };

  const archive = async () => {
    try {
      await archivePodInDatabase(activePod.id);
    } catch (error) {
      console.warn("PodManagementDataLayer: failed to archive pod", error);
    }
    removePod(activePod.id);
    router.push("/pods");
  };

  const channelLink = watch("channelLink");
  const channelTypeValue = watch("channelType");

  const fieldBindings = React.useMemo(
    () => ({
      name: register("name"),
      area: register("area"),
      slug: register("slug"),
      channelLink: register("channelLink"),
    }),
    [register]
  );

  const formErrors: PodManagementLayoutErrors = {
    name: errors.name?.message,
    area: errors.area?.message,
    slug: errors.slug?.message,
    channelType: errors.channelType?.message,
    channelLink: errors.channelLink?.message,
  };

  const rosterHref = `/pods/${slug}/roster`;
  const shiftsHref = `/pods/${slug}/shifts`;

  return (
    <PodManagementLayout
      fieldBindings={fieldBindings}
      channelType={{
        value: channelTypeValue,
        onChange: (value) =>
          setValue("channelType", value as FormValues["channelType"], {
            shouldValidate: true,
            shouldDirty: true,
          }),
        options: channelTypes,
        error: formErrors.channelType,
      }}
      channelLinkValue={channelLink}
      errors={formErrors}
      disableSave={!isDirty || isSubmitting}
      isSubmitting={isSubmitting}
      onBack={() => router.push("/pods")}
      onSubmit={handleSubmit(onSubmit)}
      onArchive={archive}
      rosterHref={rosterHref}
      shiftsHref={shiftsHref}
      LinkComponent={Link}
      loadingMessage={
        loadingRemotePod ? "Loading pod from database..." : undefined
      }
    />
  );
}
