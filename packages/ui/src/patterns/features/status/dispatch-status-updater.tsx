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
import { Badge } from "@workspace/ui/primitives/badge";
import { Input } from "@workspace/ui/primitives/input";
import { useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { STATUS_META } from "@workspace/ui/lib/constants/dispatch";
import { toast } from "sonner";
import type { DispatchStatus } from "@workspace/store/types/dispatch";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";

type DispatchStatusUpdaterProps = {
  submission: DispatchSubmission;
  onUpdate: (patch: Partial<DispatchSubmission>) => void;
};

export default function DispatchStatusUpdater({
  submission,
  onUpdate,
}: DispatchStatusUpdaterProps) {
  const [open, setOpen] = useState(false);
  const [locationLabel, setLocationLabel] = useState(
    submission.location_label ?? ""
  );

  useEffect(() => {
    setLocationLabel(submission.location_label ?? "");
  }, [submission.location_label]);

  const currentMeta = STATUS_META[submission.status] ?? {
    label: submission.status,
    color: "bg-gray-500",
  };

  const handleStatusChange = (status: DispatchStatus) => {
    onUpdate({ status, location_label: locationLabel });
    toast.success("Status updated");
    setOpen(false);
  };

  const handleSaveLocation = () => {
    onUpdate({ location_label: locationLabel });
    toast.success("Location updated");
    setOpen(false);
  };

  return (
    <>
      <div className="flex justify-between gap-2">
        <Badge className={cn("!text-white", currentMeta.color, "shadow-sm")}>
          {currentMeta.label}
        </Badge>

        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Update
        </Button>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="p-4 max-w-3xl m-auto bg-card text-card-foreground">
          <DrawerHeader>
            <DrawerTitle>Update Dispatch Status</DrawerTitle>
            <DrawerDescription>
              Choose a new status for this dispatch and update the location
              label.
            </DrawerDescription>
          </DrawerHeader>

          <div>
            <Input
              value={locationLabel}
              className="mb-4"
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="Mission District, SF"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {(
              Object.entries(STATUS_META) as [
                DispatchStatus,
                { label: string; color: string },
              ][]
            ).map(([value, meta]) => {
              const isCurrent = value === submission.status;
              return (
                <Button
                  key={value}
                  variant={isCurrent ? "default" : "outline"}
                  className={cn(
                    "justify-start",
                    isCurrent
                      ? `${meta.color} !text-white`
                      : "text-foreground hover:bg-muted"
                  )}
                  onClick={() => handleStatusChange(value)}
                >
                  {meta.label}
                </Button>
              );
            })}
          </div>

          <DrawerFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLocation}>Save location</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
