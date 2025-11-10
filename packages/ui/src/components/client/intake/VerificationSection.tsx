import * as React from "react";
import { type Control } from "react-hook-form";

import { FormSectionCard } from "../../form-section-card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../form";
import { Input } from "../../input";
import { InfoSourceArrayField } from "../../form-array-fields";
import { DetailGrid, DetailItem } from "./DetailGrid";
import { formatInfoSources, formatText } from "./utils";
import type { DetaineeIntake } from "@workspace/ui/types/missing-person-intake";

interface BaseProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  sectionName?: string;
}

interface EditProps extends BaseProps {
  mode?: "edit";
  control: Control<any>;
  onSave?: () => void;
}

interface ViewProps extends BaseProps {
  mode: "view";
  data: DetaineeIntake;
}

export type VerificationSectionProps = EditProps | ViewProps;

export function VerificationSection(props: VerificationSectionProps) {
  const title = props.title ?? "Verification & Audit Trail";
  const description =
    props.description ??
    "How this information was verified and overall confidence.";
  const sectionName = props.sectionName ?? "Verification Details";

  if (props.mode === "view") {
    const { data } = props;
    return (
      <FormSectionCard title={title} description={description}>
        <div className="space-y-6">
          <DetailItem
            label="Information Sources"
            value={formatInfoSources(data.informationSources)}
          />
          <DetailGrid>
            <DetailItem
              label="Last Updated"
              value={formatText(data.lastUpdated)}
            />
            <DetailItem
              label="Confidence Rating"
              value={formatText(data.confidenceRating?.toString())}
            />
            <DetailItem label="Created At" value={formatText(data.createdAt)} />
            <DetailItem label="Created By" value={formatText(data.createdBy)} />
          </DetailGrid>
          <DetailItem
            label="Version"
            value={formatText(data.version?.toString(), "Not versioned")}
          />
        </div>
      </FormSectionCard>
    );
  }

  const { control, onSave } = props;

  return (
    <FormSectionCard
      title={title}
      description={description}
      sectionName={sectionName}
      onSave={onSave}
      contentClassName="grid gap-6"
    >
      <InfoSourceArrayField
        control={control}
        name="informationSources"
        label="Information Sources"
        description="Provide an audit trail for each piece of information."
        addLabel="Add source"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
        control={control}
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
    </FormSectionCard>
  );
}
