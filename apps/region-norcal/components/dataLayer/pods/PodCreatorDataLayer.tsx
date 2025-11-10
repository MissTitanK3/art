"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { usePodStore } from "@/providers/PodStoreProvider";
import { channels, slugify, Pod } from "@workspace/store/types/pod.ts";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import {
  PodCreatorLayout,
  PodCreatorLayoutErrors,
} from "@workspace/ui/layout/pods/PodCreatorLayout";

const schema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Keep it under 50 characters")
    .regex(
      /^[\p{L}\p{N}\s'’-]+$/u,
      "Only letters, numbers, spaces, and - ’ allowed",
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

async function createPodInDatabase(pod: Pod): Promise<void> {
  try {
    const client = getSupabaseBrowserClient();
    const payload = {
      id: pod.id,
      slug: pod.slug,
      name: pod.name,
      area: pod.area,
      channels: pod.channels,
    };
    const { error } = await client.from("pods").insert(payload);
    if (error) throw error;
  } catch (e: any) {
    throw new Error(e?.message ?? "Failed to create pod");
  }
}

export default function PodCreatorDataLayer() {
  const addPod = usePodStore((state) => state.addPod);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { name: "", area: "", channel: "Signal" },
  });

  const name = watch("name");
  const channel = watch("channel");
  const liveSlug = slugify(name);

  const onSubmit = async (values: z.infer<typeof schema>) => {
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
      await createPodInDatabase(payload);
    } catch (error) {
      console.warn("PodCreatorDataLayer: failed to persist pod", error);
    }

    addPod(payload);
    router.push(`/pods/${payload.slug}`);
  };

  const fieldBindings = React.useMemo(
    () => ({
      name: register("name"),
      area: register("area"),
      channelLink: register("channelLink"),
    }),
    [register],
  );

  const formErrors: PodCreatorLayoutErrors = {
    name: errors.name?.message,
    area: errors.area?.message,
    channel: errors.channel?.message,
    channelLink: errors.channelLink?.message,
  };

  return (
    <PodCreatorLayout
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
      onSubmit={handleSubmit(onSubmit)}
    />
  );
}
