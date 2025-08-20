// components/role/RoleSelect.tsx
"use client";

import * as React from "react";
import { ROLE_BY_VALUE, ROLE_OPTIONS, RoleValue } from "./options.ts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select.tsx";
import { cn } from "@workspace/ui/lib/utils.ts";


export type RoleSelectProps = {
  id?: string;
  value?: RoleValue;
  defaultValue?: RoleValue;
  onChange?: (v: RoleValue) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
  showDescriptions?: boolean; // optional helper text in menu
};

export function RoleSelect({
  id,
  value,
  defaultValue,
  onChange,
  placeholder = "Select role…",
  className,
  error,
  disabled,
  showDescriptions = false,
}: RoleSelectProps) {
  const current = (value ?? defaultValue) ? ROLE_BY_VALUE[(value ?? defaultValue)!] : undefined;

  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => onChange?.(v as RoleValue)}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className={cn("w-[220px]", error && "ring-1 ring-destructive", className)}
        aria-invalid={!!error}
      >
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
        {ROLE_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <span className="inline-flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", opt.dotClass)} />
              <span className="flex flex-col">
                <span>{opt.label}</span>
                {showDescriptions && opt.description && (
                  <span className="text-xs text-muted-foreground">{opt.description}</span>
                )}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
