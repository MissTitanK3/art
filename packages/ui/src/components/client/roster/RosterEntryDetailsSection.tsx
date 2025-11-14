import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import type { RosterEntryFormInput } from "@workspace/store/types/pod.ts";

import { RoleSelect } from "../roles/RoleSelect.tsx";
import { StatusSelect } from "../status/StatusSelect.tsx";
import { RegisteredProfileDetails } from "./RegisteredProfileDetails.tsx";

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

export type RosterEntrySharedDetail = { label: string; value: string };

type FormValues = RosterEntryFormInput;

type RosterEntryDetailsSectionProps = {
  isActive: boolean;
  isRegistered: boolean;
  loadingProfile: boolean;
  hasRegisteredProfile: boolean;
  sharedDetails: RosterEntrySharedDetail[];
};

export function RosterEntryDetailsSection({
  isActive,
  isRegistered,
  loadingProfile,
  hasRegisteredProfile,
  sharedDetails,
}: RosterEntryDetailsSectionProps) {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<FormValues>();

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

  return (
    <div
      className={`grid gap-3${isActive ? "" : " hidden"}`}
      aria-hidden={!isActive}
    >
      {isRegistered ? (
        <RegisteredProfileDetails
          loading={loadingProfile}
          hasProfile={hasRegisteredProfile}
          details={sharedDetails}
        />
      ) : null}

      <div className="grid gap-1">
        <Label htmlFor="handle">Call sign</Label>
        <Input id="handle" placeholder="e.g. Atlas-1" {...register("handle")} />
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
        <Label>Notes</Label>
        <Input placeholder="Optional notes" {...register("notes")} />
      </div>
    </div>
  );
}
