"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@workspace/ui/components/drawer";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { useDispatchStore } from "@workspace/store/dispatchStore";
import { seedPods } from "@workspace/store/podStore";
import { useState } from "react";
import { toast } from "sonner";
import { humanize } from "@workspace/ui/lib/utils";
import VolunteerStatusBadge from "../status/VolunteerStatusBadge.tsx";
import { DispatchPersonnelStatus } from "@workspace/ui/lib/constants/dispatch";
import { VolunteerStatusUpdater } from "../status/VolunteerStatusUpdater.tsx";
import CopySignalHandleButton from "../buttons/CopySignalHandleButton.tsx";
import { RosterEntry, PodRole, PodMemberStatus } from "@workspace/store/types/pod.ts";
import { FIELD_ROLE_OPTIONS } from "@workspace/store/types/roles.ts";
import { Input } from "@workspace/ui/components/input";
import ManageRoleDrawer from "./ManageRoleDrawer.tsx";
import RolesEditorDrawer from "./RolesEditorDrawer.tsx";

// Build lookup of roster entries for easy access
const allRoster = seedPods.flatMap((pod) => pod.team);

export default function DispatchRolesManager({ id }: { id: string }) {
  const submission = useDispatchStore((s) =>
    s.submissions.find((sub) => sub.id === id)
  );
  const updateSubmission = useDispatchStore((s) => s.updateSubmission);

  const [openRole, setOpenRole] = useState<string | null>(null);
  const [openRolesEditor, setOpenRolesEditor] = useState(false);

  if (!submission) return null;

  const handleSaveAssignments = (
    role: string,
    selected: string[],
    manualVolunteers: { id: string; name: string }[]
  ) => {
    const updatedAssignments: Partial<RosterEntry>[] = [
      // keep existing volunteers for other roles
      ...(submission.assigned_volunteers ?? []).filter((v) => v.role !== role),

      // Existing roster members (use RosterEntry.id, not Profile.id)
      ...selected
        .filter((id) => !id.startsWith("manual-"))
        .map((rosterId) => {
          const rosterEntry = allRoster.find((r) => r.id === rosterId);
          return rosterEntry
            ? {
              id: rosterEntry.id, // ✅ use RosterEntry.id (like "r1")
              role: role as PodRole,
              status: "active" as PodMemberStatus,
            }
            : { id: rosterId, role: role as PodRole, status: "active" as PodMemberStatus };
        }),

      // Manual entries (fake RosterEntry-like objects)
      ...manualVolunteers
        .filter((m) => selected.includes(m.id))
        .map((m) => ({
          id: m.id, // still a string (manual-xxx)
          volunteer: { display_name: m.name } as any,
          role: role as PodRole,
          status: "active" as PodMemberStatus,
        })),
    ];

    updateSubmission(id, { assigned_volunteers: updatedAssignments });
    toast.success(`Assignments updated for ${role}`);
    setOpenRole(null);
  };

  const handleSaveRequiredRoles = (
    nextRoles: Record<string, number>
  ) => {
    updateSubmission(submission.id, { required_roles_by_type: nextRoles });
    toast.success("Updated roles needed for this dispatch");
    setOpenRolesEditor(false);
  };

  const hasRoleTypes =
    submission.required_roles_by_type &&
    Object.keys(submission.required_roles_by_type).length > 0;

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
              submission.assigned_volunteers?.filter((v) => v.role === role) ??
              [];

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
                            {/* Left side: volunteer info */}
                            <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-4">
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {rosterEntry?.role ??
                                  (v.id?.startsWith("manual-") ? "manual" : "unknown")}
                              </Badge>

                              <span className="font-medium text-foreground text-center md:text-left">
                                {rosterEntry?.volunteer.display_name ??
                                  v.volunteer?.display_name ??
                                  "Unknown Volunteer"}
                              </span>

                              {rosterEntry?.volunteer.contact_signal && (
                                <CopySignalHandleButton
                                  handle={rosterEntry.volunteer.contact_signal}
                                />
                              )}
                            </div>

                            {/* Right side: status */}
                            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
                              <VolunteerStatusBadge status={v.status as DispatchPersonnelStatus} />
                              <VolunteerStatusUpdater
                                current={v.status as DispatchPersonnelStatus}
                                onChange={(newStatus) => {
                                  useDispatchStore.getState().updateSubmission(submission.id, {
                                    assigned_volunteers: submission.assigned_volunteers?.map((av) =>
                                      av.id === v.id
                                        ? { ...av, status: newStatus as PodMemberStatus }
                                        : av
                                    ),
                                  });
                                }}
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
                    Manage
                  </Button>
                </div>

                {openRole === role && (
                  <ManageRoleDrawer
                    role={role}
                    submissionId={id}
                    assigned={assigned.map((v) => v.id!).filter(Boolean)}
                    manualAssigned={assigned
                      .filter((v) => v.id?.startsWith("manual-"))
                      .map((v) => ({
                        volunteer_id: v.id ?? "",
                        name: v.volunteer?.display_name,
                      }))
                    }

                    onClose={() => setOpenRole(null)}
                    onSave={handleSaveAssignments}
                    allRoster={allRoster}
                  />

                )}
                {openRolesEditor && (
                  <RolesEditorDrawer
                    current={submission.required_roles_by_type ?? {}}
                    onClose={() => setOpenRolesEditor(false)}
                    onSave={handleSaveRequiredRoles}
                  />
                )}

              </div>
            );
          })
        ) : (
          <p className="text-muted-foreground">No roles requested yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
