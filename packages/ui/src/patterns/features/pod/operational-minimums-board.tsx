"use client";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@workspace/ui/primitives/badge";
import { Button } from "@workspace/ui/primitives/button";
import { cn } from "@workspace/ui/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/primitives/collapsible";
import { OperationalMinimumCard } from "@workspace/ui/patterns/features/pod/operational-minimum-card";
import { ReadinessChecklistItem } from "@workspace/ui/patterns/features/pod/readiness-checklist-item";
import type {
  RegionOperationalMinimumSnapshot,
  RegionReadinessChecklistItem,
} from "@workspace/store/types/academy-readiness.ts";
type OperationalMinimumsBoardProps = {
  minimums: RegionOperationalMinimumSnapshot[];
  checklist: RegionReadinessChecklistItem[];
  onManageMinimums?: () => void;
};
export function OperationalMinimumsBoard({
  minimums,
  checklist,
  onManageMinimums,
}: OperationalMinimumsBoardProps) {
  const hasMinimums = Array.isArray(minimums) && minimums.length > 0;
  const hasChecklist = Array.isArray(checklist) && checklist.length > 0;
  const allMinimumsMet = hasMinimums
    ? minimums.every((item) => item.coverageStatus === "met")
    : true;
  const [minimumsOpen, setMinimumsOpen] = useState(() => !allMinimumsMet);
  useEffect(() => {
    if (!allMinimumsMet) {
      setMinimumsOpen(true);
    }
  }, [allMinimumsMet]);
  if (!hasMinimums && !hasChecklist) {
    return null;
  }
  return (
    <section className="rounded-2xl border bg-card/40 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border/70 p-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Minimum Operational Coverage
            </p>
            <h2 className="text-2xl font-semibold">
              Region Operational Minimums
            </h2>
            <p className="text-sm text-muted-foreground">
              Checklist auto-derived from roster certifications, live sessions,
              and staffing requirements. Use this to see which competencies need
              classes next.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-end">
            <div className="flex gap-2 text-right text-xs text-muted-foreground flex-col lg:flex-row sm:text-left">
              <div className="flex flex-col items-center gap-2 text-center sm:justify-end">
                <Badge variant="success">Met</Badge>
                <span>Ready coverage on target</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center sm:justify-end">
                <Badge variant="warning">At Risk</Badge>
                <span>Requires attention soon</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center sm:justify-end">
                <Badge variant="destructive">Critical</Badge>
                <span>Blocking operations</span>
              </div>
              {typeof onManageMinimums === "function" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onManageMinimums}
                  className="self-start sm:self-auto"
                >
                  Manage Minimums
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {hasChecklist ? (
        <div
          className={cn(
            "p-6",
            hasMinimums ? "border-b border-border/70" : undefined,
          )}
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Readiness Checklist
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {checklist.map((item) => {
              return <ReadinessChecklistItem key={item.id} item={item} />;
            })}
          </div>
        </div>
      ) : null}

      {hasMinimums ? (
        <Collapsible open={minimumsOpen} onOpenChange={setMinimumsOpen}>
          <div className="md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1 p-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Operational Coverage Details
                </h3>
                <p className="text-xs text-muted-foreground">
                  View ready, training, and expiring counts for each competency.
                  The data is pulled from the Pods roster.
                </p>
              </div>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="inline-flex items-center gap-2 self-start text-xs sm:self-auto"
                >
                  {minimumsOpen ? "Hide details" : "Show details"}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      minimumsOpen ? "rotate-180" : "rotate-0",
                    )}
                    aria-hidden
                  />
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 m-auto lg:grid-cols-3">
                {minimums.map((minimum) => (
                  <OperationalMinimumCard
                    key={minimum.key}
                    snapshot={minimum}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ) : null}
    </section>
  );
}
