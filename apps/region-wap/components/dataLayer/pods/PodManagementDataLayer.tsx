"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { usePodStore } from "@/providers/PodStoreProvider";
import { Channel, Pod } from "@workspace/store/types/pod.ts";
import { toast } from "sonner";
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
    const response = await fetch(`/api/pods/${encodeURIComponent(slug)}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch pod");
    }

    const { pod } = await response.json();
    if (!pod) return null;

    return mapRowToPod(pod);
  } catch (e) {
    console.warn("[PodManagementDataLayer] fetch error", e);
    return null;
  }
}

// Save via Next.js API so requests show in app logs
async function savePodViaApi(pod: Pod, isExisting: boolean): Promise<Pod> {
  const payload = {
    name: pod.name,
    area: pod.area,
    channels: pod.channels,
  };

  const url = isExisting
    ? `/api/admin/pods/${encodeURIComponent(pod.id)}`
    : `/api/admin/pods`;
  const method = isExisting ? "PATCH" : "POST";
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}) as any);
  if (!res.ok) {
    const message =
      json?.error || `Failed to ${isExisting ? "update" : "create"} pod`;
    throw new Error(message);
  }
  const row = (json as any)?.pod as Pod | null;
  if (!row) throw new Error("Server did not return a pod row");
  return row;
}

async function archivePodViaApi(podId: string): Promise<void> {
  const res = await fetch(`/api/admin/pods/${encodeURIComponent(podId)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}) as any);
    const message = (json as any)?.error || "Failed to archive pod";
    throw new Error(message);
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
    control,
    formState: { errors, isSubmitting },
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
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [errorDetails, setErrorDetails] = React.useState<string | null>(null);

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

  // RHF valid-submit handler (runs after values are captured)
  const onValidSubmit = async (data: FormValues) => {
    const updatedChannels: Channel[] = [
      {
        type: data.channelType,
        link: data.channelLink,
      },
    ];

    const patch = {
      ...data,
      area: data.area?.trim(),
      channels: updatedChannels,
    };
    delete (patch as any).channelType;
    delete (patch as any).channelLink;

    const nextPod = { ...activePod, ...patch };
    const isExisting = Boolean(remotePod);

    try {
      const savedRow = await savePodViaApi(nextPod, isExisting);
      // Clear any previous error state and toast success
      setErrorMessage(null);
      setErrorDetails(null);
      toast.success("Pod saved");

      // Sync local store with saved row
      if (pods.find((p) => p.id === savedRow.id)) {
        updatePod(savedRow.id, savedRow);
      } else {
        addPod(savedRow);
      }

      // If slug changed server-side (e.g., name changed), navigate to new URL
      if (savedRow.slug && savedRow.slug !== slug) {
        router.push(`/pods/${encodeURIComponent(savedRow.slug)}`);
      } else {
        router.refresh();
      }
      return;
    } catch (error: any) {
      console.warn("PodManagementDataLayer: failed to save via API", error);
      const msg = error?.message || "Failed to save pod";
      setErrorMessage(msg);
      setErrorDetails(
        JSON.stringify(
          {
            context: "savePodViaApi",
            submittedInput: data,
            payload: {
              name: nextPod.name,
              area: nextPod.area,
              channels: nextPod.channels,
            },
            message: msg,
          },
          null,
          2,
        ),
      );
      toast.error(msg);
    }
  };

  // Wrapper that blurs the active element BEFORE RHF captures values
  const submitWithBlur: React.FormEventHandler<HTMLFormElement> = (e) => {
    try {
      if (typeof document !== "undefined") {
        const el = document.activeElement as HTMLElement | null;
        el?.blur?.();
      }
    } catch {
      /* no-op */
    }
    return handleSubmit(onValidSubmit)(e);
  };

  const archive = async () => {
    try {
      await archivePodViaApi(activePod.id);
      toast.success("Pod archived");
    } catch (error: any) {
      console.warn("PodManagementDataLayer: failed to archive pod", error);
      const msg = error?.message || "Failed to archive pod";
      setErrorMessage(msg);
      setErrorDetails(
        JSON.stringify(
          { context: "archivePodViaApi", podId: activePod.id, message: msg },
          null,
          2,
        ),
      );
      toast.error(msg);
    }
    removePod(activePod.id);
    router.push("/pods");
  };

  const channelLink = watch("channelLink");
  const channelTypeValue = watch("channelType");
  const currentValues = watch();

  // Some environments reported isDirty not toggling when only updating the
  // recruiting/vetting link. As a fallback, detect deltas against the active pod.
  const hasFormChanges = React.useMemo(() => {
    const primary = activePod.channels?.[0];
    const cleanLink = (v?: string) => (v === "" ? undefined : v);
    return (
      currentValues?.name !== activePod.name ||
      currentValues?.area !== activePod.area ||
      currentValues?.slug !== activePod.slug ||
      currentValues?.channelType !== (primary?.type ?? "Signal") ||
      cleanLink(currentValues?.channelLink) !== cleanLink(primary?.link)
    );
  }, [activePod, currentValues]);

  const nameField = register("name");
  const slugField = register("slug");
  const channelLinkField = register("channelLink");
  const { field: areaField } = useController({ name: "area", control });
  const fieldBindings = {
    name: nameField,
    area: areaField,
    slug: slugField,
    channelLink: channelLinkField,
  } as const;

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
      disableSave={isSubmitting}
      isSubmitting={isSubmitting}
      onBack={() => router.push("/pods")}
      onSubmit={submitWithBlur}
      onArchive={archive}
      rosterHref={rosterHref}
      shiftsHref={shiftsHref}
      LinkComponent={Link}
      errorMessage={errorMessage ?? undefined}
      errorDetails={errorDetails ?? undefined}
      loadingMessage={
        loadingRemotePod ? "Loading pod from database..." : undefined
      }
    />
  );
}
