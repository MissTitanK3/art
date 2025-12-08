"use client";
import { Button } from "@workspace/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/primitives/dialog";
import type { AdvocacyGroup } from "@workspace/store/types/advocacy";

interface AdvocacyDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleteTarget: AdvocacyGroup | null;
  deleting: boolean;
  onConfirm: () => void;
}

export function AdvocacyDeleteDialog({
  open,
  onOpenChange,
  deleteTarget,
  deleting,
  onConfirm,
}: AdvocacyDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Remove Organization</DialogTitle>
          <DialogDescription>
            This will permanently remove &quot;{deleteTarget?.name}&quot; from the Advocacy
            Network. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 text-sm text-muted-foreground">
          {deleteTarget?.jurisdiction ? (
            <div>Jurisdiction: {deleteTarget.jurisdiction}</div>
          ) : null}
          {deleteTarget?.contact_emails?.length ? (
            <div>Emails: {(deleteTarget.contact_emails ?? []).join(", ")}</div>
          ) : null}
          {deleteTarget?.contact_phones?.length ? (
            <div>Phones: {(deleteTarget.contact_phones ?? []).join(", ")}</div>
          ) : null}
          {deleteTarget?.contact_faxes?.length ? (
            <div>Faxes: {(deleteTarget.contact_faxes ?? []).join(", ")}</div>
          ) : null}
          {deleteTarget?.contact_signal ? (
            <div>Signal: {deleteTarget.contact_signal}</div>
          ) : null}
        </div>
        <DialogFooter>
          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={deleting}
            >
              {deleting ? "Removing…" : "Remove"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
