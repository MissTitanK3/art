import * as React from "react";
import { type Control } from "react-hook-form";

import { ContactArrayField, StringArrayField } from "../../form-array-fields";
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
import { Switch } from "../../switch";
import { DetailGrid, DetailItem } from "./DetailGrid";
import { formatContacts, formatList, formatText } from "./utils";
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

export type LegalSupportSectionProps = EditProps | ViewProps;

export function LegalSupportSection(props: LegalSupportSectionProps) {
  const title = props.title ?? "Legal & Support";
  const description =
    props.description ??
    "Family contacts, legal representation, and urgent needs.";
  const sectionName = props.sectionName ?? "Legal Details";

  if (props.mode === "view") {
    const { data } = props;
    return (
      <FormSectionCard title={title} description={description}>
        <div className="space-y-6">
          <DetailItem
            label="Family Contacts"
            value={formatContacts(data.familyContacts)}
          />
          <DetailGrid>
            <DetailItem
              label="Prior Attorney"
              value={formatText(data.priorAttorney)}
            />
            <DetailItem
              label="Interpreter Needed"
              value={formatText(data.interpreterNeeded ? "Yes" : "No", "No")}
            />
          </DetailGrid>
          <DetailItem
            label="Preferred Legal Aid Organizations"
            value={formatList(data.preferredLegalAidOrgs, "None specified")}
          />
          <DetailItem
            label="Urgent Needs"
            value={formatList(data.urgentNeeds, "None documented")}
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
      saveButtonProps={{ variant: "secondary" }}
      contentClassName="grid gap-6"
    >
      <ContactArrayField
        control={control}
        name="familyContacts"
        label="Family Contacts"
        description="Primary relatives or support network to notify."
        addLabel="Add family contact"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
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
          control={control}
          name="interpreterNeeded"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between gap-3 rounded-lg border p-4">
              <div className="space-y-1.5">
                <FormLabel>Interpreter Needed</FormLabel>
                <FormDescription>
                  Toggle if interpretation is required for legal conversations.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <StringArrayField
        control={control}
        name="preferredLegalAidOrgs"
        label="Preferred Legal Aid Organizations"
        addLabel="Add organization"
        description="Specific clinics or organizations requested by family."
        placeholder="Legal aid organization"
      />
      <StringArrayField
        control={control}
        name="urgentNeeds"
        label="Urgent Needs"
        addLabel="Add urgent need"
        description="Medical, medication, childcare, or other immediate needs."
        placeholder="Describe the urgent need"
      />
    </FormSectionCard>
  );
}
