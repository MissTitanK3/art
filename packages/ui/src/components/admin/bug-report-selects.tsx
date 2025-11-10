import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

export type BugStatus =
  | "open"
  | "triage"
  | "in_progress"
  | "resolved"
  | "closed";
export type BugPriority = "low" | "medium" | "high" | "critical" | null;
export type BugArea =
  | "general"
  | "create"
  | "dispatches"
  | "watch"
  | "schedules"
  | "pods"
  | "academy"
  | "intents"
  | "roles"
  | "impact"
  | "missing-persons"
  | "profile"
  | "admin"
  | "auth";

type BaseProps = {
  className?: string;
  triggerClassName?: string;
};

type StatusProps = BaseProps & {
  value: BugStatus;
  onChange: (v: BugStatus) => void;
  label?: React.ReactNode;
};

export function BugStatusSelect({
  value,
  onChange,
  className,
  triggerClassName,
  label = "Status",
}: StatusProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as BugStatus)}>
        <SelectTrigger className={cn("w-60", triggerClassName)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="triage">Triage</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

type PriorityProps = BaseProps & {
  value: BugPriority;
  onChange: (v: BugPriority) => void;
  label?: React.ReactNode;
  includeNone?: boolean;
};

export function BugPrioritySelect({
  value,
  onChange,
  className,
  triggerClassName,
  label = "Priority",
  includeNone = true,
}: PriorityProps) {
  const computedValue = value ?? (includeNone ? "none" : "");
  return (
    <div className={cn("grid gap-2", className)}>
      <Label>{label}</Label>
      <Select
        value={computedValue as string}
        onValueChange={(v) =>
          onChange(v === "none" ? null : (v as Exclude<BugPriority, null>))
        }
      >
        <SelectTrigger className={cn("w-60", triggerClassName)}>
          <SelectValue placeholder={includeNone ? "None" : undefined} />
        </SelectTrigger>
        <SelectContent>
          {includeNone && <SelectItem value="none">None</SelectItem>}
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

type StatusFilterProps = BaseProps & {
  value: BugStatus | undefined;
  onChange: (v: BugStatus | undefined) => void;
  label?: React.ReactNode;
};

export function BugStatusFilterSelect({
  value,
  onChange,
  className,
  triggerClassName,
  label = "Status",
}: StatusFilterProps) {
  const computedValue = value ?? "all";
  return (
    <div className={cn("min-w-48", className)}>
      <Label className="sr-only">{label}</Label>
      <Select
        value={computedValue}
        onValueChange={(v) =>
          onChange(v === "all" ? undefined : (v as BugStatus))
        }
      >
        <SelectTrigger className={cn("w-48", triggerClassName)}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="triage">Triage</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

type AreaSelectProps = BaseProps & {
  value: BugArea | undefined;
  onChange: (v: BugArea | undefined) => void;
  label?: React.ReactNode;
  includeAll?: boolean;
  srOnlyLabel?: boolean;
};

export function BugAreaSelect({
  value,
  onChange,
  className,
  triggerClassName,
  label = "Area",
  includeAll = true,
  srOnlyLabel = true,
}: AreaSelectProps) {
  const computedValue = value ?? (includeAll ? "all" : "");
  return (
    <div className={cn("min-w-48", className)}>
      <Label className={srOnlyLabel ? "sr-only" : undefined}>{label}</Label>
      <Select
        value={computedValue as string}
        onValueChange={(v) =>
          onChange(v === "all" ? undefined : (v as BugArea))
        }
      >
        <SelectTrigger className={cn("w-48", triggerClassName)}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {includeAll && <SelectItem value="all">All</SelectItem>}
          <SelectItem value="general">General</SelectItem>
          <SelectItem value="create">Create</SelectItem>
          <SelectItem value="dispatches">Dispatch Map</SelectItem>
          <SelectItem value="watch">Community Watch</SelectItem>
          <SelectItem value="schedules">Coverage Schedules</SelectItem>
          <SelectItem value="pods">Pods</SelectItem>
          <SelectItem value="academy">Academy</SelectItem>
          <SelectItem value="intents">Intents</SelectItem>
          <SelectItem value="roles">Roles</SelectItem>
          <SelectItem value="impact">Impact</SelectItem>
          <SelectItem value="missing-persons">Missing Persons</SelectItem>
          <SelectItem value="profile">My Profile</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="auth">Auth / Sign-in</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
