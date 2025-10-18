"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Control, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { exportLegalAidReport } from "@/src/pipelines/exportLegalAidReport";
import type { DetaineeIntake } from "@/src/types/DetaineeIntake";
import { demoMissingPersons } from "@/data/demoMissingPersons";
import {
  CASE_ID_STORAGE_KEY,
  DEFAULT_CASE_ZONE,
  collectCaseIds,
  generateNextCaseId,
  isCaseIdDuplicate,
  normaliseCaseId,
} from "@workspace/ui/lib/missing-person-case-id";
import { useMissingPersonStore } from "@workspace/store/useMissingPersonStore";
import type { MissingPersonRecord } from "@workspace/store/types/missing-person";

import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { Separator } from "@workspace/ui/components/separator";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Badge } from "@workspace/ui/components/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { DateTimePicker } from "@workspace/ui/components/DateTimePicker";
import { DetaineeIntakeSchema } from "@/src/utils/validation/detaineeIntakeSchema";

type DetaineeIntakeFormValues = z.infer<typeof DetaineeIntakeSchema>;

const defaultValues: DetaineeIntakeFormValues = {
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

type StringArrayFieldName =
  | "aliases"
  | "languagesSpoken"
  | "arrestingOfficers"
  | "preferredLegalAidOrgs"
  | "urgentNeeds";

type ContactArrayFieldName = "witnessContacts" | "familyContacts";

type TransferArrayFieldName = "knownTransfers";

type InfoSourceArrayFieldName = "informationSources";

interface StringArrayFieldProps {
  control: Control<DetaineeIntakeFormValues>;
  name: StringArrayFieldName;
  label: string;
  description?: string;
  placeholder?: string;
  addLabel?: string;
}

interface ContactArrayFieldProps {
  control: Control<DetaineeIntakeFormValues>;
  name: ContactArrayFieldName;
  label: string;
  emptyLabel: string;
  addLabel: string;
}

interface TransferArrayFieldProps {
  control: Control<DetaineeIntakeFormValues>;
  name: TransferArrayFieldName;
  label: string;
  emptyLabel: string;
  addLabel: string;
}

interface InfoSourceArrayFieldProps {
  control: Control<DetaineeIntakeFormValues>;
  name: InfoSourceArrayFieldName;
  label: string;
  emptyLabel: string;
  addLabel: string;
}

function StringArrayField({
  control,
  name,
  label,
  description,
  placeholder,
  addLabel = "Add entry",
}: StringArrayFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as any,
  });

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm">{label}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => append("" as unknown as never)}
          className="w-fit"
        >
          {addLabel}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entries added yet.</p>
        ) : null}
        {fields.map((fieldItem, index) => (
          <div key={fieldItem.id} className="flex items-start gap-2">
            <FormField
              control={control}
              name={`${name}.${index}` as any}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      ref={field.ref}
                      name={field.name}
                      value={(field.value as string | undefined) ?? ""}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                      placeholder={placeholder}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              className="mt-1"
            >
              Remove
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ContactArrayField({
  control,
  name,
  label,
  emptyLabel,
  addLabel,
}: ContactArrayFieldProps) {
  const { fields, append, remove } = useFieldArray<DetaineeIntakeFormValues, ContactArrayFieldName>({
    control,
    name,
  });

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm">{label}</CardTitle>
        <CardDescription>{emptyLabel}</CardDescription>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            append({
              name: "",
              phone: "",
              email: "",
              relation: "",
            })
          }
          className="w-fit"
        >
          {addLabel}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contacts recorded.</p>
        ) : null}

        {fields.map((item, index) => (
          <div key={item.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3 pb-3">
              <Badge variant="outline">Contact {index + 1}</Badge>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                Remove
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={control}
                name={`${name}.${index}.name` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`${name}.${index}.relation` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relation</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Witness, family, dispatcher..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`${name}.${index}.phone` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(555) 123-4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`${name}.${index}.email` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="name@example.org" type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TransferArrayField({
  control,
  name,
  label,
  emptyLabel,
  addLabel,
}: TransferArrayFieldProps) {
  const { fields, append, remove } = useFieldArray<DetaineeIntakeFormValues, TransferArrayFieldName>({
    control,
    name,
  });

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm">{label}</CardTitle>
        <CardDescription>{emptyLabel}</CardDescription>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            append({
              fromFacility: "",
              toFacility: "",
              transferDate: "",
              method: "",
            })
          }
          className="w-fit"
        >
          {addLabel}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transfers recorded.</p>
        ) : null}

        {fields.map((item, index) => (
          <div key={item.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3 pb-3">
              <Badge variant="outline">Transfer {index + 1}</Badge>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                Remove
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={control}
                name={`${name}.${index}.fromFacility` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Facility</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Origin facility" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`${name}.${index}.toFacility` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Facility</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Destination facility" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`${name}.${index}.transferDate` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer Date</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="YYYY-MM-DD or ISO timestamp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`${name}.${index}.method` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Van, flight, unknown..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function InfoSourceArrayField({
  control,
  name,
  label,
  emptyLabel,
  addLabel,
}: InfoSourceArrayFieldProps) {
  const { fields, append, remove } = useFieldArray<DetaineeIntakeFormValues, InfoSourceArrayFieldName>({
    control,
    name,
  });

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm">{label}</CardTitle>
        <CardDescription>{emptyLabel}</CardDescription>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            append({
              field: "",
              sourceType: "other",
              details: "",
              timestamp: "",
              confidence: undefined,
            })
          }
          className="w-fit"
        >
          {addLabel}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sources captured.</p>
        ) : null}

        {fields.map((item, index) => (
          <div key={item.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3 pb-3">
              <Badge variant="outline">Source {index + 1}</Badge>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                Remove
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={control}
                name={`${name}.${index}.field` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Which field this applies to" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`${name}.${index}.sourceType` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value ?? "other"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a source type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="witness">Witness</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`${name}.${index}.timestamp` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timestamp</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ISO timestamp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`${name}.${index}.confidence` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confidence (1-5)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        max={5}
                        step={1}
                        placeholder="1-5"
                        value={field.value ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(value ? Number(value) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={control}
              name={`${name}.${index}.details` as const}
              render={({ field }) => (
                <FormItem className="pt-3">
                  <FormLabel>Details</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Summary or citation" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function compactIntake(values: DetaineeIntakeFormValues): DetaineeIntake {
  const prune = (input: unknown): unknown => {
    if (input === undefined || input === null) {
      return undefined;
    }

    if (typeof input === "string") {
      const trimmed = input.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }

    if (Array.isArray(input)) {
      const next = input
        .map((entry) => prune(entry))
        .filter((entry) => {
          if (entry === undefined || entry === null) {
            return false;
          }
          if (typeof entry === "string") {
            return entry.trim().length > 0;
          }
          if (Array.isArray(entry)) {
            return entry.length > 0;
          }
          if (typeof entry === "object") {
            return Object.keys(entry as Record<string, unknown>).length > 0;
          }
          return true;
        });
      return next.length > 0 ? next : undefined;
    }

    if (typeof input === "object") {
      const asRecord = input as Record<string, unknown>;
      const result: Record<string, unknown> = {};
      Object.entries(asRecord).forEach(([key, value]) => {
        const next = prune(value);
        if (next !== undefined) {
          result[key] = next;
        }
      });
      return Object.keys(result).length > 0 ? result : undefined;
    }

    return input;
  };

  return (prune(values) ?? {}) as DetaineeIntake;
}

export function MissingPersonIntakeForm() {
  const [lastJson, setLastJson] = React.useState<string>("");
  const [exportingFormat, setExportingFormat] = React.useState<"pdf" | "json" | null>(null);
  const [storedCaseIds, setStoredCaseIds] = React.useState<string[]>([]);
  const [storedIdsLoaded, setStoredIdsLoaded] = React.useState(false);
  const [caseIdInitialized, setCaseIdInitialized] = React.useState(false);
  const addRecordToStore = useMissingPersonStore((state) => state.addRecord);
  const removeRecordFromStore = useMissingPersonStore((state) => state.removeRecord);
  const hasRecord = useMissingPersonStore((state) => state.hasRecord);
  const storeRecords = useMissingPersonStore((state) => state.records);
  const currentYear = React.useMemo(() => new Date().getFullYear(), []);
  const caseIdExamplePrimary = React.useMemo(
    () => `${DEFAULT_CASE_ZONE}-${currentYear}-001`,
    [currentYear]
  );
  const caseIdExampleSecondary = React.useMemo(
    () => `TX-${currentYear}-017`,
    [currentYear]
  );

  const allDemoCaseIds = React.useMemo(
    () => collectCaseIds(demoMissingPersons),
    []
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
    allDemoCaseIds.forEach((id) => {
      map.set(normaliseCaseId(id), id);
    });
    storeCaseIds.forEach((id) => {
      map.set(normaliseCaseId(id), id);
    });
    storedCaseIds.forEach((id) => {
      map.set(normaliseCaseId(id), id);
    });
    return Array.from(map.values());
  }, [allDemoCaseIds, storeCaseIds, storedCaseIds]);

  const form = useForm<DetaineeIntakeFormValues>({
    resolver: zodResolver(DetaineeIntakeSchema),
    defaultValues,
    mode: "onBlur",
  });

  React.useEffect(() => {
    if (caseIdInitialized || !storedIdsLoaded) return;
    const generated = generateNextCaseId(DEFAULT_CASE_ZONE, allCaseIds);
    form.setValue("caseId", generated, { shouldDirty: false });
    setCaseIdInitialized(true);
  }, [allCaseIds, caseIdInitialized, storedIdsLoaded, form]);

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
    (record: DetaineeIntake, caseId: string) => {
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
    },
    [addRecordToStore, rememberCaseId]
  );

  const removeCaseId = React.useCallback((caseId: string) => {
    const normalised = normaliseCaseId(caseId);
    setStoredCaseIds((prev) => prev.filter((id) => normaliseCaseId(id) !== normalised));
    removeRecordFromStore(normalised);
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(CASE_ID_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const remaining = parsed.filter(
              (id: unknown) => typeof id === "string" && normaliseCaseId(id) !== normalised
            );
            window.localStorage.setItem(CASE_ID_STORAGE_KEY, JSON.stringify(remaining));
          }
        }
      } catch (error) {
        console.warn("Failed to remove case ID from storage", error);
      }
    }
  }, [removeRecordFromStore]);

  const generateNewCaseId = React.useCallback(() => {
    const currentId = form.getValues("caseId");
    const candidate = generateNextCaseId(DEFAULT_CASE_ZONE, [...allCaseIds, currentId ?? ""]);
    form.setValue("caseId", candidate, { shouldDirty: true });
    form.clearErrors("caseId");
  }, [allCaseIds, form]);

  const ensureUniqueCaseId = React.useCallback(
    (value: string | undefined): string | null => {
      const trimmed = value?.trim();
      if (!trimmed) {
        return "Case ID is required.";
      }
      const normalised = normaliseCaseId(trimmed);
      if (isCaseIdDuplicate(normalised, allCaseIds)) {
        return "Case ID already exists. Generate a new one.";
      }
      return null;
    },
    [allCaseIds]
  );

  const handleSubmit = (values: DetaineeIntakeFormValues) => {
    const error = ensureUniqueCaseId(values.caseId);
    if (error) {
      form.setError("caseId", { type: "manual", message: error });
      return;
    }

    const normalizedCaseId = normaliseCaseId(values.caseId ?? "");
    form.setValue("caseId", normalizedCaseId, { shouldDirty: false });

    const normalized = compactIntake({
      ...values,
      caseId: normalizedCaseId,
    });

    persistRecord(normalized, normalizedCaseId);
    setLastJson(JSON.stringify(normalized, null, 2));
    toast.success("Intake saved locally. Refresh the directory to see the new record.");
  };

  const handleExport = async (format: "pdf" | "json") => {
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

      const normalized = compactIntake({
        ...rawValues,
        caseId: normalizedCaseId,
      });

      const validated = await DetaineeIntakeSchema.parseAsync(normalized);
      persistRecord(normalized, normalizedCaseId);
      const result = await exportLegalAidReport(validated, format);

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
      <form
        className="grid gap-6"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Case Metadata</CardTitle>
            <CardDescription>Basic identifying details about this detention.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="caseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case ID</FormLabel>
                  <FormDescription>
                    Use the format <span className="font-mono text-xs">ZONE-YYYY-NNN</span>. Suggested ID:{" "}
                    <span className="font-mono text-xs">{caseIdExamplePrimary}</span>. Another valid example:{" "}
                    <span className="font-mono text-xs">{caseIdExampleSecondary}</span>.
                  </FormDescription>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input {...field} placeholder={`e.g. ${caseIdExamplePrimary}`} />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateNewCaseId}
                      >
                        Generate
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="detentionDateTime"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DateTimePicker
                      label="Detention Date &amp; Time"
                      value={field.value ?? ""}
                      onChange={(value) => field.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="detentionLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detention Location</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Street / facility / city / state" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="arrestingAgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arresting Agency</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ICE, CBP, Police + ICE hold..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Contacts</CardTitle>
            <CardDescription>Witnesses and dispatch point of contact.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <ContactArrayField
              control={form.control}
              name="witnessContacts"
              label="Witness Contacts"
              emptyLabel="Record who witnessed the detention."
              addLabel="Add witness"
            />
            <Separator />
            <Card className="border-dashed">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm">Dispatcher Contact</CardTitle>
                <CardDescription>The person submitting this intake.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="dispatcherContact.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Dispatcher name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dispatcherContact.relation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Dispatcher, coordinator..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dispatcherContact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(555) 321-6789" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dispatcherContact.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="dispatcher@example.org" type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Identification</CardTitle>
            <CardDescription>Subject identifiers and personal details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Full legal name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="YYYY-MM-DD" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="countryOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country of Birth</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Country of birth" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>A-Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="A123456789" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="genderIdentity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender Identity</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Self-described gender identity" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pronouns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pronouns</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="They/them, she/her..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <StringArrayField
              control={form.control}
              name="aliases"
              label="Aliases"
              addLabel="Add alias"
              description="Document any known aliases or nicknames."
              placeholder="Alias or nickname"
            />
            <StringArrayField
              control={form.control}
              name="languagesSpoken"
              label="Languages Spoken"
              addLabel="Add language"
              description="List the languages the individual speaks."
              placeholder="Language (e.g. Spanish)"
            />
            <FormField
              control={form.control}
              name="physicalDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physical Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} placeholder="Appearance, distinguishing features, clothing..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Detention Details</CardTitle>
            <CardDescription>Where they were last seen and custody updates.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="lastKnownFacility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Known Facility</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Facility name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastKnownCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Known City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <StringArrayField
              control={form.control}
              name="arrestingOfficers"
              label="Arresting Officers"
              addLabel="Add officer"
              description="Names or badge numbers of officers involved."
              placeholder="Officer name or badge"
            />
            <FormField
              control={form.control}
              name="statedReasonForDetention"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stated Reason for Detention</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Reason given by officers" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TransferArrayField
              control={form.control}
              name="knownTransfers"
              label="Known Transfers"
              emptyLabel="Track facility transfers to maintain custody visibility."
              addLabel="Add transfer"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="belongingsLeftBehind"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Belongings Left Behind</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="Items retained by friends, family, or officers" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dependentsLeftBehind"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dependents Left Behind</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="Children, elders, or others who need support" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Legal &amp; Support</CardTitle>
            <CardDescription>Family contacts, legal representation, and urgent needs.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <ContactArrayField
              control={form.control}
              name="familyContacts"
              label="Family Contacts"
              emptyLabel="Primary relatives or support network to notify."
              addLabel="Add family contact"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="priorAttorney"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prior Attorney</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Attorney name or firm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interpreterNeeded"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-3 rounded-lg border p-4">
                    <div className="space-y-1.5">
                      <FormLabel>Interpreter Needed</FormLabel>
                      <FormDescription>Toggle if interpretation is required for legal conversations.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <StringArrayField
              control={form.control}
              name="preferredLegalAidOrgs"
              label="Preferred Legal Aid Organizations"
              addLabel="Add organization"
              description="Specific clinics or organizations requested by family."
              placeholder="Legal aid organization"
            />
            <StringArrayField
              control={form.control}
              name="urgentNeeds"
              label="Urgent Needs"
              addLabel="Add urgent need"
              description="Medical, medication, childcare, or other immediate needs."
              placeholder="Describe the urgent need"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Verification &amp; Audit Trail</CardTitle>
            <CardDescription>How this information was verified and overall confidence.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <InfoSourceArrayField
              control={form.control}
              name="informationSources"
              label="Information Sources"
              emptyLabel="Provide an audit trail for each piece of information."
              addLabel="Add source"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="lastUpdated"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Updated</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ISO timestamp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confidenceRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confidence Rating</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        max={5}
                        step={1}
                        placeholder="1-5"
                        value={field.value ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(value ? Number(value) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="createdAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Created At</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ISO timestamp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="createdBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Created By</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Dispatcher or system user" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem className="sm:max-w-xs">
                  <FormLabel>Version</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      step={1}
                      placeholder="Version number"
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(value ? Number(value) : undefined);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">Save Intake</Button>
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
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Latest Structured Output</CardTitle>
            <CardDescription>Preview of the normalized intake data for exports.</CardDescription>
          </CardHeader>
          <CardContent>
            {lastJson ? (
              <ScrollArea className="h-64 rounded-md border bg-muted/40 p-4">
                <pre className="text-xs leading-relaxed">
                  {lastJson}
                </pre>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">
                Submit the form to generate a JSON preview and enable exports.
              </p>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
