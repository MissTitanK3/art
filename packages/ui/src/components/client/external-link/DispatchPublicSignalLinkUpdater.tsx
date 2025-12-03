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
import { useEffect, useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";

type Props = {
  submission: DispatchSubmission;
  onUpdate: (patch: Partial<DispatchSubmission>) => void;
};

export default function DispatchPublicSignalLinkUpdater({
  submission,
  onUpdate,
}: Props) {
  const [open, setOpen] = useState(false);

  const publicLink = submission.public_signal_link ?? "";
  const [draft, setDraft] = useState(publicLink);

  useEffect(() => {
    setDraft(submission.public_signal_link ?? "");
  }, [submission.public_signal_link]);

  const saveLink = () => {
    onUpdate({ public_signal_link: draft.trim() || undefined });
    toast.success("Public engagement link updated");
    setOpen(false);
  };

  const copyLink = async () => {
    if (publicLink) {
      await navigator.clipboard.writeText(publicLink);
      toast.success("Public engagement link copied ✅");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <p className="font-medium">Public Engagement Signal Link</p>
        {publicLink ? (
          <div className="flex items-center gap-2">
            <a
              href={publicLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-xs underline break-all"
            >
              {publicLink}
            </a>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyLink}
              title="Copy public link"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No public engagement link set.
          </p>
        )}
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          {publicLink ? "Edit Link" : "Add Link"}
        </Button>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="p-4 max-w-3xl m-auto bg-card text-card-foreground">
          <DrawerHeader>
            <DrawerTitle>
              {publicLink
                ? "Edit Public Engagement Link"
                : "Add Public Engagement Link"}
            </DrawerTitle>
            <DrawerDescription>
              Provide a public Signal link for outreach (unvetted chat).
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
