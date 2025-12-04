"use client";

import React from "react";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import { DispatchCard } from "./dispatch-card";
import type { BucketGroups, UrgencyBucket } from "./dispatch-buckets";
import { bucketEmoji } from "./dispatch-buckets";

type LinkWrapperProps = {
  href: string;
  children: React.ReactNode;
};

type DispatchUpcomingListProps = {
  order: UrgencyBucket[];
  groups: BucketGroups;
  pageItems: DispatchSubmission[];
  LinkComponent: React.ComponentType<LinkWrapperProps>;
  getHref: (submission: DispatchSubmission) => string;
};

export function DispatchUpcomingList({
  order,
  groups,
  pageItems,
  LinkComponent,
  getHref,
}: DispatchUpcomingListProps) {
  const pageSet = React.useMemo(
    () => new Set(pageItems.map((s) => s.id)),
    [pageItems]
  );

  return (
    <div className="space-y-8">
      {order.map((label) => {
        const bucketItems = groups[label].filter((s) => pageSet.has(s.id));
        if (bucketItems.length === 0) return null;
        return (
          <section key={label} className="space-y-3">
            <div className="sticky top-20 z-10 flex items-center gap-2 bg-background/90 py-2 backdrop-blur">
              <span>{bucketEmoji(label)}</span>
              <h2 className="text-lg font-semibold">{label}</h2>
              {bucketItems.length > 0 ? (
                <span className="text-muted-foreground text-sm">
                  ({bucketItems.length})
                </span>
              ) : null}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bucketItems.map((submission) => (
                <DispatchCard
                  key={submission.id}
                  submission={submission}
                  LinkComponent={LinkComponent}
                  href={getHref(submission)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
