"use client";

import { usePreferencesStore } from "@workspace/store/usePreferencesStore";
import { Button } from "@workspace/ui/primitives/button";

export type DistanceUnitToggleProps = {
  size?: "sm" | "default" | "lg";
  variant?: "outline" | "ghost" | "secondary" | "default" | "light";
  className?: string;
  showLabel?: boolean; // show current unit text
};

export function DistanceUnitToggle({
  size = "sm",
  variant = "light",
  className,
  showLabel = true,
}: DistanceUnitToggleProps) {
  const unit = usePreferencesStore((s) => s.distanceUnit);
  const toggle = usePreferencesStore((s) => s.toggleDistanceUnit);

  const nextHint = unit === "mi" ? "Switch to kilometers" : "Switch to miles";
  const label = unit.toUpperCase();

  return (
    <Button
      aria-label={nextHint}
      title={nextHint}
      size={size}
      variant={variant}
      onClick={toggle}
      className={className}
    >
      {showLabel ? label : unit}
    </Button>
  );
}

export default DistanceUnitToggle;
