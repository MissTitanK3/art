"use client";

import { useEffect, useMemo, useState } from "react";
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
import { OrgPod } from "../orgs";

type OrgLinkPodSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePods: OrgPod[];
  onLink?: (podId: string) => Promise<void> | void;
};

export function OrgLinkPodSheet({
  open,
  onOpenChange,
  availablePods,
  onLink,
}: OrgLinkPodSheetProps) {
  const [selectedPod, setSelectedPod] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedPod("");
      setSaving(false);
    }
  }, [open]);

  const options = useMemo(() => {
    return availablePods.map((pod) => ({
      value: pod.id,
      label: pod.name,
      description: pod.area ?? pod.slug ?? undefined,
    }));
  }, [availablePods]);

  const handleLink = async () => {
    if (!selectedPod) {
      toast.error("Choose a pod to link");
      return;
    }
    if (!onLink) return onOpenChange(false);
    setSaving(true);
    try {
      await onLink(selectedPod);
      toast.success("Pod linked");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to link pod");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="bg-card text-card-foreground max-w-2xl mx-auto overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Link pod</DrawerTitle>
          <DrawerDescription>
            Link an existing pod to this organization. Linked pods share access
            to calendars and member permissions.
          </DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-3 py-4 px-4">
          <div className="grid gap-1">
            <Label>Select pod</Label>
            <Select value={selectedPod} onValueChange={setSelectedPod}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a pod" />
              </SelectTrigger>
              <SelectContent>
                {options.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No available pods
                  </SelectItem>
                ) : (
                  options.map((pod) => (
                    <SelectItem key={pod.value} value={pod.value}>
                      <div className="flex flex-col">
                        <span>{pod.label}</span>
                        {pod.description && (
                          <span className="text-xs text-muted-foreground">
                            {pod.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DrawerFooter className="px-4">
          <div className="flex w-full justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLink}
              disabled={saving || options.length === 0}
            >
              {saving ? "Linking..." : "Link pod"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
