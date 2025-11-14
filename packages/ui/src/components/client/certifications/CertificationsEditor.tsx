"use client";

import { NormalizedCertification, CertificationLevel } from "@workspace/store/types/pod.ts";
import { X } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  CERTIFICATION_LEVELS,
  certificationLabel,
  cn,
} from "../../../lib/utils.ts";
import type { CoverageCourseStatus } from "../roster/coverage-types";
import {
  getCourseStatusBadgeClass,
  getCourseStatusLabel,
} from "../roster/course-status";

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
      <div className={cn("text-sm text-muted-foreground", className)}>
        No certifications assigned yet.
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2", className)}>
      {value.map((cert) => {
        const level = cert.level;
        const status: CoverageCourseStatus = level ?? "untracked";
        const statusLabel = getCourseStatusLabel(status);
        const badgeClassName = getCourseStatusBadgeClass(status);
        const displayName = cert.display_name || cert.id;

        return (
          <div
            key={cert.id}
            className="flex flex-col md:flex-row gap-2 rounded-md border border-border/60 bg-background/40 p-3"
          >
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {!disabled && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeCert(cert.id)}
                      className="ml-auto self-start"
                      aria-label={`Remove ${displayName}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Badge variant="outline" className={cn("text-xs", badgeClassName)}>
                    {statusLabel}
                  </Badge>
                  <p className="text-sm font-medium text-foreground break-words">
                    {displayName}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground break-all">{cert.id}</p>
              </div>
            </div>

            <Select
              value={level ?? "unset"}
              onValueChange={(next) =>
                setLevel(
                  cert.id,
                  next === "unset" ? undefined : (next as CertificationLevel),
                )
              }
              disabled={disabled}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Set status" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="unset">Unset (track only)</SelectItem>
                {CERTIFICATION_LEVELS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {certificationLabel(opt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
