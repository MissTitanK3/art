"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";

type OrgCreateDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (payload: { name: string; description?: string | null }) => Promise<void> | void;
};

export function OrgCreateDrawer({
  open,
  onOpenChange,
  onCreate,
}: OrgCreateDrawerProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setSaving(false);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Organization name is required");
      return;
    }
    if (!onCreate) return onOpenChange(false);
    setSaving(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || null,
      });
      toast.success("Organization created");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to create organization");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="bg-card text-card-foreground sm:max-w-xl sm:ml-auto h-[90vh] flex flex-col m-auto">
        <DrawerHeader>
          <DrawerTitle>Create organization</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="org-create-name">Name</Label>
            <Input
              id="org-create-name"
              placeholder="Neighborhood mutual aid"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org-create-description">Description</Label>
            <Textarea
              id="org-create-description"
              rows={4}
              placeholder="Optional: describe this organization"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DrawerFooter className="flex flex-row justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? "Creating..." : "Create organization"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
