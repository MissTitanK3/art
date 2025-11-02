import React, { FormEventHandler, ReactNode } from "react";
import { ArrowLeft, ExternalLink, Save, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";

type RegisteredFieldBinding = {
  name: string;
  onBlur?: (...args: any[]) => void;
  onChange?: (...args: any[]) => void;
  ref: React.RefCallback<HTMLInputElement>;
  [key: string]: unknown;
};

export type PodManagementLayoutFieldBindings = {
  name: RegisteredFieldBinding;
  area: RegisteredFieldBinding;
  slug: RegisteredFieldBinding;
  channelLink: RegisteredFieldBinding;
};

export type PodManagementLayoutErrors = Partial<{
  name: string;
  area: string;
  slug: string;
  channelType: string;
  channelLink: string;
}>;

type LinkComponentProps = {
  href: string;
  children: ReactNode;
};

type PodManagementLayoutProps = {
  fieldBindings: PodManagementLayoutFieldBindings;
  channelType: {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    error?: string;
  };
  channelLinkValue?: string;
  errors?: PodManagementLayoutErrors;
  disableSave: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onArchive: () => void | Promise<void>;
  rosterHref: string;
  shiftsHref: string;
  LinkComponent?: React.ComponentType<LinkComponentProps>;
  title?: ReactNode;
  description?: ReactNode;
  archiveDisabled?: boolean;
  loadingMessage?: ReactNode;
  errorMessage?: ReactNode;
  errorDetails?: ReactNode;
};

const DefaultLinkComponent: React.FC<LinkComponentProps> = ({
  href,
  children,
}) => <a href={href}>{children}</a>;

export function PodManagementLayout({
  fieldBindings,
  channelType,
  channelLinkValue,
  errors,
  disableSave,
  isSubmitting,
  onBack,
  onSubmit,
  onArchive,
  rosterHref,
  shiftsHref,
  LinkComponent = DefaultLinkComponent,
  title = "Manage Pod",
  description = (
    <p className="mt-1 text-sm text-muted-foreground">
      Edit pod details and recruiting link. Slug is public and must start with{" "}
      <span className="font-mono">pod-</span>.
    </p>
  ),
  archiveDisabled,
  loadingMessage,
  errorMessage,
  errorDetails,
}: PodManagementLayoutProps) {
  const channelLinkError = errors?.channelLink;
  const [showDebug, setShowDebug] = React.useState(false);

  return (
    <section className="mx-auto w-full max-w-4xl sm:px-4">
      <div className="flex items-center gap-2 py-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <Separator
          orientation="vertical"
          className="mx-1 hidden h-5 sm:block"
        />
        <h1 className="truncate text-xl font-bold sm:text-2xl">{title}</h1>
      </div>

      {description}

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium">{errorMessage}</p>
            {errorDetails ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDebug((v) => !v)}
              >
                {showDebug ? "Hide details" : "Show details"}
              </Button>
            ) : null}
          </div>
          {showDebug && errorDetails ? (
            <pre className="mt-2 max-h-56 overflow-auto rounded bg-background p-2 text-xs text-foreground/80">
{String(errorDetails)}
            </pre>
          ) : null}
        </div>
      ) : null}

      

      <form
        id="pod-management-form"
        onSubmit={onSubmit}
        className="mt-4 grid gap-6 pb-5 md:pb-0"
      >
        <Card className="grid gap-4 p-3 sm:p-4">
          <div className="grid gap-1">
            <Label htmlFor="pod-name">Pod Name</Label>
            <Input id="pod-name" {...fieldBindings.name} />
            {errors?.name ? (
              <p className="text-xs text-destructive">{errors.name}</p>
            ) : null}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="pod-area">Coverage Area</Label>
            <Input
              id="pod-area"
              placeholder="e.g., Core & East Bay"
              aria-invalid={Boolean(errors?.area)}
              className={cn(
                "w-full",
                errors?.area ? "ring-1 ring-destructive" : undefined
              )}
              {...fieldBindings.area}
            />
            {errors?.area ? (
              <p className="text-xs text-destructive">{errors.area}</p>
            ) : null}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="pod-slug">Public Slug</Label>
            <Input
              id="pod-slug"
              placeholder="pod-downtown"
              aria-invalid={Boolean(errors?.slug)}
              className={cn(
                "w-full font-mono",
                errors?.slug ? "ring-1 ring-destructive" : undefined
              )}
              {...fieldBindings.slug}
            />
            <p className="text-xs text-muted-foreground">
              Used in URLs and cards. Lowercase, numbers, and hyphens only.
            </p>
            {errors?.slug ? (
              <p className="text-xs text-destructive">{errors.slug}</p>
            ) : null}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="pod-channel">Primary Channel</Label>
            <Select
              value={channelType.value}
              onValueChange={channelType.onChange}
            >
              <SelectTrigger
                id="pod-channel"
                className={cn(
                  "w-[220px]",
                  channelType.error ? "ring-1 ring-destructive" : undefined
                )}
              >
                <SelectValue placeholder="Select a channel…" />
              </SelectTrigger>
              <SelectContent>
                {channelType.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {channelType.error ? (
              <p className="text-xs text-destructive">{channelType.error}</p>
            ) : null}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="pod-channel-link">Recruiting/Vetting Link</Label>
            <Input
              id="pod-channel-link"
              placeholder="https://signal.group/#… or https://matrix.to/#/…"
              aria-invalid={Boolean(channelLinkError)}
              className={cn(
                "w-full",
                channelLinkError ? "ring-1 ring-destructive" : undefined
              )}
              {...fieldBindings.channelLink}
            />
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Public
              </Badge>
              {channelLinkValue ? (
                <a
                  className="inline-flex items-center text-sm underline underline-offset-4"
                  href={channelLinkValue}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open recruiting link
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">
                  No link set
                </span>
              )}
            </div>
            {channelLinkError ? (
              <p className="text-xs text-destructive">{channelLinkError}</p>
            ) : null}
          </div>
        </Card>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            type="button"
            variant="destructive"
            onClick={onArchive}
            title="Archive or deactivate this pod"
            disabled={archiveDisabled}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Archive
          </Button>
          <div className="ml-auto" />
          <Button type="submit" disabled={disableSave}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>

      <Separator className="my-6 hidden md:block" />

      {loadingMessage ? (
        <div className="text-sm text-muted-foreground">{loadingMessage}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LinkComponent href={rosterHref}>
          <Card className="p-4">
            <h2 className="font-semibold">Roster</h2>
            <p className="text-sm text-muted-foreground">
              View/manage local roster (region-siloed).
            </p>
          </Card>
        </LinkComponent>
        <LinkComponent href={shiftsHref}>
          <Card className="p-4">
            <h2 className="font-semibold">Shifts</h2>
            <p className="text-sm text-muted-foreground">
              Configure pod shifts and availability.
            </p>
          </Card>
        </LinkComponent>
      </div>

      <div className="h-[76px] md:hidden" aria-hidden />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex w-full max-w-4xl gap-2">
          <Button type="submit" form="pod-management-form" disabled={disableSave}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onArchive}
            disabled={archiveDisabled}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Archive
          </Button>
        </div>
      </div>
    </section>
  );
}

export default PodManagementLayout;
