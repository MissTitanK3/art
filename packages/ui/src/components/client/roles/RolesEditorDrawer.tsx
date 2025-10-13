'use client';

import { FIELD_ROLE_OPTIONS } from "@workspace/store/types/roles.ts";
import { useState } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@workspace/ui/components/drawer";
import { Input } from "@workspace/ui/components/input";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Button } from "@workspace/ui/components/button";
import { humanize } from "@workspace/ui/lib/utils";

export default function RolesEditorDrawer({
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
      <DrawerContent className="p-4 max-w-3xl m-auto bg-secondary text-foreground">
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