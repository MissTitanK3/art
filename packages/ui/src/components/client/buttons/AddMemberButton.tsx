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
  usePodsStore,
} from "@workspace/store/podStore";
import { RosterEntry } from "@workspace/store/types/pod.ts";
import { Profile } from "@workspace/store/profileStore";

export function AddMemberButton({ id }: { id: string }) {
  const podId = decodeURIComponent(id ?? "");
  const { pods, updatePod, activeProfiles } = usePodsStore();
  const pod = pods.find((p) => p.slug === podId);

  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"registered" | "guest">("registered");

  // form state
  const [guestName, setGuestName] = React.useState("");
  const [selectedProfileId, setSelectedProfileId] = React.useState<string | null>(
    null
  );
  const [role, setRole] = React.useState<"lead" | "member" | "trainee">("member");

  if (!pod) return null;

  const handleAdd = () => {
    const newId = `r-${Date.now()}`;

    let profile: Profile;
    if (mode === "guest") {
      profile = makeProfile(
        `guest-${newId}`,
        guestName || "Guest Volunteer",
        [],
        "Unregistered"
      );
    } else {
      const found = activeProfiles.find((p) => p.id === selectedProfileId);
      if (!found) {
        alert("Please select a registered user");
        return;
      }
      profile = found;
    }

    const entry: RosterEntry = makeRosterEntry(
      newId,
      profile,
      role,
      "active",
      [],
      [],
      []
    );

    updatePod(pod.id, { team: [...pod.team, entry] });
    setOpen(false);
    setGuestName("");
    setSelectedProfileId(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Member</Button>
      </DialogTrigger>
      <DialogContent>
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
                value={selectedProfileId ?? ""}
                onValueChange={(v) => setSelectedProfileId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {activeProfiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.display_name}
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
