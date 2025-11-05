"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export type KeyboardHintProps = {
  show: boolean;
  onDismiss: () => void;
  className?: string;
  children: React.ReactNode;
  dismissLabel?: string;
};

export default function KeyboardHint({ show, onDismiss, className, children, dismissLabel = "Dismiss hint" }: KeyboardHintProps) {
  if (!show) return null;
  return (
    <div className={cn("absolute right-2 top-2 z-20 flex items-center gap-2 rounded-md border bg-background/80 px-2 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur", className)}>
      <span>{children}</span>
      <button
        type="button"
        className="rounded px-1 text-muted-foreground hover:text-foreground"
        onClick={onDismiss}
        aria-label={dismissLabel}
      >
        ×
      </button>
    </div>
  );
}
