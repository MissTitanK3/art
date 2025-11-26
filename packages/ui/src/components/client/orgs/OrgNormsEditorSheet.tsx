"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

import { OrgNormsSection } from "./OrgNormsSection";
import type { OrgNormPresetOption, OrgNorms, OrgNormsCategory } from "./types";
import { ORG_NORM_PRESETS } from "./types";

type OrgNormsEditorSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  norms?: OrgNorms | null;
  presets?: Record<keyof OrgNorms, readonly OrgNormPresetOption[]>;
  onSave?: (norms: OrgNorms) => Promise<void> | void;
};

type NormSection = {
  key: keyof OrgNorms;
  title: string;
  description: string;
  allowMultiple?: boolean;
};

const SECTIONS: NormSection[] = [
  {
    key: "decision_making",
    title: "Decision making",
    description: "How decisions get made and who is involved in final calls.",
  },
  {
    key: "safety_level",
    title: "Safety level",
    description: "Expected risk level and baseline safety readiness for members.",
  },
  {
    key: "communication",
    title: "Communication",
    description: "Cadence, expectations for response, and preferred channels.",
    allowMultiple: true,
  },
  {
    key: "conflict_resolution",
    title: "Conflict resolution",
    description: "How disagreements are surfaced, mediated, and resolved.",
  },
  {
    key: "safety_protocols",
    title: "Safety protocols",
    description: "Physical and digital safety practices expected of members.",
    allowMultiple: true,
  },
  {
    key: "role_boundaries",
    title: "Role boundaries",
    description: "Clarify ownership, responsibilities, and how handoffs work.",
  },
  {
    key: "accountability",
    title: "Accountability",
    description: "How commitments are tracked, reviewed, and reinforced.",
  },
  {
    key: "onboarding",
    title: "Onboarding",
    description: "What new members should expect and complete to get started.",
    allowMultiple: true,
  },
  {
    key: "offboarding",
    title: "Offboarding",
    description: "How departures are handled and responsibilities handed off.",
    allowMultiple: true,
  },
  {
    key: "values_culture",
    title: "Values & culture",
    description: "Cultural guardrails and guiding values for the organization.",
    allowMultiple: true,
  },
];

export function OrgNormsEditorSheet({
  open,
  onOpenChange,
  norms,
  presets = ORG_NORM_PRESETS,
  onSave,
}: OrgNormsEditorSheetProps) {
  const initialNorms = useMemo<OrgNorms>(() => norms ?? {}, [norms]);
  const [draft, setDraft] = useState<OrgNorms>(initialNorms);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(initialNorms);
      setSaving(false);
    }
  }, [initialNorms, open]);

  const handleChange = (category: keyof OrgNorms, value: OrgNormsCategory | null) => {
    setDraft((prev) => ({ ...prev, [category]: value }));
  };

  const handleSave = async () => {
    if (!onSave) return onOpenChange(false);
    setSaving(true);
    try {
      await onSave(draft);
      toast.success("Norms saved");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to save norms");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!onSave) return onOpenChange(false);
    const confirmed = window.confirm(
      "Reset norms to defaults? This clears all saved organizational norms.",
    );
    if (!confirmed) return;
    setSaving(true);
    try {
      await onSave({});
      toast.success("Norms reset");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to reset norms");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-3xl overflow-hidden bg-card text-card-foreground z-[1200]">
        <SheetHeader>
          <SheetTitle>Edit organizational norms</SheetTitle>
          <SheetDescription>
            Align on decision-making, communication, conflict resolution, and safety
            practices. These norms are visible to everyone in the org overview.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-full pr-3">
          <div className="grid gap-3">
            {SECTIONS.map((section) => (
              <OrgNormsSection
                key={section.key}
                category={section.key}
                title={section.title}
                description={section.description}
                value={draft?.[section.key] ?? null}
                options={presets[section.key] ?? []}
                allowMultiple={section.allowMultiple}
                onChange={handleChange}
                disabled={saving}
              />
            ))}
          </div>
        </ScrollArea>

        <SheetFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={handleReset}
              disabled={saving}
            >
              Reset Norms to Defaults
            </Button>
          </div>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save norms"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
