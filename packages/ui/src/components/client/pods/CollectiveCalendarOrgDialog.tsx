"use client";

import { useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { toast } from "sonner";
import { CalendarOrgSummary } from "./CollectiveCalendarShared";

type CollectiveCalendarOrgDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOrg: CalendarOrgSummary | null;
  onCreateOrg?: (name: string, description: string) => Promise<void>;
  onUpdateOrg?: (
    orgId: string,
    name: string,
    description: string,
  ) => Promise<void>;
};

export function CollectiveCalendarOrgDialog({
  open,
  onOpenChange,
  editingOrg,
  onCreateOrg,
  onUpdateOrg,
}: CollectiveCalendarOrgDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editingOrg?.name ?? "");
      setDescription(editingOrg?.description ?? "");
    }
  }, [open, editingOrg]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingOrg) {
        if (onUpdateOrg) {
          await onUpdateOrg(editingOrg.id, name, description);
          toast.success("Organization updated");
        }
      } else {
        if (onCreateOrg) {
          await onCreateOrg(name, description);
          toast.success("Organization created");
        }
      }
      onOpenChange(false);
    } catch (e) {
      toast.error("Failed to save organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingOrg ? "Edit organization" : "New organization"}
          </DialogTitle>
          <DialogDescription>
            {editingOrg
              ? "Modify the details of the organization."
              : "Create a new organization to group pods."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <p className="text-sm font-medium">Name</p>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Organization name"
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <p className="text-sm font-medium">Description</p>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : editingOrg
                ? "Update organization"
                : "Create organization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
