import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@workspace/ui/lib/utils";

type MarkdownPreviewProps = {
  source?: string | null;
  emptyText?: string;
  className?: string;
};

export function MarkdownPreview({
  source,
  emptyText = "No content provided.",
  className,
}: MarkdownPreviewProps) {
  const trimmed = source?.trim();
  const remarkPlugins = React.useMemo(() => [remarkGfm], []);

  if (!trimmed) {
    return (
      <p className={cn("text-sm italic text-muted-foreground", className)}>
        {emptyText}
      </p>
    );
  }

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown remarkPlugins={remarkPlugins}>{trimmed}</ReactMarkdown>
    </div>
  );
}

export default MarkdownPreview;
