"use client";

import { Loader2 } from "lucide-react";

export function ToolsLoader({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-muted-foreground h-96">
      <Loader2 className="h-5 w-5 animate-spin text-primary block" />
      <span>Loading{label ? ` ${label}` : ""}…</span>
    </div>
  );
}
