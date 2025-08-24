"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

/**
 * A small circular dot used for role/status/cert indicators.
 *
 * Usage:
 *   <Dot color="bg-indigo-500" />
 *   <Dot color="text-emerald-600" size="sm" />
 */
export function Dot({
  color = "bg-gray-400",
  size = "md",
  className,
}: {
  color?: string;        // Tailwind class, e.g. "bg-indigo-500"
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeMap = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  return (
    <span
      className={cn(
        "inline-block rounded-full border border-background/60",
        sizeMap[size],
        color,
        className
      )}
    />
  );
}
