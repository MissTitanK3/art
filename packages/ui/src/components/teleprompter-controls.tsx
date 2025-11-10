"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  SPEED_PRESETS,
  closestSpeedPresetId,
} from "@workspace/ui/lib/teleprompter";

export type TransportControlsProps = {
  playing: boolean;
  onPlayToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRewind: () => void;
  compact?: boolean;
  className?: string;
};

export function TransportControls({
  playing,
  onPlayToggle,
  onPrev,
  onNext,
  onRewind,
  compact,
  className,
}: TransportControlsProps) {
  const sizeCls = compact
    ? "h-9 px-3 text-sm"
    : "h-11 px-4 text-base sm:h-10 sm:text-sm";
  return (
    <div
      className={`grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 ${className ?? ""}`}
    >
      <Button className={`w-full ${sizeCls}`} onClick={onRewind}>
        ⏮ Rewind
      </Button>
      <Button
        className={`w-full ${sizeCls}`}
        variant="light"
        onClick={onPlayToggle}
      >
        {playing ? "⏸ Pause" : "▶ Play"}
      </Button>
      <Button className={`w-full ${sizeCls}`} onClick={onPrev}>
        Prev
      </Button>
      <Button className={`w-full ${sizeCls}`} onClick={onNext}>
        Next
      </Button>
    </div>
  );
}

export type SpeedControlProps = {
  value: number;
  onChange: (v: number) => void;
  layout?: "auto" | "chips" | "select";
  className?: string;
};

export function SpeedControl({
  value,
  onChange,
  layout = "auto",
  className,
}: SpeedControlProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const content = (
    <>
      <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
        <span>Speed</span>
        <span suppressHydrationWarning>
          {mounted ? `${value.toFixed(2)}x` : "--"}
        </span>
      </div>
      <div className="md:hidden">
        <Select
          value={closestSpeedPresetId(value)}
          onValueChange={(v) =>
            onChange(SPEED_PRESETS[v as keyof typeof SPEED_PRESETS].value)
          }
        >
          <SelectTrigger className="w-full h-11 sm:h-10 text-base sm:text-sm">
            <SelectValue placeholder="Speed" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SPEED_PRESETS).map(([id, p]) => (
              <SelectItem key={id} value={id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden md:grid grid-cols-5 gap-1 w-full">
        {Object.entries(SPEED_PRESETS).map(([id, p]) => (
          <Button
            key={id}
            variant={
              closestSpeedPresetId(value) === id ? "secondary" : "outline"
            }
            className="w-full"
            onClick={() => onChange(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>
    </>
  );

  if (layout === "select") {
    return (
      <div className={className}>
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>Speed</span>
          <span suppressHydrationWarning>
            {mounted ? `${value.toFixed(2)}x` : "--"}
          </span>
        </div>
        <Select
          value={closestSpeedPresetId(value)}
          onValueChange={(v) =>
            onChange(SPEED_PRESETS[v as keyof typeof SPEED_PRESETS].value)
          }
        >
          <SelectTrigger className="w-full h-11 sm:h-10 text-base sm:text-sm">
            <SelectValue placeholder="Speed" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SPEED_PRESETS).map(([id, p]) => (
              <SelectItem key={id} value={id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return <div className={className}>{content}</div>;
}

export default TransportControls;
