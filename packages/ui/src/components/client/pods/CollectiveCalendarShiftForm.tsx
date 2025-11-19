"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addHours } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { CalendarOrgSummary, CalendarPodSummary, CalendarVisibility, CollectiveCalendarShift, CollectiveCalendarShiftInput } from "./CollectiveCalendarShared";
import { Badge } from "@workspace/ui/components/badge";

type CollectiveCalendarShiftFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pods: CalendarPodSummary[];
  organizations: CalendarOrgSummary[];
  membershipPodIds: string[];
  initialShift?: CollectiveCalendarShift | null;
  defaultPodId?: string;
  draftStart?: string | null;
  draftEnd?: string | null;
  onSubmit: (input: CollectiveCalendarShiftInput) => Promise<void>;
  onDelete?: (shiftId: string) => Promise<void>;
};

type FormState = {
  podId: string;
  label: string;
  location: string;
  startLocal: string;
  endLocal: string;
  needed: number;
  visibility: CalendarVisibility;
  dispatchLink: string;
  notes: string;
  tz: string;
  orgMode: "independent" | "org";
  orgId: string | null;
};

const INDEPENDENT_VALUE = "__independent__";

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIsoString(localInput: string) {
  if (!localInput) return "";
  const parsed = new Date(localInput);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
}

function visibilityBadge(visibility: CalendarVisibility) {
  switch (visibility) {
    case "public":
      return { label: "Public", variant: "outline" as const };
    case "org":
      return { label: "Org only", variant: "secondary" as const };
    case "private":
      return { label: "Pod only", variant: "destructive" as const };
  }
}

export function CollectiveCalendarShiftForm({
  open,
  onOpenChange,
  pods,
  organizations,
  membershipPodIds,
  initialShift,
  defaultPodId,
  draftStart,
  draftEnd,
  onSubmit,
  onDelete,
}: CollectiveCalendarShiftFormProps) {
  const defaultTz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => ({
    podId: defaultPodId ?? pods[0]?.id ?? "",
    label: "",
    location: "",
    startLocal: "",
    endLocal: "",
    needed: 1,
    visibility: "public",
    dispatchLink: "",
    notes: "",
    tz: defaultTz,
    orgMode: "independent",
    orgId: null,
  }));
  const membershipPodSet = useMemo(
    () => new Set(membershipPodIds ?? []),
    [membershipPodIds],
  );
  const independentPods = useMemo(() => {
    if (membershipPodSet.size === 0) return pods;
    const matched = pods.filter((pod) => membershipPodSet.has(pod.id));
    return matched.length > 0 ? matched : pods;
  }, [membershipPodSet, pods]);
  const findOrgForPod = useCallback(
    (podId?: string | null) => {
      if (!podId) return null;
      for (const org of organizations) {
        if (org.pods?.some((pod) => pod.id === podId)) {
          return org.id;
        }
      }
      return null;
    },
    [organizations],
  );
  const visiblePods = useMemo(() => {
    const base =
      form.orgMode === "org"
        ? organizations.find((org) => org.id === form.orgId)?.pods ?? []
        : independentPods;
    if (form.podId && !base.some((pod) => pod.id === form.podId)) {
      const fallback = pods.find((pod) => pod.id === form.podId);
      return fallback ? [...base, fallback] : base;
    }
    return base;
  }, [form.orgMode, form.orgId, form.podId, independentPods, organizations, pods]);
  const hasOrgOptions = organizations.length > 0;
  const noPodsAvailable = visiblePods.length === 0;
  const handleOrgValueChange = useCallback(
    (value: string) => {
      if (value === INDEPENDENT_VALUE) {
        setForm((prev) => {
          const nextPods = independentPods;
          const nextPodId =
            nextPods.length === 0
              ? ""
              : nextPods.some((pod) => pod.id === prev.podId)
                ? prev.podId
                : nextPods[0]?.id ?? "";
          return {
            ...prev,
            orgMode: "independent",
            orgId: null,
            podId: nextPodId,
          };
        });
        return;
      }

      setForm((prev) => {
        const targetOrg = organizations.find((org) => org.id === value);
        const orgPods = targetOrg?.pods ?? [];
        const nextPodId =
          orgPods.length === 0
            ? ""
            : orgPods.some((pod) => pod.id === prev.podId)
              ? prev.podId
              : orgPods[0]?.id ?? "";
        return {
          ...prev,
          orgMode: "org",
          orgId: value,
          podId: nextPodId,
        };
      });
    },
    [independentPods, organizations],
  );

  useEffect(() => {
    if (!open) return;
    if (noPodsAvailable) {
      if (form.podId !== "") {
        setForm((prev) => ({ ...prev, podId: "" }));
      }
      return;
    }
    if (!visiblePods.some((pod) => pod.id === form.podId)) {
      setForm((prev) => ({ ...prev, podId: visiblePods[0]?.id ?? "" }));
    }
  }, [form.podId, noPodsAvailable, open, visiblePods]);

  useEffect(() => {
    if (!open) return;
    const fallbackPodId = defaultPodId ?? pods[0]?.id ?? "";
    const basePodId = initialShift?.pod.id ?? fallbackPodId;
    const shiftOrgId = initialShift
      ? initialShift.organizations
        .map((org) => org.id)
        .find((orgId) => organizations.some((o) => o.id === orgId)) ?? null
      : null;
    const podOrgId = findOrgForPod(basePodId);
    const resolvedOrgId = shiftOrgId ?? podOrgId;
    const useOrgMode = Boolean(resolvedOrgId && organizations.length > 0);
    const startSource = initialShift?.start ?? draftStart ?? null;
    const endSource =
      initialShift?.end ??
      draftEnd ??
      (draftStart
        ? addHours(new Date(draftStart), 1).toISOString()
        : null);

    setForm({
      podId: basePodId,
      label: initialShift?.label ?? "",
      location: initialShift?.location ?? "",
      startLocal: toLocalInput(startSource),
      endLocal: toLocalInput(endSource),
      needed: initialShift?.needed ?? 1,
      visibility: initialShift?.visibility ?? "public",
      dispatchLink: initialShift?.dispatchLink ?? "",
      notes: initialShift?.notes ?? "",
      tz: initialShift?.tz ?? defaultTz,
      orgMode: useOrgMode ? "org" : "independent",
      orgId: useOrgMode
        ? resolvedOrgId ?? organizations[0]?.id ?? null
        : null,
    });
    setError(null);
  }, [
    open,
    initialShift,
    defaultPodId,
    pods,
    defaultTz,
    organizations,
    findOrgForPod,
    draftStart,
    draftEnd,
  ]);

  const handleSave = async () => {
    setError(null);
    const startIso = toIsoString(form.startLocal);
    const endIso = toIsoString(form.endLocal);
    if (!startIso || !endIso) {
      setError("Set both start and end time.");
      return;
    }
    if (new Date(endIso) <= new Date(startIso)) {
      setError("End must be after start.");
      return;
    }
    if (form.orgMode === "org" && !form.orgId) {
      setError("Select an organization for this shift.");
      return;
    }
    if (!form.podId) {
      setError("Choose a pod.");
      return;
    }
    if (noPodsAvailable) {
      setError("There are no pods available for this selection.");
      return;
    }
    if (!form.label.trim()) {
      setError("Add a label for the shift.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        id: initialShift?.id,
        podId: form.podId,
        start: startIso,
        end: endIso,
        tz: form.tz || defaultTz,
        label: form.label.trim(),
        location: form.location.trim(),
        visibility: form.visibility,
        needed: Math.max(0, form.needed),
        headcount: Math.max(0, form.needed),
        dispatchLink: form.dispatchLink?.trim() || null,
        notes: form.notes?.trim() || null,
        scope: form.orgMode,
        organizationId: form.orgMode === "org" ? form.orgId : null,
      });
      onOpenChange(false);
    } catch (e: any) {
      setError(e?.message ?? "Could not save shift.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialShift || !onDelete) return;
    if (!confirm("Delete this shift?")) return;
    setSubmitting(true);
    try {
      await onDelete(initialShift.id);
      onOpenChange(false);
    } catch (e: any) {
      setError(e?.message ?? "Could not delete shift.");
    } finally {
      setSubmitting(false);
    }
  };

  const visBadge = visibilityBadge(form.visibility);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground max-h-[85vh] overflow-y-auto p-4 sm:max-w-2xl sm:p-6 z-[1201]">
        <DialogHeader>
          <DialogTitle>
            {initialShift ? "Edit shift" : "New shift"}
          </DialogTitle>
          <DialogDescription>
            Schedule a shift directly on the collective calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1">
            <Label htmlFor="shift-org">Organization</Label>
            <Select
              value={
                form.orgMode === "org" && form.orgId
                  ? form.orgId
                  : INDEPENDENT_VALUE
              }
              onValueChange={handleOrgValueChange}
              disabled={!hasOrgOptions}
            >
              <SelectTrigger>
                <SelectValue placeholder="Independent shift" />
              </SelectTrigger>
              <SelectContent className="z-[1202]">
                <SelectItem value={INDEPENDENT_VALUE}>
                  Independent shift
                </SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {form.orgMode === "org"
                ? "Shift will be associated with the selected organization."
                : hasOrgOptions
                  ? "Shift stays independent even though you're in an organization."
                  : "You're not part of an organization yet—this shift will be independent."}
            </p>
          </div>

          <div className="grid gap-1">
            <Label>Pod</Label>
            <Select
              value={form.podId}
              onValueChange={(value) => setForm((prev) => ({ ...prev, podId: value }))}
              disabled={submitting || noPodsAvailable}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a pod" />
              </SelectTrigger>
              <SelectContent className="z-[1202]">
                {visiblePods.map((pod) => (
                  <SelectItem key={pod.id} value={pod.id}>
                    {pod.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {noPodsAvailable ? (
              <p className="text-xs text-destructive">
                {form.orgMode === "org"
                  ? "No pods available in this organization yet."
                  : "No independent pods available for your account."}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="shift-label">Label</Label>
            <Input
              id="shift-label"
              value={form.label}
              onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Morning Court Watch"
              disabled={submitting}
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="shift-location">Location</Label>
            <Input
              id="shift-location"
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="e.g. County Courthouse"
              disabled={submitting}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <Label>Start</Label>
              <Input
                type="datetime-local"
                value={form.startLocal}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startLocal: e.target.value }))
                }
                disabled={submitting}
              />
            </div>
            <div className="grid gap-1">
              <Label>End</Label>
              <Input
                type="datetime-local"
                value={form.endLocal}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endLocal: e.target.value }))
                }
                disabled={submitting}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <Label htmlFor="needed">Crew needed</Label>
              <Input
                id="needed"
                type="number"
                inputMode="numeric"
                min={0}
                value={form.needed}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    needed: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                disabled={submitting}
              />
            </div>
            <div className="grid gap-1">
              <Label>Visibility</Label>
              <Select
                value={form.visibility}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, visibility: value as CalendarVisibility }))
                }
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[1202]">
                  <SelectItem value="public">Public (region-wide)</SelectItem>
                  <SelectItem value="org">Org only</SelectItem>
                  <SelectItem value="private">Pod only</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-2">
                <Badge variant={visBadge.variant} className="w-fit">
                  {visBadge.label}
                </Badge>
                <span className="text-left sm:text-sm">
                  {form.visibility === "public"
                    ? "Visible to all authenticated users."
                    : form.visibility === "org"
                      ? "Visible to pods in the organization."
                      : "Visible to pod members only."}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="dispatch">Dispatch / link</Label>
            <Input
              id="dispatch"
              value={form.dispatchLink}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, dispatchLink: e.target.value }))
              }
              placeholder="https://example.com/dispatch"
              disabled={submitting}
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Optional context or route notes"
              disabled={submitting}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Times save in {form.tz || defaultTz}.</span>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            {initialShift && onDelete ? (
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={handleDelete}
                disabled={submitting}
              >
                Delete
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={handleSave}
              disabled={submitting}
            >
              {submitting ? "Saving…" : initialShift ? "Save changes" : "Create shift"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
