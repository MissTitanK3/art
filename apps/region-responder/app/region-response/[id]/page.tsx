"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Sparkles, Trash } from "lucide-react";

import { Badge, Button, Input, Label, Textarea } from "@workspace/ui/primitives";
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@workspace/ui/primitives/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { toast } from "@workspace/ui/primitives/sonner";
import { cn } from "@workspace/ui/lib/utils";
import {
  buildIndividualUpdateCopy,
  buildResponseSummary,
  formatGeneralStatus,
  formatLocalDateTime,
  formatLocationCondition,
  formatSafetyConcern,
  formatSafetyStatus,
  formatTernary,
  getRegionResponseHistory,
  useRegionResponseStore,
  type SituationUpdate,
  type LocationCondition,
  type RegionResponseHistoryItem,
  type SafetyConcernLevel,
  type SafetyStatus,
  type SituationGeneralStatus,
  type TernaryChoice,
} from "@workspace/store/useRegionResponseStore";
import { DateTimePicker } from "@workspace/ui/patterns/common";

const SAFETY_OPTIONS: { label: string; value: SafetyStatus }[] = [
  { label: "En route", value: "en-route" },
  { label: "On site", value: "on-site" },
  { label: "Leaving area", value: "leaving" },
  { label: "Safe at home", value: "safe" },
  { label: "Unable to continue", value: "unable" },
];

const GENERAL_STATUS_OPTIONS: { label: string; value: SituationGeneralStatus }[] = [
  { label: "Calm", value: "calm" },
  { label: "Active", value: "active" },
  { label: "Escalating", value: "escalating" },
  { label: "Resolved", value: "resolved" },
];

const TERNARY_OPTIONS: { label: string; value: TernaryChoice }[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Unknown", value: "unknown" },
];

const LOCATION_OPTIONS: { label: string; value: LocationCondition }[] = [
  { label: "Normal", value: "normal" },
  { label: "Restricted", value: "restricted" },
  { label: "Disrupted", value: "disrupted" },
];

const SAFETY_CONCERN_OPTIONS: { label: string; value: SafetyConcernLevel }[] = [
  { label: "None", value: "none" },
  { label: "Low", value: "low" },
  { label: "High", value: "high" },
];

function nowLocalInputValue() {
  const date = new Date();
  const offsetMs = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - offsetMs);
  return local.toISOString().slice(0, 16);
}

function parseLocalInput(value: string) {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function isoToLocalInput(value?: string) {
  if (!value) return nowLocalInputValue();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return nowLocalInputValue();
  const offsetMs = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - offsetMs);
  return local.toISOString().slice(0, 16);
}

function isDetailedSituationUpdate(update: SituationUpdate) {
  return Boolean(
    update.summary?.trim() ||
    update.assistanceDetail?.trim() ||
    update.authoritiesDetail?.trim() ||
    update.publicImpactDetail?.trim() ||
    update.locationDetail?.trim() ||
    update.safetyDetail?.trim() ||
    update.additionalNotes?.trim(),
  );
}

function historyDetails(item: RegionResponseHistoryItem) {
  if (item.kind === "safety-check") {
    return [`Status: ${formatSafetyStatus(item.entry.status)}`];
  }
  const update = item.entry;
  const details = [
    `General: ${formatGeneralStatus(update.generalStatus)}`,
    `Assist: ${formatTernary(update.assistanceNeeded)}`,
    `Authorities: ${formatTernary(update.authoritiesPresent)}`,
    `Public: ${formatTernary(update.publicAffected)}`,
  ];
  const location = formatLocationCondition(update.locationCondition);
  if (location) details.push(`Location: ${location}`);
  const safety = formatSafetyConcern(update.safetyConcern);
  if (safety) details.push(`Safety: ${safety}`);
  const add = (label: string, value?: string) => {
    if (value?.trim()) details.push(`${label}: ${value.trim()}`);
  };
  add("Summary", update.summary);
  add("Assistance detail", update.assistanceDetail);
  add("Authorities detail", update.authoritiesDetail);
  add("Public impact", update.publicImpactDetail);
  add("Location detail", update.locationDetail);
  add("Safety detail", update.safetyDetail);
  add("Notes", update.notes);
  add("Additional notes", update.additionalNotes);
  return details;
}

async function copyText(text: string, successMessage = "Copied") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch (error) {
    console.error(error);
    toast.error("Unable to copy. Check permissions or try again.");
  }
}

async function shareText(text: string, fallbackMessage = "Copied for sharing") {
  try {
    if (navigator.share) {
      await navigator.share({ text });
      toast.success("Ready to share");
      return;
    }
  } catch (error) {
    console.error(error);
  }
  await copyText(text, fallbackMessage);
}

function printPdf(title: string, body: string) {
  const safeBody = body.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8" />
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; }
          pre { white-space: pre-wrap; word-break: break-word; font-size: 14px; line-height: 1.4; }
          h1 { font-size: 18px; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <pre>${safeBody}</pre>
      </body>
    </html>
  `;

  const blobUrl = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const win = window.open(blobUrl, "_blank", "noopener,noreferrer");
  if (!win) {
    toast.error("Enable popups to export PDF. Copied summary instead.");
    void copyText(body, "Summary copied");
    URL.revokeObjectURL(blobUrl);
    return;
  }

  win.document.title = title;
  win.focus();
  win.print();
}

function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2 mt-3">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={option.value === value ? "default" : "outline"}
            className={cn("h-12 justify-start text-left", option.value === value && "border-2 border-primary")}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function RegionResponseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sessionId = params?.id ? decodeURIComponent(params.id) : "";

  const session = useRegionResponseStore((state) => (sessionId ? state.sessions[sessionId] : undefined));
  const activeId = useRegionResponseStore((state) => state.activeId);
  const setActive = useRegionResponseStore((state) => state.setActive);
  const recordCheckIn = useRegionResponseStore((state) => state.recordCheckIn);
  const addSituationUpdate = useRegionResponseStore((state) => state.addSituationUpdate);
  const updateSituationUpdate = useRegionResponseStore((state) => state.updateSituationUpdate);
  const deleteHistoryItem = useRegionResponseStore((state) => state.deleteHistoryItem);
  const clearSession = useRegionResponseStore((state) => state.clearSession);

  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [observedAt, setObservedAt] = useState(nowLocalInputValue());
  const [generalStatus, setGeneralStatus] = useState<SituationGeneralStatus>("calm");
  const [assistanceNeeded, setAssistanceNeeded] = useState<TernaryChoice>("unknown");
  const [authoritiesPresent, setAuthoritiesPresent] = useState<TernaryChoice>("unknown");
  const [publicAffected, setPublicAffected] = useState<TernaryChoice>("unknown");
  const [locationCondition, setLocationCondition] = useState<LocationCondition>("");
  const [safetyConcern, setSafetyConcern] = useState<SafetyConcernLevel>("");
  const [notes, setNotes] = useState("");
  const [showDetailedUpdate, setShowDetailedUpdate] = useState(false);
  const [observedAtDetailed, setObservedAtDetailed] = useState(nowLocalInputValue());
  const [generalStatusDetailed, setGeneralStatusDetailed] = useState<SituationGeneralStatus>("calm");
  const [assistanceNeededDetailed, setAssistanceNeededDetailed] = useState<TernaryChoice>("unknown");
  const [authoritiesPresentDetailed, setAuthoritiesPresentDetailed] = useState<TernaryChoice>("unknown");
  const [publicAffectedDetailed, setPublicAffectedDetailed] = useState<TernaryChoice>("unknown");
  const [locationConditionDetailed, setLocationConditionDetailed] = useState<LocationCondition>("");
  const [safetyConcernDetailed, setSafetyConcernDetailed] = useState<SafetyConcernLevel>("");
  const [detailSummary, setDetailSummary] = useState("");
  const [detailAssistance, setDetailAssistance] = useState("");
  const [detailAuthorities, setDetailAuthorities] = useState("");
  const [detailPublicImpact, setDetailPublicImpact] = useState("");
  const [detailLocation, setDetailLocation] = useState("");
  const [detailSafety, setDetailSafety] = useState("");
  const [detailAdditionalNotes, setDetailAdditionalNotes] = useState("");
  const [checkInCooldown, setCheckInCooldown] = useState(false);
  const [editingItem, setEditingItem] = useState<RegionResponseHistoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RegionResponseHistoryItem | null>(null);
  const checkInCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const history = useMemo(() => getRegionResponseHistory(session ?? null), [session]);
  const responseRef = session?.responseRef ?? "";
  const lastUpdated = session?.lastUpdatedAt ? formatLocalDateTime(session.lastUpdatedAt) : "";
  const startedAt = session?.startedAt ? formatLocalDateTime(session.startedAt) : "";
  const isActive = activeId === sessionId;

  function resetUpdateForm() {
    setObservedAt(nowLocalInputValue());
    setGeneralStatus("calm");
    setAssistanceNeeded("unknown");
    setAuthoritiesPresent("unknown");
    setPublicAffected("unknown");
    setLocationCondition("");
    setSafetyConcern("");
    setNotes("");
    setEditingItem((current) => (current && current.kind === "situation-update" && !isDetailedSituationUpdate(current.entry) ? null : current));
  }

  function resetDetailedUpdateForm() {
    setObservedAtDetailed(nowLocalInputValue());
    setGeneralStatusDetailed("calm");
    setAssistanceNeededDetailed("unknown");
    setAuthoritiesPresentDetailed("unknown");
    setPublicAffectedDetailed("unknown");
    setLocationConditionDetailed("");
    setSafetyConcernDetailed("");
    setDetailSummary("");
    setDetailAssistance("");
    setDetailAuthorities("");
    setDetailPublicImpact("");
    setDetailLocation("");
    setDetailSafety("");
    setDetailAdditionalNotes("");
    setEditingItem((current) => (current && current.kind === "situation-update" && isDetailedSituationUpdate(current.entry) ? null : current));
  }

  const lastSafetyCheckAt = useMemo(() => {
    let latest: string | null = null;
    for (const item of history) {
      if (item.kind === "safety-check") {
        latest = formatLocalDateTime(item.entry.recordedAt);
        break;
      }
    }
    return latest;
  }, [history]);

  useEffect(() => () => {
    if (checkInCooldownRef.current) clearTimeout(checkInCooldownRef.current);
  }, []);

  if (!session) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Region Response</p>
          <h1 className="text-2xl font-semibold leading-tight text-foreground">Response not found</h1>
          <p className="text-sm text-muted-foreground">The response may have been cleared. Start a new one or open another saved response.</p>
          <div className="flex gap-3">
            <Button asChild size="lg" className="h-12">
              <Link href="/region-response">Back to responses</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const handleClear = async () => {
    await clearSession(sessionId);
    toast.success("Response cleared");
    resetUpdateForm();
    resetDetailedUpdateForm();
    setShowUpdateForm(false);
    setShowDetailedUpdate(false);
    router.push("/region-response");
  };

  const handleCheckIn = (status: SafetyStatus) => {
    if (checkInCooldown) {
      toast.message("Already logged", { description: "Wait a moment before the next check-in." });
      return;
    }
    const entry = recordCheckIn(sessionId, status);
    if (entry) {
      toast.success("Status recorded");
      setCheckInCooldown(true);
      if (checkInCooldownRef.current) clearTimeout(checkInCooldownRef.current);
      checkInCooldownRef.current = setTimeout(() => setCheckInCooldown(false), 1500);
    }
  };

  const handleAddUpdate = () => {
    const editingQuick = editingItem?.kind === "situation-update" && !isDetailedSituationUpdate(editingItem.entry);
    const payload = {
      observedAt: parseLocalInput(observedAt),
      generalStatus,
      assistanceNeeded,
      authoritiesPresent,
      publicAffected,
      locationCondition,
      safetyConcern,
      notes,
    };
    const recorded = editingQuick
      ? updateSituationUpdate(sessionId, editingItem.entry.id, payload)
      : addSituationUpdate(sessionId, payload);
    if (recorded) {
      toast.success(editingQuick ? "Update edited" : "Update saved");
      resetUpdateForm();
      setEditingItem(null);
      setShowUpdateForm(false);
    }
  };

  const handleAddDetailedUpdate = () => {
    const editingDetailed = editingItem?.kind === "situation-update" && isDetailedSituationUpdate(editingItem.entry);
    const payload = {
      observedAt: parseLocalInput(observedAtDetailed),
      generalStatus: generalStatusDetailed,
      assistanceNeeded: assistanceNeededDetailed,
      authoritiesPresent: authoritiesPresentDetailed,
      publicAffected: publicAffectedDetailed,
      locationCondition: locationConditionDetailed,
      safetyConcern: safetyConcernDetailed,
      summary: detailSummary,
      assistanceDetail: detailAssistance,
      authoritiesDetail: detailAuthorities,
      publicImpactDetail: detailPublicImpact,
      locationDetail: detailLocation,
      safetyDetail: detailSafety,
      additionalNotes: detailAdditionalNotes,
      notes: detailAdditionalNotes,
    };
    const recorded = editingDetailed
      ? updateSituationUpdate(sessionId, editingItem.entry.id, payload)
      : addSituationUpdate(sessionId, payload);

    if (recorded) {
      toast.success(editingDetailed ? "In-depth update edited" : "In-depth update saved");
      resetDetailedUpdateForm();
      setEditingItem(null);
      setShowDetailedUpdate(false);
    }
  };

  const handleCopyItem = async (item: RegionResponseHistoryItem) => {
    const text = buildIndividualUpdateCopy(session, item);
    await copyText(text, "Update copied");
  };

  const handleCopyAll = async () => {
    if (!history.length) {
      toast.error("No updates to copy yet.");
      return;
    }
    const text = history.map((item) => buildIndividualUpdateCopy(session, item)).join("\n\n");
    await copyText(text, "All updates copied");
  };

  const handleExportSummary = async () => {
    const summary = buildResponseSummary(session);
    await copyText(summary, "Summary copied");
  };

  const handleShareSummary = async () => {
    const summary = buildResponseSummary(session);
    await shareText(summary, "Summary copied for sharing");
  };

  const handlePrintSummary = () => {
    const summary = buildResponseSummary(session);
    printPdf("Region Response Summary", summary);
  };

  const beginEditUpdate = (item: RegionResponseHistoryItem) => {
    if (item.kind !== "situation-update") return;
    const update = item.entry;
    const detailed = isDetailedSituationUpdate(update);
    setEditingItem(item);
    if (detailed) {
      setObservedAtDetailed(isoToLocalInput(update.observedAt));
      setGeneralStatusDetailed(update.generalStatus);
      setAssistanceNeededDetailed(update.assistanceNeeded);
      setAuthoritiesPresentDetailed(update.authoritiesPresent);
      setPublicAffectedDetailed(update.publicAffected);
      setLocationConditionDetailed(update.locationCondition ?? "");
      setSafetyConcernDetailed(update.safetyConcern ?? "");
      setDetailSummary(update.summary ?? "");
      setDetailAssistance(update.assistanceDetail ?? "");
      setDetailAuthorities(update.authoritiesDetail ?? "");
      setDetailPublicImpact(update.publicImpactDetail ?? "");
      setDetailLocation(update.locationDetail ?? "");
      setDetailSafety(update.safetyDetail ?? "");
      setDetailAdditionalNotes(update.additionalNotes || update.notes || "");
      setShowDetailedUpdate(true);
      return;
    }
    setObservedAt(isoToLocalInput(update.observedAt));
    setGeneralStatus(update.generalStatus);
    setAssistanceNeeded(update.assistanceNeeded);
    setAuthoritiesPresent(update.authoritiesPresent);
    setPublicAffected(update.publicAffected);
    setLocationCondition(update.locationCondition ?? "");
    setSafetyConcern(update.safetyConcern ?? "");
    setNotes(update.notes ?? "");
    setShowUpdateForm(true);
  };

  const handleDeleteRequest = (item: RegionResponseHistoryItem) => {
    setDeleteTarget(item);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const removed = deleteHistoryItem(sessionId, deleteTarget);
    if (removed) {
      if (editingItem?.entry.id === deleteTarget.entry.id) {
        setEditingItem(null);
        resetUpdateForm();
        resetDetailedUpdateForm();
      }
      toast.success("Entry deleted");
    } else {
      toast.error("Unable to delete entry");
    }
    setDeleteTarget(null);
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="px-2">
            <Link href="/region-response" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back
            </Link>
          </Button>
          {!isActive ? (
            <Button size="sm" variant="outline" onClick={() => setActive(sessionId)}>
              Set active
            </Button>
          ) : (
            <Badge variant="secondary" className="h-7 rounded-full px-3 flex items-center gap-1">
              <Sparkles className="h-4 w-4" aria-hidden /> Active
            </Badge>
          )}
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Region Response</p>
        <p className="text-sm text-muted-foreground">
          Log status, share situation updates, and export a dispatcher-ready summary for this response.
        </p>
        <div className="flex flex-col items-center gap-2 justify-between w-full">
          <hr className="h-1 bg-accent w-full" />
          <div className="flex items-center gap-3 justify-between w-full">
            <Badge variant="outline" className="h-7 rounded-full px-3">Ref: {responseRef}</Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              onClick={() => copyText(responseRef, "Reference copied")}
            >
              <Copy className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <hr className="h-1 bg-accent w-full" />
        </div>
      </div>

      <section className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
        <SectionHeading
          title="Safety Check"
          hint="Tap what you are doing right now. Each tap is logged with time."
        />
        {lastSafetyCheckAt ? (
          <p className="text-sm text-muted-foreground">Last check-in: {lastSafetyCheckAt}</p>
        ) : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SAFETY_OPTIONS.map((option) => (
            <Button
              key={option.value}
              size="lg"
              className="h-14 justify-start text-lg font-semibold"
              disabled={checkInCooldown}
              onClick={() => handleCheckIn(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </section>
      <hr className="h-1 bg-accent w-full" />
      <section className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm flex flex-col w-full justify-center items-center">
        {startedAt ? <Badge variant="secondary" className="h-7 rounded-full px-3">Started: {startedAt}</Badge> : null}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="lg" className="h-12" onClick={handleClear}>
            Clear Response
          </Button>
        </div>
      </section>
      <hr className="h-1 bg-accent w-full" />
      <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeading
            title="Situation Update"
            hint="Pick quick buttons or a detailed narrative."
          />
          <div className="flex flex-wrap gap-2">
            <Drawer
              open={showUpdateForm}
              onOpenChange={(open: boolean) => {
                setShowUpdateForm(open);
                if (!open) {
                  resetUpdateForm();
                  setEditingItem((current) =>
                    current && current.kind === "situation-update" && !isDetailedSituationUpdate(current.entry)
                      ? null
                      : current,
                  );
                }
              }}
            >
              <DrawerTrigger asChild>
                <Button size="sm" variant={showUpdateForm ? "secondary" : "default"}>
                  {showUpdateForm ? "Close quick" : "Quick update"}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-w-3xl bg-card text-card-foreground h-[90vh]">
                <DrawerHeader className="px-4 pt-4 pb-2">
                  <DrawerTitle>Quick situation update</DrawerTitle>
                  <DrawerDescription>Buttons first; defaults to now.</DrawerDescription>
                </DrawerHeader>
                <div className="space-y-5 px-4 pb-4 overflow-y-auto">
                  <div className="space-y-3">
                    <DateTimePicker
                      label="Time Observed"
                      value={observedAt}
                      onChange={setObservedAt}
                      className="text-base"
                    />
                  </div>

                  <OptionGroup
                    label="General status"
                    options={GENERAL_STATUS_OPTIONS}
                    value={generalStatus}
                    onChange={setGeneralStatus}
                  />

                  <OptionGroup
                    label="Is assistance needed?"
                    options={TERNARY_OPTIONS}
                    value={assistanceNeeded}
                    onChange={setAssistanceNeeded}
                  />

                  <OptionGroup
                    label="Are authorities present?"
                    options={TERNARY_OPTIONS}
                    value={authoritiesPresent}
                    onChange={setAuthoritiesPresent}
                  />

                  <OptionGroup
                    label="Is the public affected?"
                    options={TERNARY_OPTIONS}
                    value={publicAffected}
                    onChange={setPublicAffected}
                  />

                  <OptionGroup
                    label="Location condition (optional)"
                    options={LOCATION_OPTIONS}
                    value={locationCondition}
                    onChange={setLocationCondition}
                  />

                  <OptionGroup
                    label="Safety concerns (optional)"
                    options={SAFETY_CONCERN_OPTIONS}
                    value={safetyConcern}
                    onChange={setSafetyConcern}
                  />

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Quick notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="min-h-[96px]"
                      placeholder="Short, factual notes only"
                    />
                  </div>
                </div>
                <DrawerFooter className="px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 border-t">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button size="lg" className="h-12 w-full sm:w-auto" onClick={handleAddUpdate}>
                      {editingItem && editingItem.kind === "situation-update" && !isDetailedSituationUpdate(editingItem.entry)
                        ? "Save Changes"
                        : "Save Update"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 w-full sm:w-auto"
                      onClick={resetUpdateForm}
                    >
                      Reset Form
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="lg" className="h-12 w-full sm:w-auto">
                        Cancel
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            <Drawer
              open={showDetailedUpdate}
              onOpenChange={(open: boolean) => {
                setShowDetailedUpdate(open);
                if (!open) {
                  resetDetailedUpdateForm();
                  setEditingItem((current) =>
                    current && current.kind === "situation-update" && isDetailedSituationUpdate(current.entry)
                      ? null
                      : current,
                  );
                }
              }}
            >
              <DrawerTrigger asChild>
                <Button size="sm" variant={showDetailedUpdate ? "secondary" : "outline"}>
                  {showDetailedUpdate ? "Close detailed" : "Detailed update"}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-w-3xl bg-card text-card-foreground h-[90vh]">
                <DrawerHeader className="px-4 pt-4 pb-2">
                  <DrawerTitle>Detailed situation update</DrawerTitle>
                  <DrawerDescription>Capture narrative context with richer notes.</DrawerDescription>
                </DrawerHeader>
                <div className="space-y-5 px-4 pb-4 overflow-y-auto">
                  <div className="space-y-3">
                    <DateTimePicker
                      label="Time Observed"
                      value={observedAtDetailed}
                      onChange={setObservedAtDetailed}
                      className="text-base"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="detail-summary">Situation summary</Label>
                    <Textarea
                      id="detail-summary"
                      value={detailSummary}
                      onChange={(event) => setDetailSummary(event.target.value)}
                      className="min-h-[96px]"
                      placeholder="What happened, who is involved, and immediate impact."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="detail-general-status">General status</Label>
                    <Select
                      value={generalStatusDetailed}
                      onValueChange={(value) => setGeneralStatusDetailed(value as SituationGeneralStatus)}
                    >
                      <SelectTrigger id="detail-general-status" className="h-11 w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENERAL_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="detail-assistance-select">Is assistance needed?</Label>
                      <Select
                        value={assistanceNeededDetailed}
                        onValueChange={(value) => setAssistanceNeededDetailed(value as TernaryChoice)}
                      >
                        <SelectTrigger id="detail-assistance-select" className="h-11 w-full">
                          <SelectValue placeholder="Select assistance" />
                        </SelectTrigger>
                        <SelectContent>
                          {TERNARY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="detail-assistance">Assistance details</Label>
                      <Textarea
                        id="detail-assistance"
                        value={detailAssistance}
                        onChange={(event) => setDetailAssistance(event.target.value)}
                        className="min-h-[72px]"
                        placeholder="Resources requested, ETA, contact names."
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="detail-authorities-select">Are authorities present?</Label>
                      <Select
                        value={authoritiesPresentDetailed}
                        onValueChange={(value) => setAuthoritiesPresentDetailed(value as TernaryChoice)}
                      >
                        <SelectTrigger id="detail-authorities-select" className="h-11 w-full">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          {TERNARY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="detail-authorities">Authorities details</Label>
                      <Textarea
                        id="detail-authorities"
                        value={detailAuthorities}
                        onChange={(event) => setDetailAuthorities(event.target.value)}
                        className="min-h-[72px]"
                        placeholder="Agencies on scene, badge numbers, actions taken."
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="detail-public-select">Is the public affected?</Label>
                      <Select
                        value={publicAffectedDetailed}
                        onValueChange={(value) => setPublicAffectedDetailed(value as TernaryChoice)}
                      >
                        <SelectTrigger id="detail-public-select" className="h-11 w-full">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          {TERNARY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="detail-public">Public impact</Label>
                      <Textarea
                        id="detail-public"
                        value={detailPublicImpact}
                        onChange={(event) => setDetailPublicImpact(event.target.value)}
                        className="min-h-[72px]"
                        placeholder="Crowd behavior, evacuations, bystander needs."
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="detail-location-select">Location condition</Label>
                      <Select
                        value={locationConditionDetailed}
                        onValueChange={(value) => setLocationConditionDetailed(value as LocationCondition)}
                      >
                        <SelectTrigger id="detail-location-select" className="h-11 w-full">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATION_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="detail-location">Location details</Label>
                      <Textarea
                        id="detail-location"
                        value={detailLocation}
                        onChange={(event) => setDetailLocation(event.target.value)}
                        className="min-h-[72px]"
                        placeholder="Access routes, hazards, utilities, weather."
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="detail-safety-select">Safety concerns</Label>
                      <Select
                        value={safetyConcernDetailed}
                        onValueChange={(value) => setSafetyConcernDetailed(value as SafetyConcernLevel)}
                      >
                        <SelectTrigger id="detail-safety-select" className="h-11 w-full">
                          <SelectValue placeholder="Select concern" />
                        </SelectTrigger>
                        <SelectContent>
                          {SAFETY_CONCERN_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="detail-safety">Safety details</Label>
                      <Textarea
                        id="detail-safety"
                        value={detailSafety}
                        onChange={(event) => setDetailSafety(event.target.value)}
                        className="min-h-[72px]"
                        placeholder="Risks, PPE needs, vulnerable individuals."
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="detail-additional">Additional notes</Label>
                    <Textarea
                      id="detail-additional"
                      value={detailAdditionalNotes}
                      onChange={(event) => setDetailAdditionalNotes(event.target.value)}
                      className="min-h-[96px]"
                      placeholder="Anything else dispatch should know."
                    />
                  </div>
                </div>
                <DrawerFooter className="px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 border-t">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button size="lg" className="h-12 w-full sm:w-auto" onClick={handleAddDetailedUpdate}>
                      {editingItem && editingItem.kind === "situation-update" && isDetailedSituationUpdate(editingItem.entry)
                        ? "Save Changes"
                        : "Save Detailed Update"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 w-full sm:w-auto"
                      onClick={resetDetailedUpdateForm}
                    >
                      Reset Detailed
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="lg" className="h-12 w-full sm:w-auto">
                        Cancel
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose a quick tap-first update or capture a full narrative with details and notes. Time defaults to now.
        </p>
      </section>
      <hr className="h-1 bg-accent w-full" />
      <section className="space-y-4">
        <div className="flex flex-col items-center justify-between gap-3">
          <SectionHeading
            title="History"
            hint="Chronological log of check-ins and updates."
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyAll}>
              Copy All Updates
            </Button>
          </div>
        </div>
        {!history.length ? (
          <p className="text-sm text-muted-foreground">No entries yet.</p>
        ) : (
          <div className="space-y-3 bg-card p-3 rounded-2xl text-card-foreground">
            {history.sort((a, b) => {
              const dateA = a.kind === "safety-check" ? new Date(a.entry.recordedAt) : new Date(a.entry.observedAt);
              const dateB = b.kind === "safety-check" ? new Date(b.entry.recordedAt) : new Date(b.entry.observedAt);
              return dateB.getTime() - dateA.getTime();
            }).map((item) => {
              const time =
                item.kind === "safety-check"
                  ? formatLocalDateTime(item.entry.recordedAt)
                  : formatLocalDateTime(item.entry.observedAt);
              const details = historyDetails(item);
              return (
                <div key={item.entry.id} className="rounded-xl border bg-background p-4">
                  <div className="flex flex-col items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 w-full justify-between">

                          <Badge variant="secondary" className="uppercase tracking-wide">
                            {item.kind === "safety-check" ? "Safety Check" : "Situation Update"}
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteRequest(item)}>
                            <Trash className="h-4 w-4 text-destructive" aria-hidden />
                          </Button>
                        </div>
                        <span className="text-sm text-muted-foreground">{time}</span>
                      </div>
                      <ul className="space-y-1 text-sm text-foreground list-disc pl-4 marker:text-muted-foreground">
                        {details.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.kind === "situation-update" ? (
                        <Button size="sm" variant="outline" onClick={() => beginEditUpdate(item)}>
                          Edit
                        </Button>
                      ) : null}
                      <Button size="sm" variant="outline" onClick={() => handleCopyItem(item)}>
                        Copy This Update
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <hr className="h-1 bg-accent w-full" />
      <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
        <SectionHeading
          title="Export Response Summary"
          hint="Copy or share a clean summary for dispatch."
        />
        <div className="flex flex-wrap gap-3">
          <Button size="lg" className="h-12" onClick={handleExportSummary}>
            Copy Summary
          </Button>
          <Button size="lg" variant="outline" className="h-12" onClick={handleShareSummary}>
            Share
          </Button>
          <Button size="lg" variant="outline" className="h-12" onClick={handlePrintSummary}>
            Export PDF
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Summary includes Response Ref, all safety check-ins, situation updates, and timestamps in order.
        </p>
      </section>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the {deleteTarget?.kind === "safety-check" ? "safety check-in" : "situation update"}
              {deleteTarget ? ` from ${formatLocalDateTime(deleteTarget.kind === "safety-check" ? deleteTarget.entry.recordedAt : deleteTarget.entry.observedAt)}` : ""}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white" onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
