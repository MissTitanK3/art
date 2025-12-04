"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useMissingPersonStore } from "@workspace/store/useMissingPersonStore";
import type { MissingPersonRecord } from "@workspace/store/types/missing-person";
import { DetaineeIntakeSchema } from "@workspace/ui/lib/detainee-intake-schema";
import {
  CASE_ID_STORAGE_KEY,
  DEFAULT_CASE_ZONE,
  collectCaseIds,
  generateNextCaseId,
  isCaseIdDuplicate,
  normaliseCaseId,
} from "@workspace/ui/lib/missing-person-case-id";
import { deepCompact } from "@workspace/ui/lib/utils";
import type { DetaineeIntake } from "@workspace/ui/types/missing-person-intake";
import { Button } from "@workspace/ui/primitives/button";
import { Form } from "@workspace/ui/primitives/form";
import {
  CaseMetadataSection,
  ContactsSection,
  DetentionDetailsSection,
  IdentificationSection,
  LatestOutputSection,
  LegalSupportSection,
  VerificationSection,
} from "../intake";
import { useLocalStorage } from "@workspace/ui/hooks/use-local-storage";
type ExportFormat = "pdf" | "json";
export interface MissingPersonIntakeFormProps {
  seedRecords?: Iterable<DetaineeIntake>;
  defaultCaseZone?: string;
  onExportRecord?: (
    record: DetaineeIntake,
    format: ExportFormat,
  ) => Promise<Blob | string | void>;
  onPersistRecord?: (record: DetaineeIntake) => Promise<void> | void;
  region?: string; // optional region code to enable REGION-ZONE-YYYY-MM-NNNN
  // Optional: fetch last submitted case's caseId from backend ordered by auto-increment id
  loadLastCaseId?: () => Promise<string | null>;
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
const sanitizeCaseIdList = (payload: unknown): string[] => {
  if (Array.isArray(payload)) {
    return payload.filter((id): id is string => typeof id === "string");
  }
  if (typeof payload === "string" && payload) {
    return [payload];
  }
  return [];
};
export function MissingPersonIntakeForm({
  seedRecords,
  defaultCaseZone = DEFAULT_CASE_ZONE,
  onExportRecord,
  onPersistRecord,
  region,
  loadLastCaseId,
}: MissingPersonIntakeFormProps): React.ReactElement {
  const [lastJson, setLastJson] = useState<string>("");
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(
    null,
  );
  const [caseIdInitialized, setCaseIdInitialized] = useState(false);
  const [persistedCaseId, setPersistedCaseId] = useState<string | null>(null);
  const addRecordToStore = useMissingPersonStore((state) => state.addRecord);
  const removeRecordFromStore = useMissingPersonStore(
    (state) => state.removeRecord,
  );
  const hasRecord = useMissingPersonStore((state) => state.hasRecord);
  const storeRecords = useMissingPersonStore((state) => state.records);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const caseIdExamplePrimary = useMemo(
    () => `${defaultCaseZone}-${currentYear}-001`,
    [defaultCaseZone, currentYear],
  );
  const caseIdExampleSecondary = useMemo(
    () => `TX-${currentYear}-017`,
    [currentYear],
  );
  const seedCaseIds = useMemo(
    () => collectCaseIds(seedRecords ? Array.from(seedRecords) : []),
    [seedRecords],
  );
  const [storedCaseIds, setStoredCaseIds] = useLocalStorage<string[]>(
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
  const storeCaseIds = useMemo(
    () => collectCaseIds(storeRecords),
    [storeRecords],
  );
  const allCaseIds = useMemo(() => {
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
  useEffect(() => {
    const initialCaseId = form.getValues("caseId");
    if (!initialCaseId) return;
    const normalized = normaliseCaseId(initialCaseId);
    if (hasRecord(normalized)) {
      setPersistedCaseId(normalized);
    }
  }, [form, hasRecord]);
  useEffect(() => {
    if (caseIdInitialized) return;
    const generated = generateNextCaseId(defaultCaseZone, allCaseIds);
    form.setValue("caseId", generated, { shouldDirty: false });
    setCaseIdInitialized(true);
  }, [allCaseIds, caseIdInitialized, form, defaultCaseZone]);
  const rememberCaseId = useCallback(
    (caseId: string) => {
      const normalised = normaliseCaseId(caseId);
      setStoredCaseIds((prev) => {
        const existing = Array.isArray(prev) ? prev : [];
        if (existing.some((id) => normaliseCaseId(id) === normalised)) {
          return existing;
        }
        return [...existing, caseId];
      });
    },
    [setStoredCaseIds],
  );
  const persistRecord = useCallback(
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
    [addRecordToStore, rememberCaseId, onPersistRecord],
  );
  const generateNewCaseId = useCallback(() => {
    const currentId = form.getValues("caseId");
    const candidate = generateNextCaseId(defaultCaseZone, [
      ...allCaseIds,
      currentId ?? "",
    ]);
    form.setValue("caseId", candidate, { shouldDirty: true });
    form.clearErrors("caseId");
    setPersistedCaseId(null);
  }, [allCaseIds, form, defaultCaseZone]);
  const ensureUniqueCaseId = useCallback(
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
    [allCaseIds, persistedCaseId],
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
    toast.success(
      "Intake saved locally. Refresh the directory to see the new record.",
    );
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
          loadLastCaseId={loadLastCaseId}
          onSave={() => form.handleSubmit(handleSubmit)()}
          onGenerateCaseId={generateNewCaseId}
          caseIdExamples={{
            primary: caseIdExamplePrimary,
            secondary: caseIdExampleSecondary,
          }}
        />

        <ContactsSection
          control={form.control}
          onSave={() => form.handleSubmit(handleSubmit)()}
        />

        <IdentificationSection
          control={form.control}
          onSave={() => form.handleSubmit(handleSubmit)()}
        />

        <DetentionDetailsSection
          control={form.control}
          onSave={() => form.handleSubmit(handleSubmit)()}
        />

        <LegalSupportSection
          control={form.control}
          onSave={() => form.handleSubmit(handleSubmit)()}
        />

        <VerificationSection
          control={form.control}
          onSave={() => form.handleSubmit(handleSubmit)()}
        />

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
                {exportingFormat === "pdf"
                  ? "Generating PDF..."
                  : "Download PDF"}
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
