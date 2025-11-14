"use client";

import * as React from "react";
import { PlusIcon, XIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Textarea } from "@workspace/ui/components/textarea";
import type {
  RegionOperationalMinimumDefinition,
  RegionOperationalMinimumKey,
} from "@workspace/store/types/academy-readiness.ts";
import { humanize } from "@workspace/ui/lib/utils";

type DraftMinimum = {
  key: string;
  label: string;
  description: string;
  requiredCount: string;
  staffingMin: string;
  staffingMax: string;
  requiredCourses: string[];
  tags: string;
  emphasis: string;
  customCourse: string;
};

type OperationalMinimumsManagerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  definitions: RegionOperationalMinimumDefinition[];
  courseOptions: { id: string; title: string }[];
  onSubmit?: (next: RegionOperationalMinimumDefinition[]) => Promise<void> | void;
  isSaving?: boolean;
};

const HUMANIZE_REGEX = /[_-]+/g;

function toDraft(definition: RegionOperationalMinimumDefinition): DraftMinimum {
  const [min, max] = definition.staffingRange ?? [];
  return {
    key: definition.key,
    label: definition.label ?? humanize(definition.key),
    description: definition.description ?? "",
    requiredCount: String(Number.isFinite(definition.requiredCount) ? definition.requiredCount : 0),
    staffingMin: typeof min === "number" && !Number.isNaN(min) ? String(min) : "",
    staffingMax: typeof max === "number" && !Number.isNaN(max) ? String(max) : "",
    requiredCourses: Array.isArray(definition.requiredCourses)
      ? [...definition.requiredCourses]
      : [],
    tags: Array.isArray(definition.tags) ? definition.tags.join(", ") : "",
    emphasis: definition.emphasis ?? "",
    customCourse: "",
  };
}

function splitList(value: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function parseNumber(value: string): number | undefined {
  if (!value && value !== "0") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.max(0, Math.floor(parsed));
}

function draftToDefinition(draft: DraftMinimum): RegionOperationalMinimumDefinition {
  const requiredCount = parseNumber(draft.requiredCount) ?? 0;
  const staffingMin = parseNumber(draft.staffingMin);
  const staffingMax = parseNumber(draft.staffingMax);
  let staffingRange: [number, number?] | undefined;
  if (typeof staffingMin === "number") {
    staffingRange = [staffingMin];
    if (typeof staffingMax === "number" && staffingMax >= staffingMin) {
      staffingRange[1] = staffingMax;
    }
  } else if (typeof staffingMax === "number") {
    staffingRange = [staffingMax];
  }

  const label = draft.label.trim().length > 0 ? draft.label.trim() : humanize(draft.key);
  const description = draft.description.trim().length > 0 ? draft.description.trim() : undefined;
  const emphasis = draft.emphasis.trim().length > 0 ? draft.emphasis.trim() : undefined;
  const tags = splitList(draft.tags);
  const requiredCourses = Array.from(
    new Set(
      draft.requiredCourses
        .map((course) => course.trim())
        .filter((course) => course.length > 0),
    ),
  );

  return {
    key: draft.key as RegionOperationalMinimumKey,
    label,
    description,
    requiredCount,
    requiredCourses,
    staffingRange,
    tags: tags.length > 0 ? tags : undefined,
    emphasis,
  };
}

function canonicalize(definitions: RegionOperationalMinimumDefinition[]) {
  return definitions
    .map((definition) => ({
      key: definition.key,
      label: definition.label ?? "",
      description: definition.description ?? "",
      requiredCount: definition.requiredCount ?? 0,
      requiredCourses: [...(definition.requiredCourses ?? [])],
      staffingRange: definition.staffingRange ? [...definition.staffingRange] : [],
      tags: definition.tags ? [...definition.tags] : [],
      emphasis: definition.emphasis ?? "",
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

export function OperationalMinimumsManagerSheet({
  open,
  onOpenChange,
  definitions,
  courseOptions = [],
  onSubmit,
  isSaving = false,
}: OperationalMinimumsManagerSheetProps) {
  const [drafts, setDrafts] = React.useState<DraftMinimum[]>(() => definitions.map(toDraft));
  const stableDefinitions = React.useMemo(
    () => canonicalize(definitions),
    [definitions],
  );
  const courseOptionMap = React.useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();
    for (const option of courseOptions) {
      if (!option?.id) continue;
      map.set(option.id, option);
    }
    return map;
  }, [courseOptions]);

  React.useEffect(() => {
    if (!open) return;
    setDrafts(definitions.map(toDraft));
  }, [definitions, open]);

  const convertedDrafts = React.useMemo(
    () => drafts.map(draftToDefinition),
    [drafts],
  );

  const isDirty = React.useMemo(() => {
    const canonicalDrafts = canonicalize(convertedDrafts);
    return JSON.stringify(canonicalDrafts) !== JSON.stringify(stableDefinitions);
  }, [convertedDrafts, stableDefinitions]);

  const handleFieldChange = React.useCallback(
    (index: number, field: Exclude<keyof DraftMinimum, "requiredCourses">, value: string) => {
      setDrafts((prev) => {
        const next = [...prev];
        const current = next[index];
        if (!current) return prev;
        next[index] = { ...current, [field]: value };
        return next;
      });
    },
    []);

  const handleReset = React.useCallback(() => {
    setDrafts(definitions.map(toDraft));
  }, [definitions]);

  const handleCourseToggle = React.useCallback((index: number, courseId: string) => {
    setDrafts((prev) => {
      const next = [...prev];
      const current = next[index];
      if (!current) return prev;
      const normalized = courseId.trim();
      if (normalized.length === 0) return prev;
      const exists = current.requiredCourses.includes(normalized);
      const updated = exists
        ? current.requiredCourses.filter((course) => course !== normalized)
        : [...current.requiredCourses, normalized];
      next[index] = { ...current, requiredCourses: updated };
      return next;
    });
  }, []);

  const handleRemoveCourse = React.useCallback((index: number, courseId: string) => {
    setDrafts((prev) => {
      const next = [...prev];
      const current = next[index];
      if (!current) return prev;
      next[index] = {
        ...current,
        requiredCourses: current.requiredCourses.filter((course) => course !== courseId),
      };
      return next;
    });
  }, []);

  const handleAddCustomCourse = React.useCallback((index: number) => {
    setDrafts((prev) => {
      const next = [...prev];
      const current = next[index];
      if (!current) return prev;
      const candidate = current.customCourse.trim();
      if (candidate.length === 0) return prev;
      const exists = current.requiredCourses.some((course) => course.toLowerCase() === candidate.toLowerCase());
      if (exists) {
        next[index] = { ...current, customCourse: "" };
        return next;
      }
      next[index] = {
        ...current,
        requiredCourses: [...current.requiredCourses, candidate],
        customCourse: "",
      };
      return next;
    });
  }, []);

  const handleSubmit = React.useCallback(async () => {
    if (!onSubmit) {
      onOpenChange(false);
      return;
    }
    try {
      await onSubmit(convertedDrafts);
      onOpenChange(false);
    } catch (error) {
      console.warn("[OperationalMinimumsManagerSheet] submit failed", error);
    }
  }, [convertedDrafts, onOpenChange, onSubmit]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex max-w-3xl flex-col bg-card text-card-foreground p-0">
        <SheetHeader className="border-b border-border/70 px-6 py-5">
          <SheetTitle>Manage Operational Minimums</SheetTitle>
          <SheetDescription>
            Adjust staffing targets, required courses, and emphasis notes for each competency. Changes apply to the current region once saved.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-5">
          <div className="space-y-6 pb-6">
            {drafts.map((draft, index) => (
              <div
                key={draft.key}
                className="space-y-4 rounded-xl border border-border/60 bg-background/60 p-5 shadow-xs"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {draft.key}
                  </p>
                  <Input
                    value={draft.label}
                    onChange={(event) => handleFieldChange(index, "label", event.target.value)}
                    placeholder="Label"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`${draft.key}-required-count`}>Ready headcount</Label>
                    <Input
                      id={`${draft.key}-required-count`}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={draft.requiredCount}
                      onChange={(event) => handleFieldChange(index, "requiredCount", event.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor={`${draft.key}-staffing-min`}>Staffing min</Label>
                      <Input
                        id={`${draft.key}-staffing-min`}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={draft.staffingMin}
                        onChange={(event) => handleFieldChange(index, "staffingMin", event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${draft.key}-staffing-max`}>Staffing max</Label>
                      <Input
                        id={`${draft.key}-staffing-max`}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={draft.staffingMax}
                        onChange={(event) => handleFieldChange(index, "staffingMax", event.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Required courses</Label>
                  {draft.requiredCourses.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {draft.requiredCourses.map((courseId) => {
                        const option = courseOptionMap.get(courseId);
                        const label = option?.title ?? humanize(courseId);
                        return (
                          <Button
                            key={`${draft.key}-selected-${courseId}`}
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRemoveCourse(index, courseId)}
                            className="flex items-center gap-4"
                          >
                            <span>{label}</span>
                            <span className="text-xs text-muted-foreground">{option?.id ?? courseId}</span>
                            <XIcon className="size-3" aria-hidden />
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No courses selected yet. Toggle chips below or add a custom slug.
                    </p>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Academy courses
                    </p>
                    {courseOptions.length > 0 ? (
                      <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
                        {courseOptions.map((option) => {
                          const selected = draft.requiredCourses.includes(option.id);
                          return (
                            <Button
                              key={`${draft.key}-available-${option.id}`}
                              type="button"
                              size="sm"
                              variant={selected ? "default" : "outline"}
                              onClick={() => handleCourseToggle(index, option.id)}
                              className="flex flex-col items-start gap-0.5 m-1 px-4 py-7 text-left"
                            >
                              <span className="text-sm font-medium leading-tight">
                                {option.title}
                              </span>
                              <span className="text-xs text-muted-foreground leading-tight">
                                {option.id}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No course blueprint entries available. Use the custom slug field instead.
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr),auto]">
                    <Input
                      value={draft.customCourse}
                      onChange={(event) => handleFieldChange(index, "customCourse", event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleAddCustomCourse(index);
                        }
                      }}
                      placeholder="Add custom course or certification slug"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleAddCustomCourse(index)}
                      disabled={draft.customCourse.trim().length === 0}
                      className="flex items-center gap-2"
                    >
                      <PlusIcon className="size-4" aria-hidden />
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Toggle chips to require academy courses, or add custom certification slugs manually. Selected courses appear above; click a chip to remove it.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${draft.key}-tags`}>Tags</Label>
                  <Input
                    id={`${draft.key}-tags`}
                    value={draft.tags}
                    onChange={(event) => handleFieldChange(index, "tags", event.target.value)}
                    placeholder="Comma separated tags (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${draft.key}-description`}>Description</Label>
                  <Textarea
                    id={`${draft.key}-description`}
                    value={draft.description}
                    onChange={(event) => handleFieldChange(index, "description", event.target.value)}
                    placeholder="Describe the capability this minimum covers"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${draft.key}-emphasis`}>Emphasis</Label>
                  <Textarea
                    id={`${draft.key}-emphasis`}
                    value={draft.emphasis}
                    onChange={(event) => handleFieldChange(index, "emphasis", event.target.value)}
                    placeholder="Optional callout shown when coverage is on track"
                  />
                </div>
              </div>
            ))}
            {drafts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No operational minimums available yet. Add definitions in configuration to manage them here.
              </p>
            ) : null}
          </div>
        </ScrollArea>

        <SheetFooter className="border-t border-border/70 px-6 py-4">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={!isDirty || isSaving}
            >
              Reset changes
            </Button>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isDirty || isSaving}
              >
                {isSaving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
