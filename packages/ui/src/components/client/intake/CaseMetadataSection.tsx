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
  onGenerateCaseId?: () => void;
  caseIdExamples?: CaseIdExamples;
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
  } = props;

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
              {caseIdExamples ? (
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
                <div className="flex gap-2">
                  <Input {...field} placeholder={`e.g. ${caseIdExamples?.primary ?? "ZONE-2024-001"}`} />
                  {onGenerateCaseId ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onGenerateCaseId}
                    >
                      Generate
                    </Button>
                  ) : null}
                </div>
              </FormControl>
              <FormMessage />
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
