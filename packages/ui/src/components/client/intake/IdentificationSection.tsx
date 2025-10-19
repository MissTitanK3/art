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
import { StringArrayField } from "../../form-array-fields";
import { DetailGrid, DetailItem } from "./DetailGrid";
import { formatList, formatText } from "./utils";
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

export type IdentificationSectionProps = EditProps | ViewProps;

export function IdentificationSection(props: IdentificationSectionProps) {
  const title = props.title ?? "Identification";
  const description = props.description ?? "Subject identifiers and personal details.";
  const sectionName = props.sectionName ?? "Identification";

  if (props.mode === "view") {
    const { data } = props;
    return (
      <FormSectionCard title={title} description={description}>
        <div className="space-y-6">
          <DetailGrid>
            <DetailItem label="Full Name" value={formatText(data.fullName)} />
            <DetailItem label="Date of Birth" value={formatText(data.dateOfBirth)} />
            <DetailItem label="Country of Birth" value={formatText(data.countryOfBirth)} />
            <DetailItem label="A-Number" value={formatText(data.aNumber)} />
            <DetailItem label="Gender Identity" value={formatText(data.genderIdentity)} />
            <DetailItem label="Pronouns" value={formatText(data.pronouns)} />
          </DetailGrid>
          <DetailItem label="Aliases" value={formatList(data.aliases)} />
          <DetailItem label="Languages Spoken" value={formatList(data.languagesSpoken)} />
          <DetailItem label="Physical Description" value={formatText(data.physicalDescription)} />
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
        control={control}
        name="aliases"
        label="Aliases"
        addLabel="Add alias"
        description="Document any known aliases or nicknames."
        placeholder="Alias or nickname"
      />
      <StringArrayField
        control={control}
        name="languagesSpoken"
        label="Languages Spoken"
        addLabel="Add language"
        description="List the languages the individual speaks."
        placeholder="Language (e.g. Spanish)"
      />
      <FormField
        control={control}
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
    </FormSectionCard>
  );
}
