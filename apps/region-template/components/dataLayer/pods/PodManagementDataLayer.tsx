"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { usePodStore } from "@/providers/PodStoreProvider";
import { Channel, Pod } from "@workspace/store/types/pod.ts";
import {
  PodManagementLayout,
  PodManagementLayoutErrors,
} from "@workspace/ui/layout/pods/PodManagementLayout";

// Schema uses new channels model
const schema = z.object({
  name: z.string().min(2).max(60),
  area: z.string().min(2),
  slug: z
    .string()
    .min(6)
    .regex(/^pod-[a-z0-9-]+$/),
  channelType: z.enum(["Signal", "Matrix", "LoRa"]),
  channelLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

type FormValues = z.infer<typeof schema>;
const channelTypes: Channel["type"][] = ["Signal", "Matrix", "LoRa"];

async function fetchPodFromDatabase(slug: string): Promise<Pod | null> {
  console.log("Fetching pod from database for slug:", slug);
  // TODO: replace with real database integration (e.g., Supabase, Hasura, direct SQL).
  // Example:
  // const client = createSupabaseClient();
  // const { data, error } = await client.from("pods").select("*").eq("slug", slug).single();
  // if (error) throw error;
  // return mapRowToPod(data);
  await Promise.resolve();
  return null;
}

async function persistPodToDatabase(pod: Pod): Promise<void> {
  console.log("Persisting pod to database:", pod);
  // TODO: replace with real persistence (insert/update) once database is available.
  // Example:
  // await client.from("pods").upsert(transformPodForInsert(pod));
  await Promise.resolve();
}

async function archivePodInDatabase(podId: string): Promise<void> {
  console.log("Archiving pod in database with id:", podId);
  // TODO: replace with real archive/delete implementation.
  // Example:
  // await client.from("pods").delete().eq("id", podId);
  await Promise.resolve();
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
    [id],
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
            { keepDirty: false },
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
    [register],
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
      onBack={() => router.back()}
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
