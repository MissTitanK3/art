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
  // Optional: fetch members for the selected pod from the app's data layer (e.g., DB)
  // If provided, the drawer will request members when a pod is selected and populate the volunteer select.
  getVolunteersForPod?: (podId: string) => Promise<RosterEntry[]>;
};

export default function AddShiftDrawer({ open, onOpenChange, pods, roster, onSubmit, getVolunteersForPod }: Props) {
  const [podId, setPodId] = useState<string | undefined>(undefined);
  // volunteerId will hold the profile.id when selecting from roster, or free-text when in custom mode
  const [volunteerId, setVolunteerId] = useState("");
  // Track the selected roster entry id solely for driving the Select's value
  const [selectedRosterEntryId, setSelectedRosterEntryId] = useState<string>("");
  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerMode, setVolunteerMode] = useState<"none" | "roster" | "custom">("none");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [notes, setNotes] = useState("");
  const [availableVolunteers, setAvailableVolunteers] = useState<RosterEntry[]>(roster);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [podMemberCounts, setPodMemberCounts] = useState<Record<string, number>>({});
  const [loadingPodCounts, setLoadingPodCounts] = useState(false);

  // Determine eligible pods:
  // - If a loader is provided, use per-pod counts gathered from roster_entries.
  // - Otherwise, fall back to any team data attached to pods (if present).
  const eligiblePods = useMemo(() => {
    if (getVolunteersForPod) {
      return pods.filter((p) => (podMemberCounts[p.id] ?? 0) > 0);
    }
    return pods.filter((p) => (p.team?.length ?? 0) > 0);
  }, [getVolunteersForPod, pods, podMemberCounts]);

  // When the drawer opens (and a loader exists), prefetch member counts for all pods
  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      if (!open || !getVolunteersForPod || pods.length === 0) return;
      setLoadingPodCounts(true);
      try {
        const entries = await Promise.all(
          pods.map(async (p) => {
            try {
              const members = await getVolunteersForPod(p.id);
              return [p.id, (members ?? []).length] as const;
            } catch {
              return [p.id, 0] as const;
            }
          }),
        );
        if (!cancelled) {
          const next: Record<string, number> = {};
          for (const [id, count] of entries) next[id] = count;
          setPodMemberCounts(next);
        }
      } finally {
        if (!cancelled) setLoadingPodCounts(false);
      }
    }
    loadCounts();
    return () => {
      cancelled = true;
    };
  }, [open, pods, getVolunteersForPod]);

  // If a selected pod later resolves to no members, clear the selection
  useEffect(() => {
    if (!podId) return;
    if (getVolunteersForPod && (podMemberCounts[podId] ?? 0) === 0) {
      setPodId(undefined);
      setVolunteerMode("none");
      setVolunteerId("");
      setSelectedRosterEntryId("");
      setVolunteerName("");
      setAvailableVolunteers([]);
    }
  }, [getVolunteersForPod, podId, podMemberCounts]);

  // When pod changes, fetch members for that pod (if a loader is provided).
  useEffect(() => {
    let cancelled = false;
    async function loadMembers() {
      // Clear any previous volunteer selection on pod change
      setVolunteerMode("none");
      setVolunteerId("");
      setSelectedRosterEntryId("");
      setVolunteerName("");

      if (!podId) {
        setAvailableVolunteers([]);
        return;
      }
      if (!getVolunteersForPod) {
        // Fallback: derive from provided roster if no loader is given
        const selectedPod = pods.find((p) => p.id === podId);
        if (!selectedPod || selectedPod.team.length === 0) {
          setAvailableVolunteers([]);
          return;
        }
        const podMemberIds = new Set(selectedPod.team.map((m) => m.id));
        const filtered = roster.filter((m) => podMemberIds.has(m.id));
        setAvailableVolunteers(filtered);
        return;
      }
      try {
        setLoadingMembers(true);
        const members = await getVolunteersForPod(podId);
        if (!cancelled) setAvailableVolunteers(members ?? []);
      } catch {
        if (!cancelled) setAvailableVolunteers([]);
      } finally {
        if (!cancelled) setLoadingMembers(false);
      }
    }
    loadMembers();
    return () => {
      cancelled = true;
    };
  }, [podId, getVolunteersForPod, pods, roster]);

  const volunteerSelectValue = useMemo(() => {
    if (volunteerMode === "custom") {
      return "__custom__";
    }

    if (volunteerMode === "roster" && selectedRosterEntryId) {
      // Drive the Select by the chosen roster entry id, independent of volunteerId presence
      return availableVolunteers.some((member) => member.id === selectedRosterEntryId)
        ? selectedRosterEntryId
        : "__none__";
    }

    return "__none__";
  }, [availableVolunteers, selectedRosterEntryId, volunteerMode]);

  useEffect(() => {
    if (volunteerMode === "roster" && selectedRosterEntryId) {
      const stillAvailable = availableVolunteers.some((member) => member.id === selectedRosterEntryId);
      if (!stillAvailable) {
        setVolunteerMode("none");
        setVolunteerId("");
        setSelectedRosterEntryId("");
        setVolunteerName("");
      }
    }
  }, [availableVolunteers, selectedRosterEntryId, volunteerMode]);

  // Removed volunteer autofill by design per request

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
            <Select
              value={podId}
              onValueChange={(v) => setPodId(v)}
              disabled={eligiblePods.length === 0 || loadingPodCounts}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingPodCounts ? "Loading pods..." : eligiblePods.length === 0 ? "No pods with members" : "Select pod"} />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto">
                {eligiblePods.map((p) => (
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
              disabled={!podId || loadingMembers}
              value={volunteerSelectValue}
              onValueChange={(value) => {
                if (value === "__none__") {
                  setVolunteerMode("none");
                  setVolunteerId("");
                  setSelectedRosterEntryId("");
                  setVolunteerName("");
                  return;
                }
                if (value === "__custom__") {
                  setVolunteerMode("custom");
                  setVolunteerId("");
                  setSelectedRosterEntryId("");
                  return;
                }
                // Roster selection: value is roster entry id; store that as volunteerId
                setVolunteerMode("roster");
                setSelectedRosterEntryId(value);
                const member = availableVolunteers.find((m) => m.id === value);
                setVolunteerId(value);
                const display = member?.profile?.display_name || member?.handle || "";
                setVolunteerName(display);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={!podId ? "Select a pod first" : loadingMembers ? "Loading members..." : "Select volunteer or add new"} />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto">
                <SelectItem value="__none__">No volunteer assigned</SelectItem>
                <SelectItem value="__custom__">Unlisted volunteer</SelectItem>
                {availableVolunteers.map((member) => {
                  const display = member?.profile?.display_name || member?.handle || "Unknown";
                  const handle = member?.handle ? ` (${member.handle})` : "";
                  return (
                    <SelectItem key={member.id} value={member.id}>
                      {display}
                      {handle}
                    </SelectItem>
                  );
                })}
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
