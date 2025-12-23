"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@workspace/ui/primitives";
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
import { DateTimePicker, FormSectionCard, PageHeader } from "@workspace/ui/patterns/common";
import { toast } from "@workspace/ui/primitives/sonner";
import {
  clearIntakeDraftPersistenceById,
  ensureIntakeDraftHydrated,
  type ContactEntry,
  type IntakeDraft,
  type IntakeStatus,
  type IntakeUrgency,
  type InterpreterNeeded,
  useIntakeDraftStoreFor,
} from "@workspace/store/useIntakeDraftStore";
import { useIntakeDraftIndexStore } from "@workspace/store/useIntakeDraftIndexStore";
import { getRouteIndexEntry, type RouteIndexEntry } from "@workspace/store/persistence/routeIndex";
import { DatePicker } from "@workspace/ui/patterns/common/date-picker";
import { ArrowLeft } from "lucide-react";

const STATUS_OPTIONS: { label: string; value: IntakeStatus }[] = [
  { label: "Detained", value: "detained" },
  { label: "Missing", value: "missing" },
  { label: "Transferred", value: "transferred" },
  { label: "Unknown", value: "unknown" },
];

const URGENCY_OPTIONS: { label: string; value: IntakeUrgency }[] = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const INTERPRETER_OPTIONS: { label: string; value: InterpreterNeeded }[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

function formatLocalTimestamp(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function normalizeText(value: string) {
  return value?.trim() ?? "";
}

function formatStatus(value: IntakeStatus) {
  switch (value) {
    case "detained":
      return "Detained";
    case "missing":
      return "Missing";
    case "transferred":
      return "Transferred";
    case "unknown":
      return "Unknown";
    default:
      return "";
  }
}

function formatUrgency(value: IntakeUrgency) {
  switch (value) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return "";
  }
}

function formatInterpreter(value: InterpreterNeeded) {
  switch (value) {
    case "yes":
      return "Yes";
    case "no":
      return "No";
    default:
      return "";
  }
}

function buildDescriptionBlock(draft: IntakeDraft) {
  const lines = [
    `Physical Description: ${normalizeText(draft.physicalDescription)}`,
    `Last Known Facility: ${normalizeText(draft.lastKnownFacility)}`,
    `Last Known City: ${normalizeText(draft.lastKnownCity)}`,
    `A-Number: ${normalizeText(draft.aNumber)}`,
  ];
  return lines.join("\n");
}

function formatContactLine(entry: ContactEntry) {
  const parts: string[] = [];
  const name = normalizeText(entry.name);
  const phone = normalizeText(entry.phone);
  const relation = normalizeText(entry.relation);
  const notes = normalizeText(entry.notes);
  const hasContent = [name, phone, relation, notes].some(Boolean);
  if (!hasContent) return '';
  const detail: string[] = [];
  if (phone) detail.push(phone);
  if (relation) detail.push(relation);
  const detailText = detail.length ? ` (${detail.join(' · ')})` : '';
  const noteText = notes ? ` — ${notes}` : '';
  const nameText = name || 'Unknown';
  return `- ${nameText}${detailText}${noteText}`;
}

function formatContactGroup(label: string, entries: ContactEntry[]) {
  const lines = entries
    .map(formatContactLine)
    .filter(Boolean);
  return lines.length ? `${label}:\n${lines.join('\n')}` : `${label}:`;
}

function buildContactsBlock(draft: IntakeDraft) {
  return [
    formatContactGroup('Family / Emergency Contacts', draft.familyContacts || []),
    formatContactGroup('Witness Contacts', draft.witnessContacts || []),
  ].join('\n');
}

function buildNotesBlock(draft: IntakeDraft) {
  const lines = [
    `Belongings Left Behind: ${normalizeText(draft.belongings)}`,
    `Dependents Left Behind: ${normalizeText(draft.dependents)}`,
    `Interpreter Needed: ${formatInterpreter(draft.interpreterNeeded)}`,
    `Additional Notes: ${normalizeText(draft.notes)}`,
  ];
  return lines.join("\n");
}

function buildReportText(
  draft: IntakeDraft,
  collectedAtDisplay: string,
  lastSeenDisplay: string,
) {
  const dobOrAge = normalizeText(draft.dateOfBirth) || normalizeText(draft.approximateAge);
  const genderPronouns = [normalizeText(draft.gender), normalizeText(draft.pronouns)]
    .filter(Boolean)
    .join(" / ");

  return `[MISSING PERSON REPORT]\n\nCase Ref: ${draft.caseRef}\nCollected At: ${collectedAtDisplay}\nCollector: ${normalizeText(draft.collectorCallSign)}\n\nIDENTITY\nName: ${normalizeText(draft.fullName)}\nAliases: ${normalizeText(draft.aliases)}\nDOB / Age: ${dobOrAge}\nGender / Pronouns: ${genderPronouns}\nLanguages: ${normalizeText(draft.languages)}\n\nLAST KNOWN\nLast Seen: ${lastSeenDisplay}\nLocation: ${normalizeText(draft.lastSeenLocation)}\nAgency: ${normalizeText(draft.agency)}\nReason Given (if any): ${normalizeText(draft.reasonGiven)}\n\nSTATUS\nCurrent Status: ${formatStatus(draft.currentStatus)}\nUrgency: ${formatUrgency(draft.urgency)}\n\nDESCRIPTION\n${buildDescriptionBlock(draft)}\n\nCONTACTS\n${buildContactsBlock(draft)}\n\nNOTES\n${buildNotesBlock(draft)}\n`;
}

function downloadJson(draft: IntakeDraft) {
  const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${draft.caseRef || "intake-wip"}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportPdf(reportText: string) {
  const safeBody = reportText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `
    <html>
      <head>
        <title>Intake Report</title>
        <meta charset="UTF-8" />
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; }
          pre { white-space: pre-wrap; word-wrap: break-word; font-size: 14px; line-height: 1.4; }
          h1 { font-size: 18px; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <h1>Intake Report</h1>
        <pre>${safeBody}</pre>
      </body>
    </html>
  `;

  const blobUrl = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const win = window.open(blobUrl, "_blank", "noopener,noreferrer");
  if (!win) {
    toast.error("Enable popups to export PDF. Copied report instead.");
    navigator.clipboard
      .writeText(reportText)
      .then(() => toast.success("Report copied"))
      .catch(() => toast.error("Copy failed. Select and copy manually."));
    URL.revokeObjectURL(blobUrl);
    return;
  }

  win.document.title = "Intake Report";
  win.focus();
  win.print();
}

export function IntakeDetail({
  draftId,
  onBack,
}: {
  draftId: string;
  onBack: () => void;
}) {
  const draft = useIntakeDraftStoreFor(draftId, (state) => state.draft);
  const updateField = useIntakeDraftStoreFor(draftId, (state) => state.updateField);
  const overwriteDraft = useIntakeDraftStoreFor(draftId, (state) => state.overwriteDraft);
  const markSubmitted = useIntakeDraftStoreFor(draftId, (state) => state.markSubmitted);

  const upsertDraft = useIntakeDraftIndexStore((state) => state.upsertDraft);
  const removeDraft = useIntakeDraftIndexStore((state) => state.removeDraft);

  const [isClearing, setIsClearing] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [hydrationState, setHydrationState] = useState<'pending' | 'ready' | 'missing-route' | 'missing-payload'>('pending');
  const [routeEntry, setRouteEntry] = useState<RouteIndexEntry | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (!draftId) return;
      setHydrationState('pending');
      const entry = await getRouteIndexEntry(draftId);
      if (cancelled) return;
      setRouteEntry(entry);
      if (!entry || entry.tombstone) {
        setHydrated(false);
        setHydrationState('missing-route');
        return;
      }
      if (entry.version !== 1) {
        setHydrated(false);
        setHydrationState('missing-payload');
        return;
      }
      const result = await ensureIntakeDraftHydrated(draftId);
      if (cancelled) return;
      setHydrated(result.restored);
      setHydrationState(result.restored ? 'ready' : 'missing-payload');
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [draftId]);

  useEffect(() => {
    if (!hydrated || !draftId) return;
    upsertDraft({
      id: draftId,
      caseRef: draft.caseRef,
      lastUpdatedAt: draft.lastUpdatedAt,
      createdAt: draft.lastUpdatedAt || new Date().toISOString(),
      status: draft.isSubmitted ? "submitted" : "wip",
      submittedAt: draft.submittedAt,
    });
  }, [draftId, draft.caseRef, draft.isSubmitted, draft.lastUpdatedAt, draft.submittedAt, hydrated, upsertDraft]);

  const isSubmitted = draft.isSubmitted;
  const collectedAtDisplay = hydrated && draft.lastUpdatedAt
    ? formatLocalTimestamp(draft.lastUpdatedAt)
    : "";

  const lastSeenDisplay = hydrated && draft.lastSeenDateTime
    ? formatLocalTimestamp(draft.lastSeenDateTime)
    : normalizeText(draft.lastSeenDateTime);

  const reportText = useMemo(
    () => buildReportText(draft, collectedAtDisplay, lastSeenDisplay),
    [draft, collectedAtDisplay, lastSeenDisplay],
  );

  const submittedDisplay = hydrated && (draft.submittedAt || draft.lastUpdatedAt)
    ? formatLocalTimestamp(draft.submittedAt || draft.lastUpdatedAt)
    : "";

  const savedLabel = isSubmitted
    ? `Submitted locally · ${submittedDisplay || "locked"}`
    : hydrated && draft.lastUpdatedAt
      ? `Saved locally · ${formatLocalTimestamp(draft.lastUpdatedAt)}`
      : "Saved locally";

  if (hydrationState === 'pending') {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Intake</p>
          <h1 className="text-2xl font-semibold leading-tight text-foreground">Loading intake</h1>
          <p className="text-sm text-muted-foreground">Preparing offline data…</p>
        </div>
      </main>
    );
  }

  if (hydrationState === 'missing-route') {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Intake</p>
          <h1 className="text-2xl font-semibold leading-tight text-foreground">WIP not indexed</h1>
          <p className="text-sm text-muted-foreground">This route is not in the local index. Start a new intake or open another saved WIP.</p>
          <div className="flex gap-3">
            <Button size="lg" className="h-12" onClick={onBack}>
              Back to WIPs
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (hydrationState === 'missing-payload') {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Intake</p>
          <h1 className="text-2xl font-semibold leading-tight text-foreground">Offline copy missing</h1>
          <p className="text-sm text-muted-foreground">The intake id is known, but no saved draft was found on this device. Try again when online or start a new WIP.</p>
          <Badge variant="outline" className="h-7 w-fit rounded-full px-3">WIP: {routeEntry?.id ?? draftId}</Badge>
          <div className="flex gap-3">
            <Button size="lg" className="h-12" onClick={onBack}>
              Back to WIPs
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      toast.success("Report copied");
    } catch (error) {
      console.error("copy failed", error);
      toast.error("Copy failed. Select and copy manually.");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: reportText, title: draft.caseRef });
        toast.success("Shared");
        return;
      } catch (error) {
        console.error("share failed", error);
      }
    }
    await handleCopy();
  };

  const handleExportJson = () => {
    downloadJson(draft);
    toast.success("JSON exported locally");
  };

  const handleExportPdf = () => {
    exportPdf(reportText);
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    markSubmitted();
    toast.success("Marked as submitted. This WIP is now locked.");
  };

  const handleClear = async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      const fresh = await clearIntakeDraftPersistenceById(draftId);
      overwriteDraft(fresh);
      removeDraft(draftId);
      toast.success("WIP cleared");
      onBack();
    } finally {
      setIsClearing(false);
      setShowClearDialog(false);
    }
  };

  const setField = <K extends keyof IntakeDraft>(field: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      updateField(field, event.target.value as IntakeDraft[K]);

  const makeContact = (): ContactEntry => ({
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    phone: "",
    relation: "",
    notes: "",
  });

  const addContact = (key: "familyContacts" | "witnessContacts") => {
    const list = draft[key] || [];
    updateField(key, [...list, makeContact()] as IntakeDraft[typeof key]);
  };

  const updateContact = (
    key: "familyContacts" | "witnessContacts",
    id: string,
    field: keyof ContactEntry,
    value: string,
  ) => {
    const list = draft[key] || [];
    updateField(
      key,
      list.map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact,
      ) as IntakeDraft[typeof key],
    );
  };

  const removeContact = (key: "familyContacts" | "witnessContacts", id: string) => {
    const list = draft[key] || [];
    updateField(key, list.filter((contact) => contact.id !== id) as IntakeDraft[typeof key]);
  };

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-6 pb-12">
      <div>
        <Button variant="ghost" size="sm" className="px-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back
        </Button>
      </div>
      <PageHeader
        title="Intake"
        description="Capture missing or detained person info. WIPs stay on this device until you share."
        actions={(
          <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant={isSubmitted ? "success" : "secondary"}>{isSubmitted ? "Submitted" : "WIP"}</Badge>
              <span className="font-semibold text-foreground">Case Ref: {draft.caseRef}</span>
            </div>
            <Badge variant="outline">{savedLabel}</Badge>
          </div>
        )}
        className="pt-2"
      />

      <div className="flex flex-col gap-3">
        <Button
          className="h-11"
          variant="destructive"
          onClick={() => setShowClearDialog(true)}
          disabled={isClearing}
        >
          Clear WIP
        </Button>
        {!isSubmitted ? (
          <Button className="h-11" onClick={handleSubmit}>
            Mark Submitted (lock)
          </Button>
        ) : (
          <Badge variant="success" className="h-11 items-center justify-center px-3 text-sm">
            Submitted — locked
          </Badge>
        )}
      </div>

      {isSubmitted ? (
        <p className="rounded-lg border border-muted-foreground/20 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          This WIP was submitted and is locked from further edits. Copy, share, or export as needed.
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <Button className="h-12 text-base" onClick={handleCopy}>Copy Report Text</Button>
        <Button className="h-12 text-base" variant="secondary" onClick={handleShare}>
          Share Report
        </Button>
        <Button className="h-12 text-base" variant="outline" onClick={handleExportPdf}>
          Export PDF
        </Button>
        <Button className="h-12 text-base" variant="outline" onClick={handleExportJson}>
          Export JSON
        </Button>
      </section>

      <FormSectionCard
        title="Identity"
        description="Required basics for the individual."
        contentClassName="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={draft.fullName}
            onChange={setField("fullName")}
            className="h-12 text-base"
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aliases">Aliases (optional)</Label>
          <Input
            id="aliases"
            value={draft.aliases}
            onChange={setField("aliases")}
            className="h-12 text-base"
            placeholder="Comma separated"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <DatePicker
              label="Date of Birth"
              value={draft.dateOfBirth}
              onChange={(value) => updateField("dateOfBirth", value)}
              fullWidth
              hideLabel
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="approximateAge">Approximate Age</Label>
            <Input
              id="approximateAge"
              value={draft.approximateAge}
              onChange={setField("approximateAge")}
              className="h-12 text-base"
              inputMode="numeric"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Input
              id="gender"
              value={draft.gender}
              onChange={setField("gender")}
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pronouns">Pronouns</Label>
            <Input
              id="pronouns"
              value={draft.pronouns}
              onChange={setField("pronouns")}
              className="h-12 text-base"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="languages">Languages Spoken</Label>
          <Input
            id="languages"
            value={draft.languages}
            onChange={setField("languages")}
            className="h-12 text-base"
            placeholder="Comma separated"
          />
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="Last Known"
        description="Where and when they were last seen."
        contentClassName="space-y-4"
      >
        <div className="space-y-2">
          <DateTimePicker
            label="Date / Time Last Seen"
            value={draft.lastSeenDateTime || undefined}
            onChange={(value) => updateField("lastSeenDateTime", value)}
            layout="col"
            fullWidth
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => updateField("lastSeenDateTime", new Date().toISOString())}
            >
              Now
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastSeenLocation">Location Last Seen</Label>
          <Input
            id="lastSeenLocation"
            value={draft.lastSeenLocation}
            onChange={setField("lastSeenLocation")}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agency">Arresting / Detaining Agency (if known)</Label>
          <Input
            id="agency"
            value={draft.agency}
            onChange={setField("agency")}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reasonGiven">Reason Given (if any)</Label>
          <Textarea
            id="reasonGiven"
            value={draft.reasonGiven}
            onChange={setField("reasonGiven")}
            className="min-h-20 text-base"
          />
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="Status"
        description="Current status and urgency."
        contentClassName="space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Current Status</Label>
            <Select
              value={draft.currentStatus || undefined}
              onValueChange={(value) => updateField("currentStatus", value as IntakeStatus)}
            >
              <SelectTrigger className="h-12 w-full text-base">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label || "—"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Urgency</Label>
            <Select
              value={draft.urgency || undefined}
              onValueChange={(value) => updateField("urgency", value as IntakeUrgency)}
            >
              <SelectTrigger className="h-12 w-full text-base">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {URGENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label || "—"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="Details / Notes"
        description="Optional details to keep the report actionable."
        contentClassName="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="physicalDescription">Physical Description</Label>
          <Textarea
            id="physicalDescription"
            value={draft.physicalDescription}
            onChange={setField("physicalDescription")}
            className="min-h-24 text-base"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lastKnownFacility">Last Known Facility</Label>
            <Input
              id="lastKnownFacility"
              value={draft.lastKnownFacility}
              onChange={setField("lastKnownFacility")}
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastKnownCity">Last Known City</Label>
            <Input
              id="lastKnownCity"
              value={draft.lastKnownCity}
              onChange={setField("lastKnownCity")}
              className="h-12 text-base"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="aNumber">A-Number (if known)</Label>
            <Input
              id="aNumber"
              value={draft.aNumber}
              onChange={setField("aNumber")}
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interpreterNeeded">Interpreter Needed</Label>
            <Select
              value={draft.interpreterNeeded || undefined}
              onValueChange={(value) =>
                updateField("interpreterNeeded", value as InterpreterNeeded)
              }
            >
              <SelectTrigger className="h-12 w-full text-base">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {INTERPRETER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label || "—"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="belongings">Belongings Left Behind</Label>
            <Textarea
              id="belongings"
              value={draft.belongings}
              onChange={setField("belongings")}
              className="min-h-20 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dependents">Dependents Left Behind</Label>
            <Textarea
              id="dependents"
              value={draft.dependents}
              onChange={setField("dependents")}
              className="min-h-20 text-base"
            />
          </div>
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="Family / Emergency Contacts"
        description="Add family or emergency contacts with quick fields."
        contentClassName="space-y-4"
      >
        <div className="space-y-3">
          {draft.familyContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts added.</p>
          ) : (
            draft.familyContacts.map((contact) => (
              <div key={contact.id} className="space-y-3 rounded-lg border p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Contact Name</Label>
                    <Input
                      value={contact.name}
                      onChange={(e) => updateContact("familyContacts", contact.id, "name", e.target.value)}
                      className="h-11"
                      placeholder="Name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Phone</Label>
                    <Input
                      value={contact.phone}
                      onChange={(e) => updateContact("familyContacts", contact.id, "phone", e.target.value)}
                      className="h-11"
                      inputMode="tel"
                      placeholder="(###) ###-####"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Relation</Label>
                    <Input
                      value={contact.relation}
                      onChange={(e) => updateContact("familyContacts", contact.id, "relation", e.target.value)}
                      className="h-11"
                      placeholder="e.g., Sister"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Notes</Label>
                    <Input
                      value={contact.notes}
                      onChange={(e) => updateContact("familyContacts", contact.id, "notes", e.target.value)}
                      className="h-11"
                      placeholder="Access code, language, etc."
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => removeContact("familyContacts", contact.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => addContact("familyContacts")}
          >
            Add Contact
          </Button>
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="Witness Contacts"
        description="Capture witness details separately."
        contentClassName="space-y-4"
      >
        <div className="space-y-3">
          {draft.witnessContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts added.</p>
          ) : (
            draft.witnessContacts.map((contact) => (
              <div key={contact.id} className="space-y-3 rounded-lg border p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Contact Name</Label>
                    <Input
                      value={contact.name}
                      onChange={(e) => updateContact("witnessContacts", contact.id, "name", e.target.value)}
                      className="h-11"
                      placeholder="Name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Phone</Label>
                    <Input
                      value={contact.phone}
                      onChange={(e) => updateContact("witnessContacts", contact.id, "phone", e.target.value)}
                      className="h-11"
                      inputMode="tel"
                      placeholder="(###) ###-####"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Relation / Context</Label>
                    <Input
                      value={contact.relation}
                      onChange={(e) => updateContact("witnessContacts", contact.id, "relation", e.target.value)}
                      className="h-11"
                      placeholder="e.g., Bystander"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Notes</Label>
                    <Input
                      value={contact.notes}
                      onChange={(e) => updateContact("witnessContacts", contact.id, "notes", e.target.value)}
                      className="h-11"
                      placeholder="What they saw, language, etc."
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => removeContact("witnessContacts", contact.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => addContact("witnessContacts")}
          >
            Add Contact
          </Button>
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="Notes"
        description="Free-text notes and collector info."
        contentClassName="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="notes">Free-text Notes</Label>
          <Textarea
            id="notes"
            value={draft.notes}
            onChange={setField("notes")}
            className="min-h-28 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="collectorCallSign">Collector Call Sign (optional)</Label>
          <Input
            id="collectorCallSign"
            value={draft.collectorCallSign}
            onChange={setField("collectorCallSign")}
            className="h-12 text-base"
            placeholder="e.g., Alpha-12"
          />
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="Preview"
        description="Structured text that will be copied or exported."
        contentClassName="p-0"
      >
        <pre className="whitespace-pre-wrap rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
          {reportText}
        </pre>
      </FormSectionCard>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this WIP?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the local copy and generates a new Case Ref. You cannot undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing} onClick={() => setShowClearDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
              disabled={isClearing}
              onClick={handleClear}
            >
              {isClearing ? "Clearing..." : "Clear WIP"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
