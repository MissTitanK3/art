"use client";
import { useCallback, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@workspace/ui/primitives/card";
import { Badge } from "@workspace/ui/primitives/badge";
import { Button } from "@workspace/ui/primitives/button";
import { ChevronDown, Radio } from "lucide-react";
import type {
  NormalizedCertification,
  RosterEntry,
} from "@workspace/store/types/pod.ts";
import { RemoveMemberButton } from "@workspace/ui/patterns/features/buttons/remove-member-button";
import { cn, humanize } from "@workspace/ui/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/primitives/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/primitives/collapsible";
import { ScrollArea } from "@workspace/ui/primitives/scroll-area";
import { toast } from "sonner";
import { computeCoverageAreaStatuses } from "@workspace/ui/lib/operational-coverage.ts";
import type { OperationalCoverageAreaStatus } from "@workspace/ui/lib/operational-coverage.ts";
import { useCourseLabelLookup } from "@workspace/ui/hooks/use-course-label-lookup";
import {
  type RosterEditorSection,
  ROSTER_EDITOR_SECTION_META,
} from "./types.ts";
type Props = {
  rows: RosterEntry[];
  podName: string;
  onRemoveMember: (memberId: string) => void;
  onEdit?: (id: string, section: RosterEditorSection) => void;
};
const CARD_SECTION_ACTIONS: Array<{
  key: RosterEditorSection;
  label: string;
}> = [
  { key: "details", label: ROSTER_EDITOR_SECTION_META.details.title },
  { key: "coverage", label: ROSTER_EDITOR_SECTION_META.coverage.title },
  { key: "languages", label: ROSTER_EDITOR_SECTION_META.languages.title },
  { key: "pathways", label: ROSTER_EDITOR_SECTION_META.pathways.title },
];
const CERT_PREVIEW_LIMIT = 8;
export function RosterCardList({
  rows,
  podName,
  onRemoveMember,
  onEdit,
}: Props) {
  const { getCourseLabel } = useCourseLabelLookup();
  const resolveCourseLabel = useCallback(
    (courseId: string) => getCourseLabel(courseId),
    [getCourseLabel],
  );
  const [expandedCertRows, setExpandedCertRows] = useState<
    Record<string, boolean>
  >({});
  const handleCertificationToggle = useCallback(
    (memberId: string, open: boolean) => {
      setExpandedCertRows((prev) => ({ ...prev, [memberId]: open }));
    },
    [],
  );
  return (
    <div className="grid gap-4 mt-3">
      {rows.map((r) => {
        // Treat as Registered when roster entry links to a profile row
        const registered = Boolean(
          r.profile_id && String(r.profile_id).trim().length > 0,
        );
        const coverageStatuses = computeCoverageAreaStatuses(r.certs ?? []);
        const engagedAreas = coverageStatuses.filter(
          (entry) => entry.status !== "missing",
        );
        const joinedAtDate = toDate(r.joinedAt);
        const joinedAt = formatDate(joinedAtDate ?? undefined);
        const joinedAtRelative = joinedAtDate
          ? formatRelativeTimeFromNow(joinedAtDate)
          : null;
        const lastShiftDate = toDate(r.lastShiftAt);
        const lastShift = formatDate(lastShiftDate ?? undefined, true);
        const lastShiftRelative = lastShiftDate
          ? formatRelativeTimeFromNow(lastShiftDate)
          : null;
        const languages = Array.isArray(r.langs) ? r.langs : [];
        const languagesCount = languages.length;
        const languagePreview = languages
          .slice(0, 2)
          .map((lang) => lang.display_name)
          .join(", ");
        const languagesHelper = languagesCount
          ? `${languagePreview}${languagesCount > 2 ? ` +${languagesCount - 2}` : ""}`
          : "No languages listed yet.";
        const skills = Array.isArray(r.skills)
          ? r.skills.filter(
              (skill) => typeof skill === "string" && skill.trim().length > 0,
            )
          : [];
        const visibleSkills = skills.slice(0, 6);
        const extraSkills = skills.slice(visibleSkills.length);
        const certs = Array.isArray(r.certs) ? r.certs : [];
        const certSummary = summarizeCertifications(certs);
        const certSummaryHelper = certSummary.total
          ? formatCertificationSummary(certSummary)
          : "Track interest through coverage buttons.";
        const certPreview = certs.slice(0, CERT_PREVIEW_LIMIT);
        const certOverflow = Math.max(
          certSummary.total - certPreview.length,
          0,
        );
        const showCertCollapsible = certOverflow > 0;
        const isCertExpanded = showCertCollapsible
          ? Boolean(expandedCertRows[r.id])
          : false;
        const extraCerts = showCertCollapsible
          ? certs.slice(CERT_PREVIEW_LIMIT)
          : [];
        const certificationHelperLabel = showCertCollapsible
          ? isCertExpanded
            ? `Showing all ${certSummary.total}`
            : `Showing first ${certPreview.length} of ${certSummary.total}`
          : null;
        const renderCertificationBadge = (cert: NormalizedCertification) => {
          const level = cert.level ?? "incomplete";
          const variant = certificationVariant(level);
          return (
            <Badge
              key={`${r.id}-cert-${cert.id}`}
              variant={variant}
              className="flex items-center gap-1 whitespace-normal px-2 py-1"
            >
              <span>{cert.display_name}</span>
              <span className="text-[11px] uppercase tracking-wide opacity-80">
                {humanize(level)}
              </span>
            </Badge>
          );
        };
        return (
          <Card
            key={r.id}
            className="flex flex-col border border-border/70 shadow-sm"
          >
            <CardHeader className="space-y-3 border-b border-border/60">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  {r.profile?.display_name ? (
                    <p className="text-base">{r.profile.display_name}</p>
                  ) : null}
                  <CardTitle className="text-xs text-muted-foreground font-semibold">
                    {r.handle}
                  </CardTitle>
                </div>
                {r.signal_handle && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                        onClick={async () => {
                          await navigator.clipboard.writeText(r.signal_handle!);
                          toast.success("Signal handle copied to clipboard ✅");
                        }}
                      >
                        <Radio className="h-4 w-4" />
                        {r.signal_handle}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Click to copy</TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={registered ? "default" : "outline"}
                  className={cn(
                    registered
                      ? "bg-emerald-500/15 text-emerald-800"
                      : "text-muted-foreground",
                  )}
                >
                  {registered ? "Registered" : "Manual Entry"}
                </Badge>
                <Badge variant="secondary">{humanize(r.role)}</Badge>
                <Badge
                  variant={
                    r.status === "active"
                      ? "default"
                      : r.status === "suspended"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {humanize(r.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-6 text-sm">
              <section className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Operational coverage
                </p>
                {engagedAreas.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {engagedAreas.map((entry) => (
                      <CoverageBadge
                        key={entry.area.key}
                        entry={entry}
                        resolveCourseLabel={resolveCourseLabel}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No coverage interests tagged yet.
                  </p>
                )}
              </section>

              <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoTile
                  label="Joined roster"
                  value={joinedAt ?? "—"}
                  helper={joinedAtRelative ?? "Awaiting onboarding date."}
                />
                <InfoTile
                  label="Last shift"
                  value={lastShift ?? "Not recorded"}
                  helper={lastShiftRelative ?? "No shifts recorded yet."}
                />
                <InfoTile
                  label="Languages"
                  value={
                    languagesCount
                      ? `${languagesCount} ${languagesCount === 1 ? "language" : "languages"}`
                      : "—"
                  }
                  helper={languagesHelper}
                />
                <InfoTile
                  label="Certifications"
                  value={
                    certSummary.total
                      ? `${certSummary.total} ${certSummary.total === 1 ? "cert" : "certs"}`
                      : "—"
                  }
                  helper={certSummaryHelper}
                />
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Languages
                  </p>
                  {languagesCount ? (
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lang) => (
                        <Badge
                          key={`${r.id}-lang-${lang.tag}`}
                          variant="outline"
                          className="flex items-center gap-1 whitespace-normal px-2 py-1"
                        >
                          <span>{lang.display_name}</span>
                          {lang.proficiency ? (
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              {humanize(lang.proficiency)}
                            </span>
                          ) : null}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No languages listed yet.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Skills</p>
                  {visibleSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {visibleSkills.map((skill) => (
                        <Badge
                          key={`${r.id}-skill-${skill}`}
                          variant="outline"
                          className="px-2 py-1"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {extraSkills.length > 0 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="px-2 py-1 text-xs"
                            >
                              +{extraSkills.length} more
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              {extraSkills.map((skill) => (
                                <li key={`${r.id}-skill-extra-${skill}`}>
                                  {skill}
                                </li>
                              ))}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No skills recorded.
                    </p>
                  )}
                </div>
              </section>

              <section className="space-y-3">
                {certSummary.total > 0 ? (
                  showCertCollapsible ? (
                    <Collapsible
                      open={isCertExpanded}
                      onOpenChange={(open) =>
                        handleCertificationToggle(r.id, open)
                      }
                      className="space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          Certifications
                        </p>
                        <div className="flex items-center gap-2">
                          {certificationHelperLabel ? (
                            <span className="text-xs text-muted-foreground">
                              {certificationHelperLabel}
                            </span>
                          ) : null}
                          <CollapsibleTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                            >
                              {isCertExpanded ? "Show less" : "Show all"}
                              <ChevronDown
                                className={cn(
                                  "ml-1 h-3 w-3 transition-transform",
                                  isCertExpanded ? "rotate-180" : "rotate-0",
                                )}
                              />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {certPreview.map(renderCertificationBadge)}
                      </div>
                      <CollapsibleContent>
                        <div className="rounded-md border border-border/60 bg-muted/30 p-2">
                          <ScrollArea className="max-h-48 pr-2">
                            <div className="flex flex-wrap gap-2 pb-1">
                              {extraCerts.map(renderCertificationBadge)}
                            </div>
                          </ScrollArea>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          Certifications
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {certs.map(renderCertificationBadge)}
                      </div>
                    </>
                  )
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Certifications
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      No certifications tracked yet.
                    </p>
                  </>
                )}
              </section>

              {r.notes ? (
                <section className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Notes</p>
                  <p className="text-sm italic text-muted-foreground">
                    “{r.notes}”
                  </p>
                </section>
              ) : null}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 pt-3">
              {onEdit ? (
                <div className="flex flex-wrap gap-2">
                  {CARD_SECTION_ACTIONS.map(({ key, label }) => (
                    <Button
                      key={key}
                      size="sm"
                      variant="outline"
                      className="flex-1 min-w-[160px] justify-center"
                      onClick={() => onEdit(r.id, key)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              ) : null}
              <div className="flex w-full justify-end">
                <RemoveMemberButton
                  podName={podName}
                  member={r}
                  onRemoveMember={() => onRemoveMember(r.id)}
                />
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
function InfoTile({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/40 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
      {helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}
type CertificationSummary = {
  total: number;
  completed: number;
  inProgress: number;
  expired: number;
  mentor: number;
  incomplete: number;
};
function summarizeCertifications(
  certs: NormalizedCertification[],
): CertificationSummary {
  const summary: CertificationSummary = {
    total: certs.length,
    completed: 0,
    inProgress: 0,
    expired: 0,
    mentor: 0,
    incomplete: 0,
  };
  for (const cert of certs) {
    const level = (cert.level ?? "incomplete").toLowerCase();
    switch (level) {
      case "completed":
        summary.completed += 1;
        break;
      case "mentor":
        summary.mentor += 1;
        break;
      case "in_progress":
        summary.inProgress += 1;
        break;
      case "expired":
        summary.expired += 1;
        break;
      default:
        summary.incomplete += 1;
        break;
    }
  }
  return summary;
}
function formatCertificationSummary(summary: CertificationSummary): string {
  const parts: string[] = [];
  if (summary.completed) {
    parts.push(`${summary.completed} completed`);
  }
  if (summary.inProgress) {
    parts.push(`${summary.inProgress} in progress`);
  }
  if (summary.expired) {
    parts.push(`${summary.expired} expired`);
  }
  if (summary.mentor) {
    parts.push(`${summary.mentor} mentor`);
  }
  if (summary.incomplete && parts.length === 0) {
    parts.push("Starting certifications");
  }
  return parts.length > 0
    ? parts.join(" • ")
    : "No certifications tracked yet.";
}
function toDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}
function formatRelativeTimeFromNow(date: Date): string | null {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const divisions: Array<{
    amount: number;
    unit: Intl.RelativeTimeFormatUnit;
  }> = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Infinity, unit: "year" },
  ];
  let duration = (date.getTime() - Date.now()) / 1000;
  let unit: Intl.RelativeTimeFormatUnit = "second";
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      unit = division.unit;
      break;
    }
    duration /= division.amount;
  }
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  return rtf.format(Math.round(duration), unit);
}
function certificationVariant(level: string) {
  const normalized = level.toLowerCase();
  if (normalized === "completed" || normalized === "mentor") {
    return "success" as const;
  }
  if (normalized === "in_progress") {
    return "info" as const;
  }
  if (normalized === "expired") {
    return "destructive" as const;
  }
  return "secondary" as const;
}
function formatDate(
  value?: string | Date | null,
  includeTime = false,
): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  });
  return formatter.format(date);
}
function CoverageBadge({
  entry,
  resolveCourseLabel,
}: {
  entry: OperationalCoverageAreaStatus;
  resolveCourseLabel: (courseId: string) => string;
}) {
  const { area, status, missingCourses } = entry;
  const variant =
    status === "ready"
      ? "success"
      : missingCourses.length > 0
        ? "warning"
        : "info";
  const helperLabel =
    status === "ready"
      ? "Ready"
      : missingCourses.length > 0
        ? `${missingCourses.length} course${missingCourses.length === 1 ? "" : "s"} missing`
        : "In progress";
  const courseList = area.requiredCourses.map((courseId) => ({
    id: courseId,
    label: resolveCourseLabel(courseId),
  }));
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={variant}
          className="flex max-w-full flex-col items-start gap-0.5 whitespace-normal px-2 py-1 text-left"
        >
          <span className="text-xs font-semibold leading-tight">
            {area.label}
          </span>
          <span className="text-[11px] uppercase tracking-wide leading-tight opacity-80">
            {helperLabel}
          </span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs bg-card text-card-foreground">
        <p className="font-medium text-foreground">Courses</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          {courseList.map((course) => (
            <li key={course.id}>{course.label}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
