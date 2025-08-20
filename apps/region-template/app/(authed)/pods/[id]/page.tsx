"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { ExternalLink, ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

import { usePodStore, Channel } from "@/lib/podStore";

const schema = z.object({
  name: z.string().min(2).max(60),
  area: z.string().min(2),
  slug: z.string().min(6).regex(/^pod-[a-z0-9-]+$/),
  channel: z.enum(["Signal", "Matrix", "LoRa"]),
  channelLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

type FormValues = z.infer<typeof schema>;
const channels: Channel[] = ["Signal", "Matrix", "LoRa"];

export default function PodManagementPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id ?? "");

  const { pods, addPod, updatePod, removePod } = usePodStore();

  const existing = pods.find((p) => p.slug === id) ?? {
    id: crypto.randomUUID(),
    slug: id.startsWith("pod-") ? id : `pod-${id}`,
    name: "",
    area: "",
    channel: "Signal" as Channel,
    channelLink: "",
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: existing.name,
      area: existing.area,
      slug: existing.slug,
      channel: existing.channel,
      channelLink: existing.channelLink ?? "",
    },
    mode: "onChange",
  });

  const slug = watch("slug");
  React.useEffect(() => {
    if (!slug.startsWith("pod-")) {
      setValue("slug", `pod-${slug.replace(/^pod-/, "")}`, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [slug, setValue]);

  const onSubmit = (data: FormValues) => {
    if (pods.find((p) => p.id === existing.id)) {
      updatePod(existing.id, data);
    } else {
      addPod({ ...existing, ...data });
    }
    router.push("/pods");
  };

  const archive = () => {
    removePod(existing.id);
    router.push("/pods");
  };

  const channelLink = watch("channelLink");

  return (
    <section className="mx-auto w-full max-w-4xl sm:px-4">
      {/* Top bar */}
      <div className="flex items-center gap-2 py-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />
        <h1 className="truncate text-xl font-bold sm:text-2xl">Manage Pod</h1>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        Edit pod details and recruiting link. Slug is public and must start with <span className="font-mono">pod-</span>.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-6 pb-5 md:pb-0">
        <Card className="grid gap-4 p-3 sm:p-4">
          {/* Name */}
          <div className="grid gap-1">
            <Label htmlFor="pod-name">Pod Name</Label>
            <Input id="pod-name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Area */}
          <div className="grid gap-1">
            <Label htmlFor="pod-area">Coverage Area</Label>
            <Input
              id="pod-area"
              placeholder="e.g., Core & East Bay"
              {...register("area")}
              aria-invalid={!!errors.area}
              className={cn("w-full", errors.area && "ring-1 ring-destructive")}
            />
            {errors.area && <p className="text-xs text-destructive">{errors.area.message}</p>}
          </div>

          {/* Slug */}
          <div className="grid gap-1">
            <Label htmlFor="pod-slug">Public Slug</Label>
            <Input
              id="pod-slug"
              placeholder="pod-downtown"
              {...register("slug")}
              aria-invalid={!!errors.slug}
              className={cn("w-full font-mono", errors.slug && "ring-1 ring-destructive")}
            />
            <p className="text-xs text-muted-foreground">Used in URLs and cards. Lowercase, numbers, and hyphens only.</p>
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>

          {/* Channel */}
          <div className="grid gap-1">
            <Label htmlFor="pod-channel">Primary Channel</Label>
            <Select
              value={watch("channel")}
              onValueChange={(v) =>
                setValue("channel", v as Channel, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
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
            {errors.channel && <p className="text-xs text-destructive">{errors.channel.message}</p>}
          </div>

          {/* Channel Link */}
          <div className="grid gap-1">
            <Label htmlFor="pod-channel-link">Recruiting/Vetting Link</Label>
            <Input
              id="pod-channel-link"
              placeholder="https://signal.group/#… or https://matrix.to/#/…"
              {...register("channelLink")}
              aria-invalid={!!errors.channelLink}
              className={cn("w-full", errors.channelLink && "ring-1 ring-destructive")}
            />
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">Public</Badge>
              {channelLink ? (
                <a
                  className="inline-flex items-center text-sm underline underline-offset-4"
                  href={channelLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open recruiting link
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">No link set</span>
              )}
            </div>
            {errors.channelLink && <p className="text-xs text-destructive">{errors.channelLink.message}</p>}
          </div>
        </Card>

        {/* Desktop toolbar */}
        <div className="hidden items-center gap-2 md:flex">
          <Button type="button" variant="destructive" onClick={archive} title="Archive or deactivate this pod (no‑op)">
            <Trash2 className="mr-2 h-4 w-4" />
            Archive
          </Button>
          <div className="ml-auto" />
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>

      <Separator className="my-6 hidden md:block" />

      {/* Future sections */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link href={`/pods/${slug}/roster`}>
          <Card className="p-4">
            <h2 className="font-semibold">Roster</h2>
            <p className="text-sm text-muted-foreground">View/manage local roster (region‑siloed).</p>
          </Card>
        </Link>
        <Link href={`/pods/${slug}/shifts`}>
          <Card className="p-4">
            <h2 className="font-semibold">Shifts</h2>
            <p className="text-sm text-muted-foreground">Configure pod shifts and availability. (Placeholder)</p>
          </Card>
        </Link>
      </div>
      <div className="h-[76px] md:hidden" aria-hidden />
      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex w-full max-w-4xl gap-2">
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button type="button" variant="destructive" onClick={archive}>
            <Trash2 className="mr-2 h-4 w-4" />
            Archive
          </Button>
        </div>
      </div>

    </section>
  );
}
