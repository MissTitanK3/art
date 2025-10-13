"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@workspace/ui/components/drawer";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";

type DispatchNotesUpdaterProps = {
  submission: DispatchSubmission;
  onUpdate: (patch: Partial<DispatchSubmission>) => void;
};

export default function DispatchNotesUpdater({ submission, onUpdate }: DispatchNotesUpdaterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(submission?.intended_action_notes ?? "");

  useEffect(() => {
    setDraft(submission.intended_action_notes ?? "");
  }, [submission.intended_action_notes]);

  const saveNotes = () => {
    onUpdate({ intended_action_notes: draft });
    toast.success("Notes updated");
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="font-medium">Notes</p>
        {submission.intended_action_notes ? (
          <p className="text-muted-foreground whitespace-pre-wrap">
            {submission.intended_action_notes}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No notes added yet.
          </p>
        )}
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Edit Notes
        </Button>
      </div>


      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="p-4 max-w-3xl m-auto bg-secondary text-foreground">
          <DrawerHeader>
            <DrawerTitle>Edit Notes</DrawerTitle>
            <DrawerDescription>
              Add context or custom instructions for this dispatch.
            </DrawerDescription>
          </DrawerHeader>

          <div className="mt-4">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type notes here..."
              className="min-h-[120px]"
            />
          </div>

          <DrawerFooter>
            <Button onClick={saveNotes}>Save</Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
