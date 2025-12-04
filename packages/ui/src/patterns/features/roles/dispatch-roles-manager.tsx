"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Badge } from "@workspace/ui/primitives/badge";
import { Button } from "@workspace/ui/primitives/button";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { humanize } from "@workspace/ui/lib/utils";
import VolunteerStatusBadge from "@workspace/ui/patterns/features/status/volunteer-status-badge";
import { DispatchPersonnelStatus } from "@workspace/ui/lib/constants/dispatch";
import { VolunteerStatusUpdater } from "@workspace/ui/patterns/features/status/volunteer-status-updater";
import CopySignalHandleButton from "@workspace/ui/patterns/features/buttons/copy-signal-handle-button";
import {
  RosterEntry,
  PodRole,
  PodMemberStatus,
} from "@workspace/store/types/pod.ts";
import ManageRoleDrawer from "@workspace/ui/patterns/features/roles/manage-role-drawer";
import RolesEditorDrawer from "@workspace/ui/patterns/features/roles/roles-editor-drawer";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";

type DispatchRolesManagerProps = {
  submission: DispatchSubmission;
  onUpdate: (patch: Partial<DispatchSubmission>) => void;
  roster?: RosterEntry[];
};

export default function DispatchRolesManager({
  submission,
  onUpdate,
  roster,
}: DispatchRolesManagerProps) {
  const providedRoster = useMemo(() => roster ?? [], [roster]);
  const [openRole, setOpenRole] = useState<string | null>(null);
  const [openRolesEditor, setOpenRolesEditor] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [rosterOptions, setRosterOptions] = useState<RosterEntry[] | null>(
    null
  );
  // Role-filtered roster for the currently opened role drawer
  const [loadingRoleRoster, setLoadingRoleRoster] = useState(false);
  const [roleRosterOptions, setRoleRosterOptions] = useState<
    RosterEntry[] | null
  >(null);

  type AssignedVolunteer = Partial<RosterEntry> & {
    volunteer?: {
      display_name?: string;
      contact_signal?: string;
    };
  };

  const assignedVolunteers = (submission.assigned_volunteers ??
    []) as AssignedVolunteer[];

  // Convert a plain profile into a synthetic RosterEntry for selection, similar to AddMemberButton
  const profileToRosterEntry = (profile: any): RosterEntry => ({
    id: String(profile.id),
    profile,
    role: "member" as PodRole,
    status: "active" as PodMemberStatus,
    langs: [],
    skills: [],
    certs: [],
    notes: undefined,
    handle: profile.display_name ?? "",
    joinedAt: new Date().toISOString(),
    lastShiftAt: undefined,
    signal_handle: profile.contact_signal ?? undefined,
  });

  // Load all registered users and merge with provided roster; prefer provided entries when profile.id matches
  useEffect(() => {
    let cancelled = false;
    async function loadProfiles() {
      setLoadingRoster(true);
      try {
        const res = await fetch("/api/dispatch/profiles", {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          const profiles = Array.isArray(json?.profiles) ? json.profiles : [];
          const synthetic = profiles.map(profileToRosterEntry);

          // Map by profile.id, prefer providedRoster entries
          const mapByProfile = new Map<string, RosterEntry>();
          for (const r of providedRoster) {
            const pid = r.profile?.id ? String(r.profile.id) : undefined;
            if (pid) mapByProfile.set(pid, r);
          }
          for (const s of synthetic) {
            const pid = s.profile?.id ? String(s.profile.id) : undefined;
            if (pid && !mapByProfile.has(pid)) mapByProfile.set(pid, s);
          }
          const merged = Array.from(mapByProfile.values()).sort((a, b) =>
            (a.profile?.display_name ?? "").localeCompare(
              b.profile?.display_name ?? ""
            )
          );
          if (!cancelled) setRosterOptions(merged);
          return;
        }
      } catch {
        // ignore and fall through to fallback
      } finally {
        if (!cancelled) setLoadingRoster(false);
      }

      if (!cancelled) setRosterOptions(providedRoster);
    }
    loadProfiles();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(providedRoster.map((r) => r.profile?.id))]);

  const allRoster = useMemo(
    () => rosterOptions ?? providedRoster,
    [rosterOptions, providedRoster]
  );

  // When managing a specific role, fetch only profiles eligible for that role (based on public.profile.field_roles)
  useEffect(() => {
    let cancelled = false;
    async function loadEligibleForRole() {
      if (!openRole) {
        setRoleRosterOptions(null);
        return;
      }
      setLoadingRoleRoster(true);
      try {
        const res = await fetch(
          `/api/dispatch/profiles?field_role=${encodeURIComponent(openRole)}`,
          { credentials: "include" }
        );
        if (res.ok) {
          const json = await res.json();
          const profiles = Array.isArray(json?.profiles) ? json.profiles : [];
          const synthetic = profiles.map(profileToRosterEntry);

          // Build a map by profile.id; prefer provided roster entries when present
          const mapByProfile = new Map<string, RosterEntry>();
          for (const r of providedRoster) {
            const pid = r.profile?.id ? String(r.profile.id) : undefined;
            // Only include if the profile explicitly lists this role in field_roles
            const hasRole = Array.isArray((r.profile as any)?.field_roles)
              ? ((r.profile as any).field_roles as string[]).includes(openRole)
              : false;
            if (pid && hasRole) mapByProfile.set(pid, r);
          }
          for (const s of synthetic) {
            const pid = s.profile?.id ? String(s.profile.id) : undefined;
            if (pid && !mapByProfile.has(pid)) mapByProfile.set(pid, s);
          }
          const merged = Array.from(mapByProfile.values()).sort((a, b) =>
            (a.profile?.display_name ?? "").localeCompare(
              b.profile?.display_name ?? ""
            )
          );
          if (!cancelled) setRoleRosterOptions(merged);
          return;
        }
      } catch {
        // ignore, fallback below
      } finally {
        if (!cancelled) setLoadingRoleRoster(false);
      }

      // Fallback: filter provided roster by field_roles if available
      const filteredProvided = providedRoster.filter(
        (r) =>
          Array.isArray((r.profile as any)?.field_roles) &&
          ((r.profile as any).field_roles as string[]).includes(openRole!)
      );
      if (!cancelled) setRoleRosterOptions(filteredProvided);
    }
    loadEligibleForRole();
    return () => {
      cancelled = true;
    };
  }, [openRole, providedRoster]);

  const handleSaveAssignments = (
    role: string,
    selected: string[],
    manualVolunteers: { id: string; name: string }[]
  ) => {
    const updatedAssignments: Partial<RosterEntry>[] = [
      ...(assignedVolunteers.filter((v) => v.role !== role) ?? []),
      ...selected
        .filter((id) => !id.startsWith("manual-"))
        .map((rosterId) => {
          const rosterEntry = allRoster.find((r) => r.id === rosterId);
          const existing = assignedVolunteers.find(
            (v) => v.id === rosterId && v.role === role
          );
          const status = (existing?.status as PodMemberStatus) ?? "active";

          return rosterEntry
            ? {
                id: rosterEntry.id,
                profile: rosterEntry.profile,
                role: role as PodRole,
                status,
              }
            : {
                id: rosterId,
                role: role as PodRole,
                status,
              };
        }),
      ...manualVolunteers
        .filter((m) => selected.includes(m.id))
        .map((m) => {
          const existing = assignedVolunteers.find(
            (v) => v.id === m.id && v.role === role
          );
          const status = (existing?.status as PodMemberStatus) ?? "active";

          return {
            id: m.id,
            profile: { display_name: m.name } as any,
            role: role as PodRole,
            status,
          };
        }),
    ];

    onUpdate({ assigned_volunteers: updatedAssignments });
    toast.success(`Assignments updated for ${role}`);
    setOpenRole(null);
  };

  const handleSaveRequiredRoles = (nextRoles: Record<string, number>) => {
    onUpdate({ required_roles_by_type: nextRoles });
    toast.success("Updated roles needed for this dispatch");
    setOpenRolesEditor(false);
  };

  const handleStatusChange = (
    volunteerId: string | undefined,
    status: DispatchPersonnelStatus
  ) => {
    if (!volunteerId) {
      return;
    }
    const updated = assignedVolunteers.map((v) =>
      v.id === volunteerId ? { ...v, status: status as PodMemberStatus } : v
    );
    onUpdate({ assigned_volunteers: updated });
  };

  const hasRoleTypes =
    submission.required_roles_by_type &&
    Object.keys(submission.required_roles_by_type).length > 0;

  const roles = [
    ...(hasRoleTypes
      ? Object.keys(submission.required_roles_by_type!)
      : (submission.required_roles ?? [])),
  ].sort((a, b) => a.localeCompare(b));

  return (
    <Card suppressHydrationWarning>
      <CardHeader>
        <CardTitle>Roles Management</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpenRolesEditor(true)}
        >
          Edit Needed Roles
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        {roles.length > 0 ? (
          roles.map((role) => {
            const assigned =
              assignedVolunteers.filter((v) => v.role === role) ?? [];

            const count =
              submission.required_roles_by_type?.[role] ??
              (submission.required_roles?.includes(role) ? assigned.length : 0);

            return (
              <div key={role} className="space-y-2" suppressHydrationWarning>
                <hr className="my-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 justify-between w-full">
                    <Badge variant="secondary" className="text-xs">
                      {humanize(role)}
                    </Badge>
                    <span className="text-muted-foreground">
                      {assigned.length}
                      {count ? ` / ${count}` : ""} assigned
                    </span>
                  </div>
                </div>

                {assigned.length > 0 ? (
                  <ul className="space-y-2">
                    {assigned.map((v) => {
                      const rosterEntry = allRoster.find((r) => r.id === v.id);

                      return (
                        <li key={v.id} className="text-muted-foreground">
                          <div
                            className="
      flex flex-col items-center gap-4 w-full
      md:flex-row md:justify-between md:items-center md:gap-6
    "
                          >
                            <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-4">
                              <Badge
                                variant="outline"
                                className="text-[10px] capitalize"
                              >
                                {rosterEntry?.role ??
                                  (v.id?.startsWith("manual-")
                                    ? "manual"
                                    : "unknown")}
                              </Badge>

                              <span className="font-medium text-foreground text-center md:text-left">
                                {rosterEntry?.profile.display_name ??
                                  v.profile?.display_name ??
                                  v.volunteer?.display_name ??
                                  "Unknown Volunteer"}
                              </span>

                              {(rosterEntry?.profile.contact_signal ??
                                v.profile?.contact_signal ??
                                v.volunteer?.contact_signal) && (
                                <CopySignalHandleButton
                                  handle={
                                    (rosterEntry?.profile.contact_signal ??
                                      v.profile?.contact_signal ??
                                      v.volunteer?.contact_signal)!
                                  }
                                />
                              )}
                            </div>

                            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
                              <VolunteerStatusBadge
                                status={v.status as DispatchPersonnelStatus}
                              />
                              <VolunteerStatusUpdater
                                current={v.status as DispatchPersonnelStatus}
                                onChange={(newStatus) =>
                                  handleStatusChange(v.id, newStatus)
                                }
                              />
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No volunteers assigned yet.
                  </p>
                )}
                <div className="flex justify-end w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpenRole(role)}
                  >
                    Manage Assignments
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-muted-foreground">
            No roles have been defined for this dispatch yet.
          </p>
        )}
      </CardContent>

      {openRole ? (
        <ManageRoleDrawer
          role={openRole}
          submissionId={submission.id}
          assigned={assignedVolunteers
            .filter((v) => v.role === openRole)
            .map((v) => v.id ?? "")}
          manualAssigned={assignedVolunteers
            .filter((v) => v.role === openRole && v.id?.startsWith("manual-"))
            .map((v) => ({
              volunteer_id: v.id ?? "",
              name: v.profile?.display_name ?? v.volunteer?.display_name,
            }))}
          onClose={() => setOpenRole(null)}
          onSave={handleSaveAssignments}
          allRoster={roleRosterOptions ?? allRoster}
          loading={loadingRoleRoster}
        />
      ) : null}

      {openRolesEditor ? (
        <RolesEditorDrawer
          current={submission.required_roles_by_type ?? {}}
          onClose={() => setOpenRolesEditor(false)}
          onSave={handleSaveRequiredRoles}
        />
      ) : null}
    </Card>
  );
}
