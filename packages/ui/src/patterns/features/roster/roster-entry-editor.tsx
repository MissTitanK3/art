"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { humanize } from "@workspace/ui/lib/utils";
import { RosterEntry, rosterEntrySchema } from "@workspace/store/types/pod.ts";
import type { FieldRole } from "@workspace/store/types/roles.ts";

import type { RosterEditorSection } from "./types.ts";
import {
  RosterEntryDetailsSection,
  type RosterEntrySharedDetail,
} from "@workspace/ui/patterns/features/roster/roster-entry-details-section";
import { RosterEntryCoverageSection } from "@workspace/ui/patterns/features/roster/roster-entry-coverage-section";
import { RosterEntryPathwaysSection } from "@workspace/ui/patterns/features/roster/roster-entry-pathways-section";
import { RosterEntryLanguagesSection } from "@workspace/ui/patterns/features/roster/roster-entry-languages-section";

const REGISTERED_ID_PREFIX = "registered-profile";

const editorSchema = rosterEntrySchema;

type FormValues = z.input<typeof editorSchema>;
type FormOutput = z.output<typeof editorSchema>;

function normalizeSkills(value?: string | null): string[] {
  if (!value) return [];
  const parts = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return Array.from(new Set(parts));
}

type EditRosterEntryFormProps = {
  initial: RosterEntry;
  onSave: (v: RosterEntry) => void;
  section?: RosterEditorSection;
  formId?: string;
};

export function EditRosterEntryForm({
  initial,
  onSave,
  section,
  formId,
}: EditRosterEntryFormProps) {
  const isRegistered =
    Boolean(
      (initial as any).profile_id &&
        String((initial as any).profile_id).trim().length > 0
    ) || initial.id.startsWith(REGISTERED_ID_PREFIX);

  const [loadedProfile, setLoadedProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const profileId: string | undefined = (initial as any).profile_id
    ? String((initial as any).profile_id)
    : initial.profile?.id
      ? String(initial.profile.id)
      : undefined;

  const form = useForm<FormValues, any, FormOutput>({
    resolver: zodResolver(editorSchema),
    mode: "onChange",
    defaultValues: {
      id: initial.id,
      handle: initial.handle ?? initial.profile?.display_name ?? "",
      role: initial.role,
      status: initial.status,
      joinedAt: initial.joinedAt ?? undefined,
      lastShiftAt: initial.lastShiftAt ?? undefined,
      langs: initial.langs ?? [],
      skills: initial.skills?.join(", ") ?? "",
      certs: initial.certs ?? [],
      notes: initial.notes ?? "",
      signal_handle: initial.signal_handle || "",
    },
  });

  const { handleSubmit, setValue, watch } = form;

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      if (!isRegistered || !profileId) return;
      if (initial.profile && String(initial.profile.id) === profileId) return;
      try {
        setLoadingProfile(true);
        const res = await fetch(
          `/api/dispatch/profiles?id=${encodeURIComponent(profileId)}`,
          { credentials: "include" }
        );
        if (!res.ok) return;
        const json = await res.json();
        const p = Array.isArray(json?.profiles) ? json.profiles[0] : null;
        if (!cancelled && p) {
          setLoadedProfile(p);
          const currentSignal = (watch("signal_handle") ?? "").trim();
          if (!currentSignal && p.contact_signal) {
            setValue("signal_handle", p.contact_signal, {
              shouldDirty: true,
              shouldTouch: true,
            });
          }
        }
      } catch {
        // ignore load error
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [isRegistered, profileId, initial.profile, setValue, watch]);

  const registeredProfile = isRegistered
    ? (loadedProfile ?? initial.profile)
    : undefined;

  const sharedDetails = useMemo<RosterEntrySharedDetail[]>(() => {
    if (!registeredProfile) return [];

    const detailItems: RosterEntrySharedDetail[] = [];

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

    const pushDetail = (
      label: string,
      value?: string | string[] | boolean | null | Record<string, unknown>[]
    ) => {
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
      (registeredProfile.field_roles as FieldRole[] | undefined)?.map(
        (role: FieldRole) => humanize(role)
      )
    );
    pushDetail("Coverage Zones", registeredProfile.coverage_zones);
    pushDetail("Operating Counties", registeredProfile.operating_counties);
    pushDetail(
      "Availability",
      registeredProfile.availability ? "Available" : "Unavailable"
    );
    pushDetail(
      "Verified By",
      registeredProfile.verified_by
        ? humanize(registeredProfile.verified_by)
        : ""
    );

    return detailItems;
  }, [registeredProfile]);

  const submit: SubmitHandler<FormOutput> = (vals) => {
    const nextProfile =
      isRegistered && registeredProfile ? registeredProfile : initial.profile;

    const transformed: RosterEntry = {
      ...initial,
      handle: vals.handle.trim() || initial.handle,
      role: vals.role,
      status: vals.status,
      joinedAt: vals.joinedAt ?? initial.joinedAt ?? undefined,
      lastShiftAt: vals.lastShiftAt ?? undefined,
      langs: vals.langs ?? [],
      skills: normalizeSkills(vals.skills),
      certs: vals.certs ?? [],
      notes: vals.notes?.trim() || undefined,
      signal_handle: vals.signal_handle?.trim() || undefined,
      profile: nextProfile,
    };
    onSave(transformed);
  };

  const formElementId = formId ?? "edit-roster-entry-form";
  const activeSection: RosterEditorSection = section ?? "details";

  return (
    <FormProvider {...form}>
      <form
        id={formElementId}
        onSubmit={handleSubmit(submit)}
        className="grid gap-4"
      >
        <RosterEntryDetailsSection
          isActive={activeSection === "details"}
          isRegistered={isRegistered}
          loadingProfile={loadingProfile}
          hasRegisteredProfile={Boolean(registeredProfile)}
          sharedDetails={sharedDetails}
        />
        <RosterEntryCoverageSection isActive={activeSection === "coverage"} />
        <RosterEntryLanguagesSection isActive={activeSection === "languages"} />
        <RosterEntryPathwaysSection isActive={activeSection === "pathways"} />
      </form>
    </FormProvider>
  );
}
