import * as React from "react";
import { type Control } from "react-hook-form";

import { ContactArrayField } from "../../form-array-fields";
import { FormSectionCard } from "../../form-section-card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../form";
import { Input } from "../../input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../card";
import { Separator } from "../../separator";
import { DetailGrid, DetailItem } from "./DetailGrid";
import { formatContacts } from "./utils";
import type {
  ContactInfo,
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
  dispatcherLabel?: string;
}

export type ContactsSectionProps = EditProps | ViewProps;

function formatDispatcherContact(contact?: ContactInfo): React.ReactNode {
  if (!contact) {
    return <span className="text-muted-foreground">Not provided</span>;
  }
  const details = [contact.relation, contact.phone, contact.email].filter(Boolean).join(" · ");
  return (
    <div className="space-y-1 text-sm">
      <div className="font-medium text-foreground">{contact.name || "Unknown"}</div>
      <div className="text-muted-foreground">{details || "No contact details"}</div>
    </div>
  );
}

export function ContactsSection(props: ContactsSectionProps) {
  const title = props.title ?? "Contacts";
  const description = props.description ?? "Witnesses and dispatch point of contact.";
  const sectionName = props.sectionName ?? "Contacts";

  if (props.mode === "view") {
    const { data } = props;
    return (
      <FormSectionCard title={title} description={description}>
        <div className="space-y-6">
          <DetailItem label="Witness Contacts" value={formatContacts(data.witnessContacts)} />
          <div>
            <div className="text-sm font-medium text-foreground">Dispatcher Contact</div>
            <div className="mt-2">{formatDispatcherContact(data.dispatcherContact)}</div>
          </div>
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
      <ContactArrayField
        control={control}
        name="witnessContacts"
        label="Witness Contacts"
        description="Record who witnessed the detention."
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
            control={control}
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
            control={control}
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
            control={control}
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
            control={control}
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
    </FormSectionCard>
  );
}
