import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

type RegisteredFieldBinding = {
  name: string;
  onBlur?: (...args: any[]) => void;
  onChange?: (...args: any[]) => void;
  ref: React.RefCallback<HTMLInputElement>;
  [key: string]: unknown;
};

type ChannelFieldBinding = {
  value: string;
  onChange: (value: string) => void;
};

export type PodCreatorLayoutErrors = Partial<{
  name: string;
  area: string;
  channel: string;
  channelLink: string;
}>;

export type PodCreatorLayoutProps = {
  heading?: React.ReactNode;
  formId?: string;
  fieldBindings: {
    name: RegisteredFieldBinding;
    area: RegisteredFieldBinding;
    channelLink: RegisteredFieldBinding;
  };
  channelField: ChannelFieldBinding;
  channelOptions: string[];
  liveSlug: string;
  nameLength: number;
  maxNameLength: number;
  isSubmitting: boolean;
  submitDisabled: boolean;
  errors?: PodCreatorLayoutErrors;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  submitLabel?: string;
  description?: React.ReactNode;
};

export function PodCreatorLayout({
  heading = <h1 className="text-2xl font-bold">Create Pod</h1>,
  formId = "pod-creator-form",
  fieldBindings,
  channelField,
  channelOptions,
  liveSlug,
  nameLength,
  maxNameLength,
  isSubmitting,
  submitDisabled,
  errors,
  onSubmit,
  submitLabel = "Create Pod",
  description,
}: PodCreatorLayoutProps) {
  return (
    <section className="max-w-xl">
      {heading}
      {description}
      <form id={formId} onSubmit={onSubmit} className="mt-4 grid gap-4">
        <div className="grid gap-1">
          <Label htmlFor="pod-name">Pod Name</Label>
          <Input id="pod-name" placeholder="e.g., Downtown" {...fieldBindings.name} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Slug: <code className="select-all">{liveSlug || "—"}</code>
            </span>
            <span>
              {nameLength}/{maxNameLength}
            </span>
          </div>
          {errors?.name ? (
            <p className="text-xs text-destructive">{errors.name}</p>
          ) : null}
        </div>

        <div className="grid gap-1">
          <Label htmlFor="pod-area">Coverage Area</Label>
          <Input
            id="pod-area"
            placeholder="Neighborhood, district, or courthouse"
            {...fieldBindings.area}
            className={cn(errors?.area ? "ring-1 ring-destructive" : undefined, "w-full")}
          />
          {errors?.area ? (
            <p className="text-xs text-destructive">{errors.area}</p>
          ) : null}
        </div>

        <div className="grid gap-1">
          <Label htmlFor="pod-channel">Primary Channel</Label>
          <Select value={channelField.value} onValueChange={channelField.onChange}>
            <SelectTrigger
              id="pod-channel"
              className={cn("w-[220px]", errors?.channel ? "ring-1 ring-destructive" : undefined)}
            >
              <SelectValue placeholder="Select a channel…" />
            </SelectTrigger>
            <SelectContent>
              {channelOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.channel ? (
            <p className="text-xs text-destructive">{errors.channel}</p>
          ) : null}
        </div>

        <div className="grid gap-1">
          <Label htmlFor="pod-channel-link">Channel Link</Label>
          <Input
            id="pod-channel-link"
            placeholder="https://signal.group/…"
            {...fieldBindings.channelLink}
            className={cn(errors?.channelLink ? "ring-1 ring-destructive" : undefined, "w-full")}
          />
          {errors?.channelLink ? (
            <p className="text-xs text-destructive">{errors.channelLink}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={submitDisabled} className="min-w-24">
            {isSubmitting ? "Creating…" : submitLabel}
          </Button>
        </div>
      </form>
    </section>
  );
}

export default PodCreatorLayout;
