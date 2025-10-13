"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@workspace/ui/components/drawer";
import { Button } from "@workspace/ui/components/button";
import {
  STATUS_FLOW,
  STATUS_INFO,
  STATUS_COLOR_CLASSES,
  DispatchPersonnelStatus,
} from "@workspace/ui/lib/constants/dispatch";
import { useState } from "react";

export function VolunteerStatusUpdater({
  current,
  onChange,
}: {
  current: DispatchPersonnelStatus;
  onChange: (status: DispatchPersonnelStatus) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Update Status
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="p-4 max-w-3xl m-auto bg-secondary text-foreground">
          <DrawerHeader>
            <DrawerTitle>Update Volunteer Status</DrawerTitle>
          </DrawerHeader>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {STATUS_FLOW.map((status) => (
              <Button
                key={status}
                onClick={() => {
                  onChange(status);
                  setOpen(false);
                }}
                className={STATUS_COLOR_CLASSES[status]}
              >
                {STATUS_INFO[status].label}
              </Button>
            ))}
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
