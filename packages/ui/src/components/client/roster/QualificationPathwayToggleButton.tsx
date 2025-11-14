import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import type {
  QualificationPathway,
  QualificationPathwayStatus,
} from "@workspace/ui/lib/qualification-pathways.ts";

type QualificationPathwayToggleButtonProps = {
  pathway: QualificationPathway;
  status?: QualificationPathwayStatus;
  onToggle: (key: string) => void;
};

export function QualificationPathwayToggleButton({
  pathway,
  status,
  onToggle,
}: QualificationPathwayToggleButtonProps) {
  const currentStatus = status?.status ?? "missing";
  const missingCount = status?.missingCourses.length ?? pathway.courseSlugs.length;
  const inProgressCount = status?.inProgressCourses.length ?? 0;
  const completedCount = status?.completedCourses.length ?? 0;
  const isComplete = currentStatus === "ready";
  const hasEnrollment = currentStatus === "interested" || isComplete;

  const statusLabel =
    currentStatus === "ready"
      ? "Ready"
      : currentStatus === "interested"
        ? "In Progress"
        : "Not Enrolled";

  const statusBadgeClass =
    currentStatus === "ready"
      ? "border-emerald-400 bg-emerald-900 text-emerald-50"
      : currentStatus === "interested"
        ? "border-indigo-400 bg-indigo-900 text-indigo-50"
        : "border-slate-600 bg-slate-950 text-slate-200";

  const progressSummary: string[] = [];
  if (completedCount > 0) {
    progressSummary.push(`${completedCount} complete`);
  }
  if (inProgressCount > 0) {
    progressSummary.push(
      `${inProgressCount} in progress`,
    );
  }
  if (!isComplete && missingCount > 0) {
    progressSummary.push(
      `${missingCount} missing`,
    );
  }

  const helper =
    progressSummary.length > 0
      ? progressSummary.join(" • ")
      : pathway.courseSlugs.length > 0
        ? `${pathway.courseSlugs.length} course${pathway.courseSlugs.length === 1 ? "" : "s"}`
        : "No courses configured";

  const helperTextClass =
    currentStatus === "ready"
      ? "text-emerald-100/90"
      : currentStatus === "interested"
        ? "text-indigo-100/90"
        : "text-slate-300";

  const buttonToneClasses =
    currentStatus === "ready"
      ? "border-emerald-700 bg-emerald-950 text-emerald-50 hover:bg-emerald-900"
      : currentStatus === "interested"
        ? "border-indigo-700 bg-indigo-950 text-indigo-50 hover:bg-indigo-900"
        : "border-slate-800 bg-slate-950 text-slate-100 hover:bg-slate-900";

  return (
    <button
      type="button"
      className={cn(
        "flex w-full flex-col gap-2 rounded-md border p-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-80",
        buttonToneClasses,
      )}
      aria-pressed={hasEnrollment || isComplete}
      onClick={() => onToggle(pathway.key)}
      disabled={isComplete}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-foreground">
          {pathway.label}
        </span>
        <Badge variant="outline" className={cn("text-xs", statusBadgeClass)}>
          {statusLabel}
        </Badge>
      </div>
      <div className={cn("flex flex-wrap gap-2 text-xs", helperTextClass)}>
        <span>{helper}</span>
        {pathway.courseSlugs.length > 0 ? (
          <span className={cn("opacity-90", helperTextClass)}>
            {pathway.courseSlugs.length} required
          </span>
        ) : null}
      </div>
    </button>
  );
}
