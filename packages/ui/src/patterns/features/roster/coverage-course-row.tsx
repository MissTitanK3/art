import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Badge } from "@workspace/ui/primitives/badge";
import {
  CERTIFICATION_LEVELS,
  certificationLabel,
  cn,
} from "@workspace/ui/lib/utils";
import type {
  CoverageCourseSelection,
  CoverageCourseStatus,
} from "./coverage-types";
import {
  getCourseStatusBadgeClass,
  getCourseStatusLabel,
} from "./course-status";

export type CoverageCourseRowProps = {
  courseId: string;
  label: string;
  value: CoverageCourseSelection;
  status: CoverageCourseStatus;
  onChange: (value: CoverageCourseSelection) => void;
};

export function CoverageCourseRow({
  courseId,
  label,
  value,
  status,
  onChange,
}: CoverageCourseRowProps) {
  const statusLabel = getCourseStatusLabel(status);
  const badgeClassName = getCourseStatusBadgeClass(status);

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border/50 bg-muted/40 p-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <Badge variant="outline" className={cn("text-xs", badgeClassName)}>
            {statusLabel}
          </Badge>
        </div>
      </div>
      <Select
        value={value}
        onValueChange={(next) => onChange(next as CoverageCourseSelection)}
      >
        <SelectTrigger className="w-full text-sm sm:w-48">
          <SelectValue placeholder="Set status" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="unset">Unset (track only)</SelectItem>
          {CERTIFICATION_LEVELS.map((level) => (
            <SelectItem key={`${courseId}-${level}`} value={level}>
              {certificationLabel(level)}
            </SelectItem>
          ))}
          <SelectItem value="remove">Remove from cert list</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
