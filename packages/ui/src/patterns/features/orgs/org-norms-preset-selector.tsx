"use client";

import { Button } from "@workspace/ui/primitives/button";
import { Info } from "lucide-react";

import type { OrgNormPresetOption } from "./types";

type OrgNormsPresetSelectorProps = {
  options: readonly OrgNormPresetOption[];
  value?: string | string[] | null;
  onChange?: (value: string | string[]) => void;
  disabled?: boolean;
  allowMultiple?: boolean;
};

export function formatNormLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function OrgNormsPresetSelector({
  options,
  value,
  onChange,
  disabled,
  allowMultiple,
}: OrgNormsPresetSelectorProps) {
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const toggleValue = (next: string) => {
    if (allowMultiple) {
      const nextValues = selectedValues.includes(next)
        ? selectedValues.filter((v) => v !== next)
        : [...selectedValues, next];
      return onChange?.(nextValues);
    }
    onChange?.(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selectedValues.includes(option.value);
          return (
            <Button
              type="button"
              key={option.value}
              variant={active ? "default" : "outline"}
              size="sm"
              disabled={disabled}
              onClick={() => toggleValue(option.value)}
              className="justify-between gap-2"
            >
              <span className="text-left">
                {option.label || formatNormLabel(option.value)}
              </span>
              <Info className="h-3.5 w-3.5 opacity-80" />
            </Button>
          );
        })}
      </div>
      <div className="grid gap-1">
        {options.map((option) => {
          const active = selectedValues.includes(option.value);
          return (
            <div
              key={`desc-${option.value}`}
              className={`rounded-md border p-2 text-xs leading-relaxed ${
                active ? "border-primary/60 bg-primary/5" : "border-border"
              }`}
            >
              <div className="font-medium">
                {option.label || formatNormLabel(option.value)}
              </div>
              <div className="text-muted-foreground">{option.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
