"use client";

import * as React from "react";
import { toast } from "sonner";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Input } from "@workspace/ui/components/input";
import { TagsInput } from "@workspace/ui/components/client/profile/TagsInput";
import { Switch } from "@workspace/ui/components/switch";
import { WeeklyAvailabilityEditor } from "@workspace/ui/components/client/profile/WeeklyAvailabilityEditor";
import { Button } from "@workspace/ui/components/button";
import { Save, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@workspace/ui/components/alert-dialog";
import RoleSelector from "@workspace/ui/components/client/roles/RoleSelector";
import { RiskSheet } from "@workspace/ui/components/client/profile/RiskSheet";
import { DumbField } from "@workspace/ui/components/server/DumbField";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@workspace/ui/components/select";
import { US_STATES } from "@workspace/ui/lib/constants/states";

import { BasicImage } from "../../BasicImage.tsx";
import { DeleteResult, DispatchProfileSchema, ProfileFormInput, ProfileFormOutput, SIGNAL_HANDLE_RE } from '@workspace/store/types/profile.ts'

import { ImageComponent } from '@workspace/store/utils/image'
import {
  AccessRoleDescriptions,
  FieldRole,
  roleLabel,
  VerifiedByDescriptions,
  verifierLabel
} from "@workspace/store/types/roles.ts";
import { useImage } from "../../../providers/ImageProvider.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@workspace/ui/components/label";


export interface ProfileFormProps {
  initial: Partial<ProfileFormInput> & { id?: string };
  onSubmit: (values: ProfileFormOutput) => Promise<{ ok: boolean; err?: string }> | { ok: boolean; err?: string };
  onDelete: () => Promise<DeleteResult> | DeleteResult;
  onDirtyChange?: (dirty: boolean) => void;
  onGenerateKey?: () => Promise<{ publicPem: string; privatePem: string }>;
  busy?: boolean;
  disableDelete?: boolean;
  ImageComponent?: ImageComponent;
  ImageUrl?: string;
}


export function ProfileForm({
  initial,
  onSubmit,
  onDelete,
  onDirtyChange,
  busy,
  disableDelete,
  ImageComponent: ImageProp,
  ImageUrl
}: ProfileFormProps) {
  const [isDeleting, startDelete] = React.useTransition();
  const [hasViewedSheet, setHasViewedSheet] = React.useState(false);
  const ImageFromContext = useImage();
  const Image = ImageProp ?? ImageFromContext ?? BasicImage;

  // RHF v8 instance
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormInput, any, ProfileFormOutput>({
    resolver: zodResolver(DispatchProfileSchema),
    defaultValues: {
      ...initial,
      access_role: initial.access_role ?? "team_member",
      verified_by: initial.verified_by ?? "self",
      field_roles: initial.field_roles ?? [],
      coverage_zones: initial.coverage_zones ?? [],
      affiliation: initial.affiliation ?? "",
      contact_signal: initial.contact_signal ?? "",
      coordination_zone: initial.coordination_zone ?? "",
      city: initial.city ?? "",
      availability: initial.availability ?? false,
      self_risk_acknowledged: initial.self_risk_acknowledged ?? false,
      weekly_availability: initial.weekly_availability ?? { blocks: {} },
    },
    mode: "onChange",
  });

  const submit: SubmitHandler<ProfileFormOutput> = async (values) => {
    try {
      const res = await onSubmit(values);
      console.log(res);

      if (res.ok) {
        toast.success("Profile saved");
        // form.reset(values, { keepValues: true });
      } else {
        toast.error(res.err || "Failed to save profile");
      }
    } catch (err) {
      console.error("Submit error", err);
      toast.error("Unexpected error saving profile");
    }
  };


  return (
    // <Form {...form}>
    <form id="edit-profile-entry-form" className="space-y-8" onSubmit={handleSubmit(submit, (errors) => {
      console.log("validation errors", errors);
    })}>
      {/* Identity / status */}
      <div className="grid gap-4 md:grid-cols-3">
        <DumbField
          label="Access Role"
          value={roleLabel(initial.access_role || "team_member")}
          tooltip={AccessRoleDescriptions[initial.access_role || "team_member"]}
        />
        <DumbField
          label="Verified By"
          value={verifierLabel(initial.verified_by || "self")}
          tooltip={VerifiedByDescriptions[initial.verified_by || "self"]}
        />
        <Controller
          name="availability"
          control={control}
          render={({ field }) => (
            <div className="gap-2 flex flex-col">
              <Label>Available for dispatch?</Label>
              <div>

                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                <span className="text-sm text-muted-foreground ml-2">
                  Toggle to indicate you’re actively available
                </span>
              </div>
            </div>
          )}
        />
      </div>

      {/* Contact / location */}
      <div className="grid gap-6  m-auto grid-cols-1 md:grid-cols-2">
        <div className="w-full flex justify-center">
          {ImageUrl && (
            <Image
              src={ImageUrl}
              alt="Profile avatar"
              width={200}
              height={150}
              style={{
                height: 'auto',
                width: 'auto'
              }}
              className="object-cover"
              loading="lazy"
            />
          )}
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Controller
            name="display_name"
            control={control}
            render={({ field }) => (
              <>
                <Label>Display name</Label>
                <Input placeholder="Your handle or name" {...field} value={field.value ?? ""} />
              </>
            )}
          />
          <Controller
            name="contact_signal"
            control={control}
            render={({ field }) => (
              <>
                <Label>Signal (@username)</Label>
                <Input
                  placeholder="@handle.12"
                  {...field}
                  value={field.value ?? ""}
                  onBlur={(e) => {
                    field.onBlur();
                    // lightweight normalize on blur using the same schema piece
                    const v = e.currentTarget.value;
                    const ok = SIGNAL_HANDLE_RE.test(v);
                    if (ok) field.onChange("@" + v.replace(/^@/, "").toLowerCase());
                  }}
                  inputMode="text"
                  autoComplete="username"
                  spellCheck={false}
                  // optional: native constraint to help users before submit
                  pattern={SIGNAL_HANDLE_RE.source}
                  title="3–32 chars; letters, numbers, _; must end with 2+ digits following a period"
                />
              </>
            )}
          />
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <>
                <Label>State</Label>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          />

          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <>
                <Label>City (optional)</Label>
                <Input placeholder="e.g. Washington D.C" {...field} value={field.value ?? ""} />
              </>
            )}
          />

          <Controller
            name="coordination_zone"
            control={control}
            render={({ field }) => (
              <>
                <Label>Coordination zone</Label>
                <Input placeholder="e.g. PNW-Region-1" {...field} value={field.value ?? ""} />
              </>
            )}
          />
          <Controller
            name="affiliation"
            control={control}
            render={({ field }) => (
              <>
                <Label>Affiliation (optional)</Label>
                <Input placeholder="Partner org or pod" {...field} value={field.value ?? ""} />
              </>
            )}
          />
        </div>
      </div>


      {/* Roles / tags */}
      <div className="grid gap-6 mt-4">
        <Controller
          name="field_roles"
          control={control}
          render={({ field }) => (
            <>
              <RoleSelector selected={field.value ?? [] as FieldRole[]} onChange={field.onChange} />
            </>
          )}
        />
      </div>

      <Controller
        name="self_status_flags"
        control={control}
        render={({ field }) => (
          <>
            <Label>Self Status Flags</Label>
            <TagsInput
              value={field.value ?? []}
              onChange={field.onChange}
              description="Optional tags for how you identify or participate. e.g. 'medic', 'out-of-state transport', 'queer', 'translator'. Max 10."
            />
          </>
        )}
      />

      {/* Risk acknowledgment */}
      <div className="grid gap-6">
        <Controller
          name="self_risk_acknowledged"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-3">
              <Label>Self Risk Acknowledgment</Label>
              <div className="flex flex-wrap gap-3">
                <span className="text-sm">
                  I understand the risks of field work and will follow safety protocols
                </span>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={!hasViewedSheet}
                />
              </div>
              <RiskSheet onViewed={() => setHasViewedSheet(true)} />
              {!hasViewedSheet && (
                <p className="text-xs text-muted-foreground">
                  Please review the risks before acknowledging.
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* Weekly availability */}
      <Controller
        name="weekly_availability"
        control={control}
        render={({ field }) => (
          <>
            <Label>Weekly Unavailability</Label>
            <span className="text-sm text-muted-foreground">
              Use this for when you <strong>know</strong> that you will <strong>not</strong> be available throughout the week.
            </span>
            <WeeklyAvailabilityEditor value={field.value ?? { blocks: {} }} onChange={field.onChange} />
          </>
        )}
      />

      {/* Spacer for sticky bar */}
      <div className="h-[76px] md:hidden" aria-hidden />

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="flex-1" type="button" variant="destructive" disabled={disableDelete || busy}>
                <Trash2 className="h-4 w-4" />
                Purge
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your profile & account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes your account and profile in this region. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting || busy}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeleting || busy}
                  onClick={() =>
                    startDelete(async () => {
                      const res = await onDelete();
                      if (res.ok) {
                        toast.success("Account deleted");
                        // caller handles navigation/redirect after success
                      } else {
                        toast.error(res.err || "Failed to delete account");
                      }
                    })
                  }
                >
                  {isDeleting ? "Deleting…" : "Delete account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            className="flex-1"
            type="submit"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
    </form>
    // </Form>
  );
}

/* ------------------------------------------
   Helpers
------------------------------------------- */

// If a previous schema used `state` as string[],
// coerce `initial.state` into a single string for the UI.
function coerceInitial(initial: Partial<ProfileFormInput>): Partial<ProfileFormInput> {
  const next = { ...initial };
  const raw = (initial as any)?.state;
  if (Array.isArray(raw)) {
    next.state = raw[0] ?? "";
  } else if (typeof raw !== "string") {
    next.state = "";
  }
  return next;
}
