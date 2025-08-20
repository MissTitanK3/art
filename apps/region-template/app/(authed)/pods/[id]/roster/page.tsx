// tools/apps/region-template/app/(authed)/pods/[id]/roster/page.tsx
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { Badge } from "@workspace/ui/components/badge";
import { ArrowLeft, Edit3 } from "lucide-react";
import { RHFFieldRoles } from "@workspace/ui/components/client/roles/field-roles";
import { FIELD_ROLE_OPTIONS, FieldRole } from "@workspace/ui/components/client/roles/roles";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import LanguageFluencyEditor from "@workspace/ui/components/client/language/LanguageFluencyEditor";
import LanguagePicker, { NormalizedLanguage } from "@workspace/ui/components/client/language/LanguagePicker";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet";
import { StatusSelect } from "@workspace/ui/components/client/status/StatusSelect";
import { StatusValue } from "@workspace/ui/components/client/status/options";
import { RoleSelect } from "@workspace/ui/components/client/roles/RoleSelect";
import { RoleValue } from "@workspace/ui/components/client/roles/options";
import { useRosterStore } from "@/lib/rosterStore";

export type RosterEntry = {
  id: string;
  role: "lead" | "member" | "trainee";
  status: "active" | "inactive" | "suspended";
  langs: NormalizedLanguage[];
  skills: string;
  fieldRoles: FieldRole[];
  handle: string;
};

const editSchema = z.object({
  id: z.string(),
  role: z.enum(["lead", "member", "trainee"]),
  status: z.enum(["active", "inactive", "suspended"]),
  langs: z.array(z.object({
    tag: z.string(),
    display_name: z.string(),
    proficiency: z.enum(["native", "fluent", "conversational", "basic", "nonverbal"]).optional(),
  })),
  skills: z.string(),
  fieldRoles: z.array(z.enum(FIELD_ROLE_OPTIONS)),
});
type EditValues = z.infer<typeof editSchema>;

export default function PodRosterPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const podId = decodeURIComponent(id ?? "");

  const { roster, updateEntry } = useRosterStore();
  const rows = roster.filter((r) => r.podId === podId);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const editing = rows.find((r) => r.id === selectedId) ?? null;

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <h1 className="text-2xl font-bold">Pod Roster</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage members for <span className="font-mono">{podId}</span>.
      </p>

      <Card className="mt-4 p-0 overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
          <div className="col-span-4">Handle</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Langs / Skills</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {rows.map((r) => (
          <div
            key={r.id}
            className="grid md:grid-cols-12 gap-2 px-4 py-3 border-b last:border-b-0"
          >
            <div className="md:col-span-4">
              <div className="font-medium">{r.handle}</div>
              <div className="mt-1 flex items-center gap-2 md:hidden">
                <Badge variant="secondary">{r.role}</Badge>
                <Badge variant={r.status === "active" ? "default" : "secondary"}>
                  {r.status}
                </Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground md:hidden">
                <div>
                  Langs:{" "}
                  {r.langs?.length
                    ? r.langs.map((l) => l.display_name).join(", ")
                    : "—"}
                </div>
                <div>Skills: {r.skills || "—"}</div>
              </div>
            </div>

            <div className="hidden md:block md:col-span-2 self-center">
              <Badge variant="secondary">{r.role}</Badge>
            </div>
            <div className="hidden md:block md:col-span-2 self-center">
              <Badge variant={r.status === "active" ? "default" : "secondary"}>
                {r.status}
              </Badge>
            </div>
            <div className="hidden md:block md:col-span-3 self-center text-sm text-muted-foreground">
              <div>
                Langs:{" "}
                {r.langs?.length
                  ? r.langs.map((l) => l.display_name).join(", ")
                  : "—"}
              </div>
              <div>Skills: {r.skills || "—"}</div>
            </div>

            <div className="md:col-span-1 text-right">
              <Button onClick={() => setSelectedId(r.id)} size="sm" variant="outline">
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </Button>
            </div>
          </div>
        ))}

      </Card>

      {/* One global side panel */}
      <Sheet open={!!editing} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent
          side="right"
          className="w-full sm:w-[480px] md:w-[640px] lg:w-[720px] max-w-none p-0 flex flex-col"
        >
          <div className="border-b px-4 py-3">
            <SheetHeader>
              <SheetTitle>Edit Roster Entry</SheetTitle>
              <SheetDescription>
                Update role, status, languages and skills.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {editing && (
              <EditForm
                key={editing.id}
                initial={editing}
                onSave={(vals) => {
                  updateEntry(editing.id, vals);
                  setSelectedId(null);
                }}
              />
            )}
          </div>

          <div className="border-t px-4 py-3 flex items-center justify-end gap-2">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
            <Button
              type="submit"
              form="edit-form"
              className="min-w-24"
            >
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}

function EditForm({
  initial,
  onSave,
}: {
  initial: RosterEntry;
  onSave: (v: RosterEntry) => void;
}) {
  const {
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      id: initial.id,
      role: initial.role,
      status: initial.status,
      langs: initial.langs,
      skills: initial.skills,
      fieldRoles: initial.fieldRoles,
    },
    mode: "onChange",
  });

  const submit = (vals: EditValues) => {
    // merge back static fields (handle, podId, etc)
    onSave({
      ...initial,
      ...vals,
    });
  };

  return (
    <form
      id="edit-form"
      onSubmit={handleSubmit(submit)}
      className="grid gap-4 px-4 pb-4"
    >
      <ScrollArea>
        <div className="grid gap-2 my-3">
          <Label>Handle</Label>
          <Input value={initial.handle} disabled />
          <p className="text-xs text-muted-foreground">Handle is read-only here.</p>
        </div>

        {/* Role */}
        <div className="grid gap-2 my-3">
          <Label htmlFor="edit-role">Roster Role</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <RoleSelect
                id="edit-role"
                value={field.value as RoleValue}
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

        {/* Status */}
        <div className="grid gap-2 my-3">
          <Label htmlFor="edit-status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <StatusSelect
                id="edit-status"
                value={field.value as StatusValue}
                onChange={field.onChange}
                error={!!errors.status}
              />
            )}
          />
          {errors.status && (
            <p className="text-xs text-destructive">{errors.status.message}</p>
          )}
        </div>

        {/* Langs */}
        <div className="grid gap-2 my-3">
          <Controller
            name="langs"
            control={control}
            render={({ field }) => (
              <div className="grid gap-2 my-3">
                <Label>Languages</Label>
                <LanguagePicker
                  value={field.value || []}
                  onChange={field.onChange}
                  allowFreeText
                />
                <LanguageFluencyEditor
                  value={field.value || []}
                  onChange={field.onChange}
                />
              </div>
            )}
          />
          {errors.langs && (
            <p className="text-xs text-destructive">{errors.langs.message}</p>
          )}
        </div>

        {/* Field Roles */}
        <div className="grid gap-1 py-5">
          <Label className="mb-3">Field Roles</Label>
          <RHFFieldRoles<EditValues> name="fieldRoles" control={control} />
          {errors.fieldRoles && (
            <p className="text-xs text-destructive">
              {errors.fieldRoles.message as any}
            </p>
          )}
        </div>
      </ScrollArea>
    </form>
  );
}

