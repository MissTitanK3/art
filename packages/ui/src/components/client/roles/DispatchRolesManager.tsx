"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { useState } from "react";
import { toast } from "sonner";
import { humanize } from "@workspace/ui/lib/utils";
import VolunteerStatusBadge from "../status/VolunteerStatusBadge.tsx";
import { DispatchPersonnelStatus } from "@workspace/ui/lib/constants/dispatch";
import { VolunteerStatusUpdater } from "../status/VolunteerStatusUpdater.tsx";
import CopySignalHandleButton from "../buttons/CopySignalHandleButton.tsx";
import { RosterEntry, PodRole, PodMemberStatus } from "@workspace/store/types/pod.ts";
import ManageRoleDrawer from "./ManageRoleDrawer.tsx";
import RolesEditorDrawer from "./RolesEditorDrawer.tsx";
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
  const allRoster = roster ?? [];
  const [openRole, setOpenRole] = useState<string | null>(null);
  const [openRolesEditor, setOpenRolesEditor] = useState(false);

  type AssignedVolunteer = Partial<RosterEntry> & {
    volunteer?: {
      display_name?: string;
      contact_signal?: string;
    };
  };

  const assignedVolunteers = (submission.assigned_volunteers ?? []) as AssignedVolunteer[];

  const handleSaveAssignments = (
    role: string,
    selected: string[],
    manualVolunteers: { id: string; name: string }[],
  ) => {
    const updatedAssignments: Partial<RosterEntry>[] = [
      ...(assignedVolunteers.filter((v) => v.role !== role) ?? []),
      ...selected
        .filter((id) => !id.startsWith("manual-"))
        .map((rosterId) => {
          const rosterEntry = allRoster.find((r) => r.id === rosterId);
          return rosterEntry
            ? {
                id: rosterEntry.id,
                profile: rosterEntry.profile,
                role: role as PodRole,
                status: "active" as PodMemberStatus,
              }
            : { id: rosterId, role: role as PodRole, status: "active" as PodMemberStatus };
        }),
      ...manualVolunteers
        .filter((m) => selected.includes(m.id))
        .map((m) => ({
          id: m.id,
          profile: { display_name: m.name } as any,
          role: role as PodRole,
          status: "active" as PodMemberStatus,
        })),
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

  const handleStatusChange = (volunteerId: string | undefined, status: DispatchPersonnelStatus) => {
    if (!volunteerId) {
      return;
    }
    const updated = assignedVolunteers.map((v) =>
      v.id === volunteerId ? { ...v, status: status as PodMemberStatus } : v,
    );
    onUpdate({ assigned_volunteers: updated });
  };

  const hasRoleTypes =
    submission.required_roles_by_type && Object.keys(submission.required_roles_by_type).length > 0;

  const roles = hasRoleTypes
    ? Object.keys(submission.required_roles_by_type!)
    : submission.required_roles ?? [];

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
                        <li
                          key={v.id}
                          className="text-muted-foreground"
                        >
                          <div
                            className="
      flex flex-col items-center gap-4 w-full
      md:flex-row md:justify-between md:items-center md:gap-6
    "
                          >
                            <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-4">
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {rosterEntry?.role ??
                                  (v.id?.startsWith("manual-") ? "manual" : "unknown")}
                              </Badge>

                              <span className="font-medium text-foreground text-center md:text-left">
                                {rosterEntry?.profile.display_name ??
                                  v.profile?.display_name ??
                                  v.volunteer?.display_name ??
                                  "Unknown Volunteer"}
                              </span>

                              {(rosterEntry?.profile.contact_signal ?? v.profile?.contact_signal ?? v.volunteer?.contact_signal) && (
                                <CopySignalHandleButton
                                  handle={(rosterEntry?.profile.contact_signal ?? v.profile?.contact_signal ?? v.volunteer?.contact_signal)!}
                                />
                              )}
                            </div>

                            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
                              <VolunteerStatusBadge status={v.status as DispatchPersonnelStatus} />
                              <VolunteerStatusUpdater
                                current={v.status as DispatchPersonnelStatus}
                                onChange={(newStatus) => handleStatusChange(v.id, newStatus)}
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
          assigned={assignedVolunteers.filter((v) => v.role === openRole).map((v) => v.id ?? "")}
          manualAssigned={
            assignedVolunteers
              .filter((v) => v.role === openRole && v.id?.startsWith("manual-"))
              .map((v) => ({
                volunteer_id: v.id ?? "",
                name: v.profile?.display_name ?? v.volunteer?.display_name,
              }))
          }
          onClose={() => setOpenRole(null)}
          onSave={handleSaveAssignments}
          allRoster={allRoster}
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
