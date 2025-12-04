import { Badge } from "@workspace/ui/primitives/badge";
import { cn } from "@workspace/ui/lib/utils";
import type { RegionReadinessChecklistItem } from "@workspace/store/types/academy-readiness.ts";
import {
  AlertTriangle,
  CheckCircle2,
  OctagonX,
  type LucideIcon,
} from "lucide-react";

const CHECKLIST_ICON: Record<
  RegionReadinessChecklistItem["status"],
  LucideIcon
> = {
  met: CheckCircle2,
  at_risk: AlertTriangle,
  critical: OctagonX,
};

const CHECKLIST_BADGE_VARIANT: Record<
  RegionReadinessChecklistItem["status"],
  React.ComponentProps<typeof Badge>["variant"]
> = {
  met: "success",
  at_risk: "warning",
  critical: "destructive",
};

type ReadinessChecklistItemProps = {
  item: RegionReadinessChecklistItem;
};

export function ReadinessChecklistItem({ item }: ReadinessChecklistItemProps) {
  const Icon = CHECKLIST_ICON[item.status];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-background/50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-5">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-full border w-10 h-10 shrink-0",
            item.status === "critical"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : item.status === "at_risk"
                ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
          )}
        >
          <Icon size={22} strokeWidth={2.2} className="shrink-0" aria-hidden />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{item.label}</p>
          {item.helper ? (
            <p className="text-xs text-muted-foreground">{item.helper}</p>
          ) : null}
        </div>
      </div>
      <div className="flex w-full justify-center sm:w-auto sm:justify-end">
        <Badge
          variant={CHECKLIST_BADGE_VARIANT[item.status]}
          className="w-full justify-center text-xs sm:w-auto sm:text-sm"
        >
          {item.status === "met"
            ? "Good"
            : item.status === "at_risk"
              ? "Needs Attention"
              : "Action Required"}
        </Badge>
      </div>
    </div>
  );
}
