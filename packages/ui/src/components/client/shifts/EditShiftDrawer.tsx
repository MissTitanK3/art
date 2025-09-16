// apps/region-template/components/client/shifts/EditShiftDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@workspace/ui/components/drawer";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";
import { toast } from "sonner";

import {
  useDispatchRosterStore,
  DispatchShift,
} from "@workspace/store/dispatchRosterStore";
import { usePodsStore } from "@workspace/store/podStore";
import { DateTimePicker } from "@workspace/ui/components/DateTimePicker";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: DispatchShift;
};

export default function EditShiftDrawer({ open, onOpenChange, shift }: Props) {
  const updateShift = useDispatchRosterStore((s) => s.updateShift);
  const pods = usePodsStore((s) => s.pods);

  const [podId, setPodId] = useState<string | undefined>(shift.podId);
  const [volunteerId, setVolunteerId] = useState(shift.volunteerId ?? "");
  const [startsAt, setStartsAt] = useState(shift.startsAt);
  const [endsAt, setEndsAt] = useState(shift.endsAt);
  const [notes, setNotes] = useState(shift.notes ?? "");

  // Reset state when drawer opens
  useEffect(() => {
    if (open) {
      setPodId(shift.podId);
      setVolunteerId(shift.volunteerId ?? "");
      setStartsAt(shift.startsAt);
      setEndsAt(shift.endsAt);
      setNotes(shift.notes ?? "");
    }
  }, [open, shift]);

  const handleSave = () => {
    if (!podId || !startsAt || !endsAt) {
      toast.error("Pod, start, and end time are required.");
      return;
    }

    updateShift(shift.id, {
      podId,
      volunteerId: volunteerId || undefined,
      startsAt,
      endsAt,
      notes,
    });

    toast.success("Shift updated ✅");
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit Shift</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-4 overflow-auto">
          {/* Pod Selector */}
          <div className="space-y-1">
            <Label>Pod</Label>
            <Select value={podId} onValueChange={(v) => setPodId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select pod" />
              </SelectTrigger>
              <SelectContent>
                {pods.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Volunteer ID */}
          <div className="space-y-1">
            <Label>Volunteer ID (optional)</Label>
            <Input
              value={volunteerId}
              onChange={(e) => setVolunteerId(e.target.value)}
              placeholder="vol-xxx"
            />
          </div>

          {/* Start / End */}
          <div className="space-y-1">
            <DateTimePicker
              label="Starts At"
              value={startsAt}
              onChange={setStartsAt}
            />
          </div>
          <div className="space-y-1">
            <DateTimePicker
              label="Ends At"
              value={endsAt}
              onChange={setEndsAt}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label>Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>
        </div>

        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
