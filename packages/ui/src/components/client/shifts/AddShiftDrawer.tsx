"use client";

import { useState } from "react";
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

import { useDispatchRosterStore } from "@workspace/store/dispatchRosterStore";
import { usePodsStore } from "@workspace/store/podStore";
import { DateTimePicker } from "@workspace/ui/components/DateTimePicker";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AddShiftDrawer({ open, onOpenChange }: Props) {
  const addShift = useDispatchRosterStore((s) => s.addShift);
  const pods = usePodsStore((s) => s.pods);

  const [podId, setPodId] = useState<string | undefined>(undefined);
  const [volunteerId, setVolunteerId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!podId || !startsAt || !endsAt) {
      toast.error("Pod, start, and end time are required.");
      return;
    }

    addShift({
      podId,
      volunteerId: volunteerId || undefined,
      startsAt,
      endsAt,
      notes,
    });

    toast.success("Shift added ✅");
    onOpenChange(false);

    // reset form
    setPodId(undefined);
    setVolunteerId("");
    setStartsAt("");
    setEndsAt("");
    setTimezone("America/Los_Angeles");
    setNotes("");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-4 ">
        <DrawerHeader>
          <DrawerTitle>Add New Shift</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4 py-4 overflow-auto h-full">
          {/* Pod Selector */}
          <div className="space-y-1">
            <Label>Pod</Label>
            <Select value={podId} onValueChange={(v) => setPodId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select pod" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto">
                {pods.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Volunteer Id */}
          <div className="space-y-1">
            <Label>Volunteer ID (optional)</Label>
            <Input
              value={volunteerId}
              onChange={(e) => setVolunteerId(e.target.value)}
              placeholder="vol-xxx"
            />
          </div>

          {/* Start / End */}
          <DateTimePicker label="Starts At" value={startsAt} onChange={setStartsAt} />
          <DateTimePicker label="Ends At" value={endsAt} onChange={setEndsAt} />

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
          <Button onClick={handleSubmit}>Save Shift</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
