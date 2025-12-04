"use client";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { RosterEntry } from "@workspace/store/types/pod.ts";
import type {
  DispatchVolunteerHoursResponse,
  VolunteerAttribution,
} from "@workspace/store/types/dispatch.ts";
import { Button } from "@workspace/ui/primitives/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Input } from "@workspace/ui/primitives/input";
import { Textarea } from "@workspace/ui/primitives/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/primitives/alert-dialog";
import { Badge } from "@workspace/ui/primitives/badge";
import { Alert, AlertDescription } from "@workspace/ui/primitives/alert";
import { cn } from "@workspace/ui/lib/utils";
import {
  AlertTriangle,
  Flame,
  Loader2,
  Sparkles,
  Undo2,
  Users,
} from "lucide-react";
type Props = {
  dispatchId: string;
  roster?: RosterEntry[];
};
const ACTIVITY_OPTIONS = [
  { value: "ops", label: "Operations" },
  { value: "logistics", label: "Logistics" },
  { value: "comms", label: "Comms" },
  { value: "support", label: "Support" },
  { value: "wellness", label: "Wellness" },
  { value: "training", label: "Training" },
  { value: "other", label: "Other" },
];
function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours && remainder) return `${hours}h ${remainder}m`;
  if (hours) return `${hours}h`;
  return `${remainder}m`;
}
export function VolunteerAttributionPanel({ dispatchId, roster = [] }: Props) {
  const [data, setData] = useState<DispatchVolunteerHoursResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [activityType, setActivityType] = useState("ops");
  const [customMinutes, setCustomMinutes] = useState(60);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [revertTarget, setRevertTarget] = useState<VolunteerAttribution | null>(
    null,
  );
  const [revertReason, setRevertReason] = useState("");
  const [reverting, setReverting] = useState(false);
  const volunteerSelectId = useId();
  const activitySelectId = useId();
  const notesFieldId = useId();
  const customMinutesId = useId();
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/impact/dispatches/${dispatchId}/volunteer-attributions`,
      );
      if (!res.ok) {
        throw new Error("Unable to load volunteer hours");
      }
      const json = (await res.json()) as DispatchVolunteerHoursResponse;
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to refresh volunteer attribution data",
      );
    } finally {
      setLoading(false);
    }
  }, [dispatchId]);
  useEffect(() => {
    loadData();
  }, [loadData]);
  const rosterOptions = useMemo(() => {
    const seen = new Set<string>();
    return roster
      .map((entry) => {
        const profileId = entry.profile?.id ?? entry.profile_id ?? entry.id;
        if (!profileId) return null;
        const label =
          entry.profile?.display_name ??
          entry.profile?.user_id ??
          entry.handle ??
          profileId;
        return { value: profileId, label };
      })
      .filter(
        (
          option,
        ): option is {
          value: string;
          label: string;
        } => {
          if (!option) return false;
          if (seen.has(option.value)) return false;
          seen.add(option.value);
          return true;
        },
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [roster]);
  const recentVolunteers = useMemo(() => {
    if (!data?.attributions?.length) return [];
    const unique: VolunteerAttribution[] = [];
    const seen = new Set<string>();
    for (const entry of data.attributions) {
      const key = entry.profile_id ?? entry.id;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(entry);
      if (unique.length >= 4) break;
    }
    return unique;
  }, [data?.attributions]);
  const handleSubmit = async (rawMinutes: number) => {
    const minutes = Math.min(Math.max(Math.floor(rawMinutes || 0), 15), 480);
    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch(
        `/api/impact/dispatches/${dispatchId}/volunteer-attributions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId: selectedProfileId || null,
            minutes,
            activityType,
            notes: notes || undefined,
          }),
        },
      );
      if (!res.ok) {
        const message = (await res.json())?.error;
        throw new Error(message ?? "Unable to add volunteer hours");
      }
      const json = (await res.json()) as DispatchVolunteerHoursResponse;
      setData(json);
      setNotes("");
      toast.success("Hours added");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to add volunteer hours",
      );
      toast.error(
        err instanceof Error ? err.message : "Unable to add volunteer hours",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const handleRevert = async () => {
    if (!revertTarget) return;
    try {
      setReverting(true);
      const res = await fetch(
        `/api/impact/volunteer-attributions/${revertTarget.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: revertReason }),
        },
      );
      if (!res.ok) {
        const message = (await res.json())?.error;
        throw new Error(message ?? "Unable to revert attribution");
      }
      const json = (await res.json()) as DispatchVolunteerHoursResponse;
      setData(json);
      toast.success("Volunteer hours reverted");
      setRevertTarget(null);
      setRevertReason("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to revert attribution",
      );
    } finally {
      setReverting(false);
    }
  };
  const summary = data?.summary;
  const progressPercent = summary
    ? Math.min(Math.round(summary.progressRatio * 100), 100)
    : 0;
  return (
    <section className="rounded-lg border bg-card/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-muted-foreground" />
            Volunteer Hours
          </p>
          <p className="text-xs text-muted-foreground">
            Attribute time to keep coverage honest and detect burnout.
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={loadData} disabled={loading}>
          <Sparkles className={cn("mr-1 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {summary ? `${summary.totalHours.toFixed(1)}h logged` : "—"}
          </span>
          <span>Coverage Target: 24h</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-muted">
          <div
            className={cn(
              "h-2 rounded-full bg-primary transition-all",
              progressPercent >= 90 && "bg-amber-500",
              progressPercent >= 110 && "bg-red-500",
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {summary?.anomalyCount ? (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-900">
            <AlertTriangle className="h-3 w-3" />
            {summary.anomalyCount} anomaly
            {summary.anomalyCount === 1 ? "" : " entries"}
          </div>
        ) : null}
      </div>

      {error ? (
        <Alert variant="destructive" className="mt-3 text-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-4 space-y-3 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label
              htmlFor={volunteerSelectId}
              className="text-xs font-medium text-muted-foreground"
            >
              Assign volunteer
            </label>
            <Select
              value={selectedProfileId || "__unlisted__"}
              onValueChange={(value) =>
                setSelectedProfileId(value === "__unlisted__" ? "" : value)
              }
            >
              <SelectTrigger id={volunteerSelectId}>
                <SelectValue placeholder="Select volunteer (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__unlisted__">Unlisted volunteer</SelectItem>
                {rosterOptions.length ? (
                  rosterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty__" disabled>
                    No roster linked
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor={activitySelectId}
              className="text-xs font-medium text-muted-foreground"
            >
              Activity type
            </label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger id={activitySelectId}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label
            htmlFor={notesFieldId}
            className="text-xs font-medium text-muted-foreground"
          >
            Notes (optional)
          </label>
          <Textarea
            id={notesFieldId}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Record unique context, pods involved, or observations."
            maxLength={500}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[60, 120, 240].map((minutes) => (
            <Button
              key={minutes}
              size="sm"
              variant="secondary"
              disabled={submitting}
              onClick={() => handleSubmit(minutes)}
            >
              +{minutes / 60}h
            </Button>
          ))}
          <div className="flex items-center gap-2">
            <label htmlFor={customMinutesId} className="sr-only">
              Custom minutes
            </label>
            <Input
              id={customMinutesId}
              type="number"
              className="w-20"
              min={15}
              max={480}
              step={15}
              value={customMinutes}
              onChange={(event) =>
                setCustomMinutes(Number(event.target.value ?? 15))
              }
              onBlur={(event) => {
                const value = Number(event.target.value);
                if (value < 15) setCustomMinutes(15);
                if (value > 480) setCustomMinutes(480);
              }}
            />
            <Button
              size="sm"
              disabled={submitting}
              onClick={() => handleSubmit(customMinutes)}
            >
              +Custom
            </Button>
          </div>
        </div>
        {recentVolunteers.length ? (
          <div className="text-xs text-muted-foreground">
            Recent volunteers:{" "}
            <div className="mt-1 flex flex-wrap gap-2">
              {recentVolunteers.map((entry) => (
                <button
                  key={entry.id}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    selectedProfileId === entry.profile_id
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:border-primary/70",
                  )}
                  onClick={() => {
                    if (entry.profile_id) {
                      setSelectedProfileId(entry.profile_id);
                    }
                  }}
                  type="button"
                  disabled={!entry.profile_id}
                  title={
                    entry.profile_id
                      ? "Use this volunteer"
                      : "Recorded without profile id"
                  }
                >
                  {entry.profile_display_name ?? "Unlisted volunteer"}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-3 text-sm">
        <p className="text-xs font-semibold text-muted-foreground">
          Recent entries
        </p>
        {loading ? (
          <div className="space-y-2">
            <div className="animate-pulse rounded-md bg-muted/80 p-4" />
            <div className="animate-pulse rounded-md bg-muted/80 p-4" />
          </div>
        ) : data?.attributions?.length ? (
          data.attributions.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between rounded-md border bg-background/80 p-3"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {entry.profile_display_name ?? "Unlisted volunteer"}
                  </span>
                  <Badge variant="outline">
                    {formatDuration(entry.minutes)}
                  </Badge>
                  <Badge variant="secondary">
                    {ACTIVITY_OPTIONS.find(
                      (opt) => opt.value === entry.activity_type,
                    )?.label ?? entry.activity_type}
                  </Badge>
                  {entry.anomaly_flag ? (
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <Flame className="h-3 w-3" />
                      Flagged
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  Logged{" "}
                  {new Date(entry.attributed_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                {entry.notes ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.notes}
                  </p>
                ) : null}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground"
                aria-label="Undo volunteer hours"
                disabled={submitting}
                onClick={() => {
                  setRevertTarget(entry);
                  setRevertReason("");
                }}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            No volunteer hours recorded yet.
          </div>
        )}
      </div>

      <AlertDialog
        open={!!revertTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRevertTarget(null);
            setRevertReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Undo volunteer hours?</AlertDialogTitle>
            <AlertDialogDescription>
              Provide context so the audit log captures why this change
              happened.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={revertReason}
            onChange={(event) => setRevertReason(event.target.value)}
            placeholder="Reason for reverting"
            maxLength={400}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reverting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!revertReason.trim() || reverting}
              onClick={handleRevert}
            >
              {reverting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Undo hours
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
