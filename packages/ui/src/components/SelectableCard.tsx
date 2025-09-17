"use client";

import { Check } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const COLOR_MAP: Record<
  string,
  { border: string; bg: string; text: string; hover: string; check: string }
> = {
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

interface SelectableCardProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  color?: keyof typeof COLOR_MAP;
}

export function SelectableCard({
  label,
  selected,
  onToggle,
  color = "slate",
}: SelectableCardProps) {
  const palette = COLOR_MAP[color] || {
    border: "border-slate-600",
    bg: "bg-slate-50",
    text: "text-slate-900",
    hover: "hover:border-slate-400",
    check: "text-slate-600",
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center justify-between w-full rounded-lg border p-3 text-left transition",
        selected
          ? `${palette.border} ${palette.bg} ${palette.text} shadow-sm`
          : `border-gray-300 ${palette.hover}`
      )}
    >
      <div className="grid gap-2 grid-cols-[1fr_auto] w-full items-center" style={{ gridTemplateColumns: '1fr auto' }}>

        <span className="text-sm">{label}</span>
        {selected && <Check className={cn("h-8 w-8", palette.check)} />}
      </div>
    </button>
  );
}
