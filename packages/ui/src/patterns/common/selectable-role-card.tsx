"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Input } from "@workspace/ui/primitives/input";

interface SelectableRoleCardProps {
  role: string;
  label: string;
  selected: boolean;
  suggested?: boolean;
  count?: number;
  onToggle: () => void;
  onCountChange: (val?: number) => void;
  color?: "slate" | "emerald" | "amber" | "red" | "gray";
}

export function SelectableRoleCard({
  role,
  label,
  selected,
  suggested = false,
  count,
  onToggle,
  onCountChange,
  color = "slate",
}: SelectableRoleCardProps) {
  const paletteMap = {
    slate: {
      border: "border-slate-600",
      bg: "bg-slate-50",
      text: "text-slate-900",
      hover: "hover:border-slate-400",
      check: "text-slate-600",
    },
    emerald: {
      border: "border-emerald-600",
      bg: "bg-emerald-50",
      text: "text-emerald-900",
      hover: "hover:border-emerald-400",
      check: "text-emerald-600",
    },
    amber: {
      border: "border-amber-600",
      bg: "bg-amber-50",
      text: "text-amber-900",
      hover: "hover:border-amber-400",
      check: "text-amber-600",
    },
    red: {
      border: "border-red-600",
      bg: "bg-red-50",
      text: "text-red-900",
      hover: "hover:border-red-400",
      check: "text-red-600",
    },
    gray: {
      border: "border-gray-600",
      bg: "bg-gray-50",
      text: "text-gray-900",
      hover: "hover:border-gray-400",
      check: "text-gray-600",
    },
  };

  const palette = paletteMap[color];

  // local string state for editing
  const [localValue, setLocalValue] = useState(count?.toString() ?? "");

  // sync from parent
  useEffect(() => {
    setLocalValue(count?.toString() ?? "");
  }, [count]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "flex items-center justify-between w-full rounded-lg border p-3 text-left transition cursor-pointer",
        selected
          ? `${palette.border} ${palette.bg} ${palette.text} shadow-sm`
          : `border-gray-300 ${palette.hover}`
      )}
    >
      <div className="flex items-center gap-2">
        {selected && <Check className={cn("h-4 w-4", palette.check)} />}
        <span className="font-medium">{label}</span>
      </div>
      {selected && (
        <Input
          type="number"
          min={0}
          value={localValue}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const raw = e.target.value;
            setLocalValue(raw);

            if (raw === "") {
              onCountChange(undefined); // temporarily unset
              return;
            }

            const num = parseInt(raw, 10);
            if (isNaN(num)) return;

            if (num === 0) {
              // treat 0 as "remove role"
              onToggle(); // deselect card
              onCountChange(undefined);
              setLocalValue(""); // reset display
            } else {
              onCountChange(num);
            }
          }}
          onBlur={(e) => {
            if (e.target.value === "") {
              setLocalValue("1");
              onCountChange(1);
            }
          }}
          className="w-20"
        />
      )}
    </div>
  );
}
