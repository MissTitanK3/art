"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { usePodsStore } from "@workspace/store/podStore";
import { RosterEntry } from "@workspace/store/types/pod.ts";

export function RemoveMemberButton({
  podId,
  member,
}: {
  podId: string;
  member: RosterEntry;
}) {
  const { pods, updatePod } = usePodsStore();
  const pod = pods.find((p) => p.id === podId);
  const [open, setOpen] = React.useState(false);

  if (!pod) return null;

  const handleRemove = () => {
    updatePod(pod.id, {
      team: pod.team.filter((r) => r.id !== member.id),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Remove
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-semibold">
              {member.volunteer.display_name}
            </span>{" "}
            from <span className="font-mono">{pod.name}</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRemove}>
            Remove
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
