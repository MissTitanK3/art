"use client";

import { NormalizedCertification } from "@workspace/store/types/pod.ts";
import { CertificationLevel } from "@workspace/store/types/pod.ts";
import { CERTIFICATION_FILL, CERTIFICATION_LEVELS, certificationLabel } from "../../../lib/utils.ts";
import { X } from "lucide-react";

type Props = {
  value: NormalizedCertification[];
  onChange: (next: NormalizedCertification[]) => void;
  disabled?: boolean;
  className?: string;
};

export default function CertificationEditor({
  value,
  onChange,
  disabled = false,
  className = "",
}: Props) {
  function setLevel(id: string, level?: CertificationLevel) {
    onChange(value.map((c) => (c.id === id ? { ...c, level } : c)));
  }

  function removeCert(id: string) {
    onChange(value.filter((c) => c.id !== id));
  }

  if (!value?.length) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        No certifications assigned yet.
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {value.map((c, key) => {
        const lvl = c.level;
        const filled = lvl ? CERTIFICATION_FILL[lvl] : 0;

        return (
          <div
            key={`${key}-certs`}
            className="flex flex-col gap-3 rounded-xl border px-3 py-2"
          >
            <div className="flex items-center justify-between">

              {/* Name */}
              <div className="text-sm font-medium">{c.display_name}</div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeCert(c.id)}
                  className="rounded-full p-1 hover:bg-muted"
                  aria-label={`Remove ${c.display_name}`}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            {/* Visual meter */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1"
                role="img"
                aria-label={`Status: ${lvl ?? "unset"}`}
                title={certificationLabel(lvl)}
              >
                {Array.from({ length: 4 }).map((_, i) => {
                  const isFilled = i < (lvl ? CERTIFICATION_FILL[lvl] : 0);

                  let color = "bg-zinc-200";
                  if (lvl === "in_progress") color = isFilled ? "bg-amber-500" : "bg-zinc-200";
                  if (lvl === "completed") color = isFilled ? "bg-emerald-500" : "bg-zinc-200";
                  if (lvl === "expired") color = isFilled ? "bg-rose-500" : "bg-zinc-200";
                  if (lvl === "mentor") color = isFilled ? "bg-indigo-500" : "bg-zinc-200";

                  return <span key={i} className={`h-2.5 w-6 rounded ${color}`} />;
                })}
              </div>

              <span className="text-[11px] text-muted-foreground w-28 text-right">
                {certificationLabel(lvl)}
              </span>
            </div>

            {/* Selector */}
            <select
              className="text-sm rounded-md border bg-background px-2 py-1"
              disabled={disabled}
              value={lvl ?? ""}
              onChange={(e) => setLevel(c.id, (e.target.value || undefined) as CertificationLevel)}
            >
              <option value="">—</option>
              {CERTIFICATION_LEVELS.map((opt) => (
                <option key={opt} value={opt}>
                  {certificationLabel(opt)}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
