import { Button } from "@workspace/ui/primitives/button";
import { cn } from "@workspace/ui/lib/utils";
import {
  type OperationalCoverageArea,
  type OperationalCoverageAreaStatus,
} from "@workspace/ui/lib/operational-coverage.ts";

type CoverageAreaToggleButtonProps = {
  area: OperationalCoverageArea;
  status?: OperationalCoverageAreaStatus;
  onToggle: (key: string) => void;
};

export function CoverageAreaToggleButton({
  area,
  status,
  onToggle,
}: CoverageAreaToggleButtonProps) {
  const currentStatus = status?.status ?? "missing";
  const missingCount =
    status?.missingCourses.length ?? area.requiredCourses.length;
  const hasInterest =
    currentStatus === "interested" || currentStatus === "ready";
  const isComplete = currentStatus === "ready";

  let helper =
    area.requiredCourses.length > 0
      ? `Add ${area.requiredCourses.length} course${area.requiredCourses.length === 1 ? "" : "s"}`
      : "Add required courses";
  if (isComplete) {
    helper = "Courses completed";
  } else if (currentStatus === "interested") {
    if (missingCount > 0) {
      helper = `Add ${missingCount} missing course${missingCount === 1 ? "" : "s"}`;
    } else {
      helper = "Interest tagged";
    }
  }

  return (
    <Button
      key={area.key}
      type="button"
      variant={currentStatus === "missing" ? "outline" : "secondary"}
      size="sm"
      className={cn(
        "flex h-auto w-full flex-col items-start gap-1 rounded-md border px-3 py-2 text-left shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40",
        !hasInterest && !isComplete
          ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
          : undefined,
        hasInterest && !isComplete
          ? "border-indigo-700 bg-indigo-900 text-indigo-50 hover:bg-indigo-800"
          : undefined,
        isComplete
          ? "border-emerald-700 bg-emerald-900 text-slate-50 hover:bg-emerald-800"
          : undefined
      )}
      aria-pressed={hasInterest}
      onClick={() => onToggle(area.key)}
      disabled={isComplete}
    >
      <span className="text-sm font-medium">{area.label}</span>
      <span
        className={cn(
          "text-xs",
          !hasInterest && !isComplete ? "text-slate-300" : undefined,
          hasInterest && !isComplete ? "text-indigo-100/80" : undefined,
          isComplete ? "text-emerald-100/80" : undefined
        )}
      >
        {helper}
      </span>
    </Button>
  );
}
