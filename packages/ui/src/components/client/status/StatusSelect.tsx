// components/status/StatusSelect.tsx
"use client";

import * as React from "react";
import { STATUS_BY_VALUE, STATUS_OPTIONS, StatusValue } from "./options.ts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select.tsx";
import { cn } from "@workspace/ui/lib/utils.ts";


export type StatusSelectProps = {
  id?: string;
  value?: StatusValue;
  defaultValue?: StatusValue;
  onChange?: (v: StatusValue) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;         // toggles ring
  disabled?: boolean;
};

export function StatusSelect({
  id,
  value,
  defaultValue,
  onChange,
  placeholder = "Select status…",
  className,
  error,
  disabled,
}: StatusSelectProps) {
  // For rendering the label+dot inside the trigger, we derive it from current value.
  const current = (value ?? defaultValue) ? STATUS_BY_VALUE[(value ?? defaultValue)!] : undefined;

  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => onChange?.(v as StatusValue)}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className={cn("w-[220px]", error && "ring-1 ring-destructive", className)}
        aria-invalid={!!error}
      >
        {/* If nothing selected, SelectValue shows placeholder; else we custom-render */}
        {current ? (
          <span className="inline-flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full", current.dotClass)} />
            {current.label}
          </span>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>

      <SelectContent>
        {STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <span className="inline-flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", opt.dotClass)} />
              {opt.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
