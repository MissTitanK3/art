"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  academyCertificationOptions,
  createCertification,
  slugifyIdentifier,
} from "@workspace/ui/lib/academy-utils.ts";
import { humanize } from "@workspace/ui/lib/utils";
import { RosterEntry, rosterEntrySchema } from "@workspace/store/types/pod.ts";
import type { FieldRole } from "@workspace/store/types/roles.ts";

import CertificationEditor from "../certifications/CertificationsEditor.tsx";
import LanguageFluencyEditor from "../language/LanguageFluencyEditor.tsx";
import LanguagePicker from "../language/LanguagePicker.tsx";
import { RoleSelect } from "../roles/RoleSelect.tsx";
import { StatusSelect } from "../status/StatusSelect.tsx";

const REGISTERED_ID_PREFIX = "registered-profile";

const editorSchema = rosterEntrySchema;

type FormValues = z.input<typeof editorSchema>;
type FormOutput = z.output<typeof editorSchema>;

type CertificationDraft = {
  id: string;
  label: string;
};

function toDateTimeLocal(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - tzOffset * 60000);
  return local.toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return new Date(parsed.getTime()).toISOString();
}

function normalizeSkills(value?: string | null): string[] {
  if (!value) return [];
  const parts = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return Array.from(new Set(parts));
}

export function EditRosterEntryForm({
  initial,
  onSave,
}: {
  initial: RosterEntry;
  onSave: (v: RosterEntry) => void;
}) {
  const isRegistered =
    Boolean(
      (initial as any).profile_id &&
      String((initial as any).profile_id).trim().length > 0,
    ) || initial.id.startsWith(REGISTERED_ID_PREFIX);

  const [loadedProfile, setLoadedProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const profileId: string | undefined = (initial as any).profile_id
    ? String((initial as any).profile_id)
    : initial.profile?.id
      ? String(initial.profile.id)
      : undefined;

  const [certPickerOpen, setCertPickerOpen] = useState(false);
  const [certDraft, setCertDraft] = useState<CertificationDraft>({
    id: "",
    label: "",
  });
  const [certError, setCertError] = useState<string | null>(null);

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

  const joinedAtIso = watch("joinedAt");
  const lastShiftAtIso = watch("lastShiftAt");
  const joinedAtDisplay = useMemo(
    () => toDateTimeLocal(joinedAtIso),
    [joinedAtIso],
  );
  const lastShiftAtDisplay = useMemo(
    () => toDateTimeLocal(lastShiftAtIso),
    [lastShiftAtIso],
  );
  const certs = watch("certs") ?? [];
  const langs = watch("langs") ?? [];

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      if (!isRegistered || !profileId) return;
      if (initial.profile && String(initial.profile.id) === profileId) return;
      try {
        setLoadingProfile(true);
        const res = await fetch(
          `/api/dispatch/profiles?id=${encodeURIComponent(profileId)}`,
          { credentials: "include" },
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

  useEffect(() => {
    if (!certDraft.id) return;
    const match = academyCertificationOptions.find(
      (option) => option.id === certDraft.id,
    );
    if (match && certDraft.label.trim().length === 0) {
      setCertDraft((prev) => ({ ...prev, label: match.label }));
    }
  }, [certDraft.id, certDraft.label]);

  const registeredProfile = isRegistered
    ? (loadedProfile ?? initial.profile)
    : undefined;

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

    const pushDetail = (
      label: string,
      value?: string | string[] | boolean | null | Record<string, unknown>[],
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
        (role: FieldRole) => humanize(role),
      ),
    );
    pushDetail("Coverage Zones", registeredProfile.coverage_zones);
    pushDetail("Operating Counties", registeredProfile.operating_counties);
    pushDetail(
      "Availability",
      registeredProfile.availability ? "Available" : "Unavailable",
    );
    pushDetail(
      "Verified By",
      registeredProfile.verified_by
        ? humanize(registeredProfile.verified_by)
        : "",
    );

    return detailItems;
  }, [registeredProfile]);

  const handleSelectCertification = (id: string, label: string) => {
    setCertDraft({ id, label });
    setCertPickerOpen(false);
    setCertError(null);
  };

  const handleAddCertification = () => {
    const slug = slugifyIdentifier(certDraft.id);
    const label = certDraft.label.trim();
    if (!slug || !label) {
      setCertError("Select or enter a certification before adding.");
      return;
    }
    if (certs.some((cert) => cert.id === slug)) {
      setCertError("Certification already added.");
      return;
    }
    const newCertification = {
      ...createCertification(label, slug),
      level: "in_progress" as const,
    };
    setValue("certs", [...certs, newCertification], {
      shouldDirty: true,
      shouldTouch: true,
    });
    setCertDraft({ id: "", label: "" });
    setCertError(null);
  };

  return (
    <form
      id="edit-roster-entry-form"
      onSubmit={handleSubmit(submit)}
      className="grid gap-3"
    >
      {isRegistered ? (
        <section className="rounded-md border border-dashed bg-muted/40 p-3">
          <div className="mb-2">
            <h3 className="text-sm font-semibold">Registered Profile</h3>
            <p className="text-xs text-muted-foreground">
              This volunteer is synced from their user profile. Details shown
              below reflect what they chose to share.
            </p>
          </div>
          {loadingProfile && !registeredProfile ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
            </div>
          ) : null}
          <dl className="grid gap-2 text-xs">
            {sharedDetails.map((detail) => (
              <div key={detail.label} className="grid gap-0.5">
                <dt className="font-medium text-foreground">{detail.label}</dt>
                <dd className="text-muted-foreground">{detail.value}</dd>
              </div>
            ))}
            {sharedDetails.length === 0 ? (
              <p className="text-muted-foreground">
                No shared details available.
              </p>
            ) : null}
          </dl>
        </section>
      ) : null}

      <div className="grid gap-1">
        <Label htmlFor="handle">Call sign</Label>
        <Input
          id="handle"
          placeholder="e.g. Atlas-1"
          {...register("handle")}
        />
        <p className="text-xs text-muted-foreground">
          Used across pods and readiness boards. Keep it unique.
        </p>
        {errors.handle && (
          <p className="text-xs text-destructive">{errors.handle.message}</p>
        )}
      </div>

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
        {errors.role && (
          <p className="text-xs text-destructive">{errors.role.message}</p>
        )}
      </div>

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
        {errors.status && (
          <p className="text-xs text-destructive">{errors.status.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label htmlFor="joinedAt">Joined roster</Label>
          <Input
            id="joinedAt"
            type="datetime-local"
            value={joinedAtDisplay}
            onChange={(event) => {
              const iso = fromDateTimeLocal(event.target.value);
              setValue("joinedAt", iso, {
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
          />
          <p className="text-xs text-muted-foreground">
            Helps the academy hub chart onboarding velocity.
          </p>
          {errors.joinedAt && (
            <p className="text-xs text-destructive">{errors.joinedAt.message}</p>
          )}
        </div>
        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="lastShiftAt">Last shift</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const nowIso = new Date().toISOString();
                setValue("lastShiftAt", nowIso, {
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
            >
              Set to now
            </Button>
          </div>
          <Input
            id="lastShiftAt"
            type="datetime-local"
            value={lastShiftAtDisplay}
            onChange={(event) => {
              const iso = fromDateTimeLocal(event.target.value);
              setValue("lastShiftAt", iso, {
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
          />
          <p className="text-xs text-muted-foreground">
            Surfaces in pod activity panels on the academy hub.
          </p>
          {errors.lastShiftAt && (
            <p className="text-xs text-destructive">
              {errors.lastShiftAt.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-1">
        <Label>Signal Handle</Label>
        <label
          htmlFor="signal_handle"
          className="text-xs text-muted-foreground"
        >
          Must include the .00 suffix, e.g. @handle.12
        </label>
        <Controller
          name="signal_handle"
          control={control}
          render={({ field }) => (
            <Input
              id="signal_handle"
              placeholder="@handle"
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
        {errors.signal_handle && (
          <p className="text-xs text-destructive">
            {errors.signal_handle.message}
          </p>
        )}
      </div>

      <div className="grid gap-1">
        <Label>Languages</Label>
        <LanguagePicker
          value={langs}
          onChange={(next) =>
            setValue("langs", next, { shouldDirty: true, shouldTouch: true })
          }
          showProficiency={false}
        />
        <LanguageFluencyEditor
          value={langs}
          onChange={(next) =>
            setValue("langs", next, { shouldDirty: true, shouldTouch: true })
          }
        />
        {errors.langs && (
          <p className="text-xs text-destructive">
            {errors.langs.message as string}
          </p>
        )}
      </div>

      <div className="grid gap-1">
        <Label>Skills</Label>
        <Input placeholder="Comma separated" {...register("skills")} />
      </div>

      <div className="grid gap-1">
        <Label>Certifications</Label>
        <div className="space-y-3 rounded-lg border border-dashed bg-muted/40 p-3">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr),auto]">
            <Popover open={certPickerOpen} onOpenChange={setCertPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-between"
                >
                  {certDraft.id
                    ? certDraft.label || certDraft.id
                    : "Search academy courses"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[340px] p-0">
                <Command>
                  <CommandInput placeholder="Search course or slug" />
                  <CommandList>
                    <CommandEmpty>No course found</CommandEmpty>
                    <CommandGroup heading="Academy courses">
                      {academyCertificationOptions.map((option) => (
                        <CommandItem
                          key={option.id}
                          value={`${option.id} ${option.label}`}
                          onSelect={() =>
                            handleSelectCertification(option.id, option.label)
                          }
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${certDraft.id === option.id
                              ? "opacity-100"
                              : "opacity-0"
                              }`}
                          />
                          <div className="flex flex-col text-left">
                            <span className="font-medium leading-tight">
                              {option.label}
                            </span>
                            <span className="text-xs text-muted-foreground leading-tight">
                              {option.id}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddCertification}
              disabled={!certDraft.id || !certDraft.label}
            >
              Add
            </Button>
          </div>
          {certError ? (
            <p className="text-xs text-destructive">{certError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Added certifications appear below. Set their status to reflect
              progress so the operational minimum board stays accurate.
            </p>
          )}
        </div>

        <CertificationEditor
          value={certs}
          onChange={(next) =>
            setValue("certs", next, { shouldDirty: true, shouldTouch: true })
          }
        />

        {certs.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            {certs.map((cert) => (
              <span
                key={`${cert.id}-slug`}
                className="rounded border border-border/50 bg-background/60 px-2 py-1"
              >
                {cert.id}
              </span>
            ))}
          </div>
        ) : null}

        {errors.certs && (
          <p className="text-xs text-destructive">
            {errors.certs.message as string}
          </p>
        )}
      </div>

      <div className="grid gap-1">
        <Label>Notes</Label>
        <Input placeholder="Optional notes" {...register("notes")} />
      </div>
    </form>
  );
}
