"use client";

import { useForm, SubmitHandler, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  RosterEntry,
  rosterEntrySchema,
  RosterEntryFormInput,
  RosterEntryFormOutput,
} from "@workspace/store/types/pod.ts";
import { Button } from "@workspace/ui/components/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@workspace/ui/components/select";
import { PROFICIENCIES } from "../../../lib/constants/language.ts";
import LanguagePicker from "../language/LanguagePicker.tsx";
import LanguageFluencyEditor from "../language/LanguageFluencyEditor.tsx";
import { RoleSelect } from "../roles/RoleSelect.tsx";
import { StatusSelect } from "../status/StatusSelect.tsx";
import CertificationEditor from "../certifications/CertificationsEditor.tsx";
import { useState } from "react";


export function EditRosterEntryForm({
  initial,
  onSave,
}: {
  initial: RosterEntry;
  onSave: (v: RosterEntry) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RosterEntryFormInput, any, RosterEntryFormOutput>({
    resolver: zodResolver(rosterEntrySchema),
    mode: "onChange",
    defaultValues: {
      id: initial.id,
      role: initial.role,
      status: initial.status,
      langs: initial.langs ?? [],
      skills: initial.skills?.join(", ") ?? "",
      certs: initial.certs ?? [],
      notes: initial.notes ?? "",
    },
  });

  const [newCert, setNewCert] = useState("");

  const submit: SubmitHandler<RosterEntryFormOutput> = (vals) => {
    const transformed: RosterEntry = {
      ...initial,
      role: vals.role,
      status: vals.status,
      langs: vals.langs ?? [],
      skills: vals.skills ? vals.skills.split(",").map((s) => s.trim()) : [],
      certs: vals.certs ?? [],
      notes: vals.notes?.trim(),
    };
    onSave(transformed);
  };

  return (
    <form id="edit-roster-entry-form" onSubmit={handleSubmit(submit)} className="grid gap-3">
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
