"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@workspace/ui/primitives/drawer";
import { Button } from "@workspace/ui/primitives/button";
import { Input } from "@workspace/ui/primitives/input";
import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner"; // ✅ toast import
import { Alert, AlertDescription } from "@workspace/ui/primitives/alert";
import { Shield } from "lucide-react";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import type { RosterEntry } from "@workspace/store/types/pod.ts";
import { useProfileStore } from "@workspace/store/useProfileStore";

type AssignmentEntry = Partial<RosterEntry> & {
  volunteer?: {
    id?: string;
    user_id?: string | null;
    profile_id?: string | null;
    display_name?: string;
    contact_signal?: string;
  };
};

type DispatchSignalLinkUpdaterProps = {
  submission: DispatchSubmission;
  onUpdate: (patch: Partial<DispatchSubmission>) => void;
};

export default function DispatchSignalLinkUpdater({
  submission,
  onUpdate,
}: DispatchSignalLinkUpdaterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(submission?.signal_link ?? "");
  const profile = useProfileStore((s) => s.profile);
  const assignedVolunteers = (submission.assigned_volunteers ??
    []) as AssignmentEntry[];

  const normalizeId = (value?: string | null) =>
    typeof value === "string" ? value.toLowerCase() : null;

  const viewerProfileId = profile?.id ? profile.id.toLowerCase() : null;
  const viewerUserId = profile?.user_id ? profile.user_id.toLowerCase() : null;

  const matchesProfile = (candidate?: string | null) =>
    Boolean(
      viewerProfileId && candidate && normalizeId(candidate) === viewerProfileId
    );

  const matchesUser = (candidate?: string | null) =>
    Boolean(
      viewerUserId && candidate && normalizeId(candidate) === viewerUserId
    );

  const isAssignedToDispatch = assignedVolunteers.some((vol) => {
    const profileRef = vol.profile as
      | { id?: string; user_id?: string }
      | undefined;
    const candidateProfileValues = [
      vol.id,
      (vol as { profile_id?: string | null }).profile_id,
      profileRef?.id,
      vol.volunteer?.profile_id ?? null,
    ];

    if (candidateProfileValues.some((value) => matchesProfile(value))) {
      return true;
    }

    const candidateUserValues = [
      profileRef?.user_id ?? null,
      (vol as { user_id?: string | null }).user_id ?? null,
      vol.volunteer?.user_id ?? null,
    ];

    return candidateUserValues.some((value) => matchesUser(value));
  });

  const canViewPrivateLink = Boolean(
    isAssignedToDispatch && submission.signal_link
  );

  useEffect(() => {
    setDraft(submission.signal_link ?? "");
  }, [submission.signal_link]);

  const saveLink = () => {
    onUpdate({ signal_link: draft.trim() || undefined });
    toast.success("Signal link updated");
    setOpen(false);
  };

  const copyLink = async () => {
    if (!submission.signal_link) {
      return;
    }
    if (!isAssignedToDispatch) {
      toast.error(
        "You need to be assigned to this dispatch to copy the private link."
      );
      return;
    }
    await navigator.clipboard.writeText(submission.signal_link);
    toast.success("Signal link copied to clipboard ✅");
  };

  return (
    <div className="space-y-2">
      <Alert variant="default" className="bg-amber-900 border-amber-100">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Private link security:</strong> Share only with confirmed participants.
          This link grants operational access to coordination channels.{" "}
          <a
            href="/docs/signal-security"
            className="underline hover:text-amber-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            Security guidelines →
          </a>
        </AlertDescription>
      </Alert>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <p className="font-medium">Private Dispatch Signal Link</p>
        {submission.signal_link ? (
          canViewPrivateLink ? (
            <div className="flex items-center gap-2">
              <a
                href={submission.signal_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-xs underline break-all"
              >
                {submission.signal_link}
              </a>
              <Button
                size="icon"
                variant="ghost"
                onClick={copyLink}
                title="Copy private dispatch link"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              You need to be assigned to this dispatch to view the private
              Signal link.
            </p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">No private link set.</p>
        )}
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          {submission.signal_link ? "Edit Link" : "Add Link"}
        </Button>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="p-4 max-w-3xl m-auto bg-card text-card-foreground">
          <DrawerHeader>
            <DrawerTitle>
              {submission.signal_link
                ? "Edit Private Dispatch Link"
                : "Add Private Dispatch Link"}
            </DrawerTitle>
            <DrawerDescription>
              Provide the private Signal group link for coordinators/assigned
              volunteers.
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
