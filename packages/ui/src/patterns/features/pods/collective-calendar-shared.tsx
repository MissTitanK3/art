import { Shield, ShieldCheck, User } from "lucide-react";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { VisibilityScope } from "@workspace/store/utils/permissions/types";
export type CalendarVisibility = "public" | "org" | "private";
export type CalendarPodSummary = {
  id: string;
  name: string;
  slug?: string | null;
  area?: string | null;
};
export type CalendarOrgSummary = {
  id: string;
  name: string;
  description?: string | null;
  role?: string | null;
  pods?: CalendarPodSummary[];
};
export type CalendarRouteMeta = {
  type?: string;
  data?: unknown;
} | null;
export type CalendarOwnerLink = {
  ownerType: "user" | "pod" | "org";
  ownerId: string;
  ownerProfileId?: string;
};
export type CollectiveCalendarShift = {
  id: string;
  start: string;
  end: string;
  tz: string;
  pod: CalendarPodSummary;
  organizations: CalendarOrgSummary[];
  label?: string | null;
  location?: string | null;
  visibility: CalendarVisibility;
  needed: number;
  headcount?: number | null;
  route?: CalendarRouteMeta;
  dispatchLink?: string | null;
  notes?: string | null;
  signups: string[];
  visibilityScope?: VisibilityScope | null;
  invitedUserIds?: string[];
  owners?: CalendarOwnerLink[];
};
export type CollectiveCalendarMembership = {
  podIds: string[];
  orgIds: string[];
  profileId?: string | null;
  userId?: string | null;
};
export type CollectiveCalendarShiftScope = "independent" | "pod" | "org";
export type CollectiveCalendarShiftInput = {
  id?: string;
  podId: string;
  start: string;
  end: string;
  tz: string;
  label: string;
  location: string;
  visibility: CalendarVisibility;
  needed: number;
  headcount?: number | null;
  dispatchLink?: string | null;
  notes?: string | null;
  scope?: CollectiveCalendarShiftScope;
  organizationId?: string | null;
  visibilityScope?: VisibilityScope | null;
  invitedUserIds?: string[];
  ownerProfileId?: string | null;
  ownerPodIds?: string[];
  ownerOrgIds?: string[];
};
export function EyeOpen(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
export function visibilityBadge(
  visibility: CalendarVisibility,
  scope?: VisibilityScope | null,
) {
  switch (visibility) {
    case "public":
      return { label: "Public", variant: "outline" as const, icon: EyeOpen };
    case "org":
      return { label: "Org only", variant: "secondary" as const, icon: Shield };
    case "private":
      if (scope === "only_myself") {
        return {
          label: "Only Me",
          variant: "destructive" as const,
          icon: User,
        };
      }
      return {
        label: "Pod only",
        variant: "destructive" as const,
        icon: ShieldCheck,
      };
  }
}
export function routeSummary(route?: CalendarRouteMeta) {
  if (!route) return "No route provided";
  const type = typeof route.type === "string" ? route.type : "route";
  if (Array.isArray((route as any).data)) {
    return `${type} • ${(route as any).data.length} points`;
  }
  return type;
}
export function needsRemaining(shift: CollectiveCalendarShift) {
  return Math.max(0, (shift.needed ?? 0) - (shift.signups?.length ?? 0));
}
export function computeRange(timeRange: "today" | "week" | "month") {
  const now = new Date();
  if (timeRange === "today") {
    return { start: startOfDay(now), end: endOfDay(now) };
  }
  if (timeRange === "week") {
    return {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    };
  }
  return { start: startOfMonth(now), end: endOfMonth(now) };
}
export function isShiftVisibleToUser(
  shift: CollectiveCalendarShift,
  pods: Set<string>,
  orgs: Set<string>,
) {
  if (shift.visibility === "public") return true;
  if (shift.visibility === "private") return pods.has(shift.pod.id);
  const orgIds = shift.organizations.map((o) => o.id);
  return orgIds.some((id) => orgs.has(id)) || pods.has(shift.pod.id);
}
export function formatDay(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
