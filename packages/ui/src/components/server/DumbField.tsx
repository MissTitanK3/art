// DumbField.tsx
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip.tsx";

export function DumbField({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground flex items-center gap-1">
        <span>{label}</span>
        {tooltip && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Make the trigger focusable + clickable */}
                <button
                  type="button"
                  aria-label={`${label} info`}
                  className="inline-flex items-center justify-center rounded p-0.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
