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
                    <Badge variant="secondary" className="text-xs capitalize">
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
                      const rosterEntry = allRoster.find((r) => r.id === v.id); // ✅ match by RosterEntry.id

                      return (
                        <li key={v.id} className="flex items-center gap-2 text-muted-foreground">
                          <div className="flex items-center gap-2 flex-col sm:flex-row w-full justify-between">
                            <div className="flex items-center gap-2 w-full justify-between my-1">
                              <div className="flex flex-col items-center gap-2">
                                <Badge variant="outline" className="text-[10px] capitalize">
                                  {rosterEntry?.role ??
                                    (v.id?.startsWith("manual-") ? "manual" : "unknown")}
                                </Badge>

                                <span className="font-medium text-foreground">
                                  {rosterEntry?.volunteer.display_name ??
                                    v.volunteer?.display_name ??
                                    "Unknown Volunteer"}
                                </span>
                              </div>
                              <VolunteerStatusBadge status={v.status as DispatchPersonnelStatus} />
                            </div>
                            <div className="flex items-center gap-2">
                              <VolunteerStatusUpdater
                                current={v.status as DispatchPersonnelStatus}
                                onChange={(newStatus) => {
                                  useDispatchStore.getState().updateSubmission(submission.id, {
                                    assigned_volunteers: submission.assigned_volunteers?.map(
                                      (av) =>
                                        av.id === v.id
                                          ? { ...av, status: newStatus as PodMemberStatus }
                                          : av
                                    ),
                                  });
                                }}
                              />
                            </div>
                            {rosterEntry?.volunteer.contact_signal && (
                              <CopySignalHandleButton handle={rosterEntry.volunteer.contact_signal} />
                            )}
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

function ManageRoleDrawer({
  role,
  submissionId,
  assigned,
  manualAssigned = [],
  onClose,
  onSave,
}: {
  role: string;
  submissionId: string;
  assigned: string[];
  manualAssigned?: { volunteer_id: string; name?: string }[];
  onClose: () => void;
  onSave: (
    role: string,
    selected: string[],
    manualVolunteers: { id: string; name: string }[]
  ) => void;
}) {
  const [selected, setSelected] = useState<string[]>(assigned);
  const [manualName, setManualName] = useState("");
  const [manualVolunteers, setManualVolunteers] = useState<
    { id: string; name: string }[]
  >(
    manualAssigned.map((m) => ({
      id: m.volunteer_id,
      name: m.name ?? m.volunteer_id,
    }))
  );

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const addManualVolunteer = () => {
    if (!manualName.trim()) return;
    const id = `manual-${Date.now()}`;
    const newVolunteer = { id, name: manualName.trim() };
    setManualVolunteers((prev) => [...prev, newVolunteer]);
    setSelected((prev) => [...prev, id]);
    setManualName("");
  };

  return (
    <Drawer open onOpenChange={onClose}>
      <DrawerContent className="p-4">
        <DrawerHeader>
          <DrawerTitle>Manage Role: {role}</DrawerTitle>
          <DrawerDescription>
            Assign or unassign volunteers for this role.
          </DrawerDescription>
        </DrawerHeader>

        <div className="max-h-[50vh] overflow-y-auto mt-4 space-y-2">
          {/* Existing roster */}
          {allRoster.map((r) => (
            <label
              key={r.volunteer.id}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <Checkbox
                checked={selected.includes(r.id)}
                onCheckedChange={() => toggle(r.id)}
              />

              <span className="font-medium">{r.volunteer.display_name}</span>
              <Badge variant="outline" className="text-[10px] capitalize">
                {r.role}
              </Badge>
            </label>
          ))}

          {/* Manual volunteers */}
          {manualVolunteers.map((m) => (
            <label
              key={m.id}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <Checkbox
                checked={selected.includes(m.id)}
                onCheckedChange={() => toggle(m.id)}
              />
              <span className="font-medium">{m.name}</span>
              <Badge variant="outline" className="text-[10px] capitalize">
                manual
              </Badge>
            </label>
          ))}
        </div>

        {/* Manual entry field */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="Add volunteer name"
            className="flex-1 rounded-md border px-2 py-1 text-sm"
          />
          <Button size="sm" onClick={addManualVolunteer}>
            Add
          </Button>
        </div>

        <DrawerFooter>
          <Button onClick={() => onSave(role, selected, manualVolunteers)}>
            Save
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}


function RolesEditorDrawer({
  current,
  onClose,
  onSave,
}: {
  current: Record<string, number>;
  onClose: () => void;
  onSave: (roles: Record<string, number>) => void;
}) {
  const [rolesState, setRolesState] = useState<Record<string, number>>(current);
  const [query, setQuery] = useState("");

  const toggleRole = (role: string) => {
    setRolesState((prev) => {
      const copy = { ...prev };
      if (copy[role]) {
        delete copy[role];
      } else {
        copy[role] = 1; // default count
      }
      return copy;
    });
  };

  const updateCount = (role: string, value: number) => {
    setRolesState((prev) => ({ ...prev, [role]: value }));
  };

  // 🔍 Filtered roles list
  const filteredRoles = FIELD_ROLE_OPTIONS.filter((role) =>
    role.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Drawer open onOpenChange={onClose}>
      <DrawerContent className="p-4" inert>
        <DrawerHeader>
          <DrawerTitle>Edit Roles Needed</DrawerTitle>
          <DrawerDescription>
            Add or remove required roles and set how many volunteers are needed
            for each.
          </DrawerDescription>
        </DrawerHeader>

        {/* Search bar */}
        <div className="mb-3">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roles..."
            className="w-full"
            autoFocus
          />
        </div>

        <div className="max-h-[50vh] overflow-y-auto mt-2 space-y-2">
          {filteredRoles.length > 0 ? (
            filteredRoles.map((role) => (
              <div
                key={role}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={rolesState[role] !== undefined}
                    onCheckedChange={() => toggleRole(role)}
                  />
                  <span className="capitalize">{humanize(role)}</span>
                </label>
                {rolesState[role] !== undefined && (
                  <Input
                    type="number"
                    min={1}
                    value={rolesState[role]}
                    onChange={(e) =>
                      updateCount(role, Number(e.target.value))
                    }
                    className="w-16 text-center"
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              No roles match your search.
            </p>
          )}
        </div>

        <DrawerFooter>
          <Button onClick={() => onSave(rolesState)}>Save</Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}