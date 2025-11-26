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
} from "@workspace/ui/components/drawer";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";

import type { Org } from "../types";

type OrgEditSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  org: Org;
  onSubmit?: (payload: { name: string; description?: string | null }) => Promise<void> | void;
};

export function OrgEditSheet({
  open,
  onOpenChange,
  org,
  onSubmit,
}: OrgEditSheetProps) {
  const [name, setName] = useState(org.name);
  const [description, setDescription] = useState(org.description ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(org.name);
      setDescription(org.description ?? "");
    }
  }, [open, org.description, org.name]);

  const handleSave = async () => {
    if (!onSubmit) return onOpenChange(false);
    if (!name.trim()) {
      toast.error("Organization name is required");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || null });
      toast.success("Organization updated");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to update organization");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="bg-card text-card-foreground sm:max-w-xl sm:ml-auto h-[85vh] flex flex-col m-auto">
        <DrawerHeader>
          <DrawerTitle>Edit organization</DrawerTitle>
          <DrawerDescription>
            Update the organization name and description. Changes apply to all
            members immediately.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3">
          <div className="grid gap-1">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Org name"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="org-description">Description</Label>
            <Textarea
              id="org-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              rows={4}
            />
          </div>
        </div>
        <DrawerFooter className="flex flex-row justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
