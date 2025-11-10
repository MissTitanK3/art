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
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FIPS_TO_POSTAL } from "@workspace/ui/lib/constants/states";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";

const POSTAL_TO_FIPS = Object.fromEntries(
  Object.entries(FIPS_TO_POSTAL).map(([fips, postal]) => [postal, fips]),
);

type DispatchLocationUpdaterProps = {
  submission: DispatchSubmission;
  onUpdate: (patch: Partial<DispatchSubmission>) => void;
};

export default function DispatchLocationUpdater({
  submission,
  onUpdate,
}: DispatchLocationUpdaterProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(submission?.location_label ?? "");
  // store as FIPS internally, show as postal
  const [stateFips, setStateFips] = useState(
    submission?.state && POSTAL_TO_FIPS[submission.state]
      ? POSTAL_TO_FIPS[submission.state]
      : "",
  );

  useEffect(() => {
    setLabel(submission.location_label ?? "");
    setStateFips(
      submission.state && POSTAL_TO_FIPS[submission.state]
        ? POSTAL_TO_FIPS[submission.state]
        : "",
    );
  }, [submission.location_label, submission.state]);

  const saveLocation = () => {
    const postal = stateFips ? FIPS_TO_POSTAL[stateFips] : undefined;
    onUpdate({
      location_label: label.trim() || undefined,
      state: postal, // still save as 2-letter postal code in the store for now
    });
    toast.success("Location updated");
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="font-medium">Location:</p>
        <p>
          {submission.location_label ?? "Unknown"}{" "}
          {submission.state && (
            <span className="text-muted-foreground ml-2">
              {submission.state}
            </span>
          )}
        </p>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Edit Location
        </Button>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="p-4 max-w-3xl m-auto bg-card text-card-foreground">
          <DrawerHeader>
            <DrawerTitle>Edit Location</DrawerTitle>
            <DrawerDescription>
              Update the label and state code for this dispatch.
            </DrawerDescription>
          </DrawerHeader>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Location Label</p>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Mission District, SF"
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">State</p>
              <Select
                value={stateFips}
                onValueChange={(val) => setStateFips(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FIPS_TO_POSTAL)
                    .sort(([, a], [, b]) => a.localeCompare(b))
                    .map(([fips, postal]) => (
                      <SelectItem key={fips} value={fips}>
                        {postal}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={saveLocation}>Save</Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
