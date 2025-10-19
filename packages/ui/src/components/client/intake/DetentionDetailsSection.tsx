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
import { Textarea } from "../../textarea";
import { StringArrayField, TransferArrayField } from "../../form-array-fields";
import { DetailGrid, DetailItem } from "./DetailGrid";
import { formatList, formatText, formatTransfers } from "./utils";
import type {
  DetaineeIntake,
} from "@workspace/ui/types/missing-person-intake";

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

export type DetentionDetailsSectionProps = EditProps | ViewProps;

export function DetentionDetailsSection(props: DetentionDetailsSectionProps) {
  const title = props.title ?? "Detention Details";
  const description = props.description ?? "Where they were last seen and custody updates.";
  const sectionName = props.sectionName ?? "Detention Details";

  if (props.mode === "view") {
    const { data } = props;
    return (
      <FormSectionCard title={title} description={description}>
        <div className="space-y-6">
          <DetailGrid>
            <DetailItem label="Last Known Facility" value={formatText(data.lastKnownFacility)} />
            <DetailItem label="Last Known City" value={formatText(data.lastKnownCity)} />
          </DetailGrid>
          <DetailItem label="Arresting Officers" value={formatList(data.arrestingOfficers, "None recorded")} />
          <DetailItem
            label="Stated Reason for Detention"
            value={formatText(data.statedReasonForDetention, "No reason recorded")}
          />
          <DetailItem label="Known Transfers" value={formatTransfers(data.knownTransfers)} />
          <DetailGrid>
            <DetailItem
              label="Belongings Left Behind"
              value={formatText(data.belongingsLeftBehind, "Not documented")}
            />
            <DetailItem
              label="Dependents Left Behind"
              value={formatText(data.dependentsLeftBehind, "Not documented")}
            />
          </DetailGrid>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
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
          control={control}
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
        control={control}
        name="arrestingOfficers"
        label="Arresting Officers"
        addLabel="Add officer"
        description="Names or badge numbers of officers involved."
        placeholder="Officer name or badge"
      />
      <FormField
        control={control}
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
        control={control}
        name="knownTransfers"
        label="Known Transfers"
        description="Track facility transfers to maintain custody visibility."
        addLabel="Add transfer"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
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
          control={control}
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
    </FormSectionCard>
  );
}
