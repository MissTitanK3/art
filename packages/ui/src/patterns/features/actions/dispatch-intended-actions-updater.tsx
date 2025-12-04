"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/primitives/drawer";
import { Button } from "@workspace/ui/primitives/button";
import { Checkbox } from "@workspace/ui/primitives/checkbox";
import { Badge } from "@workspace/ui/primitives/badge";
import { useEffect, useState } from "react";
import { ACTION_PRESETS_GROUPED } from "@workspace/ui/lib/constants/dispatch";
import { toast } from "sonner";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";

type DispatchIntendedActionsUpdaterProps = {
  submission: DispatchSubmission;
  onUpdate: (patch: Partial<DispatchSubmission>) => void;
};

export default function DispatchIntendedActionsUpdater({
  submission,
  onUpdate,
}: DispatchIntendedActionsUpdaterProps) {
  const [open, setOpen] = useState<"manual" | "preset" | null>(null);
  const [selected, setSelected] = useState<string[]>(
    submission.intended_actions ?? []
  );

  useEffect(() => {
    setSelected(submission.intended_actions ?? []);
  }, [submission.intended_actions]);

  const toggleGroup = (groupActions: string[]) => {
    const hasAll = groupActions.every((a) => selected.includes(a));
    setSelected((prev) =>
      hasAll
        ? prev.filter((a) => !groupActions.includes(a))
        : [...prev, ...groupActions.filter((a) => !prev.includes(a))]
    );
  };

  const saveActions = () => {
    onUpdate({ intended_actions: selected });
    toast.success("Intended actions updated");
    setOpen(null);
  };

  return (
    <>
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

      <Drawer open={open === "manual"} onOpenChange={() => setOpen(null)}>
        <DrawerContent className="p-4 max-w-3xl m-auto bg-card text-card-foreground">
          <DrawerHeader>
            <DrawerTitle>Edit Intended Actions</DrawerTitle>
            <DrawerDescription>
              Manually select individual actions.
            </DrawerDescription>
          </DrawerHeader>

          <div className="max-h-[50vh] overflow-y-auto mt-4 space-y-2">
            {Object.values(ACTION_PRESETS_GROUPED)
              .flat()
              .map((action) => (
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

      <Drawer open={open === "preset"} onOpenChange={() => setOpen(null)}>
        <DrawerContent className="p-4 max-w-3xl m-auto bg-card text-card-foreground">
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
