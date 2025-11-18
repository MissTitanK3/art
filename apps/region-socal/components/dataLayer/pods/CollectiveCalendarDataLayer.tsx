"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import {
  CollectiveCalendar,
  CollectiveCalendarMembership,
  CollectiveCalendarShift,
  CalendarOrgSummary,
  CalendarPodSummary,
} from "@workspace/ui/components/client/pods/CollectiveCalendar";
import { toast } from "sonner";

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
    const supabase = getSupabaseBrowserClient();
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const { data: userRes, error: userErr } =
          await supabase.auth.getUser();
        if (userErr) throw userErr;
        const uid = userRes?.user?.id ?? null;
        if (active) setUserId(uid);

        // Resolve profile id for joins
        let resolvedProfileId: string | null = null;
        if (uid) {
          const { data: profileRow } = await supabase
            .from("profiles")
            .select("id, user_id")
            .or(`user_id.eq.${uid},id.eq.${uid}`)
            .maybeSingle();
          resolvedProfileId =
            profileRow?.id ?? profileRow?.user_id ?? userRes?.user?.id ?? null;
        }
        if (active) setProfileId(resolvedProfileId);

        const shiftsPromise = supabase
          .from("pod_shifts")
          .select(
            `
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
          `,
          )
          .order("start", { ascending: true });

        const podsPromise = supabase
          .from("pods")
          .select("id, name, slug, area")
          .order("name", { ascending: true });

        const rosterPromise = resolvedProfileId
          ? supabase
            .from("roster_entries")
            .select("pod_id")
            .eq("profile_id", resolvedProfileId)
          : Promise.resolve({ data: null });

        const orgRolesPromise = resolvedProfileId
          ? supabase
            .from("organization_roles")
            .select(
              "org_id, role, organization:organizations(id, name, description)",
            )
            .eq("user_id", resolvedProfileId)
          : Promise.resolve({ data: null });

        const orgPodsPromise = supabase
          .from("organization_pods")
          .select(
            "org_id, pod_id, organization:organizations(id, name, description), pod:pods(id, name, slug)",
          );

        const shiftsRes = await shiftsPromise;
        const podsRes = await podsPromise;
        const rosterRes = await rosterPromise;
        const orgRolesRes = await orgRolesPromise;
        const orgPodsRes = await orgPodsPromise;

        const mappedShifts = Array.isArray(shiftsRes?.data)
          ? (shiftsRes!.data as any[]).map(mapShiftRow)
          : [];
        const knownPods = Array.isArray(podsRes?.data)
          ? podsRes!.data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            slug: p.slug,
            area: p.area,
          })) as CalendarPodSummary[]
          : [];
        if (active) setPods(knownPods);

        const podMembershipIds = new Set<string>();
        if (Array.isArray(rosterRes?.data)) {
          for (const row of rosterRes!.data as any[]) {
            if (row?.pod_id) podMembershipIds.add(String(row.pod_id));
          }
        }

        const orgRoleRows: CalendarOrgSummary[] = Array.isArray(
          orgRolesRes?.data,
        )
          ? (orgRolesRes!.data as any[]).map((row: any) => ({
            id: String(row.org_id ?? row.organization?.id),
            name: row.organization?.name ?? "Organization",
            description: row.organization?.description ?? null,
            role: row.role ?? null,
          }))
          : [];

        const orgPodRows = Array.isArray(orgPodsRes?.data)
          ? (orgPodsRes!.data as any[])
          : [];
        const orgIdsFromPods = new Set<string>();
        const orgMap = new Map<string, CalendarOrgSummary>();
        for (const row of orgPodRows) {
          const orgId = row.org_id ?? row.organization?.id;
          if (!orgId) continue;
          const entry: CalendarOrgSummary = {
            id: String(orgId),
            name: row.organization?.name ?? "Organization",
            description: row.organization?.description ?? null,
          };
          orgMap.set(entry.id, { ...(orgMap.get(entry.id) ?? entry), ...entry });
          if (row.pod_id && podMembershipIds.has(String(row.pod_id))) {
            orgIdsFromPods.add(String(orgId));
          }
        }

        for (const role of orgRoleRows) {
          orgMap.set(role.id, { ...(orgMap.get(role.id) ?? role), ...role });
        }

        if (active) {
          setOrganizations(Array.from(orgMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name),
          ));
        }

        const combinedOrgIds = new Set<string>([
          ...orgIdsFromPods,
          ...orgRoleRows.map((r) => r.id),
        ]);
        if (active) {
          setMembership({
            podIds: Array.from(podMembershipIds),
            orgIds: Array.from(combinedOrgIds),
            profileId: resolvedProfileId,
            userId: uid,
          });
          setShifts(mappedShifts);
          setError(null);
        }
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
      const supabase = getSupabaseBrowserClient();
      const { error: upsertError } = await supabase
        .from("pod_shift_signups")
        .upsert({
          id: crypto.randomUUID(),
          shift_id: shift.id,
          user_id: signupId,
        });
      if (upsertError) throw upsertError;

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
      const supabase = getSupabaseBrowserClient();
      const newId = crypto.randomUUID();
      const { error } = await supabase.from("organizations").insert({
        id: newId,
        name,
        description,
      });
      if (error) throw error;

      // Assign owner role if we have a profile
      if (profileId) {
        const { error: roleError } = await supabase
          .from("organization_roles")
          .insert({
            org_id: newId,
            user_id: profileId,
            role: "owner",
          });
        if (roleError) {
          console.error("Failed to assign owner role", roleError);
          // We don't throw here to avoid blocking the UI, but it's an issue.
        }
      }

      const newOrg: CalendarOrgSummary = {
        id: newId,
        name,
        description,
        role: "owner",
      };
      setOrganizations((prev) =>
        [...prev, newOrg].sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
    [profileId],
  );

  const handleUpdateOrg = useCallback(
    async (orgId: string, name: string, description: string) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("organizations")
        .update({ name, description })
        .eq("id", orgId);
      if (error) throw error;

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
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("organizations")
        .delete()
        .eq("id", orgId);
      if (error) throw error;

      setOrganizations((prev) => prev.filter((o) => o.id !== orgId));
    },
    [],
  );

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
      onCreateOrg={handleCreateOrg}
      onUpdateOrg={handleUpdateOrg}
      onDeleteOrg={handleDeleteOrg}
    />
  );
}
