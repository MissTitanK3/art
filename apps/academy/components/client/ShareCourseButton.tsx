"use client";

import { useCallback } from "react";
import { Button } from "@workspace/ui/primitives/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

type ShareCourseButtonProps = {
  title: string;
};

type ShareNavigator = Navigator & {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data?: ShareData) => boolean;
};

async function copyUrlToClipboard(url: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = url;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export default function ShareCourseButton({ title }: ShareCourseButtonProps) {
  const handleShare = useCallback(async () => {
    if (typeof window === "undefined") {
      toast.error("Share is unavailable right now.");
      return;
    }

    const url = window.location.href;
    const nav = navigator as ShareNavigator;
    const shareData: ShareData = { title, url };

    try {
      if (typeof nav.share === "function") {
        if (!nav.canShare || nav.canShare(shareData)) {
          await nav.share(shareData);
          return;
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      console.warn("Navigator share failed, falling back to copy", error);
    }

    try {
      await copyUrlToClipboard(url);
      toast.success("Course link copied.");
    } catch (copyError) {
      console.error("Failed to copy course link", copyError);
      toast.error("Could not copy the course link.");
    }
  }, [title]);

  return (
    <Button
      type="button"
      variant="outline"
      className="no-print"
      onClick={handleShare}
    >
      <Share2 className="mr-2 h-4 w-4" aria-hidden />
      <span className="hidden sm:inline">Share</span>
      <span className="sm:hidden">Share</span>
    </Button>
  );
}
