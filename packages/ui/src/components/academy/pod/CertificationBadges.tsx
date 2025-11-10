"use client";

import * as React from "react";
import { Badge } from "@workspace/ui/components/badge";
import type { NormalizedCertification } from "@workspace/store/types/pod";

type Props = {
  certifications: NormalizedCertification[];
  maxPreview?: number;
  onRemove?: (id: string) => void;
};

export default function CertificationBadges({ certifications, maxPreview = 3, onRemove }: Props) {
  const preview = certifications.slice(0, maxPreview);
  const more = certifications.length - preview.length;

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-wrap gap-2">
        {preview.map((cert) => (
          onRemove ? (
            <button
              key={cert.id}
              type="button"
              onClick={() => onRemove(cert.id)}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition hover:bg-secondary/80"
            >
              {cert.display_name}
            </button>
          ) : (
            <Badge key={cert.id} variant="outline" className="text-xs">{cert.display_name}</Badge>
          )
        ))}
      </div>
      {more > 0 ? <span className="text-xs text-muted-foreground">+{more} more</span> : null}
    </div>
  );
}
