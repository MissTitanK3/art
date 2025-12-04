"use client";
import { useCallback, useMemo, useState } from "react";
import { Callout } from "@workspace/ui/patterns/features/academy/callout";
import { AcademyStatsGrid } from "@workspace/ui/patterns/features/pod/academy-stats-grid";
import { ActiveClassesSection } from "@workspace/ui/patterns/features/pod/active-classes-section";
import { SessionsBoard } from "@workspace/ui/patterns/features/pod/sessions-board";
import { InstructorBench } from "@workspace/ui/patterns/features/pod/instructor-bench";
import { QualificationPathwaysSection } from "@workspace/ui/patterns/features/pod/qualification-pathways-section";
import { OperationalMinimumsBoard } from "@workspace/ui/patterns/features/pod/operational-minimums-board";
import { OperationalMinimumsManagerSheet } from "@workspace/ui/patterns/features/pod/operational-minimums-manager-sheet";
import type {
  AcademyCourseGroup,
  AcademyInstructorProfile,
  AcademyInstructorDraft,
  AcademyMemberProgress,
  AcademySummaryStat,
  AcademyTrainingClass,
  AcademyTrainingSession,
  AcademyTrainingSessionDraft,
} from "@workspace/store/types/academy.ts";
import { useUnifiedAccess } from "@workspace/store/utils/permissions/useUnifiedAccess";
import { NavRole } from "@workspace/store/utils/permissions/types";
import { useProfileStore } from "@workspace/store/useProfileStore";
import type {
  RegionOperationalMinimumSnapshot,
  RegionReadinessChecklistItem,
  RegionOperationalMinimumDefinition,
} from "@workspace/store/types/academy-readiness.ts";
export type {
  AcademySummaryStat,
  AcademyCourseGroup,
  AcademyMemberProgress,
  AcademyInstructorProfile,
  AcademyInstructorDraft,
  AcademyTrainingClass,
  AcademyTrainingSession,
  AcademyTrainingSessionDraft,
  AcademyTrainingSessionParticipant,
  AcademySessionUnderstandingLevel,
  AcademyTrainingSessionStatus,
} from "@workspace/store/types/academy.ts";
export type PodAcademyDashboardLayoutProps = {
  /** Current user's roles. Optional; if omitted, conservative defaults are used. */
  roles?: string[];
  heading?: {
    title: string;
    subtitle?: string;
    cta?: React.ReactNode;
  };
  stats: AcademySummaryStat[];
  courseGroups: AcademyCourseGroup[];
  members: AcademyMemberProgress[];
  instructors: AcademyInstructorProfile[];
  trainingClasses: AcademyTrainingClass[];
  sessions: AcademyTrainingSession[];
  /** Whether current user can manage instructors (admin dispatcher). */
  canManageInstructors?: boolean;
  operationalMinimums?: RegionOperationalMinimumSnapshot[];
  operationalMinimumDefinitions?: RegionOperationalMinimumDefinition[];
  readinessChecklist?: RegionReadinessChecklistItem[];
  onSaveOperationalMinimums?: (
    definitions: RegionOperationalMinimumDefinition[],
  ) => Promise<void> | void;
  isSavingOperationalMinimums?: boolean;
  onScheduleClass?: (classId: string) => void;
  onUpdateSessionStatus?: (
    sessionId: string,
    status: AcademyTrainingSession["status"],
  ) => void;
  onCreateInstructor?: (instructor: AcademyInstructorDraft) => void;
  onUpdateInstructor?: (
    instructorId: string,
    patch: Partial<AcademyInstructorProfile>,
  ) => void;
  onDeleteInstructor?: (instructorId: string) => void;
  onCreatePathwayClass?: (pathwayId: string) => void;
  onCreateTrainingSession?: (session: AcademyTrainingSessionDraft) => void;
  onUpdateTrainingSession?: (
    sessionId: string,
    patch: Partial<AcademyTrainingSession>,
  ) => void;
  onDeleteTrainingSession?: (sessionId: string) => void;
};
export function PodAcademyDashboardLayout({
  roles = [],
  heading = {
    title: "Pod Academy Readiness",
    subtitle:
      "Track how your dispatch pod is progressing through qualifications.",
  },
  stats,
  courseGroups,
  members,
  instructors,
  trainingClasses,
  sessions,
  canManageInstructors = false,
  operationalMinimums = [],
  operationalMinimumDefinitions = [],
  readinessChecklist = [],
  onSaveOperationalMinimums,
  isSavingOperationalMinimums = false,
  onScheduleClass,
  onUpdateSessionStatus,
  onCreateInstructor,
  onUpdateInstructor,
  onDeleteInstructor,
  onCreatePathwayClass,
  onCreateTrainingSession,
  onUpdateTrainingSession,
  onDeleteTrainingSession,
}: PodAcademyDashboardLayoutProps) {
  // If the parent hasn't yet provided `roles` (e.g. profile still hydrating),
  // attempt to read the profile from the shared store as a fallback so the
  // layout can compute permissions correctly once the profile is available.
  const profileFromStore = useProfileStore((s) => s.profile);
  const effectiveRoles = useMemo(() => {
    const profileRoles = profileFromStore?.access_role
      ? [String(profileFromStore.access_role)]
      : [];
    if (roles && roles.length > 0) return roles;
    if (profileRoles.length) return profileRoles;
    return [];
  }, [roles, profileFromStore]);
  // Use the first role as the primary NavRole for now
  const primaryRole = effectiveRoles[0] as NavRole | undefined;
  const ctx = useMemo(() => ({ navRole: primaryRole }), [primaryRole]);
  const { access: canManageInstructorsFromRole } = useUnifiedAccess(
    "manage_instructors",
    ctx,
  );
  const { access: canManageSessions } = useUnifiedAccess(
    "manage_sessions",
    ctx,
  );
  const { access: canScheduleClasses } = useUnifiedAccess(
    "schedule_classes",
    ctx,
  );
  const { access: canCreatePathwayClass } = useUnifiedAccess(
    "create_pathway_class",
    ctx,
  );
  const resolvedCanManageInstructors = useMemo(
    () => canManageInstructors ?? canManageInstructorsFromRole,
    [canManageInstructors, canManageInstructorsFromRole],
  );
  const handleScheduleClass = useMemo(
    () => onScheduleClass ?? (() => {}),
    [onScheduleClass],
  );
  const handleUpdateSessionStatus = useMemo(
    () => onUpdateSessionStatus ?? (() => {}),
    [onUpdateSessionStatus],
  );
  const handleCreateInstructor = useMemo(
    () => onCreateInstructor ?? (() => {}),
    [onCreateInstructor],
  );
  const handleUpdateInstructor = useMemo(
    () => onUpdateInstructor ?? (() => {}),
    [onUpdateInstructor],
  );
  const handleDeleteInstructor = useMemo(
    () => onDeleteInstructor ?? (() => {}),
    [onDeleteInstructor],
  );
  const handleCreatePathwayClass = useMemo(
    () => onCreatePathwayClass ?? (() => {}),
    [onCreatePathwayClass],
  );
  const handleCreateTrainingSession = useMemo(
    () => onCreateTrainingSession ?? (() => {}),
    [onCreateTrainingSession],
  );
  const handleUpdateTrainingSession = useMemo(
    () => onUpdateTrainingSession ?? (() => {}),
    [onUpdateTrainingSession],
  );
  const handleDeleteTrainingSession = useMemo(
    () => onDeleteTrainingSession ?? (() => {}),
    [onDeleteTrainingSession],
  );
  const [isMinimumsSheetOpen, setIsMinimumsSheetOpen] = useState(false);
  // Wrap handlers so they only run when the current role set has permission. No-ops otherwise.
  const guardedScheduleClass = useCallback(
    (classId: string) => {
      // If we don't yet know the user's roles (empty array), allow the action to
      // proceed to avoid blocking during client-side hydration. When roles are
      // known and the permission is false, block and warn.
      if (!canScheduleClasses && effectiveRoles.length > 0) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[PodAcademyDashboardLayout] scheduleClass blocked by permissions",
            {
              roles: effectiveRoles,
              canScheduleClasses,
            },
          );
        }
        return;
      }
      if (
        !canScheduleClasses &&
        effectiveRoles.length === 0 &&
        process.env.NODE_ENV !== "production"
      ) {
        // Roles are unknown — warn in dev but still proceed so UX isn't blocked during hydration.
        // Production remains permissive here because server-side RLS / guards enforce safety.
        console.warn(
          "[PodAcademyDashboardLayout] scheduleClass proceeding with unknown roles (hydration)",
          {
            roles: effectiveRoles,
          },
        );
      }
      return handleScheduleClass(classId);
    },
    [canScheduleClasses, handleScheduleClass, effectiveRoles],
  );
  const guardedCreateTrainingSession = useCallback(
    (session: AcademyTrainingSessionDraft) => {
      if (!canManageSessions && effectiveRoles.length > 0) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[PodAcademyDashboardLayout] createTrainingSession blocked by permissions",
            {
              roles: effectiveRoles,
              canManageSessions,
            },
          );
        }
        return;
      }
      if (
        !canManageSessions &&
        effectiveRoles.length === 0 &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(
          "[PodAcademyDashboardLayout] createTrainingSession proceeding with unknown roles (hydration)",
          {
            roles: effectiveRoles,
          },
        );
      }
      return handleCreateTrainingSession(session);
    },
    [canManageSessions, handleCreateTrainingSession, effectiveRoles],
  );
  const guardedUpdateSessionStatus = useCallback(
    (sessionId: string, status: AcademyTrainingSession["status"]) => {
      if (!canManageSessions && effectiveRoles.length > 0) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[PodAcademyDashboardLayout] updateSessionStatus blocked by permissions",
            {
              roles: effectiveRoles,
              canManageSessions,
            },
          );
        }
        return;
      }
      if (
        !canManageSessions &&
        effectiveRoles.length === 0 &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(
          "[PodAcademyDashboardLayout] updateSessionStatus proceeding with unknown roles (hydration)",
          {
            roles: effectiveRoles,
          },
        );
      }
      return handleUpdateSessionStatus(sessionId, status);
    },
    [canManageSessions, handleUpdateSessionStatus, effectiveRoles],
  );
  const guardedUpdateTrainingSession = useCallback(
    (sessionId: string, patch: Partial<AcademyTrainingSession>) => {
      if (!canManageSessions && effectiveRoles.length > 0) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[PodAcademyDashboardLayout] updateTrainingSession blocked by permissions",
            {
              roles: effectiveRoles,
              canManageSessions,
            },
          );
        }
        return;
      }
      if (
        !canManageSessions &&
        effectiveRoles.length === 0 &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(
          "[PodAcademyDashboardLayout] updateTrainingSession proceeding with unknown roles (hydration)",
          {
            roles: effectiveRoles,
          },
        );
      }
      return handleUpdateTrainingSession(sessionId, patch);
    },
    [canManageSessions, handleUpdateTrainingSession, effectiveRoles],
  );
  const guardedDeleteTrainingSession = useCallback(
    (sessionId: string) => {
      if (!canManageSessions && effectiveRoles.length > 0) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[PodAcademyDashboardLayout] deleteTrainingSession blocked by permissions",
            {
              roles: effectiveRoles,
              canManageSessions,
            },
          );
        }
        return;
      }
      if (
        !canManageSessions &&
        effectiveRoles.length === 0 &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(
          "[PodAcademyDashboardLayout] deleteTrainingSession proceeding with unknown roles (hydration)",
          {
            roles: effectiveRoles,
          },
        );
      }
      return handleDeleteTrainingSession(sessionId);
    },
    [canManageSessions, handleDeleteTrainingSession, effectiveRoles],
  );
  const guardedCreatePathwayClass = useCallback(
    (pathwayId: string) => {
      if (!canCreatePathwayClass && effectiveRoles.length > 0) return;
      if (
        !canCreatePathwayClass &&
        effectiveRoles.length === 0 &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(
          "[PodAcademyDashboardLayout] createPathwayClass proceeding with unknown roles (hydration)",
          {
            roles: effectiveRoles,
          },
        );
      }
      return handleCreatePathwayClass(pathwayId);
    },
    [canCreatePathwayClass, handleCreatePathwayClass, effectiveRoles],
  );
  const benchStat = useMemo(() => {
    const total = instructors.length;
    const registered = instructors.filter(
      (instructor) => instructor.registrationStatus !== "unregistered",
    ).length;
    const unregistered = total - registered;
    let cleared = 0;
    let needsReview = 0;
    let awaiting = 0;
    for (const instructor of instructors) {
      const status = instructor.vettingStatus ?? "awaiting_verification";
      if (status === "cleared") {
        cleared += 1;
      } else if (status === "needs_review") {
        needsReview += 1;
      } else {
        awaiting += 1;
      }
    }
    if (total === 0) {
      return {
        label: "Instructor Bench",
        value: "0",
        helper: "Add instructors to begin scheduling live sessions",
      };
    }
    const helperSegments: string[] = [];
    if (registered > 0) {
      helperSegments.push(`${registered} registered`);
    }
    if (unregistered > 0) {
      helperSegments.push(
        `${unregistered} unregistered SME${unregistered === 1 ? "" : "s"}`,
      );
    }
    if (cleared > 0) {
      helperSegments.push(`${cleared} cleared`);
    }
    if (needsReview > 0) {
      helperSegments.push(`${needsReview} needs review`);
    }
    if (awaiting > 0) {
      helperSegments.push(`${awaiting} awaiting verification`);
    }
    if (helperSegments.length === 0) {
      helperSegments.push("Bench vetting not yet tracked");
    }
    return {
      label: "Instructor Bench",
      value: String(total),
      helper: helperSegments.join(" · "),
      href: "#instructor-bench",
    };
  }, [instructors]);
  const statsWithBench = useMemo(() => {
    const filtered = stats.filter((stat) => stat.label !== "Instructor Bench");
    return [benchStat, ...filtered];
  }, [benchStat, stats]);
  const courseOptions = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        title: string;
      }
    >();
    for (const group of courseGroups) {
      if (!group?.courses) continue;
      for (const course of group.courses) {
        if (!course?.slug) continue;
        if (map.has(course.slug)) continue;
        map.set(course.slug, {
          id: course.slug,
          title: course.title || course.slug,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  }, [courseGroups]);
  const handleManageMinimumsClick = useCallback(() => {
    if (operationalMinimumDefinitions.length === 0) return;
    setIsMinimumsSheetOpen(true);
  }, [operationalMinimumDefinitions]);
  const handleMinimumsSubmit = useCallback(
    (definitions: RegionOperationalMinimumDefinition[]) => {
      if (!onSaveOperationalMinimums) {
        return Promise.resolve();
      }
      return onSaveOperationalMinimums(definitions);
    },
    [onSaveOperationalMinimums],
  );
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-6 rounded-2xl border bg-card/40 p-6 text-card-foreground shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Academy Overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{heading.title}</h1>
          {heading.subtitle ? (
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              {heading.subtitle}
            </p>
          ) : null}
        </div>
        {heading.cta}
      </header>

      <AcademyStatsGrid stats={statsWithBench} />

      {operationalMinimums.length > 0 || readinessChecklist.length > 0 ? (
        <OperationalMinimumsBoard
          minimums={operationalMinimums}
          checklist={readinessChecklist}
          onManageMinimums={
            operationalMinimumDefinitions.length > 0 ||
            onSaveOperationalMinimums
              ? handleManageMinimumsClick
              : undefined
          }
        />
      ) : null}

      <Callout type="info">
        Classes are the training container — a group of learners working through
        a set of topics or a qualification track. Sessions are standalone events
        focused on a single lesson or topic. Sessions are managed independently
        (scheduling, status, and participants) and are not necessarily attached
        to a class. Use classes to organize curriculum and learning pathways;
        use sessions to run discrete, schedulable meetings or focused
        instruction.
      </Callout>

      <ActiveClassesSection
        classes={trainingClasses}
        onScheduleClass={guardedScheduleClass}
      />

      <SessionsBoard
        sessions={sessions}
        onCreateSession={guardedCreateTrainingSession}
        onUpdateSessionStatus={guardedUpdateSessionStatus}
        onUpdateSession={guardedUpdateTrainingSession}
        onDeleteSession={guardedDeleteTrainingSession}
      />

      <div id="instructor-bench" className="scroll-mt-28">
        <InstructorBench
          instructors={instructors}
          learnerCount={members.length}
          onCreateInstructor={handleCreateInstructor}
          onUpdateInstructor={handleUpdateInstructor}
          onRemoveInstructor={handleDeleteInstructor}
          canManageInstructors={resolvedCanManageInstructors}
        />
      </div>

      <QualificationPathwaysSection
        courseGroups={courseGroups}
        onCreatePathwayClass={guardedCreatePathwayClass}
      />

      <OperationalMinimumsManagerSheet
        open={isMinimumsSheetOpen}
        onOpenChange={setIsMinimumsSheetOpen}
        definitions={operationalMinimumDefinitions}
        courseOptions={courseOptions}
        onSubmit={handleMinimumsSubmit}
        isSaving={isSavingOperationalMinimums}
      />
    </section>
  );
}
export default PodAcademyDashboardLayout;
