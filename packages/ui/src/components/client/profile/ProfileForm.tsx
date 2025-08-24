"use client";

import * as React from "react";
import { z } from "zod";
import { toast } from "sonner";
import { SubmitHandler } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@workspace/ui/components/form";
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
import { DispatchProfileSchema, SIGNAL_HANDLE_RE } from '@workspace/store/types/profile.ts'
import {
  formSchema,
  nullToEmptyArray,
  nullToEmptyBlocks,
  nullToEmptyString,
  nullToFalse
} from '@workspace/store/utils/form-helpers'
import { ImageComponent } from '@workspace/store/utils/image'
import {
  AccessRoleDescriptions,
  FIELD_ROLE_OPTIONS, FieldRole, roleLabel,
  VerifiedByDescriptions,
  verifierLabel
} from "@workspace/store/types/roles.ts";
import { useImage } from "../../../providers/ImageProvider.tsx";


/* ------------------------------------------
   Schema & RHF harness (UI-only)
------------------------------------------- */

const {
  schema: FormSchema,
  defaults,
  useForm,
} = formSchema(
  DispatchProfileSchema.pick({
    id: true,
    display_name: true,
    access_role: true,
    field_roles: true,
    verified_by: true,
    affiliation: true,
    availability: true,
    contact_signal: true,
    contact_sms: true,
    coordination_zone: true,
    coverage_zones: true,
    state: true,
    weekly_availability: true,
    self_risk_acknowledged: true,
    city: true,
  }).extend({
    id: z.string().uuid().optional(),
    display_name: z.string().min(1, "Display name is required"),
    affiliation: nullToEmptyString(),
    contact_signal: nullToEmptyString(),
    contact_sms: nullToEmptyString(),
    coordination_zone: nullToEmptyString(),
    city: nullToEmptyString(),
    field_roles: z.array(z.enum(FIELD_ROLE_OPTIONS)).default([]),
    state: z.string().optional().default(""),
    weekly_availability: nullToEmptyBlocks(),
    availability: nullToFalse(),
    self_risk_acknowledged: nullToFalse(),
    self_status_flags: z.array(z.string().min(1)).optional().default([]),
  })
);

export type ProfileFormInput = z.input<typeof FormSchema>;
export type ProfileFormOutput = z.output<typeof FormSchema>;

type DeleteResult = { ok: boolean; err?: string };

export interface ProfileFormProps {
  initial: Partial<ProfileFormInput> & { id?: string };
  onSubmit: (
    values: ProfileFormOutput
  ) => Promise<{ ok: boolean; err?: string }> | { ok: boolean; err?: string };
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
  const form = useForm({ defaultValues: { ...defaults, ...coerceInitial(initial) } });

  // Bubble dirty-state upwards if requested
  React.useEffect(() => {
    if (!onDirtyChange) return;
    const sub = form.watch(() => onDirtyChange(!!form.formState.isDirty));
    return () => sub.unsubscribe?.();
  }, [form, onDirtyChange]);

  const handleSubmit: SubmitHandler<ProfileFormOutput> = async (values) => {
    const res = await onSubmit({
      ...values,
      // normalize coverage_zones if you use an array of objects elsewhere
      coverage_zones: Array.isArray(values.coverage_zones)
        ? values.coverage_zones
        : [],
    });
    if (res.ok) {
      toast.success("Profile saved");
      form.reset(values, { keepValues: true });
    } else {
      toast.error(res.err || "Failed to save profile");
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(handleSubmit)}>
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
          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Available for dispatch?</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    <span className="text-sm text-muted-foreground">
                      Toggle to indicate you’re actively available
                    </span>
                  </div>
                </FormControl>
              </FormItem>
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
                className="object-cover"
                loading="lazy"
              />
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your handle or name" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_signal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signal (@username)</FormLabel>
                  <FormControl>
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem >
                  <FormLabel>State</FormLabel>
                  <Select

                    value={typeof field.value === "string" ? field.value : ""}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-full">
                      {US_STATES.map((s) => (
                        <SelectItem key={s.code} value={s.code}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Seattle" {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coordination_zone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coordination zone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. PNW-Region-1" {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="affiliation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affiliation (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Partner org or pod" {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>


        {/* Roles / tags */}
        <div className="grid gap-6 mt-4">
          <FormField
            control={form.control}
            name="field_roles"
            render={({ field }) => (
              <FormItem>
                <RoleSelector selected={field.value ?? [] as FieldRole[]} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="self_status_flags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Self Status Flags</FormLabel>
              <TagsInput
                value={field.value ?? []}
                onChange={field.onChange}
                description="Optional tags for how you identify or participate. e.g. 'medic', 'out-of-state transport', 'queer', 'translator'. Max 10."
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Risk acknowledgment */}
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="self_risk_acknowledged"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-3">
                <FormLabel>Risk Acknowledgment</FormLabel>
                <div className="flex flex-col items-center justify-between gap-3">
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                        disabled={!hasViewedSheet}
                      />
                      <span className="text-sm text-muted-foreground">
                        I understand the risks of field work and will follow safety protocols
                      </span>
                    </div>
                  </FormControl>
                  <RiskSheet onViewed={() => setHasViewedSheet(true)} />
                </div>
                {!hasViewedSheet && (
                  <p className="text-xs text-muted-foreground">
                    Please review the risks before acknowledging.
                  </p>
                )}
              </FormItem>
            )}
          />
        </div>

        {/* Weekly availability */}
        <FormField
          control={form.control}
          name="weekly_availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weekly Unavailability</FormLabel>
              <span className="text-sm text-muted-foreground">
                Use this for when you <strong>know</strong> that you will <strong>not</strong> be available throughout the week.
              </span>
              <WeeklyAvailabilityEditor value={field.value ?? { blocks: {} }} onChange={field.onChange} />
            </FormItem>
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
              disabled={busy || !form.formState.isDirty || form.formState.isSubmitting}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </form>
    </Form>
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
