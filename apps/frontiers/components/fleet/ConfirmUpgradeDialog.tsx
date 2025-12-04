"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/primitives/button";

export function ConfirmUpgradeDialog({
  open,
  onOpenChange,
  cost,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  cost: number;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Confirm Upgrade</DialogTitle>
        </DialogHeader>
        <div className="text-sm space-y-2">
          <div className="text-xs text-muted-foreground">
            Cost: <span className="font-medium">{cost} credits</span>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={onConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
