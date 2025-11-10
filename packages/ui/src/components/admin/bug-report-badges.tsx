import * as React from "react";
import { Badge } from "@workspace/ui/components/badge";
import type { BugPriority } from "@workspace/ui/components/admin/bug-report-selects";

type PriorityBadgeProps = {
  priority: BugPriority;
};

export function BugPriorityBadge({ priority }: PriorityBadgeProps) {
  if (!priority) return <span className="text-muted-foreground">-</span>;
  if (priority === "critical")
    return <Badge variant="destructive">Critical</Badge>;
  if (priority === "high")
    return (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
        High
      </Badge>
    );
  if (priority === "medium")
    return (
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
        Medium
      </Badge>
    );
  return (
    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
      Low
    </Badge>
  );
}
