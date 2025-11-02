import * as React from "react";
import { type Control } from "react-hook-form";

import { Button, type ButtonProps } from "../../button";
import { FormSectionCard } from "../../form-section-card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../form";
import { Input } from "../../input";
import { DateTimePicker } from "../../DateTimePicker";
import { DetailGrid, DetailItem } from "./DetailGrid";
import { formatDateTime, formatText } from "./utils";
import type {
  DetaineeIntake,
} from "@workspace/ui/types/missing-person-intake";

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
  caseIdExamples?: CaseIdExamples;
  existingCaseIds?: string[]; // optional: used to suggest next sequence
}

interface ViewProps extends BaseProps {
  mode: "view";
  data: DetaineeIntake;
}

export type CaseMetadataSectionProps = EditProps | ViewProps;

export function CaseMetadataSection(props: CaseMetadataSectionProps) {
  const title = props.title ?? "Case Metadata";
  const description = props.description ?? "Basic identifying details about this detention.";
  const sectionName = props.sectionName ?? "Case Metadata";

  if (props.mode === "view") {
    const { data } = props;
    return (
      <FormSectionCard title={title} description={description}>
        <DetailGrid>
          <DetailItem label="Case ID" value={formatText(data.caseId)} />
          <DetailItem label="Detention Date & Time" value={formatDateTime(data.detentionDateTime)} />
          <DetailItem label="Detention Location" value={formatText(data.detentionLocation)} />
          <DetailItem label="Arresting Agency" value={formatText(data.arrestingAgency)} />
        </DetailGrid>
      </FormSectionCard>
    );
  }

  const {
    control,
    onSave,
    saveButtonProps,
    onGenerateCaseId,
    caseIdExamples,
    region,
    existingCaseIds,
  } = props;

  const [zoneInput, setZoneInput] = React.useState("");
  const [sequenceInput, setSequenceInput] = React.useState<number | "">("");

  const now = React.useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const normalise = (s: string) => s.trim().toUpperCase();

  const suggestNextSequence = React.useCallback(() => {
    if (!region || !existingCaseIds || !zoneInput) return 1;
    const prefix = `${normalise(region)}-${normalise(zoneInput)}-${year}-${month}`;
    let max = 0;
    for (const id of existingCaseIds) {
      const n = normalise(id);
      if (n.startsWith(prefix + "-")) {
        const tail = n.slice(prefix.length + 1);
        const m = tail.match(/^(\d{1,4})$/);
        if (m && m[1]) {
          const num = Number.parseInt(m[1], 10);
          if (!Number.isNaN(num) && num > max) max = num;
        }
      }
    }
    return max + 1;
  }, [region, existingCaseIds, zoneInput, year, month]);

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
                  Use the format {" "}
                  <span className="font-mono text-xs">REGION-ZONE-YYYY-MM-NNNN</span>. Suggested ID:{" "}
                  <span className="font-mono text-xs">
                    {buildCaseId(typeof sequenceInput === "number" && sequenceInput > 0 ? sequenceInput : 1)}
                  </span>
                  .
                </FormDescription>
              ) : caseIdExamples ? (
                <FormDescription>
                  Use the format <span className="font-mono text-xs">ZONE-YYYY-NNN</span>. Suggested ID:{" "}
                  <span className="font-mono text-xs">{caseIdExamples.primary}</span>
                  {caseIdExamples.secondary ? (
                    <>
                      . Another valid example:{" "}
                      <span className="font-mono text-xs">{caseIdExamples.secondary}</span>.
                    </>
                  ) : (
                    "."
                  )}
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
                          onChange={(e) => setZoneInput(e.target.value.toUpperCase())}
                          placeholder="ZONE"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <FormLabel>Case Number:</FormLabel>
                        <Input
                          type="number"
                          min={1}
                          value={sequenceInput === "" ? "" : sequenceInput}
                          onChange={(e) => {
                            const v = e.target.value;
                            setSequenceInput(v === "" ? "" : Math.max(1, Number(v)));
                          }}
                          placeholder="0001"
                        />
                      </div>
                      <div className="flex items-end gap-2">

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const next = suggestNextSequence();
                            setSequenceInput(next);
                          }}
                        >
                          Suggest Next Number
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            const seq = typeof sequenceInput === "number" && sequenceInput > 0
                              ? sequenceInput
                              : suggestNextSequence();
                            const candidate = buildCaseId(seq);
                            field.onChange(candidate);
                          }}
                        >
                          Generate ID
                        </Button>
                      </div>
                    </div>
                    <Input
                      {...field}
                      placeholder={`e.g. ${buildCaseId(1)}`}
                    />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input {...field} placeholder={`e.g. ${caseIdExamples?.primary ?? "ZONE-2024-001"}`} />
                    {onGenerateCaseId ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onGenerateCaseId}
                      >
                        Generate ID
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
                        // ignore clipboard errors
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
              <Input {...field} placeholder="Street / facility / city / state" />
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
