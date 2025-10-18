"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileJson, Pencil, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type {
  ContactInfo,
  DetaineeIntake,
  InfoSource,
  TransferRecord,
} from "@/src/types/DetaineeIntake";
import { exportLegalAidReport } from "@/src/pipelines/exportLegalAidReport";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  CASE_ID_STORAGE_KEY,
  normaliseCaseId,
} from "@workspace/ui/lib/missing-person-case-id";
import { useMissingPersonStore } from "@workspace/store/useMissingPersonStore";

type SectionKey =
  | "caseMetadata"
  | "identification"
  | "detentionDetails"
  | "supportNetwork"
  | "verificationNotes";

type SectionField = { label: string; value?: React.ReactNode };

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRelativeDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Updated today";
  if (diffDays === 1) return "Updated 1 day ago";
  if (diffDays < 7) return `Updated ${diffDays} days ago`;
  return `Updated ${Math.floor(diffDays / 7)} weeks ago`;
}

function isPresent(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).length > 0;
  }
  return true;
}

function formatList(values?: string[]): React.ReactNode {
  if (!values || values.length === 0) {
    return <span className="text-muted-foreground">Not provided</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((value) => (
        <Badge key={value} variant="outline">
          {value}
        </Badge>
      ))}
    </div>
  );
}

function formatTransfers(records?: TransferRecord[]): React.ReactNode {
  if (!records || records.length === 0) {
    return <span className="text-muted-foreground">No documented transfers</span>;
  }
  return (
    <div className="space-y-2 text-sm">
      {records.map((transfer, index) => (
        <div key={`${transfer.transferDate}-${transfer.toFacility}-${index}`}>
          <div className="font-medium text-foreground">{transfer.toFacility ?? "Unknown facility"}</div>
          <div className="text-muted-foreground">
            {transfer.fromFacility ? `From ${transfer.fromFacility}` : null}
            {transfer.fromFacility && transfer.transferDate ? " · " : null}
            {transfer.transferDate ? new Date(transfer.transferDate).toLocaleString() : null}
            {transfer.method ? ` · ${transfer.method}` : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatContacts(records?: ContactInfo[]): React.ReactNode {
  if (!records || records.length === 0) {
    return <span className="text-muted-foreground">No contacts recorded</span>;
  }
  return (
    <div className="space-y-2 text-sm">
      {records.map((contact, index) => (
        <div key={`${contact.name}-${contact.relation ?? index}`}>
          <div className="font-medium text-foreground">{contact.name}</div>
          <div className="text-muted-foreground">
            {[contact.relation, contact.phone, contact.email].filter(isPresent).join(" · ")}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatInfoSources(records?: InfoSource[]): React.ReactNode {
  if (!records || records.length === 0) {
    return <span className="text-muted-foreground">No verification notes recorded</span>;
  }
  return (
    <div className="space-y-3 text-sm">
      {records.map((source, index) => (
        <div key={`${source.field}-${index}`}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{source.field}</Badge>
            <Badge variant="secondary">{source.sourceType}</Badge>
            {source.confidence ? (
              <Badge variant="outline">Confidence {source.confidence}/5</Badge>
            ) : null}
          </div>
          {source.details ? (
            <div className="text-muted-foreground">{source.details}</div>
          ) : null}
          {source.timestamp ? (
            <div className="text-xs text-muted-foreground">
              Logged {new Date(source.timestamp).toLocaleString()}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function stringifyList(values?: string[] | null): string {
  if (!values || values.length === 0) return "";
  return values.join("\n");
}

function parseList(input: string): string[] | undefined {
  const values = input
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  return values.length > 0 ? values : undefined;
}

function contactsToTextarea(records?: ContactInfo[] | null): string {
  if (!records || records.length === 0) return "";
  return records
    .map((contact) =>
      [
        contact.name ?? "",
        contact.relation ?? "",
        contact.phone ?? "",
        contact.email ?? "",
      ]
        .map((value) => value.trim())
        .join(" | ")
    )
    .join("\n");
}

function parseContacts(input: string): ContactInfo[] | undefined {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return undefined;

  const contacts: ContactInfo[] = lines.map((line) => {
    const [name, relation, phone, email] = line.split("|").map((part) => part.trim());
    return {
      name: name || "Unknown",
      relation: relation || undefined,
      phone: phone || undefined,
      email: email || undefined,
    };
  });

  return contacts.length > 0 ? contacts : undefined;
}

function transfersToTextarea(records?: TransferRecord[] | null): string {
  if (!records || records.length === 0) return "";
  return records
    .map((transfer) =>
      [
        transfer.fromFacility ?? "",
        transfer.toFacility ?? "",
        transfer.transferDate ?? "",
        transfer.method ?? "",
      ]
        .map((value) => value.trim())
        .join(" | ")
    )
    .join("\n");
}

function parseTransfers(input: string): TransferRecord[] | undefined {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return undefined;

  const transfers: TransferRecord[] = lines.map((line) => {
    const [fromFacility, toFacility, transferDate, method] = line
      .split("|")
      .map((part) => part.trim());
    return {
      fromFacility: fromFacility || undefined,
      toFacility: toFacility || undefined,
      transferDate: transferDate || undefined,
      method: method || undefined,
    };
  });

  return transfers.length > 0 ? transfers : undefined;
}

function infoSourcesToTextarea(records?: InfoSource[] | null): string {
  if (!records || records.length === 0) return "";
  return records
    .map((source) =>
      [
        source.field ?? "",
        source.sourceType ?? "",
        source.details ?? "",
        source.timestamp ?? "",
        source.confidence?.toString() ?? "",
      ]
        .map((value) => value.trim())
        .join(" | ")
    )
    .join("\n");
}

function parseInfoSources(input: string): InfoSource[] | undefined {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return undefined;

  const validSourceTypes = new Set<InfoSource["sourceType"]>([
    "witness",
    "document",
    "phone",
    "other",
  ]);

  const sources: InfoSource[] = lines.map((line) => {
    const [field, sourceType, details, timestamp, confidence] = line
      .split("|")
      .map((part) => part.trim());
    const parsedConfidence = confidence ? Number(confidence) : undefined;
    return {
      field: field || "unknown",
      sourceType: validSourceTypes.has(sourceType as InfoSource["sourceType"])
        ? (sourceType as InfoSource["sourceType"])
        : "other",
      details: details || undefined,
      timestamp: timestamp || undefined,
      confidence:
        parsedConfidence && parsedConfidence >= 1 && parsedConfidence <= 5
          ? parsedConfidence
          : undefined,
    };
  });

  return sources.length > 0 ? sources : undefined;
}

const emptyToUndefined = (value: string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

interface MissingPersonDetailProps {
  record: DetaineeIntake;
  slug: string;
}

export function MissingPersonDetail({ record, slug }: MissingPersonDetailProps) {
  const router = useRouter();
  const removeRecordFromStore = useMissingPersonStore((state) => state.removeRecord);
  const hasRecordInStore = useMissingPersonStore((state) => state.hasRecord);
  const [currentRecord, setCurrentRecord] = React.useState<DetaineeIntake>(record);
  const [openSection, setOpenSection] = React.useState<SectionKey | null>(null);
  const [draft, setDraft] = React.useState<any>(null);
  const [exporting, setExporting] = React.useState<"pdf" | "json" | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const normalizedCaseId = React.useMemo(
    () => (record.caseId ? normaliseCaseId(record.caseId) : null),
    [record.caseId]
  );
  const isDeletable = React.useMemo(
    () => (normalizedCaseId ? hasRecordInStore(normalizedCaseId) : false),
    [normalizedCaseId, hasRecordInStore]
  );

  React.useEffect(() => {
    setCurrentRecord(record);
  }, [record]);

  React.useEffect(() => {
    if (openSection) {
      setDraft(createInitialDraft(openSection, currentRecord));
    } else {
      setDraft(null);
    }
  }, [openSection, currentRecord]);

  const removeCaseIdFromStorage = React.useCallback((caseId: string) => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(CASE_ID_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const remaining = parsed.filter(
        (id: unknown) => typeof id === "string" && normaliseCaseId(id) !== caseId
      );
      window.localStorage.setItem(CASE_ID_STORAGE_KEY, JSON.stringify(remaining));
    } catch (error) {
      console.warn("Failed to remove case ID from storage", error);
    }
  }, []);

  const handleDelete = React.useCallback(async () => {
    if (!normalizedCaseId) {
      toast.error("This record cannot be deleted because it has no case ID.");
      return;
    }

    try {
      setDeleting(true);
      removeRecordFromStore(normalizedCaseId);
      removeCaseIdFromStorage(normalizedCaseId);
      toast.success("Intake deleted. Redirecting to directory…");
      router.push("/missing-persons");
    } catch (error) {
      console.error("Failed to delete intake", error);
      toast.error("Failed to delete this intake. Please try again.");
    } finally {
      setDeleting(false);
    }
  }, [normalizedCaseId, removeCaseIdFromStorage, removeRecordFromStore, router]);

  const handleExport = async (format: "pdf" | "json") => {
    try {
      setExporting(format);
      const result = await exportLegalAidReport(currentRecord, format);

      if (format === "json" && typeof result === "string") {
        await navigator.clipboard?.writeText(result);
        toast.success("JSON copied to clipboard");
        return;
      }

      if (format === "pdf" && result instanceof Blob) {
        const url = URL.createObjectURL(result);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `detainee-report-${currentRecord.caseId ?? slug}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
        toast.success("PDF download started");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to export report. Try again after checking the record.");
    } finally {
      setExporting(null);
    }
  };

  const headerBadges = [
    currentRecord.pronouns ? (
      <Badge key="pronouns" variant="outline">
        {currentRecord.pronouns}
      </Badge>
    ) : null,
    currentRecord.languagesSpoken?.length ? (
      <Badge key="languages" variant="outline">
        {currentRecord.languagesSpoken.join(", ")}
      </Badge>
    ) : null,
    currentRecord.interpreterNeeded ? (
      <Badge key="interpreter" variant="destructive">
        Interpreter needed
      </Badge>
    ) : null,
    currentRecord.confidenceRating ? (
      <Badge key="confidence" variant="secondary">
        Confidence {currentRecord.confidenceRating}/5
      </Badge>
    ) : null,
  ].filter(Boolean);

  const sections: Array<{
    key: SectionKey;
    heading: string;
    description?: string;
    fields: SectionField[];
  }> = [
      {
        key: "caseMetadata",
        heading: "Case Metadata",
        fields: [
          { label: "Case ID", value: currentRecord.caseId },
          {
            label: "Detention Date",
            value: currentRecord.detentionDateTime
              ? new Date(currentRecord.detentionDateTime).toLocaleString()
              : undefined,
          },
          { label: "Detention Location", value: currentRecord.detentionLocation },
          { label: "Arresting Agency", value: currentRecord.arrestingAgency },
          { label: "Dispatcher", value: currentRecord.dispatcherContact?.name },
          {
            label: "Dispatcher Contact",
            value:
              [
                currentRecord.dispatcherContact?.email,
                currentRecord.dispatcherContact?.phone,
              ]
                .filter(isPresent)
                .join(" · ") || undefined,
          },
        ],
      },
      {
        key: "identification",
        heading: "Identification",
        fields: [
          { label: "Full Name", value: currentRecord.fullName },
          { label: "Aliases", value: formatList(currentRecord.aliases) },
          { label: "Date of Birth", value: currentRecord.dateOfBirth },
          { label: "Country of Birth", value: currentRecord.countryOfBirth },
          { label: "A-Number", value: currentRecord.aNumber },
          { label: "Physical Description", value: currentRecord.physicalDescription },
        ],
      },
      {
        key: "detentionDetails",
        heading: "Detention Details",
        fields: [
          { label: "Last Known Facility", value: currentRecord.lastKnownFacility },
          { label: "Last Known City", value: currentRecord.lastKnownCity },
          { label: "Arresting Officers", value: formatList(currentRecord.arrestingOfficers) },
          { label: "Stated Reason", value: currentRecord.statedReasonForDetention },
          { label: "Belongings Left Behind", value: currentRecord.belongingsLeftBehind },
          { label: "Dependents Left Behind", value: currentRecord.dependentsLeftBehind },
          { label: "Known Transfers", value: formatTransfers(currentRecord.knownTransfers) },
        ],
      },
      {
        key: "supportNetwork",
        heading: "Support Network",
        description: "Who to contact and how to support the detained individual.",
        fields: [
          { label: "Witness Contacts", value: formatContacts(currentRecord.witnessContacts) },
          { label: "Family Contacts", value: formatContacts(currentRecord.familyContacts) },
          { label: "Prior Attorney", value: currentRecord.priorAttorney },
          {
            label: "Preferred Legal Aid Orgs",
            value: formatList(currentRecord.preferredLegalAidOrgs),
          },
          { label: "Urgent Needs", value: formatList(currentRecord.urgentNeeds) },
          {
            label: "Interpreter Needed",
            value: currentRecord.interpreterNeeded ? "Yes" : "No",
          },
        ],
      },
      {
        key: "verificationNotes",
        heading: "Verification & Notes",
        description: "Track confidence and verification sources for this intake.",
        fields: [
          { label: "Information Sources", value: formatInfoSources(currentRecord.informationSources) },
          {
            label: "Last Updated",
            value: currentRecord.lastUpdated
              ? new Date(currentRecord.lastUpdated).toLocaleString()
              : undefined,
          },
          {
            label: "Created At",
            value: currentRecord.createdAt
              ? new Date(currentRecord.createdAt).toLocaleString()
              : undefined,
          },
          { label: "Created By", value: currentRecord.createdBy },
          {
            label: "Version",
            value: currentRecord.version != null ? `v${currentRecord.version}` : undefined,
          },
        ],
      },
    ];

  const updateDraft = (field: string, value: unknown) => {
    setDraft((prev: Record<string, unknown> | null) =>
      prev ? { ...prev, [field]: value } : prev
    );
  };

  const handleSectionSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!openSection || !draft) return;
    const success = saveSection(openSection, draft, setCurrentRecord);
    if (success) {
      toast.success("Section updated.");
      setOpenSection(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Link
              href="/missing-persons"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to directory
            </Link>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {currentRecord.fullName?.trim() || "Unidentified individual"}
              </h1>
              <p className="text-muted-foreground">
                Case {currentRecord.caseId ?? "Pending"} ·{" "}
                {currentRecord.aNumber ? `A-Number ${currentRecord.aNumber}` : "A-Number pending"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">{headerBadges}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isDeletable ? (
              <AlertDialog >
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md bg-card text-card-foreground">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete intake?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the locally saved intake for case{" "}
                      <span className="font-mono">{currentRecord.caseId}</span>. You can re-create it later if needed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="ml-2 text-white bg-red-600 hover:bg-red-700 focus:ring-red-500"
                      >
                        {deleting ? "Deleting…" : "Delete intake"}
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
              disabled={exporting === "json"}
            >
              <FileJson className="mr-2 h-4 w-4" />
              {exporting === "json" ? "Copying…" : "Copy JSON"}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleExport("pdf")}
              disabled={exporting === "pdf"}
            >
              <Download className="mr-2 h-4 w-4" />
              {exporting === "pdf" ? "Generating…" : "Download PDF"}
            </Button>
          </div>
        </div>

        <Separator />

        <ScrollArea className="rounded-lg border">
          <div className="grid gap-6 p-6">
            {sections.map((section) => (
              <Card key={section.key} className="border-border/70">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="text-lg">{section.heading}</CardTitle>
                      {section.description ? (
                        <CardDescription>{section.description}</CardDescription>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setOpenSection(section.key)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit section
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {section.fields.map(({ label, value }) => (
                    <div key={label} className="space-y-1">
                      <div className="text-xs uppercase text-muted-foreground">{label}</div>
                      <div className="text-sm text-foreground">
                        {isPresent(value) ? value : <span className="text-muted-foreground">Not provided</span>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Drawer
        open={openSection !== null}
        onOpenChange={(open) => {
          if (!open) setOpenSection(null);
        }}
      >
        <DrawerContent className="bg-card text-card-foreground m-auto h-full w-full max-w-3xl rounded-t-3xl border border-border/70 shadow-xl">
          {openSection && draft ? (
            <form onSubmit={handleSectionSubmit} className="grid gap-6 overflow-auto">
              <DrawerHeader>
                <DrawerTitle>
                  Edit {sections.find((section) => section.key === openSection)?.heading}
                </DrawerTitle>
                {sections.find((section) => section.key === openSection)?.description ? (
                  <DrawerDescription>
                    {sections.find((section) => section.key === openSection)?.description}
                  </DrawerDescription>
                ) : null}
              </DrawerHeader>

              <div className="grid gap-4 px-4">
                {renderSectionFields(openSection, draft, updateDraft)}
              </div>

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button type="submit">Save changes</Button>
              </DrawerFooter>
            </form>
          ) : null}
        </DrawerContent>
      </Drawer>
    </>
  );
}

function createInitialDraft(section: SectionKey, data: DetaineeIntake) {
  switch (section) {
    case "caseMetadata":
      return {
        caseId: data.caseId ?? "",
        detentionDateTime: data.detentionDateTime ?? "",
        detentionLocation: data.detentionLocation ?? "",
        arrestingAgency: data.arrestingAgency ?? "",
        dispatcherName: data.dispatcherContact?.name ?? "",
        dispatcherEmail: data.dispatcherContact?.email ?? "",
        dispatcherPhone: data.dispatcherContact?.phone ?? "",
        dispatcherRelation: data.dispatcherContact?.relation ?? "",
      };
    case "identification":
      return {
        fullName: data.fullName ?? "",
        aliases: stringifyList(data.aliases),
        dateOfBirth: data.dateOfBirth ?? "",
        countryOfBirth: data.countryOfBirth ?? "",
        pronouns: data.pronouns ?? "",
        languages: stringifyList(data.languagesSpoken),
        aNumber: data.aNumber ?? "",
        physicalDescription: data.physicalDescription ?? "",
      };
    case "detentionDetails":
      return {
        lastKnownFacility: data.lastKnownFacility ?? "",
        lastKnownCity: data.lastKnownCity ?? "",
        arrestingOfficers: stringifyList(data.arrestingOfficers),
        statedReasonForDetention: data.statedReasonForDetention ?? "",
        belongingsLeftBehind: data.belongingsLeftBehind ?? "",
        dependentsLeftBehind: data.dependentsLeftBehind ?? "",
        knownTransfers: transfersToTextarea(data.knownTransfers),
      };
    case "supportNetwork":
      return {
        witnessContacts: contactsToTextarea(data.witnessContacts),
        familyContacts: contactsToTextarea(data.familyContacts),
        priorAttorney: data.priorAttorney ?? "",
        preferredLegalAidOrgs: stringifyList(data.preferredLegalAidOrgs),
        urgentNeeds: stringifyList(data.urgentNeeds),
        interpreterNeeded: data.interpreterNeeded ?? false,
      };
    case "verificationNotes":
      return {
        informationSources: infoSourcesToTextarea(data.informationSources),
        confidenceRating: data.confidenceRating?.toString() ?? "",
        lastUpdated: data.lastUpdated ?? "",
        createdAt: data.createdAt ?? "",
        createdBy: data.createdBy ?? "",
        version: data.version?.toString() ?? "",
      };
    default:
      return {};
  }
}

function saveSection(
  section: SectionKey,
  draft: Record<string, unknown>,
  setCurrentRecord: React.Dispatch<React.SetStateAction<DetaineeIntake>>
): boolean {
  switch (section) {
    case "caseMetadata": {
      const caseId = (draft.caseId as string | undefined)?.trim();
      if (!caseId) {
        toast.error("Case ID is required.");
        return false;
      }

      setCurrentRecord((prev) => {
        const dispatcherName = emptyToUndefined(draft.dispatcherName as string | undefined);
        const dispatcherEmail = emptyToUndefined(draft.dispatcherEmail as string | undefined);
        const dispatcherPhone = emptyToUndefined(draft.dispatcherPhone as string | undefined);
        const dispatcherRelation = emptyToUndefined(
          draft.dispatcherRelation as string | undefined
        );

        const dispatcherValues = [
          dispatcherName,
          dispatcherEmail,
          dispatcherPhone,
          dispatcherRelation,
        ].filter(isPresent);

        const dispatcherContact =
          dispatcherValues.length > 0
            ? {
              name: dispatcherName ?? "",
              email: dispatcherEmail,
              phone: dispatcherPhone,
              relation: dispatcherRelation,
            }
            : undefined;

        return {
          ...prev,
          caseId,
          detentionDateTime: emptyToUndefined(draft.detentionDateTime as string | undefined),
          detentionLocation: emptyToUndefined(draft.detentionLocation as string | undefined),
          arrestingAgency: emptyToUndefined(draft.arrestingAgency as string | undefined),
          dispatcherContact,
        };
      });
      return true;
    }
    case "identification": {
      const aliases = parseList(draft.aliases as string);
      const languages = parseList(draft.languages as string);

      setCurrentRecord((prev) => ({
        ...prev,
        fullName: emptyToUndefined(draft.fullName as string | undefined),
        aliases,
        dateOfBirth: emptyToUndefined(draft.dateOfBirth as string | undefined),
        countryOfBirth: emptyToUndefined(draft.countryOfBirth as string | undefined),
        pronouns: emptyToUndefined(draft.pronouns as string | undefined),
        languagesSpoken: languages,
        aNumber: emptyToUndefined(draft.aNumber as string | undefined),
        physicalDescription: emptyToUndefined(
          draft.physicalDescription as string | undefined
        ),
      }));
      return true;
    }
    case "detentionDetails": {
      const arrestingOfficers = parseList(draft.arrestingOfficers as string);
      const transfers = parseTransfers(draft.knownTransfers as string);

      setCurrentRecord((prev) => ({
        ...prev,
        lastKnownFacility: emptyToUndefined(draft.lastKnownFacility as string | undefined),
        lastKnownCity: emptyToUndefined(draft.lastKnownCity as string | undefined),
        arrestingOfficers,
        statedReasonForDetention: emptyToUndefined(
          draft.statedReasonForDetention as string | undefined
        ),
        belongingsLeftBehind: emptyToUndefined(
          draft.belongingsLeftBehind as string | undefined
        ),
        dependentsLeftBehind: emptyToUndefined(
          draft.dependentsLeftBehind as string | undefined
        ),
        knownTransfers: transfers,
      }));
      return true;
    }
    case "supportNetwork": {
      const witnessContacts = parseContacts(draft.witnessContacts as string);
      const familyContacts = parseContacts(draft.familyContacts as string);
      const preferredLegalAidOrgs = parseList(draft.preferredLegalAidOrgs as string);
      const urgentNeeds = parseList(draft.urgentNeeds as string);
      const interpreterNeeded = Boolean(draft.interpreterNeeded);

      setCurrentRecord((prev) => ({
        ...prev,
        witnessContacts,
        familyContacts,
        priorAttorney: emptyToUndefined(draft.priorAttorney as string | undefined),
        preferredLegalAidOrgs,
        urgentNeeds,
        interpreterNeeded,
      }));
      return true;
    }
    case "verificationNotes": {
      const informationSources = parseInfoSources(draft.informationSources as string);
      const confidenceRaw = (draft.confidenceRating as string | undefined)?.trim();
      const versionRaw = (draft.version as string | undefined)?.trim();

      const confidenceNumber =
        confidenceRaw && !Number.isNaN(Number(confidenceRaw))
          ? Math.min(5, Math.max(1, Number(confidenceRaw)))
          : undefined;
      const versionNumber =
        versionRaw && !Number.isNaN(Number(versionRaw)) ? Number(versionRaw) : undefined;

      setCurrentRecord((prev) => ({
        ...prev,
        informationSources,
        confidenceRating: confidenceNumber,
        lastUpdated: emptyToUndefined(draft.lastUpdated as string | undefined),
        createdAt: emptyToUndefined(draft.createdAt as string | undefined),
        createdBy: emptyToUndefined(draft.createdBy as string | undefined),
        version: versionNumber,
      }));
      return true;
    }
    default:
      return false;
  }
}

function renderSectionFields(
  section: SectionKey,
  draft: Record<string, unknown>,
  updateDraft: (field: string, value: unknown) => void
): React.ReactNode[] {
  switch (section) {
    case "caseMetadata":
      return [
        <div key="caseId" className="grid gap-2">
          <Label htmlFor="caseId">Case ID *</Label>
          <Input
            id="caseId"
            value={(draft.caseId as string) ?? ""}
            onChange={(event) => updateDraft("caseId", event.target.value)}
            required
          />
        </div>,
        <div key="detentionDateTime" className="grid gap-2">
          <Label htmlFor="detentionDateTime">Detention Date &amp; Time</Label>
          <Input
            id="detentionDateTime"
            placeholder="ISO timestamp"
            value={(draft.detentionDateTime as string) ?? ""}
            onChange={(event) => updateDraft("detentionDateTime", event.target.value)}
          />
        </div>,
        <div key="detentionLocation" className="grid gap-2">
          <Label htmlFor="detentionLocation">Detention Location</Label>
          <Input
            id="detentionLocation"
            value={(draft.detentionLocation as string) ?? ""}
            onChange={(event) => updateDraft("detentionLocation", event.target.value)}
          />
        </div>,
        <div key="arrestingAgency" className="grid gap-2">
          <Label htmlFor="arrestingAgency">Arresting Agency</Label>
          <Input
            id="arrestingAgency"
            value={(draft.arrestingAgency as string) ?? ""}
            onChange={(event) => updateDraft("arrestingAgency", event.target.value)}
          />
        </div>,
        <div key="dispatcherName" className="grid gap-2">
          <Label htmlFor="dispatcherName">Dispatcher Name</Label>
          <Input
            id="dispatcherName"
            value={(draft.dispatcherName as string) ?? ""}
            onChange={(event) => updateDraft("dispatcherName", event.target.value)}
          />
        </div>,
        <div key="dispatcherEmail" className="grid gap-2">
          <Label htmlFor="dispatcherEmail">Dispatcher Email</Label>
          <Input
            id="dispatcherEmail"
            type="email"
            value={(draft.dispatcherEmail as string) ?? ""}
            onChange={(event) => updateDraft("dispatcherEmail", event.target.value)}
          />
        </div>,
        <div key="dispatcherPhone" className="grid gap-2">
          <Label htmlFor="dispatcherPhone">Dispatcher Phone</Label>
          <Input
            id="dispatcherPhone"
            value={(draft.dispatcherPhone as string) ?? ""}
            onChange={(event) => updateDraft("dispatcherPhone", event.target.value)}
          />
        </div>,
        <div key="dispatcherRelation" className="grid gap-2">
          <Label htmlFor="dispatcherRelation">Dispatcher Relation</Label>
          <Input
            id="dispatcherRelation"
            value={(draft.dispatcherRelation as string) ?? ""}
            onChange={(event) => updateDraft("dispatcherRelation", event.target.value)}
          />
        </div>,
      ];
    case "identification":
      return [
        <div key="fullName" className="grid gap-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={(draft.fullName as string) ?? ""}
            onChange={(event) => updateDraft("fullName", event.target.value)}
          />
        </div>,
        <div key="aliases" className="grid gap-2">
          <Label htmlFor="aliases">Aliases</Label>
          <Textarea
            id="aliases"
            rows={3}
            placeholder="One alias per line"
            value={(draft.aliases as string) ?? ""}
            onChange={(event) => updateDraft("aliases", event.target.value)}
          />
        </div>,
        <div key="dateOfBirth" className="grid gap-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            placeholder="YYYY-MM-DD"
            value={(draft.dateOfBirth as string) ?? ""}
            onChange={(event) => updateDraft("dateOfBirth", event.target.value)}
          />
        </div>,
        <div key="countryOfBirth" className="grid gap-2">
          <Label htmlFor="countryOfBirth">Country of Birth</Label>
          <Input
            id="countryOfBirth"
            value={(draft.countryOfBirth as string) ?? ""}
            onChange={(event) => updateDraft("countryOfBirth", event.target.value)}
          />
        </div>,
        <div key="pronouns" className="grid gap-2">
          <Label htmlFor="pronouns">Pronouns</Label>
          <Input
            id="pronouns"
            value={(draft.pronouns as string) ?? ""}
            onChange={(event) => updateDraft("pronouns", event.target.value)}
          />
        </div>,
        <div key="languages" className="grid gap-2">
          <Label htmlFor="languages">Languages Spoken</Label>
          <Textarea
            id="languages"
            rows={3}
            placeholder="One language per line"
            value={(draft.languages as string) ?? ""}
            onChange={(event) => updateDraft("languages", event.target.value)}
          />
        </div>,
        <div key="aNumber" className="grid gap-2">
          <Label htmlFor="aNumber">A-Number</Label>
          <Input
            id="aNumber"
            value={(draft.aNumber as string) ?? ""}
            onChange={(event) => updateDraft("aNumber", event.target.value)}
          />
        </div>,
        <div key="physicalDescription" className="grid gap-2 sm:col-span-2">
          <Label htmlFor="physicalDescription">Physical Description</Label>
          <Textarea
            id="physicalDescription"
            rows={3}
            value={(draft.physicalDescription as string) ?? ""}
            onChange={(event) => updateDraft("physicalDescription", event.target.value)}
          />
        </div>,
      ];
    case "detentionDetails":
      return [
        <div key="lastKnownFacility" className="grid gap-2">
          <Label htmlFor="lastKnownFacility">Last Known Facility</Label>
          <Input
            id="lastKnownFacility"
            value={(draft.lastKnownFacility as string) ?? ""}
            onChange={(event) => updateDraft("lastKnownFacility", event.target.value)}
          />
        </div>,
        <div key="lastKnownCity" className="grid gap-2">
          <Label htmlFor="lastKnownCity">Last Known City</Label>
          <Input
            id="lastKnownCity"
            value={(draft.lastKnownCity as string) ?? ""}
            onChange={(event) => updateDraft("lastKnownCity", event.target.value)}
          />
        </div>,
        <div key="arrestingOfficers" className="grid gap-2 sm:col-span-2">
          <Label htmlFor="arrestingOfficers">Arresting Officers</Label>
          <Textarea
            id="arrestingOfficers"
            rows={3}
            placeholder="One officer per line"
            value={(draft.arrestingOfficers as string) ?? ""}
            onChange={(event) => updateDraft("arrestingOfficers", event.target.value)}
          />
        </div>,
        <div key="statedReasonForDetention" className="grid gap-2 sm:col-span-2">
          <Label htmlFor="statedReasonForDetention">Stated Reason for Detention</Label>
          <Textarea
            id="statedReasonForDetention"
            rows={3}
            value={(draft.statedReasonForDetention as string) ?? ""}
            onChange={(event) => updateDraft("statedReasonForDetention", event.target.value)}
          />
        </div>,
        <div key="belongingsLeftBehind" className="grid gap-2 sm:col-span-2">
          <Label htmlFor="belongingsLeftBehind">Belongings Left Behind</Label>
          <Textarea
            id="belongingsLeftBehind"
            rows={2}
            value={(draft.belongingsLeftBehind as string) ?? ""}
            onChange={(event) => updateDraft("belongingsLeftBehind", event.target.value)}
          />
        </div>,
        <div key="dependentsLeftBehind" className="grid gap-2 sm:col-span-2">
          <Label htmlFor="dependentsLeftBehind">Dependents Left Behind</Label>
          <Textarea
            id="dependentsLeftBehind"
            rows={2}
            value={(draft.dependentsLeftBehind as string) ?? ""}
            onChange={(event) => updateDraft("dependentsLeftBehind", event.target.value)}
          />
        </div>,
        <div key="knownTransfers" className="grid gap-2 sm:col-span-2">
          <Label htmlFor="knownTransfers">Known Transfers</Label>
          <Textarea
            id="knownTransfers"
            rows={4}
            placeholder="From facility | To facility | Transfer date | Method"
            value={(draft.knownTransfers as string) ?? ""}
            onChange={(event) => updateDraft("knownTransfers", event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Enter one transfer per line. Separate fields with a pipe character (|).
          </p>
        </div>,
      ];
    case "supportNetwork":
      return [
        <div key="witnessContacts" className="grid gap-2 sm:col-span-2">
          <Label htmlFor="witnessContacts">Witness Contacts</Label>
          <Textarea
            id="witnessContacts"
            rows={4}
            placeholder="Name | relation | phone | email"
            value={(draft.witnessContacts as string) ?? ""}
            onChange={(event) => updateDraft("witnessContacts", event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            One contact per line. Use the format: Name | relation | phone | email.
          </p>
        </div>,
        <div key="familyContacts" className="grid gap-2 sm:col-span-2">
          <Label htmlFor="familyContacts">Family Contacts</Label>
          <Textarea
            id="familyContacts"
            rows={4}
            placeholder="Name | relation | phone | email"
            value={(draft.familyContacts as string) ?? ""}
            onChange={(event) => updateDraft("familyContacts", event.target.value)}
          />
        </div>,
        <div key="priorAttorney" className="grid gap-2">
          <Label htmlFor="priorAttorney">Prior Attorney</Label>
          <Input
            id="priorAttorney"
            value={(draft.priorAttorney as string) ?? ""}
            onChange={(event) => updateDraft("priorAttorney", event.target.value)}
          />
        </div>,
        <div key="preferredLegalAidOrgs" className="grid gap-2">
          <Label htmlFor="preferredLegalAidOrgs">Preferred Legal Aid Organisations</Label>
          <Textarea
            id="preferredLegalAidOrgs"
            rows={3}
            placeholder="One organisation per line"
            value={(draft.preferredLegalAidOrgs as string) ?? ""}
            onChange={(event) => updateDraft("preferredLegalAidOrgs", event.target.value)}
          />
        </div>,
        <div key="urgentNeeds" className="grid gap-2 sm:col-span-2">
          <Label htmlFor="urgentNeeds">Urgent Needs</Label>
          <Textarea
            id="urgentNeeds"
            rows={3}
            placeholder="One need per line"
            value={(draft.urgentNeeds as string) ?? ""}
            onChange={(event) => updateDraft("urgentNeeds", event.target.value)}
          />
        </div>,
        <div
          key="interpreterNeeded"
          className="flex items-center justify-between rounded-md border p-3"
        >
          <div className="space-y-1">
            <Label htmlFor="interpreterNeeded" className="text-base">
              Interpreter Needed
            </Label>
            <p className="text-xs text-muted-foreground">
              Toggle if an interpreter is required for this individual.
            </p>
          </div>
          <Switch
            id="interpreterNeeded"
            checked={Boolean(draft.interpreterNeeded)}
            onCheckedChange={(checked) => updateDraft("interpreterNeeded", checked)}
          />
        </div>,
      ];
    case "verificationNotes":
      return [
        <div key="informationSources" className="grid gap-2 sm:col-span-2">
          <Label htmlFor="informationSources">Information Sources</Label>
          <Textarea
            id="informationSources"
            rows={4}
            placeholder="Field | source type | details | timestamp | confidence"
            value={(draft.informationSources as string) ?? ""}
            onChange={(event) => updateDraft("informationSources", event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            One source per line. Confidence is optional and should be 1-5.
          </p>
        </div>,
        <div key="confidenceRating" className="grid gap-2">
          <Label htmlFor="confidenceRating">Confidence Rating (1-5)</Label>
          <Input
            id="confidenceRating"
            type="number"
            min={1}
            max={5}
            value={(draft.confidenceRating as string) ?? ""}
            onChange={(event) => updateDraft("confidenceRating", event.target.value)}
          />
        </div>,
        <div key="version" className="grid gap-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            type="number"
            min={1}
            value={(draft.version as string) ?? ""}
            onChange={(event) => updateDraft("version", event.target.value)}
          />
        </div>,
        <div key="lastUpdated" className="grid gap-2">
          <Label htmlFor="lastUpdated">Last Updated</Label>
          <Input
            id="lastUpdated"
            placeholder="ISO timestamp"
            value={(draft.lastUpdated as string) ?? ""}
            onChange={(event) => updateDraft("lastUpdated", event.target.value)}
          />
        </div>,
        <div key="createdAt" className="grid gap-2">
          <Label htmlFor="createdAt">Created At</Label>
          <Input
            id="createdAt"
            placeholder="ISO timestamp"
            value={(draft.createdAt as string) ?? ""}
            onChange={(event) => updateDraft("createdAt", event.target.value)}
          />
        </div>,
        <div key="createdBy" className="grid gap-2">
          <Label htmlFor="createdBy">Created By</Label>
          <Input
            id="createdBy"
            value={(draft.createdBy as string) ?? ""}
            onChange={(event) => updateDraft("createdBy", event.target.value)}
          />
        </div>,
      ];
    default:
      return [];
  }
}
