"use client";

import * as React from "react";

import { TrackBadge } from "@workspace/ui/patterns/features/academy/track-badge";
import { Button } from "@workspace/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Input } from "@workspace/ui/primitives/input";
import { Label } from "@workspace/ui/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Textarea } from "@workspace/ui/primitives/textarea";

import type { AcademyClass } from "@workspace/store/usePodStore";
import type { CourseBlueprint } from "@workspace/ui/data/academy/course-blueprint";
import { useProfileStore } from "@workspace/store/useProfileStore";
import { useUnifiedAccess } from "@workspace/store/utils/permissions/useUnifiedAccess";
import { NavRole } from "@workspace/store/utils/permissions/types";

type CreatePathwayClassContentProps = {
  pathway: CourseBlueprint;
  onCreateClass: (academyClass: AcademyClass) => Promise<void> | void;
  onBackToAcademy: () => void;
  onCancel?: () => void;
};

function generateClassId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `cls_${Math.random().toString(36).slice(2, 10)}`;
}

export function CreatePathwayClassContent({
  pathway,
  onCreateClass,
  onBackToAcademy,
  onCancel,
}: CreatePathwayClassContentProps) {
  const profileFromStore = useProfileStore((s) => s.profile);
  const profileRoles = React.useMemo(
    () =>
      profileFromStore?.access_role
        ? [String(profileFromStore.access_role)]
        : [],
    [profileFromStore?.access_role]
  );
  const ctx = React.useMemo(
    () => ({ navRole: profileRoles[0] as NavRole }),
    [profileRoles]
  );
  const { access: effectiveCanManage } = useUnifiedAccess(
    "manage_instructors",
    ctx
  );
  const defaultCourse = pathway.courses[0];
  const [submitting, setSubmitting] = React.useState(false);

  const totalTrackHours = React.useMemo(() => {
    const total = pathway.courses.reduce(
      (sum, course) => sum + (course.durationHours ?? 0),
      0
    );
    if (total > 0) {
      return Number.parseFloat(total.toFixed(1));
    }
    if (defaultCourse?.durationHours) {
      return defaultCourse.durationHours;
    }
    return 1;
  }, [defaultCourse?.durationHours, pathway.courses]);

  const [title, setTitle] = React.useState<string>(() =>
    defaultCourse ? `${pathway.label} · Cohort` : `${pathway.label} Class`
  );
  const [capacity, setCapacity] = React.useState<string>("18");
  const [modality, setModality] = React.useState<
    "in_person" | "online" | "hybrid"
  >(defaultCourse?.modality ?? "online");
  const [instructorType, setInstructorType] = React.useState<
    "dispatcher" | "mentor" | "expert"
  >(defaultCourse?.instructorType ?? "dispatcher");
  const [notes, setNotes] = React.useState<string>("");

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const classId = generateClassId();
      const parsedCapacity = Number.parseInt(capacity, 10) || 0;
      const description =
        pathway.trackLabel ??
        `Live cohort moving through the ${pathway.label} pathway together.`;

      const academyClass: AcademyClass = {
        id: classId,
        pathwayId: pathway.id,
        pathwayLabel: pathway.label,
        trackLabel: pathway.trackLabel,
        variant: pathway.variant,
        title,
        description,
        modality,
        instructorType,
        durationHours: totalTrackHours,
        capacity: parsedCapacity > 0 ? parsedCapacity : undefined,
        notes: notes || undefined,
        instructorName: undefined,
        members: [],
        sessions: [],
        sessionsScheduled: 0,
        nextSession: undefined,
        status: "needs_instructor",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        setSubmitting(true);
        await onCreateClass(academyClass);
      } finally {
        setSubmitting(false);
      }
    },
    [
      capacity,
      instructorType,
      modality,
      notes,
      onCreateClass,
      pathway.id,
      pathway.label,
      pathway.trackLabel,
      pathway.variant,
      title,
      totalTrackHours,
    ]
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Qualification pathway
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{pathway.label}</h1>
          {pathway.trackLabel ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {pathway.trackLabel}
            </p>
          ) : null}
          {pathway.variant ? (
            <div className="mt-4">
              <TrackBadge variant={pathway.variant} />
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" onClick={onBackToAcademy}>
            Back to Academy
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class details</CardTitle>
          <CardDescription>
            Set up a cohort for ongoing sessions. You can add meeting dates,
            locations, and links later from the cohort workspace.
          </CardDescription>
          <p className="mt-2 text-sm text-muted-foreground">
            {pathway.courses.length} modules · approximately {totalTrackHours}{" "}
            hours of guided practice.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Label htmlFor="class-title">Class title</Label>
            <Input
              id="class-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Level 2 Cohort · April Dispatchers"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="class-capacity">Target cohort size</Label>
                <Input
                  id="class-capacity"
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(event) => setCapacity(event.target.value)}
                  placeholder="18"
                />
              </div>
              <div className="space-y-2">
                <Label>Modality</Label>
                <Select
                  value={modality}
                  onValueChange={(value) =>
                    setModality(value as typeof modality)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in_person">In person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Instructor focus</Label>
                <Select
                  value={instructorType}
                  onValueChange={(value) =>
                    setInstructorType(value as typeof instructorType)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dispatcher">
                      Dispatcher Instructor
                    </SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="expert">Subject Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="class-notes">
                  Notes for mentors & coordinators
                </Label>
                <Textarea
                  id="class-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  placeholder="Outline preparation needs, resource links, and who will coordinate updates."
                />
                <p className="text-xs text-muted-foreground">
                  Use the cohort workspace to schedule individual sessions,
                  assign instructors, and share location details when ready.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onCancel?.()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !effectiveCanManage}
                aria-busy={submitting}
              >
                {submitting ? "Saving…" : "Save cohort"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
