"use client";

import * as React from "react";
import { Button } from "@workspace/ui/primitives/button";

export type OrientationHintProps = {
  show: boolean;
  onDismiss: () => void;
  message?: string;
};

export default function OrientationHint({
  show,
  onDismiss,
  message = "For easier reading, rotate your device (landscape)",
}: OrientationHintProps) {
  if (!show) return null;
  return (
    <div className="absolute top-2 inset-x-0 z-20 flex justify-center">
      <div className="flex items-center gap-2 rounded-md border bg-background/80 px-3 py-1.5 text-xs shadow-sm backdrop-blur">
        <span>{message}</span>
        <Button
          className="h-7 px-2 text-xs"
          variant="outline"
          onClick={onDismiss}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
