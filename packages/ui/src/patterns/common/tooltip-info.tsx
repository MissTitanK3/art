"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/primitives/tooltip";
import { Info } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export type TooltipInfoProps = {
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
};

/**
 * Inline information tooltip for providing context about fields, enums, and features.
 * Implements accessibility pattern: "Enums Must Be Explained Inline"
 */
export function TooltipInfo({
  children,
  className,
  iconClassName,
  side = "top",
}: TooltipInfoProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
            className,
          )}
          aria-label="More information"
        >
          <Info className={cn("h-4 w-4", iconClassName)} />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
