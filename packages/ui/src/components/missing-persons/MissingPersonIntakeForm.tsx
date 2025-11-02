"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { useMissingPersonStore } from "@workspace/store/useMissingPersonStore";
import type { MissingPersonRecord } from "@workspace/store/types/missing-person";

import { DetaineeIntakeSchema } from "../../lib/detainee-intake-schema";
import {
  CASE_ID_STORAGE_KEY,
  DEFAULT_CASE_ZONE,
  collectCaseIds,
  generateNextCaseId,
  isCaseIdDuplicate,
  normaliseCaseId,
} from "../../lib/missing-person-case-id";
import { deepCompact } from "../../lib/utils";
import type { DetaineeIntake } from "../../types/missing-person-intake";
import { Button } from "../button";
import { Form } from "../form";
import {
  CaseMetadataSection,
  ContactsSection,
  DetentionDetailsSection,
  IdentificationSection,
  LatestOutputSection,
  LegalSupportSection,
  VerificationSection,
} from "../client/intake";

type ExportFormat = "pdf" | "json";

export interface MissingPersonIntakeFormProps {
  seedRecords?: Iterable<DetaineeIntake>;
  defaultCaseZone?: string;
  onExportRecord?: (record: DetaineeIntake, format: ExportFormat) => Promise<Blob | string | void>;
  onPersistRecord?: (record: DetaineeIntake) => Promise<void> | void;
  region?: string; // optional region code to enable REGION-ZONE-YYYY-MM-NNNN
}

type DetaineeIntakeFormValues = z.infer<typeof DetaineeIntakeSchema>;

const emptyValues: DetaineeIntakeFormValues = {
  caseId: "",
  detentionDateTime: "",
  detentionLocation: "",
  arrestingAgency: "",
  witnessContacts: [],
  dispatcherContact: {
    name: "",
    phone: "",
    email: "",
    relation: "",
  },
  fullName: "",
  aliases: [],
  dateOfBirth: "",
  countryOfBirth: "",
  genderIdentity: "",
  pronouns: "",
  languagesSpoken: [],
  aNumber: "",
  physicalDescription: "",
  lastKnownFacility: "",
  lastKnownCity: "",
  arrestingOfficers: [],
  statedReasonForDetention: "",
  knownTransfers: [],
  belongingsLeftBehind: "",
  dependentsLeftBehind: "",
  familyContacts: [],
  priorAttorney: "",
  preferredLegalAidOrgs: [],
  interpreterNeeded: false,
  urgentNeeds: [],
  informationSources: [],
  lastUpdated: "",
  confidenceRating: undefined,
  createdAt: "",
  createdBy: "",
  version: undefined,
};

export function MissingPersonIntakeForm({
  seedRecords,
  defaultCaseZone = DEFAULT_CASE_ZONE,
  onExportRecord,
  onPersistRecord,
  region,
}: MissingPersonIntakeFormProps) {
  const [lastJson, setLastJson] = React.useState<string>("");
  const [exportingFormat, setExportingFormat] = React.useState<ExportFormat | null>(null);
  const [storedCaseIds, setStoredCaseIds] = React.useState<string[]>([]);
  const [storedIdsLoaded, setStoredIdsLoaded] = React.useState(false);
  const [caseIdInitialized, setCaseIdInitialized] = React.useState(false);
  const [persistedCaseId, setPersistedCaseId] = React.useState<string | null>(null);

  const addRecordToStore = useMissingPersonStore((state) => state.addRecord);
  const removeRecordFromStore = useMissingPersonStore((state) => state.removeRecord);
  const hasRecord = useMissingPersonStore((state) => state.hasRecord);
  const storeRecords = useMissingPersonStore((state) => state.records);

  const currentYear = React.useMemo(() => new Date().getFullYear(), []);

  const caseIdExamplePrimary = React.useMemo(
    () => `${defaultCaseZone}-${currentYear}-001`,
    [defaultCaseZone, currentYear]
  );
  const caseIdExampleSecondary = React.useMemo(
    () => `TX-${currentYear}-017`,
    [currentYear]
  );

  const seedCaseIds = React.useMemo(
    () => collectCaseIds(seedRecords ? Array.from(seedRecords) : []),
    [seedRecords]
  );

  React.useEffect(() => {
    if (typeof window === "undefined") {
      setStoredIdsLoaded(true);
      return;
    }
    try {
      const raw = window.localStorage.getItem(CASE_ID_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setStoredCaseIds(parsed.filter((id): id is string => typeof id === "string"));
        }
      }
    } catch (error) {
      console.warn("Failed to parse stored case IDs", error);
    } finally {
      setStoredIdsLoaded(true);
    }
  }, []);

  const storeCaseIds = React.useMemo(() => collectCaseIds(storeRecords), [storeRecords]);

  const allCaseIds = React.useMemo(() => {
    const map = new Map<string, string>();
    seedCaseIds.forEach((id) => {
      map.set(normaliseCaseId(id), id);
    });
    storeCaseIds.forEach((id) => {
      map.set(normaliseCaseId(id), id);
    });
    storedCaseIds.forEach((id) => {
      map.set(normaliseCaseId(id), id);
    });
    return Array.from(map.values());
  }, [seedCaseIds, storeCaseIds, storedCaseIds]);

  const form = useForm<DetaineeIntakeFormValues>({
    resolver: zodResolver(DetaineeIntakeSchema),
    defaultValues: emptyValues,
    mode: "onBlur",
  });

  React.useEffect(() => {
    const initialCaseId = form.getValues("caseId");
    if (!initialCaseId) return;
    const normalized = normaliseCaseId(initialCaseId);
    if (hasRecord(normalized)) {
      setPersistedCaseId(normalized);
    }
  }, [form, hasRecord]);

  React.useEffect(() => {
    if (caseIdInitialized || !storedIdsLoaded) return;
    const generated = generateNextCaseId(defaultCaseZone, allCaseIds);
    form.setValue("caseId", generated, { shouldDirty: false });
    setCaseIdInitialized(true);
  }, [allCaseIds, caseIdInitialized, storedIdsLoaded, form, defaultCaseZone]);

  const rememberCaseId = React.useCallback((caseId: string) => {
    const normalised = normaliseCaseId(caseId);
    setStoredCaseIds((prev) => {
      if (prev.some((id) => normaliseCaseId(id) === normalised)) {
        return prev;
      }
      const next = [...prev, caseId];
      if (typeof window !== "undefined") {
        window.localStorage.setItem(CASE_ID_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const persistRecord = React.useCallback(
    async (record: DetaineeIntake, caseId: string) => {
      const timestamp = new Date().toISOString();
      const finalRecord: MissingPersonRecord = {
        ...record,
        caseId,
        createdAt: record.createdAt ?? timestamp,
        lastUpdated: record.lastUpdated ?? timestamp,
        version: record.version ?? 1,
      };
      addRecordToStore(finalRecord);
      rememberCaseId(caseId);
      setPersistedCaseId(normaliseCaseId(caseId));
      try {
        if (onPersistRecord) {
          await onPersistRecord(finalRecord);
        }
      } catch (err) {
        console.warn("MissingPersonIntakeForm: remote persist failed", err);
      }
    },
    [addRecordToStore, rememberCaseId, onPersistRecord]
  );

  const generateNewCaseId = React.useCallback(() => {
    const currentId = form.getValues("caseId");
    const candidate = generateNextCaseId(defaultCaseZone, [...allCaseIds, currentId ?? ""]);
    form.setValue("caseId", candidate, { shouldDirty: true });
    form.clearErrors("caseId");
    setPersistedCaseId(null);
  }, [allCaseIds, form, defaultCaseZone]);

  const ensureUniqueCaseId = React.useCallback(
    (value: string | undefined): string | null => {
      const trimmed = value?.trim();
      if (!trimmed) {
        return "Case ID is required.";
      }
      const normalised = normaliseCaseId(trimmed);
      if (persistedCaseId && normalised === persistedCaseId) {
        return null;
      }
      if (isCaseIdDuplicate(normalised, allCaseIds)) {
        return "Case ID already exists. Generate a new one.";
      }
      return null;
    },
    [allCaseIds, persistedCaseId]
  );

  const handleSubmit = async (values: DetaineeIntakeFormValues) => {
    const error = ensureUniqueCaseId(values.caseId);
    if (error) {
      form.setError("caseId", { type: "manual", message: error });
      return;
    }

    const normalizedCaseId = normaliseCaseId(values.caseId ?? "");
    form.setValue("caseId", normalizedCaseId, { shouldDirty: false });

    const normalizedInput: DetaineeIntake = {
      ...values,
      caseId: normalizedCaseId,
    };
    const normalized = deepCompact(normalizedInput);

    await persistRecord(normalized, normalizedCaseId);
    setLastJson(JSON.stringify(normalized, null, 2));
    toast.success("Intake saved locally. Refresh the directory to see the new record.");
  };

  const handleExport = async (format: ExportFormat) => {
    if (!onExportRecord) {
      toast.error("Export is not available for this intake.");
      return;
    }

    try {
      const caseIdError = ensureUniqueCaseId(form.getValues("caseId"));
      if (caseIdError) {
        form.setError("caseId", { type: "manual", message: caseIdError });
        return;
      }

      setExportingFormat(format);
      const rawValues = form.getValues();
      const normalizedCaseId = normaliseCaseId(rawValues.caseId ?? "");
      form.setValue("caseId", normalizedCaseId, { shouldDirty: false });

      const normalizedInput: DetaineeIntake = {
        ...rawValues,
        caseId: normalizedCaseId,
      };
      const normalized = deepCompact(normalizedInput);

      const validated = await DetaineeIntakeSchema.parseAsync(normalized);
      await persistRecord(normalized, normalizedCaseId);
      const result = await onExportRecord(validated, format);

      if (format === "json" && typeof result === "string") {
        await navigator.clipboard?.writeText(result);
        setLastJson(result);
        return;
      }

      if (format === "pdf" && result instanceof Blob) {
        const url = URL.createObjectURL(result);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `detainee-report-${validated.caseId || "intake"}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export intake", error);
      form.setError("caseId", {
        type: "manual",
        message: "Unable to export intake with current data.",
      });
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <Form {...form}>
      <form className="grid gap-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <CaseMetadataSection
          control={form.control}
          region={region}
          existingCaseIds={allCaseIds}
          onSave={() => form.handleSubmit(handleSubmit)()}
          onGenerateCaseId={generateNewCaseId}
          caseIdExamples={{
            primary: caseIdExamplePrimary,
            secondary: caseIdExampleSecondary,
          }}
        />

        <ContactsSection control={form.control} onSave={() => form.handleSubmit(handleSubmit)()} />

        <IdentificationSection control={form.control} onSave={() => form.handleSubmit(handleSubmit)()} />

        <DetentionDetailsSection control={form.control} onSave={() => form.handleSubmit(handleSubmit)()} />

        <LegalSupportSection control={form.control} onSave={() => form.handleSubmit(handleSubmit)()} />

        <VerificationSection control={form.control} onSave={() => form.handleSubmit(handleSubmit)()} />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">Submit Intake</Button>
          {onExportRecord ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleExport("pdf")}
                disabled={exportingFormat === "pdf"}
              >
                {exportingFormat === "pdf" ? "Generating PDF..." : "Download PDF"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleExport("json")}
                disabled={exportingFormat === "json"}
              >
                {exportingFormat === "json" ? "Copying JSON..." : "Copy JSON"}
              </Button>
            </>
          ) : null}
        </div>

        <LatestOutputSection json={lastJson} />
      </form>
    </Form>
  );
}
