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
import type { RosterEntry } from "@workspace/store/types/pod.ts";

type RemoveMemberButtonProps = {
  podName: string;
  member: RosterEntry;
  onRemoveMember: () => void;
};

export function RemoveMemberButton({ podName, member, onRemoveMember }: RemoveMemberButtonProps) {
  const [open, setOpen] = React.useState(false);

  const handleRemove = () => {
    onRemoveMember();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Remove
        </Button>
      </DialogTrigger>
      <DialogContent className="p-4 max-w-3xl m-auto bg-secondary text-foreground">
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-semibold">
              {member.profile?.display_name ?? member.handle ?? "Unknown member"}
            </span>{" "}
            from <span className="font-mono">{podName}</span>? This action
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
