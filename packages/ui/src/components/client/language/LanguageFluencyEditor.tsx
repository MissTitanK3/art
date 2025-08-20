// components/LanguageFluencyEditor.tsx
"use client";

import * as React from "react";
import { NormalizedLanguage } from "./LanguagePicker.tsx";

type Props = {
  value: NormalizedLanguage[];
  onChange: (next: NormalizedLanguage[]) => void;
  disabled?: boolean;
  className?: string;
};

const LEVELS: Array<NonNullable<NormalizedLanguage["proficiency"]>> = [
  "nonverbal",
  "basic",
  "conversational",
  "fluent",
  "native",
];

// Map level → fill count (0..4). We’ll keep a 4‑segment bar:
// nonverbal is special-colored but fills 1 segment so it’s *visible*.
const fillCount: Record<NonNullable<NormalizedLanguage["proficiency"]>, number> = {
  nonverbal: 1,
  basic: 1,
  conversational: 2,
  fluent: 3,
  native: 4,
};

function idxOf(p?: NormalizedLanguage["proficiency"]) {
  return p ? LEVELS.indexOf(p) + 1 : 0; // 0..4 filled segments
}

export default function LanguageFluencyEditor({
  value,
  onChange,
  disabled = false,
  className = "",
}: Props) {
  function setProf(tag: string, prof?: NormalizedLanguage["proficiency"]) {
    onChange(value.map((l) => (l.tag === tag ? { ...l, proficiency: prof } : l)));
  }

  if (!value?.length) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        No languages selected yet.
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {value.map((l) => {
        const p = l.proficiency;
        const filled = p ? fillCount[p] : 0;

        return (
          <div
            key={l.tag}
            className="flex flex-col items-center justify-between gap-3 rounded-xl border px-3 py-2"
          >
            {/* Name */}
            <div className="text-sm font-medium">{l.display_name}</div>

            {/* Visual meter */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1"
                role="img"
                aria-label={`Proficiency: ${p ?? "unset"}`}
                title={
                  p
                    ? p === "nonverbal"
                      ? "Nonverbal / Context"
                      : p[0]?.toUpperCase() + p.slice(1)
                    : "—"
                }
              >
                {Array.from({ length: 4 }).map((_, i) => {
                  const isFilled = i < filled;

                  // Color ramp; special color for nonverbal
                  let color = "bg-zinc-200";
                  if (p === "nonverbal") {
                    color = isFilled ? "bg-indigo-400" : "bg-zinc-200";
                  } else if (p === "basic") {
                    color = isFilled ? "bg-amber-400" : "bg-zinc-200";
                  } else if (p === "conversational") {
                    color = isFilled ? "bg-amber-500" : "bg-zinc-200";
                  } else if (p === "fluent") {
                    color = isFilled ? "bg-emerald-500" : "bg-zinc-200";
                  } else if (p === "native") {
                    color = isFilled ? "bg-emerald-600" : "bg-zinc-200";
                  }

                  return (
                    <span
                      key={i}
                      className={`h-2.5 w-6 rounded ${color} transition-colors`}
                    />
                  );
                })}
              </div>

              <span className="text-[11px] text-muted-foreground w-28 text-right">
                {p
                  ? p === "nonverbal"
                    ? "Nonverbal / Context"
                    : p[0]?.toUpperCase() + p.slice(1)
                  : "—"}
              </span>
            </div>

            {/* Selector */}
            <select
              className="text-sm rounded-md border bg-background px-2 py-1"
              disabled={disabled}
              value={p ?? ""}
              onChange={(e) => setProf(l.tag, (e.target.value || undefined) as any)}
            >
              <option value="">—</option>
              {LEVELS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "nonverbal" ? "Nonverbal / Context" : opt[0]?.toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
