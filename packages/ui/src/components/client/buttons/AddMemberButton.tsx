"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@workspace/ui/components/select";

import {
  makeProfile,
  makeRosterEntry,
} from "@workspace/store/utils/generator.ts";
import type { Pod, RosterEntry } from "@workspace/store/types/pod.ts";

type AddMemberButtonProps = {
  pod: Pod;
  activeRoster: RosterEntry[];
  onAddMember: (entry: RosterEntry) => void;
};

export function AddMemberButton({
  pod,
  activeRoster,
  onAddMember,
}: AddMemberButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"registered" | "guest">("registered");

  // form state
  const [guestName, setGuestName] = React.useState("");
  const [selectedRosterId, setSelectedRosterId] = React.useState<string | null>(
    null,
  );
  const [role, setRole] = React.useState<"lead" | "member" | "trainee">(
    "member",
  );

  // Load eligible profiles (pod_leader and higher) from server route when dialog opens
  const [loadingOptions, setLoadingOptions] = React.useState(false);
  const [rosterOptions, setRosterOptions] = React.useState<
    RosterEntry[] | null
  >(null);

  // Convert a plain profile into a synthetic RosterEntry for selection
  const profileToRosterEntry = React.useCallback(
    (profile: any): RosterEntry => ({
      id: String(profile.id), // synthetic id for selection (we generate a new one on add)
      profile,
      role: "member",
      status: "active",
      langs: [],
      skills: [],
      certs: [],
      notes: undefined,
      handle: profile.display_name ?? "",
      joinedAt: new Date().toISOString(),
      lastShiftAt: undefined,
      signal_handle: profile.contact_signal ?? undefined,
    }),
    [],
  );

  React.useEffect(() => {
    let cancelled = false;
    async function loadEligible() {
      if (!open || mode !== "registered") return;
      // Avoid refetch if already loaded
      if (rosterOptions && rosterOptions.length > 0) return;
      setLoadingOptions(true);
      try {
        // Try server route (filters to pod_leader+ and authorizes podAdmins)
        const res = await fetch("/api/dispatch/profiles", {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          const profiles = Array.isArray(json?.profiles) ? json.profiles : [];
          const synthetic = profiles.map(profileToRosterEntry);
          // Merge with activeRoster and de-dup by profile.id (prefer activeRoster entries when present)
          const mapByProfile = new Map<string, RosterEntry>();
          for (const r of activeRoster) {
            const pid = r.profile?.id ? String(r.profile.id) : undefined;
            if (pid) mapByProfile.set(pid, r);
          }
          for (const s of synthetic) {
            const pid = s.profile?.id ? String(s.profile.id) : undefined;
            if (pid && !mapByProfile.has(pid)) mapByProfile.set(pid, s);
          }
          const merged = Array.from(mapByProfile.values()).sort((a, b) =>
            (a.profile?.display_name ?? "").localeCompare(
              b.profile?.display_name ?? "",
            ),
          );
          if (!cancelled) setRosterOptions(merged);
          return;
        }
      } catch {
        // ignore and fall back below
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }

      // Fallback: use provided activeRoster
      if (!cancelled) setRosterOptions(activeRoster);
    }
    loadEligible();
    return () => {
      cancelled = true;
    };
  }, [open, mode, activeRoster, rosterOptions, profileToRosterEntry]);

  if (!pod) return null;

  const handleAdd = () => {
    const newId = `r-${Date.now()}`;

    let entry: RosterEntry;
    if (mode === "guest") {
      // build guest profile + roster entry
      const profile = makeProfile(
        `guest-${newId}`,
        guestName || "Guest Volunteer",
        [],
        "Unregistered",
        { registered: false },
      );
      entry = makeRosterEntry(newId, profile, role, "active", [], [], []);
    } else {
      const list = rosterOptions ?? activeRoster;
      const found = list.find((r) => r.id === selectedRosterId);
      if (!found) {
        alert("Please select a registered roster entry");
        return;
      }
      // clone roster entry with new role/status for this pod
      entry = {
        ...found,
        id: newId,
        role,
        status: "active",
        // Ensure profile_id is present for proper Registered detection and persistence
        profile_id:
          found.profile_id ??
          (found.profile?.id ? String(found.profile.id) : undefined),
      };
    }

    onAddMember(entry);
    setOpen(false);
    setGuestName("");
    setSelectedRosterId(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Member</Button>
      </DialogTrigger>
      <DialogContent className="p-4 max-w-3xl m-auto bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Add Member to {pod.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode select */}
          <Label>Mode</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="registered">Registered User</SelectItem>
              <SelectItem value="guest">Guest (no account)</SelectItem>
            </SelectContent>
          </Select>

          {/* Different inputs per mode */}
          {mode === "guest" ? (
            <>
              <Label>Guest Name</Label>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter guest name"
              />
            </>
          ) : (
            <>
              <Label>User Lookup</Label>
              <Select
                value={selectedRosterId ?? ""}
                onValueChange={(v) => setSelectedRosterId(v)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingOptions
                        ? "Loading users..."
                        : "Select a roster member"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(rosterOptions ?? activeRoster).map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.profile?.display_name ?? r.handle ?? "Unknown"} (
                      {r.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {/* Role select */}
          <Label>Pod Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="trainee">Trainee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
