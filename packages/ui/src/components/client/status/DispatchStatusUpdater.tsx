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
import { Badge } from "@workspace/ui/components/badge";
import { useDispatchStore } from "@workspace/store/dispatchStore";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { STATUS_META } from "@workspace/ui/lib/constants/dispatch";
import { toast } from "sonner";
import { Input } from "@workspace/ui/components/input";
import { DispatchStatus } from "@workspace/store/types/dispatch.ts";

export default function DispatchStatusUpdater({ id }: { id: string }) {
  const submission = useDispatchStore((s) =>
    s.submissions.find((sub) => sub.id === id)
  );
  const updateSubmission = useDispatchStore((s) => s.updateSubmission);

  const [open, setOpen] = useState(false);

  if (!submission) return null;

  const currentMeta = STATUS_META[submission.status] || {
    label: submission.status,
    color: "bg-gray-500",
  };

  return (
    <>
      <div className="flex justify-between gap-2">
        <Badge
          className={cn(
            "!text-white", // force white text
            currentMeta.color, // custom background
            "shadow-sm"
          )}
        >
          {currentMeta.label}
        </Badge>

        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Update
        </Button>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="p-4">
          <DrawerHeader>
            <DrawerTitle>Update Dispatch Status</DrawerTitle>
            <DrawerDescription>
              Choose a new status for this dispatch.
            </DrawerDescription>
          </DrawerHeader>

          <div>
            <Input
              value={submission.location_label || ""}
              className="mb-4"
              onChange={(e) =>
                updateSubmission(id, { location_label: e.target.value })
              }
              placeholder="Mission District, SF"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {(Object.entries(STATUS_META) as [DispatchStatus, { label: string; color: string }][]).map(
              ([value, meta]) => {
                const isCurrent = value === submission.status;

                return (
                  <Button
                    key={value}
                    variant={isCurrent ? "default" : "outline"}
                    className={cn(
                      "justify-start",
                      isCurrent
                        ? `${meta.color} !text-white` // current status: solid bg + white text
                        : "text-foreground hover:bg-muted"
                    )}
                    onClick={() => {
                      updateSubmission(id, { status: value });
                      toast.success("Status updated");
                      setOpen(false);
                    }}
                  >
                    {meta.label}
                  </Button>
                );
              }
            )}
          </div>

          <DrawerFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
