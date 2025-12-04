"use client";

import { Button } from "@workspace/ui/primitives/button";
import {
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Crosshair,
} from "lucide-react";

export function MapControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onPan,
  onCenter,
  onResetFog,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPan: (dx: number, dy: number) => void;
  onCenter?: () => void;
  onResetFog?: () => void;
}) {
  return (
    <div className="rounded-md border bg-card/90 backdrop-blur px-2 py-2 shadow-md flex flex-col items-center gap-2 w-28">
      <div className="text-xs text-muted-foreground">
        Zoom {zoom.toFixed(1)}
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8"
          onClick={onZoomIn}
          aria-label="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8"
          onClick={onZoomOut}
          aria-label="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <div />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => onPan(0, 1)}
          aria-label="Pan North"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <div />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => onPan(-1, 0)}
          aria-label="Pan West"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => onCenter && onCenter()}
          aria-label="Center on position"
        >
          <Crosshair className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => onPan(1, 0)}
          aria-label="Pan East"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => onPan(0, -1)}
          aria-label="Pan South"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <div />
      </div>
      {onResetFog ? (
        <Button
          size="xs"
          variant="outline"
          className="w-full text-[11px]"
          onClick={onResetFog}
        >
          Reset Fog (test)
        </Button>
      ) : null}
    </div>
  );
}
