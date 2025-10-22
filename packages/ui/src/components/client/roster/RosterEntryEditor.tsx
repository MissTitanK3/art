"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  RosterEntry,
  rosterEntrySchema,
} from "@workspace/store/types/pod.ts";
import { Button } from "@workspace/ui/components/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@workspace/ui/components/select";
import { AccessRole, AccessRoles, AccessRoleDescriptions, roleLabel } from "@workspace/store/types/roles.ts";
import LanguagePicker from "../language/LanguagePicker.tsx";
import LanguageFluencyEditor from "../language/LanguageFluencyEditor.tsx";
import { RoleSelect } from "../roles/RoleSelect.tsx";
import { StatusSelect } from "../status/StatusSelect.tsx";
import CertificationEditor from "../certifications/CertificationsEditor.tsx";
import { useMemo, useState } from "react";
import { humanize } from "@workspace/ui/lib/utils";

const REGISTERED_ID_PREFIX = "registered-profile";

const editorSchema = rosterEntrySchema.extend({
  dispatch_role: z.enum(AccessRoles).optional(),
});

type FormValues = z.input<typeof editorSchema>;
type FormOutput = z.output<typeof editorSchema>;

export function EditRosterEntryForm({
  initial,
  onSave,
}: {
  initial: RosterEntry;
  onSave: (v: RosterEntry) => void;
}) {
  const isRegistered =
    initial.id.startsWith(REGISTERED_ID_PREFIX) ||
    (!!initial.profile?.user_id && initial.profile.user_id.trim().length > 0);

  const registeredProfile = isRegistered ? initial.profile : undefined;

  const dispatchRoleOptions = useMemo(
    () =>
      AccessRoles.map((value) => ({
        value,
        label: roleLabel(value),
        description: AccessRoleDescriptions[value],
      })),
    [],
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues, any, FormOutput>({
    resolver: zodResolver(editorSchema),
    mode: "onChange",
    defaultValues: {
      id: initial.id,
      role: initial.role,
      status: initial.status,
      langs: initial.langs ?? [],
      skills: initial.skills?.join(", ") ?? "",
      certs: initial.certs ?? [],
      notes: initial.notes ?? "",
      signal_handle: initial.signal_handle || "",
      dispatch_role: isRegistered ? (initial.profile?.access_role ?? "team_member") : undefined,
    },
  });

  const [newCert, setNewCert] = useState("");

  const submit: SubmitHandler<FormOutput> = (vals) => {
    const nextProfile = isRegistered && registeredProfile
      ? {
          ...registeredProfile,
          access_role: vals.dispatch_role ?? registeredProfile.access_role ?? "team_member",
        }
      : initial.profile;

    const transformed: RosterEntry = {
      ...initial,
      role: vals.role,
      status: vals.status,
      langs: vals.langs ?? [],
      skills: vals.skills ? vals.skills.split(",").map((s) => s.trim()) : [],
      certs: vals.certs ?? [],
      notes: vals.notes?.trim(),
      signal_handle: vals.signal_handle?.trim() || undefined,
      profile: nextProfile,
    };
    onSave(transformed);
  };

  const sharedDetails = useMemo(() => {
    if (!registeredProfile) return [];

    const detailItems: { label: string; value: string }[] = [];

    const stringifyValue = (entry: unknown): string => {
      if (typeof entry === "string") {
        return humanize(entry);
      }
      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        if (typeof record.label === "string" && record.label.length > 0) {
          return record.label;
        }
        if (typeof record.name === "string" && record.name.length > 0) {
          return record.name;
        }
        if (typeof record.id === "string" && record.id.length > 0) {
          return humanize(record.id);
        }
      }
      return String(entry ?? "");
    };

    const pushDetail = (label: string, value?: string | string[] | boolean | null | Record<string, unknown>[] ) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        if (!value.length) return;
        detailItems.push({
          label,
          value: value.map((entry) => stringifyValue(entry)).join(", "),
        });
        return;
      }
      if (typeof value === "boolean") {
        detailItems.push({ label, value: value ? "Yes" : "No" });
        return;
      }
      const trimmed = value.toString().trim();
      if (!trimmed) return;
      detailItems.push({ label, value: trimmed });
    };

    pushDetail("Display Name", registeredProfile.display_name);
    pushDetail("Affiliation", registeredProfile.affiliation);
    pushDetail("Signal Contact", registeredProfile.contact_signal);
    pushDetail("City", registeredProfile.city);
    pushDetail("Coordination Zone", registeredProfile.coordination_zone);
    pushDetail(
      "Field Roles",
      registeredProfile.field_roles?.map((role) => humanize(role)),
    );
    pushDetail("Coverage Zones", registeredProfile.coverage_zones);
    pushDetail("Operating Counties", registeredProfile.operating_counties);
    pushDetail("Availability", registeredProfile.availability ? "Available" : "Unavailable");
    pushDetail("Verified By", registeredProfile.verified_by ? humanize(registeredProfile.verified_by) : "");

    return detailItems;
  }, [registeredProfile]);

  return (
    <form id="edit-roster-entry-form" onSubmit={handleSubmit(submit)} className="grid gap-3">
      {isRegistered ? (
        <section className="rounded-md border border-dashed bg-muted/40 p-3">
          <div className="mb-2">
            <h3 className="text-sm font-semibold">Registered Profile</h3>
            <p className="text-xs text-muted-foreground">
              This volunteer is synced from their user profile. Details shown below reflect what they chose to share.
            </p>
          </div>
          <dl className="grid gap-2 text-xs">
            {sharedDetails.map((detail) => (
              <div key={detail.label} className="grid gap-0.5">
                <dt className="font-medium text-foreground">{detail.label}</dt>
                <dd className="text-muted-foreground">{detail.value}</dd>
              </div>
            ))}
            {sharedDetails.length === 0 ? (
              <p className="text-muted-foreground">No shared details available.</p>
            ) : null}
          </dl>
        </section>
      ) : null}
      {/* Role */}
      <div className="grid gap-1">
        <Label>Role</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <RoleSelect
              id="role"
              value={field.value}
              onChange={field.onChange}
              error={!!errors.role}
              showDescriptions
            />
          )}
        />
        {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
      </div>

      {/* Status */}
      <div className="grid gap-1">
        <Label>Status</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <StatusSelect
              id="status"
              value={field.value}
              onChange={field.onChange}
              error={!!errors.status}
            />
          )}
        />
        {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
      </div>

      {isRegistered ? (
        <div className="grid gap-1">
          <Label>Dispatch Access</Label>
          <Controller
            name="dispatch_role"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(value) => field.onChange(value as AccessRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dispatch access" />
                </SelectTrigger>
                <SelectContent>
                  {dispatchRoleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Choose the level of dispatch responsibility this registered volunteer should hold.
          </p>
        </div>
      ) : null}
      <div className="grid gap-1">
        <Label>Signal Handle</Label>
        <label htmlFor="signal_handle" className="text-xs text-muted-foreground">
          Must include the .00 suffix, e.g. @handle.12
        </label>
        <Controller
          name="signal_handle"
          control={control}
          render={({ field }) => (
            <Input
              id="signal_handle"
              placeholder="@handle"
              {...register("signal_handle")}
            />
          )}
        />
        {errors.signal_handle && <p className="text-xs text-destructive">{errors.signal_handle.message}</p>}
      </div>

      {/* Languages */}
      <div className="grid gap-1">
        <Label>Languages</Label>
        <LanguagePicker
          value={watch("langs") ?? []}
          onChange={(next) => setValue("langs", next)}
          showProficiency={false} // only adding languages here
        />
        <LanguageFluencyEditor
          value={watch("langs") ?? []}
          onChange={(next) => setValue("langs", next)}
        />
        {errors.langs && <p className="text-xs text-destructive">{errors.langs.message as string}</p>}
      </div>

      {/* Skills */}
      <div className="grid gap-1">
        <Label>Skills</Label>
        <Input placeholder="Comma separated" {...register("skills")} />
      </div>

      {/* Certs */}
      <div className="grid gap-1">
        <Label>Certifications</Label>
        <div className="flex gap-2">
          <Input
            placeholder="New certification name (e.g. Medic Basics)"
            value={newCert}
            onChange={(e) => setNewCert(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => {
              if (!newCert.trim()) return;
              const current = watch("certs") ?? [];
              setValue("certs", [
                ...current,
                {
                  id: crypto.randomUUID(),
                  display_name: newCert.trim(),
                  level: "incomplete", // sensible default
                },
              ]);
              setNewCert("");
            }}
            disabled={!newCert.trim()}
          >
            Add
          </Button>
        </div>
        <CertificationEditor
          value={watch("certs") ?? []}
          onChange={(next) => setValue("certs", next)}
        />
        {errors.certs && <p className="text-xs text-destructive">{errors.certs.message as string}</p>}
      </div>

      {/* Notes */}
      <div className="grid gap-1">
        <Label>Notes</Label>
        <Input placeholder="Optional notes" {...register("notes")} />
      </div>
    </form>
  );
}
