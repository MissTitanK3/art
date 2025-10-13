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
import { Input } from "@workspace/ui/components/input";
import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner"; // ✅ toast import
import type { DispatchSubmission } from "@workspace/store/types/global.ts";

type DispatchSignalLinkUpdaterProps = {
  submission: DispatchSubmission;
  onUpdate: (patch: Partial<DispatchSubmission>) => void;
};

export default function DispatchSignalLinkUpdater({ submission, onUpdate }: DispatchSignalLinkUpdaterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(submission?.signal_link ?? "");

  useEffect(() => {
    setDraft(submission.signal_link ?? "");
  }, [submission.signal_link]);

  const saveLink = () => {
    onUpdate({ signal_link: draft.trim() || undefined });
    toast.success("Signal link updated");
    setOpen(false);
  };

  const copyLink = async () => {
    if (submission.signal_link) {
      await navigator.clipboard.writeText(submission.signal_link);
      toast.success("Signal link copied to clipboard ✅");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="font-medium">Signal Link</p>
        {submission.signal_link ? (
          <div className="flex items-center gap-2">
            <a
              href={submission.signal_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline break-all"
            >
              {submission.signal_link}
            </a>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyLink}
              title="Copy Signal link"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No Signal link set.</p>
        )}
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          {submission.signal_link ? "Edit Link" : "Add Link"}
        </Button>
      </div>


      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="p-4 max-w-3xl m-auto bg-secondary text-foreground">
          <DrawerHeader>
            <DrawerTitle>
              {submission.signal_link ? "Edit Signal Link" : "Add Signal Link"}
            </DrawerTitle>
            <DrawerDescription>
              Provide the Signal group link for this dispatch.
            </DrawerDescription>
          </DrawerHeader>

          <div className="mt-4">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="https://signal.group/#..."
              type="url"
              className="w-full"
            />
          </div>

          <DrawerFooter>
            <Button onClick={saveLink}>Save</Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
