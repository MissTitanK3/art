"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

type Props = {
  href: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  className?: string;
};

export default function NavTile({ href, icon, label, description, className }: Props) {
  return (
    <a
      href={href}
      className={cn(
        "group block rounded-lg border p-4 hover:bg-muted/30 transition-colors",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-md border p-2 text-muted-foreground group-hover:text-foreground">{icon}</div>
        <div className="flex-1">
          <div className="font-medium">{label}</div>
          {description ? (
            <div className="text-sm text-muted-foreground">{description}</div>
          ) : null}
        </div>
      </div>
    </a>
  );
}

