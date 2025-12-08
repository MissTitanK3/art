"use client";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "@workspace/ui/primitives/button";
import { Input } from "@workspace/ui/primitives/input";
import { Textarea } from "@workspace/ui/primitives/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Switch } from "@workspace/ui/primitives/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/primitives/sheet";
import type {
  AdvocacyGroup,
  AdvocacyGroupType,
  AdvocacyPreferredFormat,
} from "@workspace/store/types/advocacy";

type Option<T extends string> = {
  value: T;
  label: string;
};

interface AdvocacyGroupSheetProps {
  canManage: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: Partial<AdvocacyGroup>;
  setDraft: Dispatch<SetStateAction<Partial<AdvocacyGroup>>>;
  saving: boolean;
  onSubmit: () => void;
  types: readonly Option<AdvocacyGroupType>[];
  formats: readonly Option<AdvocacyPreferredFormat>[];
}

export function AdvocacyGroupSheet({
  canManage,
  open,
  onOpenChange,
  draft,
  setDraft,
  saving,
  onSubmit,
  types,
  formats,
}: AdvocacyGroupSheetProps) {
  if (!canManage) return null;

  type ContactKey = "contact_emails" | "contact_phones" | "contact_faxes";

  const handleContactChange = (
    key: ContactKey,
    index: number,
    value: string
  ) => {
    setDraft((prev) => {
      const next = [...((prev[key] as string[] | undefined) ?? [])];
      next[index] = value;
      return { ...prev, [key]: next };
    });
  };

  const addContactField = (key: ContactKey) => {
    setDraft((prev) => {
      const current = (prev[key] as string[] | undefined) ?? [];
      return { ...prev, [key]: [...current, ""] };
    });
  };

  const contactEntries = (key: ContactKey) => {
    const list = (draft[key] as string[] | undefined) ?? [];
    return list.length > 0 ? list : [""];
  };

  const removeContactField = (key: ContactKey, index: number) => {
    setDraft((prev) => {
      const current = [...((prev[key] as string[] | undefined) ?? [])];
      current.splice(index, 1);
      return { ...prev, [key]: current };
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button>Add Group</Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[80vh] bg-card overflow-y-auto text-card-foreground max-w-2xl m-auto"
      >
        <SheetHeader>
          <SheetTitle>Add Advocacy Group</SheetTitle>
          <SheetDescription>
            Trusted orgs automatically receive finalized missing-person reports
            when enabled.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-3 p-4 pt-0">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Name"
              value={draft.name ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
            />
            <Input
              placeholder="Jurisdiction (city, county, region)"
              value={draft.jurisdiction ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, jurisdiction: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-2 grid-cols-2">
            <Select
              value={draft.type ?? undefined}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, type: v as AdvocacyGroupType | null }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={draft.preferred_format ?? undefined}
              onValueChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  preferred_format: v as AdvocacyPreferredFormat | null,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Preferred Format" />
              </SelectTrigger>
              <SelectContent>
                {formats.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={!!draft.active_status}
              onCheckedChange={(v) =>
                setDraft((d) => ({ ...d, active_status: v }))
              }
            />
            <span className="text-sm">Available For Advocacy</span>
          </div>
          {(["contact_emails", "contact_phones", "contact_faxes"] as ContactKey[]).map((key) => (
            <div key={key} className="space-y-2">
              <span className="text-sm font-medium capitalize">
                {key.replace("contact_", "").replace("_", " ")}
              </span>
              <div className="space-y-2">
                {contactEntries(key).map((value, idx) => (
                  <div key={`${key}-${idx}`} className="flex gap-2">
                    <Input
                      placeholder={`${key.replace("contact_", "").replace("_", " ")} ${idx + 1}`}
                      value={value}
                      onChange={(e) => handleContactChange(key, idx, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContactField(key, idx)}
                      disabled={contactEntries(key).length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addContactField(key)}
              >
                Add {key.replace("contact_", "").replace("_", " ")}
              </Button>
            </div>
          ))}
          <Input
            placeholder="Signal handle (optional)"
            value={draft.contact_signal ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, contact_signal: e.target.value }))
            }
          />
          <Textarea
            placeholder="Notes (internal only)"
            value={draft.notes ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          />
        </div>
        <SheetFooter>
          <div className="flex w-full justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={saving}>
              {saving ? "Saving…" : "Save Group"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
