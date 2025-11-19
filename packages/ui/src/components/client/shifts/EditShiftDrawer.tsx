// apps/region-template/components/client/shifts/EditShiftDrawer.tsx
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
  shift: DispatchShift;
  pods: Pod[];
  roster: RosterEntry[];
  onUpdateShift: (id: string, updates: Partial<DispatchShift>) => void;
};

export default function EditShiftDrawer({
  open,
  onOpenChange,
  shift,
  pods,
  roster,
  onUpdateShift,
}: Props) {
  const [podId, setPodId] = useState<string | undefined>(shift.podId);
  const [volunteerId, setVolunteerId] = useState(shift.volunteerId ?? "");
  const [volunteerName, setVolunteerName] = useState(shift.volunteerName ?? "");
  const [volunteerMode, setVolunteerMode] = useState<
    "none" | "roster" | "custom"
  >(() => {
    if (
      shift.volunteerId &&
      roster.some((member) => member.id === shift.volunteerId)
    ) {
      return "roster";
    }
    if (shift.volunteerName) {
      return "custom";
    }
    if (shift.volunteerId) {
      return "custom";
    }
    return "none";
  });
  const [startsAt, setStartsAt] = useState(shift.startsAt);
  const [endsAt, setEndsAt] = useState(shift.endsAt);
  const [notes, setNotes] = useState(shift.notes ?? "");

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
      return availableVolunteers.some((member) => member.id === volunteerId)
        ? volunteerId
        : "__none__";
    }

    return "__none__";
  }, [availableVolunteers, volunteerId, volunteerMode]);

  useEffect(() => {
    if (volunteerMode === "roster" && volunteerId) {
      const stillAvailable = availableVolunteers.some(
        (member) => member.id === volunteerId,
      );
      if (!stillAvailable) {
        setVolunteerMode("none");
        setVolunteerId("");
        setVolunteerName("");
      }
    }
  }, [availableVolunteers, volunteerId, volunteerMode]);

  // Reset state when drawer opens
  useEffect(() => {
    if (open) {
      setPodId(shift.podId);
      setVolunteerId(shift.volunteerId ?? "");
      setVolunteerName(shift.volunteerName ?? "");
      if (
        shift.volunteerId &&
        roster.some((member) => member.id === shift.volunteerId)
      ) {
        setVolunteerMode("roster");
        const member = roster.find((m) => m.id === shift.volunteerId);
        const display =
          member?.profile?.display_name ||
          member?.handle ||
          shift.volunteerName ||
          "";
        setVolunteerName(display);
      } else if (shift.volunteerName) {
        setVolunteerMode("custom");
      } else if (shift.volunteerId) {
        setVolunteerMode("custom");
      } else {
        setVolunteerMode("none");
      }
      setStartsAt(shift.startsAt);
      setEndsAt(shift.endsAt);
      setNotes(shift.notes ?? "");
    }
  }, [open, shift, roster]);

  const handleSave = () => {
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

    onUpdateShift(shift.id, {
      podId,
      volunteerId:
        volunteerMode === "roster"
          ? volunteerId
          : trimmedVolunteerId
            ? trimmedVolunteerId
            : undefined,
      volunteerName:
        volunteerMode === "custom"
          ? trimmedVolunteerName
          : volunteerMode === "roster" && volunteerName
            ? volunteerName
            : undefined,
      startsAt,
      endsAt,
      notes,
    });

    toast.success("Shift updated ✅");
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-4 max-w-3xl m-auto bg-card text-card-foreground z-[1201]">
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
                  if (!shift.volunteerName) {
                    setVolunteerName("");
                  }
                  if (
                    !shift.volunteerId ||
                    roster.some((member) => member.id === shift.volunteerId)
                  ) {
                    setVolunteerId("");
                  }
                  return;
                }
                setVolunteerMode("roster");
                setVolunteerId(value);
                const member = availableVolunteers.find((m) => m.id === value);
                const display =
                  member?.profile?.display_name || member?.handle || "";
                setVolunteerName(display);
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
                  <Label htmlFor="edit-custom-volunteer-name">
                    Volunteer name
                  </Label>
                  <Input
                    id="edit-custom-volunteer-name"
                    value={volunteerName}
                    onChange={(e) => setVolunteerName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-custom-volunteer-id">
                    Volunteer identifier (optional)
                  </Label>
                  <Input
                    id="edit-custom-volunteer-id"
                    value={volunteerId}
                    onChange={(e) => setVolunteerId(e.target.value)}
                    placeholder="guest-001"
                  />
                </div>
              </div>
            ) : null}
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
