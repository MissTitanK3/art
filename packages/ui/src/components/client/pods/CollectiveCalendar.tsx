"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Separator } from "@workspace/ui/components/separator";
import {
  addHours,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "date-fns";
import {
  BadgeInfo,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { CollectiveCalendarOrgDialog } from "./CollectiveCalendarOrgDialog";
import {
  CollectiveCalendarOrgConsole,
  type OrgPodFormInput,
} from "./CollectiveCalendarOrgConsole";
import {
  CalendarOrgSummary,
  CalendarPodSummary,
  CalendarVisibility,
  CollectiveCalendarMembership,
  CollectiveCalendarShift,
  CollectiveCalendarShiftInput,
  computeRange,
  formatDay,
  isShiftVisibleToUser,
  needsRemaining,
} from "./CollectiveCalendarShared";
import { CollectiveCalendarShiftDetailsSheet } from "./CollectiveCalendarShiftDetailsSheet";
import { CollectiveCalendarAdminPanel } from "./CollectiveCalendarAdminPanel";
import { CollectiveCalendarFilters } from "./CollectiveCalendarFilters";
import { CollectiveCalendarView } from "./CollectiveCalendarView";
import { CollectiveCalendarShiftForm } from "./CollectiveCalendarShiftForm";
import ConfirmDeleteModal from "../shifts/ConfirmDeleteModal";

export {
  type CalendarOrgSummary,
  type CalendarPodSummary,
  type CalendarVisibility,
  type CollectiveCalendarMembership,
  type CollectiveCalendarShift,
  type CollectiveCalendarShiftInput,
};

export type CollectiveCalendarProps = {
  loading: boolean;
  error: string | null;
  shifts: CollectiveCalendarShift[];
  pods: CalendarPodSummary[];
  organizations: CalendarOrgSummary[];
  membership: CollectiveCalendarMembership;
  onSignup: (shift: CollectiveCalendarShift) => Promise<void>;
  onCreateShift?: (input: CollectiveCalendarShiftInput) => Promise<void>;
  onUpdateShift?: (
    shiftId: string,
    input: CollectiveCalendarShiftInput,
  ) => Promise<void>;
  onDeleteShift?: (shiftId: string) => Promise<void>;
  onCreateOrg?: (name: string, description: string) => Promise<void>;
  onUpdateOrg?: (orgId: string, name: string, description: string) => Promise<void>;
  onDeleteOrg?: (orgId: string) => Promise<void>;
  onCreateOrgPod?: (orgId: string, input: OrgPodFormInput) => Promise<void>;
  onLinkOrgPod?: (orgId: string, podId: string) => Promise<void>;
  onUpdateOrgPod?: (
    orgId: string,
    podId: string,
    input: OrgPodFormInput,
  ) => Promise<void>;
  onRemoveOrgPod?: (
    orgId: string,
    podId: string,
    options?: { hardDelete?: boolean },
  ) => Promise<void>;
};

export function CollectiveCalendar({
  loading,
  error,
  shifts,
  pods,
  organizations,
  membership,
  onSignup,
  onCreateShift,
  onUpdateShift,
  onDeleteShift,
  onCreateOrg,
  onUpdateOrg,
  onDeleteOrg,
  onCreateOrgPod,
  onLinkOrgPod,
  onUpdateOrgPod,
  onRemoveOrgPod,
}: CollectiveCalendarProps) {

  const membershipPods = useMemo(
    () => new Set(membership.podIds ?? []),
    [membership.podIds],
  );
  const membershipOrgs = useMemo(
    () => new Set(membership.orgIds ?? []),
    [membership.orgIds],
  );
  const memberOrganizations = useMemo(
    () => organizations.filter((org) => membershipOrgs.has(org.id)),
    [organizations, membershipOrgs],
  );
  const membershipPodIdList = useMemo(
    () => Array.from(membershipPods),
    [membershipPods],
  );
  const viewerId = membership.profileId ?? membership.userId ?? null;

  const [viewMode, setViewMode] = useState<"week" | "day" | "month" | "mine">(
    "week",
  );
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">(
    "week",
  );
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [selectedPod, setSelectedPod] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<
    CalendarVisibility | "all"
  >("all");
  const [needsCrewOnly, setNeedsCrewOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [myOnly, setMyOnly] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [selectedShift, setSelectedShift] =
    useState<CollectiveCalendarShift | null>(null);
  const [signupLoadingId, setSignupLoadingId] = useState<string | null>(null);
  const [shiftFormOpen, setShiftFormOpen] = useState(false);
  const [editingShift, setEditingShift] =
    useState<CollectiveCalendarShift | null>(null);
  const [draftShiftRange, setDraftShiftRange] = useState<
    { start: string; end: string } | null
  >(null);

  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<CalendarOrgSummary | null>(null);
  const [orgConsoleOpen, setOrgConsoleOpen] = useState(false);
  const [orgConsoleOrg, setOrgConsoleOrg] = useState<CalendarOrgSummary | null>(
    null,
  );
  const [deleteOrgDialogOpen, setDeleteOrgDialogOpen] = useState(false);
  const [orgPendingDeletion, setOrgPendingDeletion] =
    useState<CalendarOrgSummary | null>(null);

  const hasOrgPodManagement = Boolean(
    onCreateOrgPod || onLinkOrgPod || onUpdateOrgPod || onRemoveOrgPod,
  );
  const canManageShifts = Boolean(
    onCreateShift && (membershipPods.size > 0 || membershipOrgs.size > 0),
  );

  const handleOpenOrgDialog = (org?: CalendarOrgSummary) => {
    if (org) {
      setEditingOrg(org);
    } else {
      setEditingOrg(null);
    }
    setOrgDialogOpen(true);
  };

  const handleDeleteOrg = async (orgId: string) => {
    if (!onDeleteOrg) return;
    try {
      await onDeleteOrg(orgId);
      toast.success("Organization deleted");
    } catch (e) {
      toast.error("Failed to delete organization");
    } finally {
      setOrgPendingDeletion(null);
      setDeleteOrgDialogOpen(false);
    }
  };

  const handleDeleteOrgClick = (orgId: string) => {
    if (!onDeleteOrg) return;
    const target = organizations.find((org) => org.id === orgId) ?? null;
    if (!target) return;
    setOrgPendingDeletion(target);
    setDeleteOrgDialogOpen(true);
  };

  const handleManageOrgPods = useCallback(
    (org?: CalendarOrgSummary) => {
      const target = org ?? organizations[0];
      if (!target) {
        toast.info("No organizations", {
          description: "Create an organization to start managing pods.",
        });
        return;
      }
      setOrgConsoleOrg(target);
      setOrgConsoleOpen(true);
    },
    [organizations],
  );

  useEffect(() => {
    if (!orgConsoleOrg) return;
    const next = organizations.find((o) => o.id === orgConsoleOrg.id) ?? null;
    if (!next) {
      if (organizations.length === 0) {
        setOrgConsoleOpen(false);
        setOrgConsoleOrg(null);
      } else {
        setOrgConsoleOrg(organizations[0] ?? null);
      }
      return;
    }
    if (next !== orgConsoleOrg) {
      setOrgConsoleOrg(next);
    }
  }, [orgConsoleOrg, organizations]);

  const visibleShifts = useMemo(() => {
    return shifts.filter((shift) =>
      isShiftVisibleToUser(shift, membershipPods, membershipOrgs),
    );
  }, [membershipOrgs, membershipPods, shifts]);

  const filteredShifts = useMemo(() => {
    const range = computeRange(timeRange);
    const query = search.trim().toLowerCase();
    return visibleShifts.filter((shift) => {
      const start = parseISO(shift.start);
      if (!isWithinInterval(start, { start: range.start, end: range.end }))
        return false;

      if (visibilityFilter !== "all" && shift.visibility !== visibilityFilter) {
        return false;
      }

      if (selectedPod !== "all" && shift.pod.id !== selectedPod) return false;

      if (
        selectedOrg !== "all" &&
        !shift.organizations.some((o) => o.id === selectedOrg)
      ) {
        return false;
      }

      if (needsCrewOnly && needsRemaining(shift) <= 0) return false;

      if (myOnly) {
        const mine =
          membershipPods.has(shift.pod.id) ||
          (viewerId ? shift.signups.includes(viewerId) : false);
        if (!mine) return false;
      }

      if (query) {
        const hay = [
          shift.label ?? "",
          shift.location ?? "",
          shift.pod.name ?? "",
          shift.organizations.map((o) => o.name).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }

      return true;
    });
  }, [
    myOnly,
    needsCrewOnly,
    search,
    selectedOrg,
    selectedPod,
    visibilityFilter,
    visibleShifts,
    timeRange,
    membershipPods,
    viewerId,
  ]);

  const groupedByDay = useMemo(() => {
    const groups = new Map<string, CollectiveCalendarShift[]>();
    for (const shift of filteredShifts) {
      const day = parseISO(shift.start);
      const key = day.toISOString().slice(0, 10);
      const list = groups.get(key) ?? [];
      list.push(shift);
      groups.set(key, list);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, list]) => ({
        key,
        date: parseISO(`${key}T00:00:00Z`),
        shifts: list.sort((a, b) =>
          parseISO(a.start).getTime() - parseISO(b.start).getTime(),
        ),
      }));
  }, [filteredShifts]);

  const busyDays = useMemo(() => {
    return new Set(
      filteredShifts.map((shift) => parseISO(shift.start).toDateString()),
    );
  }, [filteredShifts]);

  const selectedDayShifts = useMemo(
    () =>
      filteredShifts
        .filter((shift) => isSameDay(parseISO(shift.start), selectedDay))
        .sort(
          (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime(),
        ),
    [filteredShifts, selectedDay],
  );

  const activeOrgRole = organizations.find((o) => o.role);

  const handleSignup = async (shift: CollectiveCalendarShift) => {
    setSignupLoadingId(shift.id);
    try {
      await onSignup(shift);
    } catch (e: any) {
      toast.error("Could not sign up", {
        description: e?.message ?? "Try again shortly.",
      });
    } finally {
      setSignupLoadingId(null);
    }
  };

  const handleOpenShiftForm = (
    shift?: CollectiveCalendarShift,
    options?: { start?: Date; end?: Date },
  ) => {
    if (shift) {
      setEditingShift(shift);
      setDraftShiftRange(null);
    } else {
      setEditingShift(null);
      if (options?.start) {
        const startIso = options.start.toISOString();
        const endDate = options.end ?? addHours(options.start, 1);
        setDraftShiftRange({ start: startIso, end: endDate.toISOString() });
      } else {
        setDraftShiftRange(null);
      }
    }
    setShiftFormOpen(true);
  };

  const handleSaveShift = async (input: CollectiveCalendarShiftInput) => {
    if (editingShift && onUpdateShift) {
      await onUpdateShift(editingShift.id, input);
    } else if (onCreateShift) {
      await onCreateShift(input);
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (!onDeleteShift) return;
    await onDeleteShift(shiftId);
    if (selectedShift?.id === shiftId) {
      setSelectedShift(null);
    }
  };

  const handleAddShiftAt = (start: Date) => {
    handleOpenShiftForm(undefined, { start });
  };

  const canManageSelected =
    !!selectedShift &&
    canManageShifts &&
    (membershipPods.has(selectedShift.pod.id) ||
      selectedShift.organizations.some((o) => membershipOrgs.has(o.id)));

  return (
    <div className="space-y-6 md:px-2 pb-10">
      <div className="space-y-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl font-semibold">Collective Calendar</h1>
            <p className="text-sm text-muted-foreground">
              Region-wide view of pod shifts with org awareness, shadow mode,
              and crew needs.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
              {canManageShifts ? (
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => handleOpenShiftForm()}
                >
                  New shift
                </Button>
              ) : null}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <BadgeInfo className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 text-sm">
                  <p className="font-semibold">RBAC + visibility</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>Public: Visible region-wide.</li>
                    <li>Org: Only pods in the same organization.</li>
                    <li>Private: Only members of the pod.</li>
                  </ul>
                  <Separator className="my-2" />
                  <p className="font-semibold">Crew requests</p>
                  <p className="text-muted-foreground">
                    “Needs Crew” badge counts down signups. Shifts keep original
                    requested headcount.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        {activeOrgRole ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="gap-1">
              <Layers className="h-3.5 w-3.5" />
              Org role: {activeOrgRole.name} ({activeOrgRole.role})
            </Badge>
            <span>
              Org admins can curate pods and default visibility from the admin
              panel below.
            </span>
          </div>
        ) : null}
      </div>

      <CollectiveCalendarFilters
        organizations={organizations}
        pods={pods}
        selectedOrg={selectedOrg}
        onSelectedOrgChange={setSelectedOrg}
        selectedPod={selectedPod}
        onSelectedPodChange={setSelectedPod}
        search={search}
        onSearchChange={setSearch}
        visibilityFilter={visibilityFilter}
        onVisibilityFilterChange={(v) => setVisibilityFilter(v as any)}
        timeRange={timeRange}
        onTimeRangeChange={(v) => setTimeRange(v as any)}
        needsCrewOnly={needsCrewOnly}
        onNeedsCrewOnlyChange={setNeedsCrewOnly}
        myOnly={myOnly}
        onMyOnlyChange={(v) => {
          const next = Boolean(v);
          setMyOnly(next);
          if (next) setViewMode("mine");
          else if (viewMode === "mine") setViewMode("week");
        }}
      />

      <CollectiveCalendarView
        viewMode={viewMode}
        onViewModeChange={(v) => {
          setViewMode(v);
          setMyOnly(v === "mine");
          if (v === "week") setTimeRange("week");
          else if (v === "day") setTimeRange("today");
          else if (v === "month") setTimeRange("month");
        }}
        loading={loading}
        error={error}
        filteredShifts={filteredShifts}
        groupedByDay={groupedByDay}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedDayShifts={selectedDayShifts}
        busyDays={busyDays}
        onSelectShift={setSelectedShift}
        onAddShiftAt={canManageShifts ? handleAddShiftAt : undefined}
      />

      <CollectiveCalendarAdminPanel
        organizations={organizations}
        hasCreateOrg={!!onCreateOrg}
        hasUpdateOrg={!!onUpdateOrg}
        hasDeleteOrg={!!onDeleteOrg}
        onOpenOrgDialog={handleOpenOrgDialog}
        onDeleteOrgClick={handleDeleteOrgClick}
        onManageOrgPods={hasOrgPodManagement ? handleManageOrgPods : undefined}
      />

      <CollectiveCalendarShiftDetailsSheet
        shift={selectedShift}
        open={!!selectedShift}
        onOpenChange={(open) => {
          if (!open) setSelectedShift(null);
        }}
        viewerId={viewerId}
        onSignup={handleSignup}
        signupLoadingId={signupLoadingId}
        canManage={canManageSelected}
        onEditShift={(shift) => handleOpenShiftForm(shift)}
        onDeleteShift={(shiftId) => handleDeleteShift(shiftId)}
      />

      <CollectiveCalendarOrgDialog
        open={orgDialogOpen}
        onOpenChange={setOrgDialogOpen}
        editingOrg={editingOrg}
        onCreateOrg={onCreateOrg}
        onUpdateOrg={onUpdateOrg}
      />

      {hasOrgPodManagement && (
        <CollectiveCalendarOrgConsole
          open={orgConsoleOpen}
          onOpenChange={(open) => {
            setOrgConsoleOpen(open);
            if (!open) setOrgConsoleOrg(null);
          }}
          org={orgConsoleOrg}
          pods={orgConsoleOrg?.pods ?? []}
          allPods={pods}
          onLinkPod={
            onLinkOrgPod
              ? (orgId, podId) => onLinkOrgPod(orgId, podId)
              : undefined
          }
          onRemovePod={
            onRemoveOrgPod
              ? (orgId, podId, options) => onRemoveOrgPod(orgId, podId, options)
              : undefined
          }
        />
      )}

      {canManageShifts && (
        <CollectiveCalendarShiftForm
          open={shiftFormOpen}
          onOpenChange={(open) => {
            setShiftFormOpen(open);
            if (!open) {
              setEditingShift(null);
              setDraftShiftRange(null);
            }
          }}
          pods={pods}
          organizations={memberOrganizations}
          membershipPodIds={membershipPodIdList}
          initialShift={editingShift}
          defaultPodId={
            selectedPod !== "all"
              ? selectedPod
              : memberOrganizations.find((o) => (o.pods?.length ?? 0) > 0)?.pods?.[0]?.id ??
              pods[0]?.id
          }
          draftStart={draftShiftRange?.start}
          draftEnd={draftShiftRange?.end}
          onSubmit={handleSaveShift}
          onDelete={onDeleteShift ? handleDeleteShift : undefined}
        />
      )}

      {onDeleteOrg && orgPendingDeletion && (
        <ConfirmDeleteModal
          open={deleteOrgDialogOpen}
          onOpenChange={(open) => {
            setDeleteOrgDialogOpen(open);
            if (!open) setOrgPendingDeletion(null);
          }}
          title={`Delete ${orgPendingDeletion.name}?`}
          description="This will remove the organization and detach its pods. This action cannot be undone."
          onConfirm={() => {
            if (orgPendingDeletion) {
              void handleDeleteOrg(orgPendingDeletion.id);
            }
          }}
        />
      )}
    </div>
  );
}

export default CollectiveCalendar;
