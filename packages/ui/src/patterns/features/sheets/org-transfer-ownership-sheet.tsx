"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/primitives/drawer";
import { Button } from "@workspace/ui/primitives/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Label } from "@workspace/ui/primitives/label";

import { OrgMember } from "../orgs";

type OrgTransferOwnershipSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: OrgMember[];
  onTransfer?: (memberId: string) => Promise<void> | void;
};

export function OrgTransferOwnershipSheet({
  open,
  onOpenChange,
  members,
  onTransfer,
}: OrgTransferOwnershipSheetProps) {
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedMember("");
      setSaving(false);
    }
  }, [open]);

  const handleTransfer = async () => {
    if (!selectedMember) {
      toast.error("Select a member to transfer ownership");
      return;
    }
    if (!onTransfer) return onOpenChange(false);
    setSaving(true);
    try {
      await onTransfer(selectedMember);
      toast.success("Ownership transferred");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to transfer ownership");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="bg-card text-card-foreground sm:max-w-md sm:ml-auto h-[50vh] flex flex-col m-auto">
        <DrawerHeader>
          <DrawerTitle>Transfer ownership</DrawerTitle>
          <DrawerDescription>
            Choose a member to receive ownership. This grants full management
            rights for pods and members.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3">
          <div className="grid gap-1">
            <Label>New owner</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No eligible members
                  </SelectItem>
                ) : (
                  members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex flex-col">
                        <span>{member.displayName}</span>
                        <span className="text-xs text-muted-foreground">
                          Current role: {member.role}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DrawerFooter className="flex flex-row justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={saving || members.length === 0}
          >
            {saving ? "Transferring..." : "Transfer"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
