import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Badge } from "@workspace/ui/primitives/badge";
import { cn, humanize } from "@workspace/ui/lib/utils";
import { ChevronRight } from "lucide-react";
import type { RegionOperationalMinimumSnapshot } from "@workspace/store/types/academy-readiness.ts";

import { formatStaffingRange } from "./helpers.ts";

export const OPERATIONAL_STATUS_LABEL: Record<
  RegionOperationalMinimumSnapshot["coverageStatus"],
  string
> = {
  met: "Met",
  at_risk: "At Risk",
  critical: "Critical",
};

export const OPERATIONAL_STATUS_VARIANT: Record<
  RegionOperationalMinimumSnapshot["coverageStatus"],
  React.ComponentProps<typeof Badge>["variant"]
> = {
  met: "success",
  at_risk: "warning",
  critical: "destructive",
};

type OperationalMinimumCardProps = {
  snapshot: RegionOperationalMinimumSnapshot;
  className?: string;
};

export function OperationalMinimumCard({
  snapshot,
  className,
}: OperationalMinimumCardProps) {
  const staffingRange = formatStaffingRange(snapshot.staffingRange);
  const fallbackCoverage = snapshot.supportingMembers
    .map((member) => member.name || "Unknown")
    .slice(0, 3)
    .join(", ");
  const coverageLabel =
    snapshot.coverageSummary && snapshot.coverageSummary.trim().length > 0
      ? snapshot.coverageSummary
      : fallbackCoverage;
  const pipelineNames = Array.from(
    new Set(
      (snapshot.pipelineMembers ?? [])
        .map((member) => member.name?.trim())
        .filter((name): name is string => Boolean(name && name.length > 0))
    )
  );
  const pipelineLabel = pipelineNames.join(", ");
  const expiringLabel =
    snapshot.expiringSoonMembers && snapshot.expiringSoonMembers.length > 0
      ? snapshot.expiringSoonMembers
          .map((member) => member.name || "Unknown")
          .slice(0, 3)
          .join(", ")
      : "";

  return (
    <Card
      className={cn(
        "w-full max-w-[290px] border-border/70 shadow-none transition-colors sm:max-w-[400px]",
        snapshot.coverageStatus === "critical"
          ? "border-destructive/60"
          : snapshot.coverageStatus === "at_risk"
            ? "border-amber-500/50"
            : "hover:border-primary/40",
        className
      )}
    >
      <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">
            {snapshot.label}
          </CardTitle>
          <CardDescription>
            {snapshot.description ?? "No description available."}
          </CardDescription>
        </div>
        <Badge variant={OPERATIONAL_STATUS_VARIANT[snapshot.coverageStatus]}>
          {OPERATIONAL_STATUS_LABEL[snapshot.coverageStatus]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Ready</p>
            <p className="text-2xl font-semibold text-foreground">
              {snapshot.activeCount}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">In Training</p>
            <p className="text-2xl font-semibold text-foreground">
              {snapshot.inProgressCount}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Expired</p>
            <p className="text-2xl font-semibold text-foreground">
              {snapshot.expiredCount}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-3 py-1">
            <span className="font-medium text-foreground">
              Need at least {snapshot.requiredCount} ready
            </span>
            {staffingRange ? (
              <>
                <ChevronRight
                  className="h-3 w-3 text-muted-foreground"
                  aria-hidden
                />
                <span>Target {staffingRange} staffed</span>
              </>
            ) : null}
          </span>
          {coverageLabel ? (
            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">
              Coverage: {coverageLabel}
            </span>
          ) : null}
          {pipelineLabel ? (
            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">
              Pipeline: {pipelineLabel}
            </span>
          ) : null}
          {expiringLabel ? (
            <span className="rounded-full border border-amber-500/60 bg-amber-500/10 px-3 py-1 text-amber-600 dark:text-amber-300">
              Expiring Soon: {expiringLabel}
            </span>
          ) : null}
        </div>

        {snapshot.requiredCourses.length > 0 ? (
          <div className="flex w-full max-w-[290px] flex-wrap gap-2 pr-3 sm:max-w-[400px] sm:pr-4">
            {snapshot.requiredCourses.map((course) => (
              <Badge
                key={course}
                variant="outline"
                className="max-w-full break-words whitespace-normal"
              >
                {humanize(course)}
              </Badge>
            ))}
          </div>
        ) : null}

        {snapshot.gaps.length > 0 ? (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {snapshot.gaps.map((gap, index) => (
              <li key={`${snapshot.key}-gap-${index}`} className="leading-snug">
                • {gap}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {snapshot.emphasis ?? "Staffing level meets minimum coverage."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
