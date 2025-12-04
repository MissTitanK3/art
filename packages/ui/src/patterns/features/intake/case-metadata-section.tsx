import * as React from "react";
import { type Control } from "react-hook-form";

import { Button, type ButtonProps } from "@workspace/ui/primitives/button";
import { FormSectionCard } from "@workspace/ui/patterns/common/form-section-card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/primitives/form";
import { Input } from "@workspace/ui/primitives/input";
import { DateTimePicker } from "@workspace/ui/patterns/common/date-time-picker";
import { DetailGrid, DetailItem } from "./detail-grid";
import { formatDateTime, formatText } from "./utils";
import type { DetaineeIntake } from "@workspace/ui/types/missing-person-intake";

interface BaseProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  sectionName?: string;
  region?: string;
}

interface CaseIdExamples {
  primary: string;
  secondary?: string;
}

interface EditProps extends BaseProps {
  mode?: "edit";
  control: Control<any>;
  onSave?: () => void;
  saveButtonProps?: ButtonProps;
  onGenerateCaseId?: () => void; // legacy: used when region is not provided
  // Optional: fetch the last submitted case's ID from backend (ordered by auto-increment id)
  // Return the last case's `caseId` string or null if none.
  loadLastCaseId?: () => Promise<string | null>;
  caseIdExamples?: CaseIdExamples;
  existingCaseIds?: string[]; // Deprecated: old suggest logic; retained for compatibility
}

interface ViewProps extends BaseProps {
  mode: "view";
  data: DetaineeIntake;
}

export type CaseMetadataSectionProps = EditProps | ViewProps;

export function CaseMetadataSection(props: CaseMetadataSectionProps) {
  if (props.mode === "view") {
    return <CaseMetadataSectionView {...props} />;
  }
  return <CaseMetadataSectionEdit {...props} />;
}

function CaseMetadataSectionView({
  title = "Case Metadata",
  description = "Basic identifying details about this detention.",
  data,
}: ViewProps) {
  return (
    <FormSectionCard title={title} description={description}>
      <DetailGrid>
        <DetailItem label="Case ID" value={formatText(data.caseId)} />
        <DetailItem
          label="Detention Date & Time"
          value={formatDateTime(data.detentionDateTime)}
        />
        <DetailItem
          label="Detention Location"
          value={formatText(data.detentionLocation)}
        />
        <DetailItem
          label="Arresting Agency"
          value={formatText(data.arrestingAgency)}
        />
      </DetailGrid>
    </FormSectionCard>
  );
}

function CaseMetadataSectionEdit({
  title = "Case Metadata",
  description = "Basic identifying details about this detention.",
  sectionName = "Case Metadata",
  control,
  onSave,
  saveButtonProps,
  onGenerateCaseId,
  loadLastCaseId,
  caseIdExamples,
  region,
  existingCaseIds,
}: EditProps) {
  const [zoneInput, setZoneInput] = React.useState("");
  const [generating, setGenerating] = React.useState(false);

  const now = React.useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const normalise = (s: string) => s.trim().replace(/\s+/g, "-").toUpperCase();

  const parseSequenceFromCaseId = React.useCallback(
    (caseId: string | null | undefined) => {
      if (!caseId) return 0;
      const text = normalise(caseId);
      const m = text.match(/(\d+)$/);
      if (!m || !m[1]) return 0;
      const n = Number.parseInt(m[1], 10);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    },
    []
  );

  const buildCaseId = React.useCallback(
    (seq: number) => {
      const padded = String(Math.max(1, seq)).padStart(4, "0");
      const r = normalise(region ?? "REGION");
      const z = normalise(zoneInput || "ZONE");
      return `${r}-${z}-${year}-${month}-${padded}`;
    },
    [region, zoneInput, year, month]
  );

  return (
    <FormSectionCard
      title={title}
      description={description}
      sectionName={sectionName}
      onSave={onSave}
      saveButtonProps={saveButtonProps}
      contentClassName="grid gap-4 sm:grid-cols-2"
    >
      <div className="flex flex-col gap-6 sm:col-span-2">
        <FormField
          control={control}
          name="detentionDateTime"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DateTimePicker
                  label="Detention Date & Time"
                  value={field.value ?? ""}
                  onChange={(value) => field.onChange(value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="caseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case ID</FormLabel>
              {region ? (
                <FormDescription>
                  Format{" "}
                  <span className="font-mono text-xs">
                    REGION-ZONE-YYYY-MM-NNNN
                  </span>
                  . Generate from last submitted case.
                </FormDescription>
              ) : caseIdExamples ? (
                <FormDescription>
                  Format{" "}
                  <span className="font-mono text-xs">ZONE-YYYY-NNN</span>. Use
                  Generate to set ID.
                </FormDescription>
              ) : null}
              <FormControl>
                {region ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 flex-col md:flex-row md:items-end">
                      <div className="flex flex-col gap-2">
                        <FormLabel>The Zone this is in:</FormLabel>
                        <Input
                          value={zoneInput}
                          onChange={(e) => {
                            const raw = e.target.value ?? "";
                            const sanitised = raw
                              .replace(/\s+/g, "-")
                              .toUpperCase();
                            setZoneInput(sanitised);
                          }}
                          placeholder="ZONE"
                        />
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
                        <Button
                          type="button"
                          disabled={!zoneInput || generating}
                          onClick={async () => {
                            if (!zoneInput) return;
                            setGenerating(true);
                            try {
                              let last: string | null = null;
                              if (typeof loadLastCaseId === "function") {
                                try {
                                  last = await loadLastCaseId();
                                } catch {
                                  last = null;
                                }
                              }
                              let seq = 0;
                              if (last) {
                                seq = parseSequenceFromCaseId(last);
                              } else if (
                                existingCaseIds &&
                                existingCaseIds.length
                              ) {
                                const prefix = `${normalise(region ?? "REGION")}-${normalise(zoneInput)}-${year}-${month}-`;
                                for (const id of existingCaseIds) {
                                  const n = normalise(id);
                                  if (n.startsWith(prefix)) {
                                    const s = parseSequenceFromCaseId(n);
                                    if (s > seq) seq = s;
                                  }
                                }
                              }
                              const candidate = buildCaseId(seq + 1);
                              field.onChange(candidate);
                            } finally {
                              setGenerating(false);
                            }
                          }}
                          className="w-full sm:w-auto"
                        >
                          {generating ? "Generating..." : "Generate ID"}
                        </Button>
                      </div>
                    </div>
                    <Input
                      value={field.value ?? ""}
                      readOnly
                      placeholder={`e.g. ${buildCaseId(1)}`}
                    />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={field.value ?? ""}
                      readOnly
                      placeholder={`e.g. ${caseIdExamples?.primary ?? "ZONE-2024-001"}`}
                    />
                    {onGenerateCaseId || loadLastCaseId ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          if (typeof loadLastCaseId === "function") {
                            setGenerating(true);
                            try {
                              const last = await loadLastCaseId();
                              const nextSeq = parseSequenceFromCaseId(last) + 1;
                              const candidate = buildCaseId(nextSeq);
                              field.onChange(candidate);
                            } finally {
                              setGenerating(false);
                            }
                          } else if (typeof onGenerateCaseId === "function") {
                            onGenerateCaseId();
                          }
                        }}
                        disabled={generating}
                      >
                        {generating ? "Generating..." : "Generate ID"}
                      </Button>
                    ) : null}
                  </div>
                )}
              </FormControl>
              <div className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                <div className="flex-grow">
                  <FormMessage />
                </div>
                <div className="flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      const text = String(field.value ?? "");
                      if (!text) return;
                      try {
                        await navigator.clipboard.writeText(text);
                      } catch {
                        /* ignore */
                      }
                    }}
                  >
                    Copy Case ID
                  </Button>
                </div>
              </div>
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="detentionLocation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Detention Location</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Street / facility / city / state"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
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
    </FormSectionCard>
  );
}
