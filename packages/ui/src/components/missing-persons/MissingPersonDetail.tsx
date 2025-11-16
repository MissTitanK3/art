"use client";

import * as React from "react";
import {
  ArrowLeft,
  Download,
  FileJson,
  Pencil,
  Printer,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useMissingPersonStore } from "@workspace/store/useMissingPersonStore";
import type { MissingPersonRecord } from "@workspace/store/types/missing-person";

import { Badge } from "../badge";
import { Button } from "../button";
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
} from "../alert-dialog";
import {
  CaseMetadataSection,
  ContactsSection,
  DetentionDetailsSection,
  IdentificationSection,
  LatestOutputSection,
  LegalSupportSection,
  VerificationSection,
} from "../client/intake";
import { Form } from "../form";
import { deepCompact } from "../../lib/utils";
import {
  CASE_ID_STORAGE_KEY,
  normaliseCaseId,
} from "../../lib/missing-person-case-id";
import type {
  DetaineeIntake,
  DetaineeIntakeFormValues,
} from "../../types/missing-person-intake";
import { useLocalStorage } from "@workspace/ui/hooks/use-local-storage";

type ExportFormat = "pdf" | "json";

const DEFAULT_DIRECTORY_HREF = "/missing-persons";

const defaultRenderDirectoryLink = (href: string, label: React.ReactNode) => (
  <a href={href}>{label}</a>
);

const navigateToHref = (href: string) => {
  if (typeof window === "undefined") return;
  try {
    window.location.assign(href);
  } catch (error) {
    console.warn("MissingPersonDetail: failed to navigate", error);
  }
};

const sanitizeCaseIdList = (payload: unknown): string[] => {
  if (Array.isArray(payload)) {
    return payload.filter((id): id is string => typeof id === "string");
  }
  if (typeof payload === "string" && payload) {
    return [payload];
  }
  return [];
};

export interface MissingPersonDetailProps {
  record: DetaineeIntake;
  slug: string;
  onExportRecord?: (
    record: DetaineeIntake,
    format: ExportFormat,
  ) => Promise<Blob | string | void>;
  onFinalizeRecord?: (record: DetaineeIntake) => Promise<void> | void;
  directoryHref?: string;
  renderDirectoryLink?: (
    href: string,
    label: React.ReactNode,
  ) => React.ReactNode;
  onDeleteSuccess?: (details: {
    caseId: string;
    record: DetaineeIntake;
    directoryHref: string;
  }) => void;
  onSaveRecord?: (record: DetaineeIntake) => Promise<void> | void;
  onDeleteRecord?: (
    caseId: string,
    record: DetaineeIntake,
  ) => Promise<void> | void;
}

export function MissingPersonDetail({
  record,
  slug,
  onExportRecord,
  onFinalizeRecord,
  directoryHref = DEFAULT_DIRECTORY_HREF,
  renderDirectoryLink = defaultRenderDirectoryLink,
  onDeleteSuccess,
  onSaveRecord,
  onDeleteRecord,
}: MissingPersonDetailProps): React.ReactElement {
  const addRecordToStore = useMissingPersonStore((state) => state.addRecord);
  const updateRecordInStore = useMissingPersonStore(
    (state) => state.updateRecord,
  );
  const removeRecordFromStore = useMissingPersonStore(
    (state) => state.removeRecord,
  );
  const hasRecordInStore = useMissingPersonStore((state) => state.hasRecord);

  const [currentRecord, setCurrentRecord] =
    React.useState<DetaineeIntake>(record);
  const [isEditing, setIsEditing] = React.useState(false);
  const [exporting, setExporting] = React.useState<ExportFormat | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [finalizing, setFinalizing] = React.useState(false);

  const [, setStoredCaseIds] = useLocalStorage<string[]>(
    CASE_ID_STORAGE_KEY,
    [],
    {
      version: 1,
      sync: true,
      serialize: (value) => JSON.stringify(value),
      deserialize: (raw) => {
        try {
          return sanitizeCaseIdList(JSON.parse(raw));
        } catch {
          return [];
        }
      },
      migrate: (payload) => sanitizeCaseIdList(payload),
    },
  );

  const form = useForm<DetaineeIntakeFormValues>({
    defaultValues: toFormValues(record),
    mode: "onBlur",
  });

  React.useEffect(() => {
    setCurrentRecord(record);
    form.reset(toFormValues(record));
  }, [record, form]);

  const normalizedCaseId = React.useMemo(
    () => (currentRecord.caseId ? normaliseCaseId(currentRecord.caseId) : null),
    [currentRecord.caseId],
  );

  const isDeletable = React.useMemo(
    () => (normalizedCaseId ? hasRecordInStore(normalizedCaseId) : false),
    [normalizedCaseId, hasRecordInStore],
  );

  const rememberCaseId = React.useCallback(
    (caseId: string) => {
      const normalisedTarget = normaliseCaseId(caseId);
      setStoredCaseIds((prev) => {
        const existing = Array.isArray(prev) ? prev : [];
        if (existing.some((id) => normaliseCaseId(id) === normalisedTarget)) {
          return existing;
        }
        return [...existing, caseId];
      });
    },
    [setStoredCaseIds],
  );

  const removeCaseIdFromStorage = React.useCallback(
    (caseId: string) => {
      const normalisedTarget = normaliseCaseId(caseId);
      setStoredCaseIds((prev) => {
        const existing = Array.isArray(prev) ? prev : [];
        return existing.filter(
          (id) => normaliseCaseId(id) !== normalisedTarget,
        );
      });
    },
    [setStoredCaseIds],
  );

  const handleDelete = React.useCallback(async () => {
    if (!normalizedCaseId) {
      toast.error("This record cannot be deleted because it has no case ID.");
      return;
    }

    try {
      setDeleting(true);
      try {
        if (onDeleteRecord) {
          await onDeleteRecord(normalizedCaseId, currentRecord);
        }
      } catch (err) {
        console.warn("MissingPersonDetail: remote delete failed", err);
      }
      removeRecordFromStore(normalizedCaseId);
      removeCaseIdFromStorage(normalizedCaseId);
      toast.success("Intake deleted. Redirecting to directory…");
      if (onDeleteSuccess) {
        onDeleteSuccess({
          caseId: normalizedCaseId,
          record: currentRecord,
          directoryHref,
        });
      } else {
        navigateToHref(directoryHref);
      }
    } catch (error) {
      console.error("Failed to delete intake", error);
      toast.error("Failed to delete this intake. Please try again.");
    } finally {
      setDeleting(false);
    }
  }, [
    normalizedCaseId,
    removeCaseIdFromStorage,
    removeRecordFromStore,
    onDeleteSuccess,
    currentRecord,
    directoryHref,
    onDeleteRecord,
  ]);

  const handleExport = React.useCallback(
    async (format: ExportFormat) => {
      if (!onExportRecord) {
        toast.error("Export is not available for this record.");
        return;
      }
      try {
        setExporting(format);
        const result = await onExportRecord(currentRecord, format);

        if (format === "json" && typeof result === "string") {
          await navigator.clipboard?.writeText(result);
          toast.success("JSON copied to clipboard");
          return;
        }

        if (format === "pdf" && result instanceof Blob) {
          const url = URL.createObjectURL(result);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `detainee-report-${currentRecord.caseId || slug}.pdf`;
          anchor.click();
          URL.revokeObjectURL(url);
          toast.success("PDF download started");
        }
      } catch (error) {
        console.error(error);
        toast.error(
          "Failed to export report. Try again after checking the record.",
        );
      } finally {
        setExporting(null);
      }
    },
    [currentRecord, onExportRecord, slug],
  );

  const handleSubmit = React.useCallback(
    async (values: DetaineeIntakeFormValues) => {
      if (!values.caseId?.trim()) {
        toast.error("Case ID is required.");
        return;
      }

      const nextCaseId = normaliseCaseId(values.caseId);
      const timestamp = new Date().toISOString();

      const compacted = deepCompact({
        ...values,
        caseId: nextCaseId,
      }) as DetaineeIntake;

      const nextRecord: MissingPersonRecord = {
        ...currentRecord,
        ...compacted,
        caseId: nextCaseId,
        lastUpdated: timestamp,
        createdAt: compacted.createdAt ?? currentRecord.createdAt ?? timestamp,
      };

      const previousCaseId = currentRecord.caseId
        ? normaliseCaseId(currentRecord.caseId)
        : nextCaseId;

      if (previousCaseId && previousCaseId !== nextCaseId) {
        removeRecordFromStore(previousCaseId);
        addRecordToStore(nextRecord);
        removeCaseIdFromStorage(previousCaseId);
      } else if (nextCaseId) {
        updateRecordInStore(nextCaseId, nextRecord);
      }

      rememberCaseId(nextCaseId);
      setCurrentRecord(nextRecord);
      form.reset(toFormValues(nextRecord));
      try {
        if (onSaveRecord) {
          await onSaveRecord(nextRecord);
        }
      } catch (err) {
        console.warn("MissingPersonDetail: remote save failed", err);
      }
      setIsEditing(false);
      toast.success("Intake updated.");
    },
    [
      addRecordToStore,
      currentRecord,
      form,
      rememberCaseId,
      removeCaseIdFromStorage,
      removeRecordFromStore,
      updateRecordInStore,
      onSaveRecord,
    ],
  );

  const submit = React.useMemo(
    () => form.handleSubmit(handleSubmit),
    [form, handleSubmit],
  );

  const startEditing = React.useCallback(() => {
    form.reset(toFormValues(currentRecord));
    setIsEditing(true);
  }, [form, currentRecord]);

  const cancelEditing = React.useCallback(() => {
    form.reset(toFormValues(currentRecord));
    setIsEditing(false);
  }, [form, currentRecord]);

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

  const latestJson = React.useMemo(
    () => JSON.stringify(deepCompact(currentRecord), null, 2),
    [currentRecord],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row items-center gap-2 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" asChild className="px-2">
                {renderDirectoryLink(
                  directoryHref,
                  <span className="inline-flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" /> Back to directory
                  </span>,
                )}
              </Button>
              <span>
                Last updated{" "}
                {formatRelativeDate(
                  currentRecord.lastUpdated ?? currentRecord.createdAt,
                )}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {currentRecord.fullName ||
                  currentRecord.caseId ||
                  "Missing person intake"}
              </h1>
              {headerBadges}
            </div>
            <p className="text-sm text-muted-foreground">
              Case ID: {currentRecord.caseId || "Not assigned"} · Created{" "}
              {formatDate(currentRecord.createdAt)}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {!isEditing ? (
              <>
                {onExportRecord ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleExport("pdf")}
                      disabled={exporting === "pdf"}
                      className="w-full sm:w-auto"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {exporting === "pdf" ? "Generating…" : "Download PDF"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleExport("json")}
                      disabled={exporting === "json"}
                      className="w-full sm:w-auto"
                    >
                      <FileJson className="mr-2 h-4 w-4" />
                      {exporting === "json" ? "Copying…" : "Copy JSON"}
                    </Button>
                  </>
                ) : null}
                {onFinalizeRecord ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        setFinalizing(true);
                        await onFinalizeRecord(currentRecord);
                        toast.success("Finalized and notifications queued");
                      } catch (e) {
                        toast.error("Failed to finalize");
                      } finally {
                        setFinalizing(false);
                      }
                    }}
                    disabled={finalizing}
                    className="w-full sm:w-auto"
                  >
                    {finalizing ? "Finalizing…" : "Finalize & Notify"}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  onClick={startEditing}
                  className="w-full sm:w-auto"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
              </>
            ) : null}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleting}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-accent text-accent-foreground max-w-xs">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this intake?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The intake will be removed
                    from local storage.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                    {deleting ? "Deleting…" : "Confirm"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {isEditing ? (
        <Form {...form}>
          <form className="grid gap-6" onSubmit={submit}>
            <CaseMetadataSection
              mode="edit"
              region="Demo"
              control={form.control}
              onSave={submit}
              caseIdExamples={{
                primary: currentRecord.caseId || "ZONE-2024-001",
              }}
            />
            <ContactsSection
              mode="edit"
              control={form.control}
              onSave={submit}
            />
            <IdentificationSection
              mode="edit"
              control={form.control}
              onSave={submit}
            />
            <DetentionDetailsSection
              mode="edit"
              control={form.control}
              onSave={submit}
            />
            <LegalSupportSection
              mode="edit"
              control={form.control}
              onSave={submit}
            />
            <VerificationSection
              mode="edit"
              control={form.control}
              onSave={submit}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="grid gap-6">
          <CaseMetadataSection mode="view" data={currentRecord} region="Demo" />
          <ContactsSection mode="view" data={currentRecord} />
          <IdentificationSection mode="view" data={currentRecord} />
          <DetentionDetailsSection mode="view" data={currentRecord} />
          <LegalSupportSection mode="view" data={currentRecord} />
          <VerificationSection mode="view" data={currentRecord} />
          <LatestOutputSection json={latestJson} />
        </div>
      )}
    </div>
  );
}

function toFormValues(record: DetaineeIntake): DetaineeIntakeFormValues {
  return {
    caseId: record.caseId ?? "",
    detentionDateTime: record.detentionDateTime ?? "",
    detentionLocation: record.detentionLocation ?? "",
    arrestingAgency: record.arrestingAgency ?? "",
    witnessContacts: record.witnessContacts ?? [],
    dispatcherContact: {
      name: record.dispatcherContact?.name ?? "",
      phone: record.dispatcherContact?.phone ?? "",
      email: record.dispatcherContact?.email ?? "",
      relation: record.dispatcherContact?.relation ?? "",
    },
    fullName: record.fullName ?? "",
    aliases: record.aliases ?? [],
    dateOfBirth: record.dateOfBirth ?? "",
    countryOfBirth: record.countryOfBirth ?? "",
    genderIdentity: record.genderIdentity ?? "",
    pronouns: record.pronouns ?? "",
    languagesSpoken: record.languagesSpoken ?? [],
    aNumber: record.aNumber ?? "",
    photoUrl: record.photoUrl,
    physicalDescription: record.physicalDescription ?? "",
    lastKnownFacility: record.lastKnownFacility ?? "",
    lastKnownCity: record.lastKnownCity ?? "",
    arrestingOfficers: record.arrestingOfficers ?? [],
    statedReasonForDetention: record.statedReasonForDetention ?? "",
    knownTransfers: record.knownTransfers ?? [],
    belongingsLeftBehind: record.belongingsLeftBehind ?? "",
    dependentsLeftBehind: record.dependentsLeftBehind ?? "",
    familyContacts: record.familyContacts ?? [],
    priorAttorney: record.priorAttorney ?? "",
    preferredLegalAidOrgs: record.preferredLegalAidOrgs ?? [],
    interpreterNeeded: record.interpreterNeeded ?? false,
    urgentNeeds: record.urgentNeeds ?? [],
    informationSources: record.informationSources ?? [],
    lastUpdated: record.lastUpdated ?? "",
    confidenceRating: record.confidenceRating,
    createdAt: record.createdAt ?? "",
    createdBy: record.createdBy ?? "",
    version: record.version,
  };
}

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
