"use client";

import { useEffect, useMemo, useState } from "react";
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

import type { DispatchShift } from "@workspace/store/useDispatchStore";
import type { Pod, RosterEntry } from "@workspace/store/types/pod.ts";
import { DateTimePicker } from "@workspace/ui/components/DateTimePicker";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pods: Pod[];
  roster: RosterEntry[];
  onSubmit: (shift: Omit<DispatchShift, "id">) => void;
};

export default function AddShiftDrawer({ open, onOpenChange, pods, roster, onSubmit }: Props) {
  const [podId, setPodId] = useState<string | undefined>(undefined);
  const [volunteerId, setVolunteerId] = useState("");
  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerMode, setVolunteerMode] = useState<"none" | "roster" | "custom">("none");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [notes, setNotes] = useState("");

  const availableVolunteers = useMemo(() => {
    if (!podId) {
      return roster;
    }

    const selectedPod = pods.find((pod) => pod.id === podId);
    if (!selectedPod || selectedPod.team.length === 0) {
      return roster;
    }

    const podMemberIds = new Set(selectedPod.team.map((member) => member.id));
    const filtered = roster.filter((member) => podMemberIds.has(member.id));

    return filtered.length > 0 ? filtered : roster;
  }, [podId, pods, roster]);

  const volunteerSelectValue = useMemo(() => {
    if (volunteerMode === "custom") {
      return "__custom__";
    }

    if (volunteerMode === "roster" && volunteerId) {
      return availableVolunteers.some((member) => member.id === volunteerId) ? volunteerId : "__none__";
    }

    return "__none__";
  }, [availableVolunteers, volunteerId, volunteerMode]);

  useEffect(() => {
    if (volunteerMode === "roster" && volunteerId) {
      const stillAvailable = availableVolunteers.some((member) => member.id === volunteerId);
      if (!stillAvailable) {
        setVolunteerMode("none");
        setVolunteerId("");
        setVolunteerName("");
      }
    }
  }, [availableVolunteers, volunteerId, volunteerMode]);

  const handleSubmit = () => {
    if (!podId || !startsAt || !endsAt) {
      toast.error("Pod, start, and end time are required.");
      return;
    }

    if (volunteerMode === "custom" && !volunteerName.trim()) {
      toast.error("Volunteer name is required for custom volunteers.");
      return;
    }

    const trimmedVolunteerId = volunteerId.trim();
    const trimmedVolunteerName = volunteerName.trim();

    onSubmit({
      podId,
      volunteerId:
        volunteerMode === "roster"
          ? volunteerId
          : trimmedVolunteerId
            ? trimmedVolunteerId
            : undefined,
      volunteerName: volunteerMode === "custom" ? trimmedVolunteerName : undefined,
      startsAt,
      endsAt,
      notes,
    });

    toast.success("Shift added ✅");
    onOpenChange(false);

    // reset form
    setPodId(undefined);
    setVolunteerId("");
    setVolunteerName("");
    setVolunteerMode("none");
    setStartsAt("");
    setEndsAt("");
    setNotes("");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-4 max-w-3xl m-auto bg-card text-card-foreground">
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

          {/* Volunteer */}
          <div className="space-y-1">
            <Label>Volunteer (optional)</Label>
            <Select
              value={volunteerSelectValue}
              onValueChange={(value) => {
                if (value === "__none__") {
                  setVolunteerMode("none");
                  setVolunteerId("");
                  setVolunteerName("");
                  return;
                }
                if (value === "__custom__") {
                  setVolunteerMode("custom");
                  setVolunteerId("");
                  return;
                }
                setVolunteerMode("roster");
                setVolunteerId(value);
                setVolunteerName("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select volunteer or add new" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto">
                <SelectItem value="__none__">No volunteer assigned</SelectItem>
                <SelectItem value="__custom__">Unlisted volunteer</SelectItem>
                {availableVolunteers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.profile.display_name} ({member.handle})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {volunteerMode === "custom" ? (
              <div className="mt-3 space-y-2 rounded-md border border-dashed border-border bg-background/60 p-3">
                <div className="space-y-1">
                  <Label htmlFor="custom-volunteer-name">Volunteer name</Label>
                  <Input
                    id="custom-volunteer-name"
                    value={volunteerName}
                    onChange={(e) => setVolunteerName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="custom-volunteer-id">Volunteer identifier (optional)</Label>
                  <Input
                    id="custom-volunteer-id"
                    value={volunteerId}
                    onChange={(e) => setVolunteerId(e.target.value)}
                    placeholder="guest-001"
                  />
                </div>
              </div>
            ) : null}
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
