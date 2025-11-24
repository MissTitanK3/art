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
} from "@workspace/ui/components/client/pods/CollectiveCalendar";
import { toast } from "sonner";

type OrgPodInput = {
  name: string;
  area?: string | null;
};

type OrgPodUpdate = {
  name?: string;
  area?: string | null;
};

type CalendarOrgWithPods = CalendarOrgSummary & {
  pods?: CalendarPodSummary[];
};

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
  signups:pod_shift_signups(user_id)
`;

function normalizeVisibility(value: any): CollectiveCalendarShift["visibility"] {
  return value === "org" || value === "private" ? value : "public";
}

function mapShiftRow(row: any): CollectiveCalendarShift {
  const pod = row.pod ?? row.pods ?? {};
  const orgLinks = Array.isArray(row.orgs ?? row.organization_pods)
    ? row.orgs ?? row.organization_pods
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
  };
}

export default function CollectiveCalendarDataLayer() {
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
          ? data.pods.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            slug: p.slug,
            area: p.area,
          })) as CalendarPodSummary[]
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
        const orgMap = new Map<string, CalendarOrgWithPods>();

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
            .sort((a, b) => a.name.localeCompare(b.name)),
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

  const callOrgApi = useCallback(async (path: string, init?: RequestInit) => {
    const res = await fetch(path, {
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      ...init,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error ?? "Request failed");
    }
    return json;
  }, []);

  const mutateOrgPods = useCallback(
    (
      orgId: string,
      updater: (pods: CalendarPodSummary[]) => CalendarPodSummary[],
    ) => {
      setOrganizations((prev) =>
        prev
          .map((org) => {
            if (org.id !== orgId) return org;
            const withPods = org as CalendarOrgWithPods;
            const nextPods = updater(withPods.pods ?? []);
            return { ...withPods, pods: nextPods } as CalendarOrgSummary;
          })
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
    [],
  );

  const syncGlobalPods = useCallback((pod: CalendarPodSummary) => {
    setPods((prev) => {
      const existing = prev.find((p) => p.id === pod.id);
      if (!existing) return sortPodsByName([...prev, pod]);
      return prev.map((p) => (p.id === pod.id ? { ...p, ...pod } : p));
    });
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
          s.id === shift.id ? { ...s, signups: [...s.signups, signupId] } : s,
        ),
      );
      toast.success("Signed up", {
        description: "You are on the crew list for this shift.",
      });
    },
    [profileId, userId],
  );

  const handleCreateOrg = useCallback(
    async (name: string, description: string) => {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to create organization");
      }

      const newOrg = await res.json();
      setOrganizations((prev) =>
        [...prev, newOrg].sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
    [],
  );

  const handleUpdateOrg = useCallback(
    async (orgId: string, name: string, description: string) => {
      const res = await fetch(`/api/orgs/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to update organization");
      }

      setOrganizations((prev) =>
        prev
          .map((o) =>
            o.id === orgId ? { ...o, name, description } : o,
          )
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
    [],
  );

  const handleDeleteOrg = useCallback(
    async (orgId: string) => {
      const res = await fetch(`/api/orgs/${orgId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to delete organization");
      }

      setOrganizations((prev) => prev.filter((o) => o.id !== orgId));
    },
    [],
  );

  const handleCreateOrgPod = useCallback(
    async (orgId: string, input: OrgPodInput) => {
      const json = await callOrgApi(`/api/orgs/${orgId}/pods`, {
        method: "POST",
        body: JSON.stringify({
          name: input.name,
          area: input.area ?? null,
        }),
      });
      const pod = json?.pod as CalendarPodSummary | undefined;
      if (!pod) throw new Error("Missing pod payload");
      mutateOrgPods(orgId, (pods) => sortPodsByName([...pods, pod]));
      syncGlobalPods(pod);
    },
    [callOrgApi, mutateOrgPods, syncGlobalPods],
  );

  const handleLinkOrgPod = useCallback(
    async (orgId: string, podId: string) => {
      const json = await callOrgApi(`/api/orgs/${orgId}/pods`, {
        method: "POST",
        body: JSON.stringify({ existingPodId: podId }),
      });
      const pod = json?.pod as CalendarPodSummary | undefined;
      if (pod) {
        mutateOrgPods(orgId, (pods) => {
          if (pods.some((p) => p.id === pod.id)) return pods;
          return sortPodsByName([...pods, pod]);
        });
        syncGlobalPods(pod);
      }
    },
    [callOrgApi, mutateOrgPods, syncGlobalPods],
  );

  const handleUpdateOrgPod = useCallback(
    async (orgId: string, podId: string, patch: OrgPodUpdate) => {
      const json = await callOrgApi(`/api/orgs/${orgId}/pods/${podId}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      const pod = json?.pod as CalendarPodSummary | undefined;
      if (!pod) throw new Error("Missing pod payload");
      mutateOrgPods(orgId, (pods) =>
        sortPodsByName(pods.map((p) => (p.id === pod.id ? pod : p))),
      );
      syncGlobalPods(pod);
    },
    [callOrgApi, mutateOrgPods, syncGlobalPods],
  );

  const handleRemoveOrgPod = useCallback(
    async (orgId: string, podId: string, options?: { hardDelete?: boolean }) => {
      const params = options?.hardDelete ? "?hard=true" : "";
      const json = await callOrgApi(
        `/api/orgs/${orgId}/pods/${podId}${params}`,
        {
          method: "DELETE",
        },
      );
      mutateOrgPods(orgId, (pods) => pods.filter((p) => p.id !== podId));
      if (json?.podDeleted) {
        setPods((prev) => prev.filter((p) => p.id !== podId));
      }
    },
    [callOrgApi, mutateOrgPods],
  );

  const handleCreateShift = useCallback(
    async (input: CollectiveCalendarShiftInput) => {
      const res = await fetch("/api/calendar/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
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
          (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime(),
        ),
      );
    },
    [],
  );

  const handleUpdateShift = useCallback(
    async (shiftId: string, input: CollectiveCalendarShiftInput) => {
      const res = await fetch(`/api/calendar/shifts/${shiftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
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
            (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime(),
          ),
      );
    },
    [],
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
    [membership.orgIds, membership.podIds, profileId, userId],
  );

  return (
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
      onCreateOrg={handleCreateOrg}
      onUpdateOrg={handleUpdateOrg}
      onDeleteOrg={handleDeleteOrg}
      onCreateOrgPod={handleCreateOrgPod}
      onLinkOrgPod={handleLinkOrgPod}
      onUpdateOrgPod={handleUpdateOrgPod}
      onRemoveOrgPod={handleRemoveOrgPod}
    />
  );
}
