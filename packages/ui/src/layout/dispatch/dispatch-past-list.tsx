"use client";
import { Badge } from "@workspace/ui/primitives/badge";
import { humanize } from "@workspace/ui/lib/utils";
import { DISPATCH_TYPE_LABELS } from "@workspace/store/types/dispatch.ts";
import { STATUS_META } from "@workspace/ui/lib/constants/dispatch";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
type LinkWrapperProps = {
  href: string;
  children: React.ReactNode;
};
type DispatchPastListProps = {
  items: DispatchSubmission[];
  LinkComponent: React.ComponentType<LinkWrapperProps>;
  getHref: (submission: DispatchSubmission) => string;
};
export function DispatchPastList({
  items,
  LinkComponent,
  getHref,
}: DispatchPastListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        No past or archived events
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[1.2fr,1fr,1fr,0.8fr] gap-3 border-b bg-muted/60 px-4 py-3 text-sm font-semibold">
            <span>When</span>
            <span>Location</span>
            <span>Type</span>
            <span className="text-right">Status</span>
          </div>
          <div className="divide-y">
            {items.map((submission) => (
              <LinkComponent key={submission.id} href={getHref(submission)}>
                <div className="grid grid-cols-[1.2fr,1fr,1fr,0.8fr] items-center gap-3 px-4 py-3 text-sm transition hover:bg-muted/50">
                  <span className="text-muted-foreground">
                    {formatDate(submission)}
                  </span>
                  <span className="truncate font-medium">
                    {submission.location_label ?? "Unknown location"}
                  </span>
                  <span className="truncate">
                    {submission.type
                      ? (DISPATCH_TYPE_LABELS[
                          submission.type as keyof typeof DISPATCH_TYPE_LABELS
                        ] ?? humanize(submission.type))
                      : "—"}
                  </span>
                  <span className="flex justify-end">
                    <Badge variant="outline">
                      {STATUS_META[
                        submission.status as keyof typeof STATUS_META
                      ]?.label ?? humanize(submission.status)}
                    </Badge>
                  </span>
                </div>
              </LinkComponent>
            ))}
          </div>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {items.map((submission) => (
          <LinkComponent key={submission.id} href={getHref(submission)}>
            <div className="rounded-lg border p-3 shadow-sm transition hover:border-primary/60 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {submission.location_label ?? "Unknown location"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(submission)}
                  </p>
                </div>
                <Badge variant="outline">
                  {STATUS_META[submission.status as keyof typeof STATUS_META]
                    ?.label ?? humanize(submission.status)}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {submission.type ? (
                  <span>
                    {DISPATCH_TYPE_LABELS[
                      submission.type as keyof typeof DISPATCH_TYPE_LABELS
                    ] ?? humanize(submission.type)}
                  </span>
                ) : null}
                {submission.state ? (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span>{submission.state}</span>
                  </>
                ) : null}
              </div>
            </div>
          </LinkComponent>
        ))}
      </div>
    </div>
  );
}
function formatDate(submission: DispatchSubmission) {
  const date = submission.date_of_event
    ? new Date(submission.date_of_event)
    : new Date(submission.timestamp);
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
