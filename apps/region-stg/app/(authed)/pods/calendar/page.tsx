"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { REGION_IDENTIFIER } from "@/app/brand_settings";
import { parseISO } from "date-fns";
import {
  CollectiveCalendar,
  CollectiveCalendarMembership,
  CollectiveCalendarShift,
  CollectiveCalendarShiftInput,
  CalendarOrgSummary,
  CalendarPodSummary,
} from "@workspace/ui/patterns/features/pods/collective-calendar";
import { toast } from "@workspace/ui/primitives/sonner";

const DEFAULT_VISIBILITY_SCOPE = "org_and_region_masked";

const sortPodsByName = (pods: CalendarPodSummary[]) =>
  [...pods].sort((a, b) => a.name.localeCompare(b.name));

const SHIFT_SELECT_FIELDS = `
  id,
  pod_id,
  start,
  end,
  tz,
  headcount,
  location,
  label,
  dispatch_link,
  notes,
  visibility,
  needed,
  route,
  pod:pods(
    id,
    name,
    slug,
    area,
    orgs:organization_pods(org_id, organization:organizations(id, name, description))
  ),
  signups:calendar_signups(user_id)
`;

function normalizeVisibility(
  value: any
): CollectiveCalendarShift["visibility"] {
  return value === "org" || value === "private" ? value : "public";
}

function mapShiftRow(row: any): CollectiveCalendarShift {
  const pod = row.pod ?? row.pods ?? {};
  const orgLinks = Array.isArray(row.orgs ?? row.organization_pods)
    ? (row.orgs ?? row.organization_pods)
    : [];
  const nestedPodOrgs = Array.isArray(pod?.orgs) ? pod.orgs : [];
  const allOrgLinks = [...orgLinks, ...nestedPodOrgs];
  const organizations: CalendarOrgSummary[] = allOrgLinks
    .map((link: any) => {
      const org = link.organization ?? link.organizations ?? {};
      if (!org?.id && !link?.org_id) return null;
      return {
        id: String(org.id ?? link.org_id),
        name: org.name ?? "Org",
        description: org.description ?? null,
      } as CalendarOrgSummary;
    })
    .filter(Boolean) as CalendarOrgSummary[];

  const signups = Array.isArray(row.signups)
    ? row.signups
        .map((s: any) => s?.user_id ?? s?.userId)
        .filter(Boolean)
        .map((id: any) => String(id))
    : [];
  const owners = Array.isArray(row.owners)
    ? row.owners
        .map((o: any) => {
          const ownerType = o?.owner_type ?? o?.ownerType;
          const ownerId = o?.owner_id ?? o?.ownerId;
          if (!ownerType || !ownerId) return null;
          return {
            ownerType: ownerType as "user" | "pod" | "org",
            ownerId: String(ownerId),
          };
        })
        .filter(Boolean)
        .map((o: any) => ({
          ...o,
          ownerProfileId: o.ownerProfileId ?? undefined,
        }))
    : [];

  return {
    id: String(row.id),
    start: String(row.start),
    end: String(row.end),
    tz: String(row.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone),
    pod: {
      id: String(pod.id ?? row.pod_id ?? row.podId ?? ""),
      name: String(pod.name ?? pod.slug ?? "Unknown pod"),
      slug: pod.slug ?? null,
      area: pod.area ?? null,
    },
    organizations,
    label: row.label ?? row.title ?? null,
    location: row.location ?? null,
    visibility: normalizeVisibility(row.visibility),
    needed:
      typeof row.needed === "number"
        ? row.needed
        : Number(row.needed ?? 0) || 0,
    headcount:
      typeof row.headcount === "number"
        ? row.headcount
        : Number(row.headcount ?? 0) || null,
    route:
      row.route && typeof row.route === "object"
        ? (row.route as CollectiveCalendarShift["route"])
        : null,
    dispatchLink: row.dispatch_link ?? row.dispatchLink ?? null,
    notes: row.notes ?? null,
    signups,
    visibilityScope: row.visibility_scope ?? row.visibilityScope ?? null,
    invitedUserIds: Array.isArray(row.invited_user_ids ?? row.invitedUserIds)
      ? (row.invited_user_ids ?? row.invitedUserIds).map(String)
      : [],
    owners,
  };
}

export default function CollectiveCalendarPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [pods, setPods] = useState<CalendarPodSummary[]>([]);
  const [organizations, setOrganizations] = useState<CalendarOrgSummary[]>([]);
  const [shifts, setShifts] = useState<CollectiveCalendarShift[]>([]);
  const [membership, setMembership] = useState<CollectiveCalendarMembership>({
    podIds: [],
    orgIds: [],
    profileId: null,
    userId: null,
  });
  const orgByPod = useMemo(() => {
    const map = new Map<string, string>();
    for (const org of organizations) {
      for (const pod of org.pods ?? []) {
        map.set(pod.id, org.id);
      }
    }
    return map;
  }, [organizations]);

  const resolveOrgForPod = useCallback(
    (podId?: string | null) => {
      if (!podId) return null;
      return orgByPod.get(podId) ?? null;
    },
    [orgByPod]
  );

  const buildOwnershipPayload = useCallback(
    (input: CollectiveCalendarShiftInput) => {
      const ownerProfileId =
        input.ownerProfileId ?? profileId ?? userId ?? null;
      const ownerPodIds =
        input.ownerPodIds ?? (input.podId ? [input.podId] : []);
      const orgId =
        input.ownerOrgIds?.[0] ??
        input.organizationId ??
        resolveOrgForPod(input.podId);
      const ownerOrgIds = input.ownerOrgIds ?? (orgId ? [orgId] : []);

      return {
        ownerProfileId,
        ownerPodIds,
        ownerOrgIds,
        visibilityScope: input.visibilityScope ?? DEFAULT_VISIBILITY_SCOPE,
        invitedUserIds: input.invitedUserIds ?? [],
        organizationId: orgId,
      };
    },
    [profileId, resolveOrgForPod, userId]
  );

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/calendar", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load calendar data");
        const data = await res.json();

        if (!active) return;

        setUserId(data.userId);
        setProfileId(data.profileId);

        const mappedShifts = Array.isArray(data.shifts)
          ? data.shifts.map(mapShiftRow)
          : [];
        setShifts(mappedShifts);

        const knownPods = Array.isArray(data.pods)
          ? (data.pods.map((p: any) => ({
              id: String(p.id),
              name: p.name,
              slug: p.slug,
              area: p.area,
            })) as CalendarPodSummary[])
          : [];
        setPods(sortPodsByName(knownPods));

        const podMembershipIds = new Set<string>();
        if (Array.isArray(data.roster)) {
          for (const row of data.roster) {
            if (row?.pod_id) podMembershipIds.add(String(row.pod_id));
          }
        }

        const orgRoleRows: CalendarOrgSummary[] = Array.isArray(data.orgRoles)
          ? data.orgRoles.map((row: any) => ({
              id: String(row.org_id ?? row.organization?.id),
              name: row.organization?.name ?? "Organization",
              description: row.organization?.description ?? null,
              role: row.role ?? null,
            }))
          : [];

        const orgPodRows = Array.isArray(data.orgPods) ? data.orgPods : [];
        const orgIdsFromPods = new Set<string>();
        const orgMap = new Map<
          string,
          CalendarOrgSummary & { pods?: CalendarPodSummary[] }
        >();

        for (const row of orgPodRows) {
          const orgId = row.org_id ?? row.organization?.id;
          if (!orgId) continue;
          const entry: CalendarOrgSummary = {
            id: String(orgId),
            name: row.organization?.name ?? "Organization",
            description: row.organization?.description ?? null,
          };
          const podRow = row.pod ?? row.pods ?? {};
          const podSummary: CalendarPodSummary = {
            id: String(podRow.id ?? row.pod_id),
            name: podRow.name ?? "Pod",
            slug: podRow.slug ?? null,
            area: podRow.area ?? null,
          };
          const existing = orgMap.get(entry.id);
          const nextPods: CalendarPodSummary[] = existing?.pods ?? [];
          const hasPod = nextPods.some((p) => p.id === podSummary.id);
          const mergedPods = hasPod
            ? nextPods
            : sortPodsByName([...nextPods, podSummary]);
          orgMap.set(entry.id, {
            ...(existing ?? entry),
            ...entry,
            pods: mergedPods,
          });
          if (row.pod_id && podMembershipIds.has(String(row.pod_id))) {
            orgIdsFromPods.add(String(orgId));
          }
        }

        for (const role of orgRoleRows) {
          const existing = orgMap.get(role.id);
          orgMap.set(role.id, {
            ...(existing ?? role),
            ...role,
            pods: existing?.pods ?? [],
          });
        }

        setOrganizations(
          Array.from(orgMap.values())
            .map((org) => ({
              ...org,
              pods: sortPodsByName(org.pods ?? []),
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
        );

        const combinedOrgIds = new Set<string>([
          ...orgIdsFromPods,
          ...orgRoleRows.map((r) => r.id),
        ]);

        setMembership({
          podIds: Array.from(podMembershipIds),
          orgIds: Array.from(combinedOrgIds),
          profileId: data.profileId,
          userId: data.userId,
        });
        setError(null);
      } catch (e: any) {
        if (active) {
          console.warn("[CollectiveCalendar] load failed", e);
          setError(e?.message ?? "Failed to load calendar");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSignup = useCallback(
    async (shift: CollectiveCalendarShift) => {
      const signupId = profileId ?? userId;
      if (!signupId) {
        toast.error("Sign in required", {
          description: "You need an active profile to sign up for a shift.",
        });
        throw new Error("Missing profile");
      }
      if (shift.signups.includes(signupId)) {
        toast.message("Already signed up");
        return;
      }

      const res = await fetch(`/api/calendar/shifts/${shift.id}/signup`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to sign up");
      }

      setShifts((prev) =>
        prev.map((s) =>
          s.id === shift.id ? { ...s, signups: [...s.signups, signupId] } : s
        )
      );
      toast.success("Signed up", {
        description: "You are on the crew list for this shift.",
      });
    },
    [profileId, userId]
  );

  const handleCreateShift = useCallback(
    async (input: CollectiveCalendarShiftInput) => {
      const ownership = buildOwnershipPayload(input);
      const res = await fetch("/api/calendar/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          ...ownership,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to create shift");
      }

      const data = await res.json();
      const mapped = mapShiftRow(data);
      setShifts((prev) =>
        [...prev.filter((s) => s.id !== mapped.id), mapped].sort(
          (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()
        )
      );
    },
    [buildOwnershipPayload]
  );

  const handleUpdateShift = useCallback(
    async (shiftId: string, input: CollectiveCalendarShiftInput) => {
      const ownership = buildOwnershipPayload(input);
      const res = await fetch(`/api/calendar/shifts/${shiftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          ...ownership,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to update shift");
      }

      const data = await res.json();
      const mapped = mapShiftRow({ ...data, id: shiftId });
      setShifts((prev) =>
        prev
          .map((s) => (s.id === shiftId ? mapped : s))
          .sort(
            (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()
          )
      );
    },
    [buildOwnershipPayload]
  );

  const handleDeleteShift = useCallback(async (shiftId: string) => {
    const res = await fetch(`/api/calendar/shifts/${shiftId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || "Failed to delete shift");
    }

    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
  }, []);

  const membershipMemo = useMemo<CollectiveCalendarMembership>(
    () => ({
      podIds: membership.podIds,
      orgIds: membership.orgIds,
      profileId,
      userId,
    }),
    [membership.orgIds, membership.podIds, profileId, userId]
  );

  return (
    <div className="md:px-2">
      <CollectiveCalendar
        loading={loading}
        error={error}
        shifts={shifts}
        pods={pods}
        organizations={organizations}
        membership={membershipMemo}
        onSignup={handleSignup}
        onCreateShift={handleCreateShift}
        onUpdateShift={handleUpdateShift}
        onDeleteShift={handleDeleteShift}
      />
    </div>
  );
}
