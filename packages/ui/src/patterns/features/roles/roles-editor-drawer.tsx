"use client";

import { FIELD_ROLE_OPTIONS } from "@workspace/store/types/roles.ts";
import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/primitives/drawer";
import { Input } from "@workspace/ui/primitives/input";
import { Checkbox } from "@workspace/ui/primitives/checkbox";
import { Button } from "@workspace/ui/primitives/button";
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
  const allFiltered = FIELD_ROLE_OPTIONS.filter((role) =>
    role.toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => a.localeCompare(b));

  const selectedRoles = allFiltered.filter((r) => rolesState[r] !== undefined);
  const unselectedRoles = allFiltered.filter(
    (r) => rolesState[r] === undefined
  );

  const renderRoleRow = (role: string) => (
    <div key={role} className="flex items-center justify-between gap-2 text-sm">
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
          onChange={(e) => updateCount(role, Number(e.target.value))}
          className="w-16 text-center"
        />
      )}
    </div>
  );

  return (
    <Drawer open onOpenChange={onClose}>
      <DrawerContent className="p-4 max-w-3xl m-auto bg-card text-card-foreground">
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
          />
        </div>

        <div className="max-h-[50vh] overflow-y-auto mt-2 space-y-4">
          {allFiltered.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No roles match your search.
            </p>
          ) : (
            <>
              {selectedRoles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Selected
                  </h4>
                  {selectedRoles.map(renderRoleRow)}
                </div>
              )}

              {selectedRoles.length > 0 && unselectedRoles.length > 0 && (
                <hr className="border-muted" />
              )}

              {unselectedRoles.length > 0 && (
                <div className="space-y-2">
                  {selectedRoles.length > 0 && (
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Available
                    </h4>
                  )}
                  {unselectedRoles.map(renderRoleRow)}
                </div>
              )}
            </>
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
