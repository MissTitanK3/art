"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@workspace/ui/components/drawer";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Badge } from "@workspace/ui/components/badge";
import { useDispatchStore } from "@workspace/store/dispatchStore";
import { useState } from "react";
import { ACTION_PRESETS_GROUPED } from "@workspace/ui/lib/constants/dispatch";
import { toast } from "sonner";

export default function DispatchIntendedActionsUpdater({ id }: { id: string }) {
  const submission = useDispatchStore((s) =>
    s.submissions.find((sub) => sub.id === id)
  );
  const updateSubmission = useDispatchStore((s) => s.updateSubmission);

  const [open, setOpen] = useState<"manual" | "preset" | null>(null);
  const [selected, setSelected] = useState<string[]>(
    submission?.intended_actions ?? []
  );

  if (!submission) return null;

  // Toggle all actions in a group
  const toggleGroup = (groupActions: string[]) => {
    const hasAll = groupActions.every((a) => selected.includes(a));
    setSelected((prev) =>
      hasAll
        ? prev.filter((a) => !groupActions.includes(a)) // remove whole group
        : [...prev, ...groupActions.filter((a) => !prev.includes(a))] // add missing
    );
  };

  const saveActions = () => {
    updateSubmission(id, { intended_actions: selected });
    toast.success("Intended actions updated");
    setOpen(null);
  };

  return (
    <>
      {/* Inline selected actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {submission.intended_actions?.length ? (
          <div className="flex flex-wrap gap-2">
            {submission.intended_actions.map((action) => (
              <Badge
                key={action}
                variant="secondary"
                className="text-xs whitespace-normal break-words max-w-full"
              >
                {action}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No actions selected yet.
          </p>
        )}

        <div className="flex gap-2 flex-col">
          <Button size="sm" variant="outline" onClick={() => setOpen("manual")}>
            Edit Actions
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOpen("preset")}>
            Apply Preset
          </Button>
        </div>
      </div>

      {/* Manual select drawer (individual actions) */}
      <Drawer open={open === "manual"} onOpenChange={() => setOpen(null)}>
        <DrawerContent className="p-4">
          <DrawerHeader>
            <DrawerTitle>Edit Intended Actions</DrawerTitle>
            <DrawerDescription>
              Manually select individual actions.
            </DrawerDescription>
          </DrawerHeader>

          <div className="max-h-[50vh] overflow-y-auto mt-4 space-y-2">
            {Object.values(ACTION_PRESETS_GROUPED).flat().map((action) => (
              <label
                key={action}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <Checkbox
                  checked={selected.includes(action)}
                  onCheckedChange={() =>
                    setSelected((prev) =>
                      prev.includes(action)
                        ? prev.filter((a) => a !== action)
                        : [...prev, action]
                    )
                  }
                />
                <span>{action}</span>
              </label>
            ))}
          </div>

          <DrawerFooter>
            <Button onClick={saveActions}>Save</Button>
            <Button variant="secondary" onClick={() => setOpen(null)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Preset select drawer (whole groups) */}
      <Drawer open={open === "preset"} onOpenChange={() => setOpen(null)}>
        <DrawerContent className="p-4">
          <DrawerHeader>
            <DrawerTitle>Apply Preset</DrawerTitle>
            <DrawerDescription>
              Select one or more preset groups of actions.
            </DrawerDescription>
          </DrawerHeader>

          <div className="max-h-[50vh] overflow-y-auto mt-4 space-y-4">
            {Object.entries(ACTION_PRESETS_GROUPED).map(([group, actions]) => {
              const hasAll = actions.every((a) => selected.includes(a));
              return (
                <label
                  key={group}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={hasAll}
                    onCheckedChange={() => toggleGroup(actions)}
                  />
                  <span className="font-medium">{group}</span>
                </label>
              );
            })}
          </div>

          <DrawerFooter>
            <Button onClick={saveActions}>Save</Button>
            <Button variant="secondary" onClick={() => setOpen(null)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
