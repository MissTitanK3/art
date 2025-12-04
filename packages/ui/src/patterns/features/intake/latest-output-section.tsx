import * as React from "react";

import { FormSectionCard } from "@workspace/ui/patterns/common/form-section-card";
import { ScrollArea } from "@workspace/ui/primitives/scroll-area";

interface LatestOutputSectionProps {
  json?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export function LatestOutputSection({
  json,
  title = "Latest Structured Output",
  description = "Preview of the normalized intake data for exports.",
}: LatestOutputSectionProps) {
  return (
    <FormSectionCard title={title} description={description}>
      {json ? (
        <ScrollArea className="h-64 rounded-md border bg-muted/40 p-4">
          <pre className="text-xs leading-relaxed">{json}</pre>
        </ScrollArea>
      ) : (
        <p className="text-sm text-muted-foreground">
          Submit the form to generate a JSON preview and enable exports.
        </p>
      )}
    </FormSectionCard>
  );
}
