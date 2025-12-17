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

          // Map by both profile.id AND roster entry id, prefer providedRoster entries
          const mapByProfile = new Map<string, RosterEntry>();
          for (const r of providedRoster) {
            const pid = r.profile?.id ? String(r.profile.id) : undefined;
            if (pid) mapByProfile.set(pid, r);
            if (r.id && r.id !== pid) mapByProfile.set(String(r.id), r);
          }
          for (const s of synthetic) {
            const pid = s.profile?.id ? String(s.profile.id) : undefined;
            if (pid && !mapByProfile.has(pid)) mapByProfile.set(pid, s);
            if (s.id && s.id !== pid && !mapByProfile.has(String(s.id))) {
              mapByProfile.set(String(s.id), s);
            }
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

  const allRoster = useMemo(() => {
    const base = rosterOptions ?? providedRoster;
    const map = new Map<string, RosterEntry>();

    for (const r of base) {
      if (r.id) map.set(String(r.id), r);
    }

    // Ensure assigned volunteers always have a resolvable entry to avoid "Unknown Volunteer"
    for (const v of assignedVolunteers) {
      const vid = v.id ? String(v.id) : undefined;
      if (!vid) continue;
      if (!map.has(vid)) {
        const displayName = v.volunteer?.display_name ?? v.profile?.display_name ?? `User ${vid.slice(0, 8)}`;
        const contactSignal = (v.profile as any)?.contact_signal ?? (v.volunteer as any)?.contact_signal;

        map.set(vid, {
          id: vid,
          role: v.role as PodRole,
          status: (v.status as PodMemberStatus) ?? "active",
          profile: {
            id: vid,
            user_id: vid,
            display_name: displayName,
            access_role: "team_member" as const,
            field_roles: [],
            verified_by: "self" as const,
            affiliation: undefined,
            availability: false,
            contact_signal: contactSignal,
            coordination_zone: undefined,
            last_profile_check_in: undefined,
            inserted_at: new Date().toISOString(),
            coverage_zones: [],
            state: "",
            weekly_availability: undefined,
            self_risk_acknowledged: false,
            city: undefined,
            operating_counties: [],
            self_status_flags: [],
            ...(v.profile ?? {}),
          },
          langs: [],
          skills: [],
          certs: [],
          notes: undefined,
          handle: displayName,
          joinedAt: new Date().toISOString(),
          lastShiftAt: undefined,
          signal_handle: contactSignal,
        });
      }
    }

    return Array.from(map.values());
  }, [assignedVolunteers, rosterOptions, providedRoster]);

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
    selectedRoster: RosterEntry[],
    manualVolunteers: { id: string; name: string }[]
  ) => {
    const updatedAssignments: any[] = [
      ...(assignedVolunteers.filter((v) => v.role !== role) ?? []),
      ...selectedRoster.map((rosterEntry) => {
        const existing = assignedVolunteers.find(
          (v) => v.id === rosterEntry.id && v.role === role
        );
        const status = (existing?.status as PodMemberStatus) ?? "active";

        return {
          id: rosterEntry.id,
          profile: {
            id: rosterEntry.profile.id,
            display_name: rosterEntry.profile.display_name,
            contact_signal: rosterEntry.profile.contact_signal,
          },
          role: role as PodRole,
          status,
        };
      }),
      ...manualVolunteers.map((m) => {
        const existing = assignedVolunteers.find(
          (v) => v.id === m.id && v.role === role
        );
        const status = (existing?.status as PodMemberStatus) ?? "active";

        return {
          id: m.id,
          profile: {
            id: m.id,
            display_name: m.name,
            contact_signal: undefined,
          },
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
                  <div className="flex flex-wrap gap-3">
                    {assigned.map((v) => {
                      const rosterEntry = allRoster.find((r) => r.id === v.id);

                      return (
                        <div
                          key={v.id}
                          className="flex flex-col gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm flex-shrink-0 w-full sm:w-[280px]"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex gap-4 flex-1 min-w-0">
                              <span className="font-semibold text-sm text-foreground truncate">
                                {v.profile?.display_name ??
                                  v?.profile?.display_name ??
                                  rosterEntry?.profile.display_name ??
                                  "Unknown Volunteer"}
                              </span>
                              <VolunteerStatusBadge
                                status={v.status as DispatchPersonnelStatus}
                              />
                            </div>
                          </div>

                          {(v.profile?.contact_signal ??
                            rosterEntry?.profile.contact_signal ??
                            v.volunteer?.contact_signal) && (
                              <CopySignalHandleButton
                                handle={
                                  (v.profile?.contact_signal ??
                                    rosterEntry?.profile.contact_signal ??
                                    v.volunteer?.contact_signal)!
                                }
                              />
                            )}

                          <div className="flex items-center justify-between gap-2 pt-2 border-t">
                            <VolunteerStatusUpdater
                              current={v.status as DispatchPersonnelStatus}
                              onChange={(newStatus) =>
                                handleStatusChange(v.id, newStatus)
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-8 text-center">
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
