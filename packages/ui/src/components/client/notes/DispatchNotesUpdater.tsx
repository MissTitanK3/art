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
import { useDispatchStore } from "@workspace/store/dispatchStore";
import { useState } from "react";
import { toast } from "sonner";

export default function DispatchNotesUpdater({ id }: { id: string }) {
  const submission = useDispatchStore((s) =>
    s.submissions.find((sub) => sub.id === id)
  );
  const updateSubmission = useDispatchStore((s) => s.updateSubmission);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(submission?.intended_action_notes ?? "");

  if (!submission) return null;

  const saveNotes = () => {
    updateSubmission(id, { intended_action_notes: draft });
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
        <DrawerContent className="p-4">
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
