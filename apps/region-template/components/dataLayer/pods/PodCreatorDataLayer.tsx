"use client";

import * as React from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";   // ✅ import router

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { usePodsStore } from "@workspace/store/podStore";
import { channels, slugify } from '@workspace/store/types/pod.ts'

const schema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Keep it under 50 characters")
    .regex(/^[\p{L}\p{N}\s'’-]+$/u, "Only letters, numbers, spaces, and - ’ allowed"),
  area: z
    .string()
    .min(3, "Coverage area is required")
    .max(80, "Keep it under 80 characters"),
  channel: z.enum(channels, { required_error: "Select a primary channel" }),
  channelLink: z.string().url("Must be a valid URL").min(5, "Link is required").optional(),
});

export default function PodCreatorDataLayer() {
  const addPod = usePodsStore((s) => s.addPod);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { name: "", area: "", channel: "Signal" },
  });

  const name = watch("name");
  const liveSlug = slugify(name);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const payload = {
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

    addPod(payload);
    router.push(`/pods/${payload.slug}`);
  };

  return (
    <section className="max-w-xl">
      <h1 className="text-2xl font-bold">Create Pod</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4">
        {/* Pod Name */}
        <div className="grid gap-1">
          <Label htmlFor="pod-name">Pod Name</Label>
          <Input
            id="pod-name"
            placeholder="e.g., Downtown, Eastside Court Watch"
            {...register("name")}
            aria-invalid={!!errors.name}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Slug: <code className="select-all">{liveSlug || "—"}</code>
            </span>
            <span>{name.length}/50</span>
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        {/* Coverage Area */}
        <div className="grid gap-1">
          <Label htmlFor="pod-area">Coverage Area</Label>
          <Input
            id="pod-area"
            placeholder="Neighborhood, district, or courthouse"
            {...register("area")}
            aria-invalid={!!errors.area}
          />
          {errors.area && <p className="text-xs text-destructive">{errors.area.message}</p>}
        </div>

        {/* Primary Channel */}
        <div className="grid gap-1">
          <Label htmlFor="pod-channel">Primary Channel</Label>
          <Controller
            name="channel"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="pod-channel"
                  className={cn("w-[220px]", errors.channel && "ring-1 ring-destructive")}
                >
                  <SelectValue placeholder="Select a channel…" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.channel && <p className="text-xs text-destructive">{errors.channel.message}</p>}
        </div>

        {/* Channel Link */}
        <div className="grid gap-1">
          <Label htmlFor="pod-channel-link">Channel Link</Label>
          <Input
            id="pod-channel-link"
            placeholder="https://signal.group/…"
            {...register("channelLink")}
            aria-invalid={!!errors.channelLink}
          />
          {errors.channelLink && (
            <p className="text-xs text-destructive">{errors.channelLink.message}</p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={!isValid || isSubmitting} className="min-w-24">
            {isSubmitting ? "Creating…" : "Create Pod"}
          </Button>
        </div>
      </form>
    </section>
  );
}
