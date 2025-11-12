"use client";

import * as React from "react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  TrackBadge,
  type TrackVariant,
} from "@workspace/ui/components/academy/TrackBadge";
import { useProfileStore } from "@workspace/store/useProfileStore";
import { canManageInstructorsFromRoles } from "@workspace/ui/lib/permissions";
import type { AcademyCourseGroup } from "@workspace/store/types/academy.ts";

type QualificationPathwaysSectionProps = {
  courseGroups: AcademyCourseGroup[];
  onCreatePathwayClass?: (pathwayId: string) => void;
};

export function QualificationPathwaysSection({
  courseGroups,
  onCreatePathwayClass,
}: QualificationPathwaysSectionProps) {
  const profileFromStore = useProfileStore((s) => s.profile);
  const profileRoles = React.useMemo(
    () => (profileFromStore?.access_role ? [String(profileFromStore.access_role)] : []),
    [profileFromStore?.access_role],
  );
  const effectiveCanManage = React.useMemo(
    () => canManageInstructorsFromRoles(profileRoles),
    [profileRoles],
  );

  const handleCreatePathwayClass = React.useCallback(
    (pathwayId: string) => {
      if (!effectiveCanManage) return;
      (onCreatePathwayClass ?? (() => { }))(pathwayId);
    },
    [effectiveCanManage, onCreatePathwayClass],
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Qualification Pathways</h2>
        <Badge variant="outline">Live curriculum</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {courseGroups.map((group) => (
          <Card
            key={group.id}
            className="flex flex-col border border-border/70 shadow-none h-[900px]"
          >
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {group.label}
                    </CardTitle>
                    {group.trackLabel ? (
                      <CardDescription className="text-sm text-muted-foreground">
                        {group.trackLabel}
                      </CardDescription>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="shrink-0"
                    variant="outline"
                    onClick={() => handleCreatePathwayClass(group.id)}
                  >
                    Create class
                  </Button>
                </div>
                {group.variant ? (
                  <TrackBadge variant={group.variant as TrackVariant} />
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ScrollArea className="max-h-[730px] h-11/12 w-full rounded-md border border-border/60">
                <ul className="space-y-3 pr-3">
                  {group.courses.map((course) => (
                    <li key={course.slug}>
                      <div className="flex items-start gap-3 rounded-lg border border-dashed border-border/60 p-3">
                        <span className="shrink-0 text-xl">
                          {course.icon ?? "📘"}
                        </span>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium leading-tight">
                              {course.title}
                            </p>
                            <Badge
                              variant={
                                course.status === "completed"
                                  ? "default"
                                  : course.status === "in_progress"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {course.status.replaceAll("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] uppercase text-muted-foreground">
                            <span>
                              {course.type === "certified"
                                ? "Certification"
                                : "Qualification"}
                            </span>
                            {typeof course.version !== "undefined" ? (
                              <>
                                <span>•</span>
                                <span>
                                  v{Number(course.version).toFixed(1)}
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
