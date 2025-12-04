"use client";

import { Badge } from "@workspace/ui/primitives/badge";
import type { NormalizedCertification } from "@workspace/store/types/pod";

type Props = {
  certifications: NormalizedCertification[];
  maxPreview?: number;
  onRemove?: (id: string) => void;
};

export default function CertificationBadges({
  certifications,
  maxPreview = 3,
  onRemove,
}: Props) {
  const preview = certifications.slice(0, maxPreview);
  const more = certifications.length - preview.length;

  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-wrap gap-2">
        {preview.map((cert) =>
          onRemove ? (
            <button
              key={cert.id}
              type="button"
              onClick={() => onRemove(cert.id)}
              className="inline-flex max-w-[200px] items-start justify-start gap-1 rounded-full border border-border/60 bg-secondary px-3 py-1 text-xs font-medium leading-tight text-left text-secondary-foreground transition hover:bg-secondary/80 whitespace-normal break-words"
            >
              <span className="min-w-0 break-words leading-tight">
                {cert.display_name}
              </span>
            </button>
          ) : (
            <Badge
              key={cert.id}
              variant="outline"
              className="text-xs max-w-[200px] whitespace-normal break-words leading-tight text-left items-start justify-start"
            >
              <span className="min-w-0 break-words leading-tight">
                {cert.display_name}
              </span>
            </Badge>
          )
        )}
      </div>
      {more > 0 ? (
        <span className="text-xs text-muted-foreground">+{more} more</span>
      ) : null}
    </div>
  );
}
