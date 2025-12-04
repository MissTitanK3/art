"use client";
import { useMemo } from "react";
import { Badge } from "@workspace/ui/primitives/badge";
import { Button } from "@workspace/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import {
  formatDurationLabel,
  formatNextSessionLabel,
  modalityLabels,
  instructorTypeLabels,
} from "./utils";
import type { AcademyTrainingClass } from "@workspace/store/types/academy.ts";
type ActiveClassesSectionProps = {
  classes: AcademyTrainingClass[];
  onScheduleClass?: (classId: string) => void;
};
const classStatusConfig: Record<
  AcademyTrainingClass["status"],
  {
    label: string;
    badge: React.ComponentProps<typeof Badge>["variant"];
  }
> = {
  draft: { label: "Draft", badge: "outline" },
  needs_instructor: { label: "Needs Instructor", badge: "warning" },
  scheduled: { label: "Scheduled", badge: "info" },
  completed: { label: "Completed", badge: "success" },
};
const classStatusOrder: Record<AcademyTrainingClass["status"], number> = {
  needs_instructor: 0,
  draft: 1,
  scheduled: 2,
  completed: 3,
};
export function ActiveClassesSection({
  classes,
  onScheduleClass,
}: ActiveClassesSectionProps) {
  const handleScheduleClass = onScheduleClass ?? (() => {});
  const activeClasses = useMemo(() => {
    const filtered = classes.filter(
      (trainingClass) => trainingClass.status !== "completed",
    );
    return filtered.sort((a, b) => {
      const statusDiff =
        classStatusOrder[a.status] - classStatusOrder[b.status];
      if (statusDiff !== 0) {
        return statusDiff;
      }
      const aTime = a.nextSession
        ? new Date(a.nextSession).getTime()
        : Number.POSITIVE_INFINITY;
      const bTime = b.nextSession
        ? new Date(b.nextSession).getTime()
        : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });
  }, [classes]);
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Active Classes</h2>
          <p className="text-sm text-muted-foreground">
            Cohorts currently being drafted, staffed, or scheduled.
          </p>
        </div>
        <Badge variant="outline">{activeClasses.length} active</Badge>
      </div>

      {activeClasses.length === 0 ? (
        <Card className="border border-dashed border-border/60 shadow-none">
          <CardContent className="py-6 text-sm text-muted-foreground">
            No active classes yet. Use the qualification pathways below to
            launch a new cohort.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {activeClasses.map((trainingClass) => {
            const statusDisplay = classStatusConfig[trainingClass.status];
            const nextSessionLabel = formatNextSessionLabel(
              trainingClass.nextSession,
            );
            const sessionsLabel =
              trainingClass.sessionsScheduled === 1
                ? "1 session scheduled"
                : `${trainingClass.sessionsScheduled} sessions scheduled`;
            return (
              <Card
                key={trainingClass.id}
                className="flex flex-col border border-border/70 shadow-none"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold">
                        {trainingClass.title}
                      </CardTitle>
                      <CardDescription>
                        {trainingClass.description}
                      </CardDescription>
                    </div>
                    <Badge variant={statusDisplay.badge}>
                      {statusDisplay.label}
                    </Badge>
                  </div>
                  <p className="text-xs uppercase text-muted-foreground">
                    {trainingClass.track}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase text-muted-foreground">
                    <span>{modalityLabels[trainingClass.modality]}</span>
                    <span>•</span>
                    <span>
                      {instructorTypeLabels[trainingClass.instructorType]}
                    </span>
                    <span>•</span>
                    <span>
                      {formatDurationLabel(trainingClass.durationHours)}
                    </span>
                    <span>•</span>
                    <span>{sessionsLabel}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">
                      Next session
                    </p>
                    <p className="text-sm font-medium">
                      {nextSessionLabel ?? "Not scheduled"}
                    </p>
                  </div>
                  <div className="mt-auto flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleScheduleClass(trainingClass.id)}
                    >
                      Manage class
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
