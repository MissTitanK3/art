'use client';

import { RosterEntry } from "@workspace/store/types/pod.ts";
import { useState } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@workspace/ui/components/drawer";

export default function ManageRoleDrawer({
  role,
  submissionId,
  assigned,
  manualAssigned = [],
  onClose,
  onSave,
  allRoster,
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
  allRoster: RosterEntry[];
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
