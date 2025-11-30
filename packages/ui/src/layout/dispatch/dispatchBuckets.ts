"use client";

import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import { urgencyEmoji } from "@workspace/ui/lib/messageFormatter";

export type UrgencyBucket =
  | "Immediately"
  | "Within 30 Minutes"
  | "Within 1 Hour"
  | "Within 2 Hours"
  | "Later Today"
  | "Within A Day"
  | "Within 3 Days"
  | "Within the Week"
  | "Beyond Next Week";

export const URGENCY_BUCKET_ORDER: UrgencyBucket[] = [
  "Immediately",
  "Within 30 Minutes",
  "Within 1 Hour",
  "Within 2 Hours",
  "Later Today",
  "Within A Day",
  "Within 3 Days",
  "Within the Week",
  "Beyond Next Week",
];

export const bucketEmoji = (bucket: UrgencyBucket) => urgencyEmoji(bucket);

export function bucketFor(
  submission: DispatchSubmission,
  now: Date = new Date(),
): UrgencyBucket {
  const whenStr = submission.date_of_event ?? submission.timestamp;
  const when = new Date(whenStr);
  if (Number.isNaN(when.getTime())) return "Within the Week";

  const diffMs = when.getTime() - now.getTime();
  const mins = diffMs / (60 * 1000);
  const hours = mins / 60;

  if (mins <= 0) return "Immediately";
  if (mins <= 30) return "Within 30 Minutes";
  if (hours <= 1) return "Within 1 Hour";
  if (hours <= 2) return "Within 2 Hours";

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  if (when <= endOfToday) return "Later Today";

  const endOfTomorrow = new Date(endOfToday);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
  if (when <= endOfTomorrow) return "Within A Day";

  const endOf3Days = new Date(endOfToday);
  endOf3Days.setDate(endOf3Days.getDate() + 3);
  if (when <= endOf3Days) return "Within 3 Days";

  const endOfWeek = new Date(endOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  return when <= endOfWeek ? "Within the Week" : "Beyond Next Week";
}

export type BucketGroups = Record<UrgencyBucket, DispatchSubmission[]>;

export function groupByBucket(
  submissions: DispatchSubmission[],
  now: Date = new Date(),
) {
  const groups: BucketGroups = {
    Immediately: [],
    "Within 30 Minutes": [],
    "Within 1 Hour": [],
    "Within 2 Hours": [],
    "Later Today": [],
    "Within A Day": [],
    "Within 3 Days": [],
    "Within the Week": [],
    "Beyond Next Week": [],
  };

  for (const submission of submissions) {
    const bucket = bucketFor(submission, now);
    groups[bucket].push(submission);
  }

  for (const bucket of URGENCY_BUCKET_ORDER) {
    groups[bucket].sort((a, b) => {
      const da = new Date(a.date_of_event ?? a.timestamp).getTime();
      const db = new Date(b.date_of_event ?? b.timestamp).getTime();
      return da - db;
    });
  }

  return { groups, order: URGENCY_BUCKET_ORDER };
}

export function flattenGroups(order: UrgencyBucket[], groups: BucketGroups) {
  const flattened: DispatchSubmission[] = [];
  for (const bucket of order) {
    flattened.push(...groups[bucket]);
  }
  return flattened;
}
