"use client";

import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import { isDemoMode } from "@/lib/demo/supabaseStub";
import type {
  Org,
  OrgMember,
  OrgNorms,
  OrgPod,
  OrgPoll,
} from "@workspace/ui/components/client/orgs/types";

function mapOrgRow(row: any): Org {
  return {
    id: String(row.id),
    name: row.name ?? "Untitled org",
    description: row.description ?? row.summary ?? null,
    slug: row.slug ?? null,
    regionId: row.region_id ?? null,
    norms: (row.norms as OrgNorms) ?? null,
    visibilityScope: row.visibility_scope ?? null,
  };
}

function mapPoll(row: any): OrgPoll {
  return {
    id: String(row.id),
    title: row.title ?? "Poll",
    status: row.status ?? "open",
    closesAt: row.closes_at ?? null,
    allowMultiple: Boolean(row.allow_multiple),
    createdAt: row.created_at ?? null,
    createdBy: row.created_by ?? null,
    note: row.note ?? null,
    options: Array.isArray(row.options)
      ? row.options.map((opt: any, idx: number) => ({
        id: String(opt.id ?? `${row.id}-${idx}`),
        label: opt.label ?? "Option",
        emoji: opt.emoji ?? null,
        votes: opt.votes_count ?? 0,
      }))
      : [],
  };
}

const demoOrg: Org = {
  id: "demo-org-1",
  name: "Demo Organization",
  description: "Demo organization for template",
  slug: "demo-org",
  regionId: "region-template",
  norms: null,
  visibilityScope: "regional" as any,
};

const demoPods: OrgPod[] = [
  { id: "demo-pod-1", name: "Demo Pod Alpha", slug: "demo-pod-1", area: "Central", description: null },
  { id: "demo-pod-2", name: "Demo Pod Beta", slug: "demo-pod-2", area: "North", description: null },
];

const demoMembers: OrgMember[] = [
  {
    id: "demo-member-1",
    membershipId: "demo-member-1",
    displayName: "Demo Admin",
    role: "owner",
  },
];

export async function getOrganizationsByRegion(regionId?: string): Promise<Org[]> {
  try {
    if (isDemoMode()) {
      return [demoOrg];
    }
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from("organizations")
      .select("id, name, description, slug, region_id, norms, visibility_scope")
      .is("deleted_at", null);
    if (regionId) {
      query = query.eq("region_id", regionId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return Array.isArray(data) ? data.map(mapOrgRow) : [];
  } catch (e) {
    console.warn("[dal/organizations] getOrganizationsByRegion error", e);
    return [];
  }
}

export async function getOrganization(orgId: string): Promise<Org | null> {
  try {
    if (isDemoMode()) {
      return demoOrg;
    }
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, description, slug, region_id, norms, visibility_scope")
      .eq("id", orgId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapOrgRow(data) : null;
  } catch (e) {
    console.warn("[dal/organizations] getOrganization error", e);
    return null;
  }
}

export async function getOrganizationPods(orgId: string): Promise<OrgPod[]> {
  try {
    if (isDemoMode()) {
      return demoPods;
    }
    const res = await fetch(`/api/orgs/pods?orgId=${encodeURIComponent(orgId)}`, {
      credentials: "same-origin",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message ?? body?.error ?? "Unable to load pods");
    }
    const data = await res.json();
    return (data ?? [])
      .map((row: any) => row.pod)
      .filter(Boolean)
      .map((pod: any) => ({
        id: String(pod.id),
        name: pod.name ?? "Pod",
        slug: pod.slug ?? null,
        area: pod.area ?? null,
        description: pod.description ?? null,
      }));
  } catch (e) {
    console.warn("[dal/organizations] getOrganizationPods error", e);
    return [];
  }
}

export async function getOrganizationMembers(orgId: string): Promise<OrgMember[]> {
  try {
    if (isDemoMode()) {
      return demoMembers;
    }
    const res = await fetch(
      `/api/orgs/members?orgId=${encodeURIComponent(orgId)}`,
      { credentials: "same-origin" },
    );
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message ?? body?.error ?? "Unable to load members");
    }
    const data = await res.json();
    return (data ?? []).map((row: any, idx: number) => ({
      id: String(row.id ?? `${orgId}-${idx}`),
      membershipId: row.id ? String(row.id) : undefined,
      displayName: row.user?.display_name ?? "Member",
      role: row.role ?? "member",
    }));
  } catch (e) {
    console.warn("[dal/organizations] getOrganizationMembers error", e);
    return [];
  }
}

export async function getOrganizationPolls(orgId: string): Promise<OrgPoll[]> {
  try {
    if (isDemoMode()) {
      return [];
    }
    const res = await fetch(
      `/api/orgs/polls?orgId=${encodeURIComponent(orgId)}`,
      { credentials: "same-origin" },
    );
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message ?? body?.error ?? "Unable to load polls");
    }
    const data = await res.json();
    return Array.isArray(data) ? data.map(mapPoll) : [];
  } catch (e) {
    console.warn("[dal/organizations] getOrganizationPolls error", e);
    return [];
  }
}

export async function updateOrganization(
  orgId: string,
  updates: { name: string; description?: string | null },
) {
  if (isDemoMode()) return;
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      name: updates.name,
      description: updates.description ?? null,
    })
    .eq("id", orgId);
  if (error) throw error;
}

export async function updateOrganizationNorms(orgId: string, norms: OrgNorms) {
  if (isDemoMode()) return { id: orgId, norms } as any;
  const res = await fetch(`/api/orgs/${encodeURIComponent(orgId)}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ norms }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? body?.error ?? "Unable to update norms");
  }
  return { id: orgId, norms } as any;
}

export async function addPodToOrganization(orgId: string, podId: string) {
  if (isDemoMode()) return;
  const res = await fetch("/api/orgs/pods", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgId, podId }),
  });
  if (!res.ok) {
    let message = "Unable to link pod";
    try {
      const body = await res.json();
      message = body?.message ?? body?.error ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
}

export async function removePodFromOrganization(orgId: string, podId: string) {
  if (isDemoMode()) return;
  const res = await fetch(
    `/api/orgs/pods?orgId=${encodeURIComponent(orgId)}&podId=${encodeURIComponent(podId)}`,
    {
      method: "DELETE",
      credentials: "same-origin",
    },
  );
  if (!res.ok) {
    let message = "Unable to unlink pod";
    try {
      const body = await res.json();
      message = body?.message ?? body?.error ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
}

export async function addMemberToOrganization(
  orgId: string,
  profileId: string,
  role: string,
) {
  if (isDemoMode()) return;
  const res = await fetch("/api/orgs/members", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgId, profileId, role }),
  });
  if (!res.ok) {
    let message = "Unable to add member";
    try {
      const body = await res.json();
      message = body?.message ?? body?.error ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
}

export async function updateMemberRole(
  orgId: string,
  membershipId: string,
  role: string,
) {
  if (isDemoMode()) return;
  const res = await fetch("/api/orgs/members", {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgId, membershipId, role }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? body?.error ?? "Unable to update member");
  }
}

export async function transferOwnership(orgId: string, membershipId: string) {
  if (isDemoMode()) return;
  await updateMemberRole(orgId, membershipId, "owner");
}

export async function removeMemberFromOrganization(
  orgId: string,
  membershipId: string,
) {
  if (isDemoMode()) return;
  const res = await fetch("/api/orgs/members", {
    method: "DELETE",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgId, membershipId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? body?.error ?? "Unable to remove member");
  }
}

export async function createOrganization(payload: {
  name: string;
  description?: string | null;
}) {
  if (isDemoMode()) return demoOrg;
  const res = await fetch("/api/orgs", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      description: payload.description ?? null,
    }),
  });
  if (!res.ok) {
    let message = "Unable to create organization";
    try {
      const body = await res.json();
      message = body?.message ?? body?.error ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const data = await res.json();
  return mapOrgRow(data);
}

export async function updateOrganizationVisibilityScope(orgId: string, visibilityScope: string) {
  if (isDemoMode()) return;
  const res = await fetch(`/api/orgs/${encodeURIComponent(orgId)}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visibilityScope }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? body?.error ?? "Unable to update visibility");
  }
}

export async function createOrganizationPoll(
  orgId: string,
  payload: {
    title: string;
    options: Array<{ label: string; emoji?: string | null }>;
    closesAt?: string | null;
    allowMultiple?: boolean;
  },
) {
  if (isDemoMode()) {
    return mapPoll({
      id: "demo-poll",
      title: payload.title,
      status: "open",
      options: payload.options?.map((o, idx) => ({
        id: `opt-${idx}`,
        label: o.label,
        emoji: o.emoji ?? null,
        votes_count: 0,
      })),
    });
  }
  const res = await fetch("/api/orgs/polls", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orgId,
      title: payload.title,
      options: payload.options,
      closesAt: payload.closesAt ?? null,
      allowMultiple: payload.allowMultiple ?? false,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? body?.error ?? "Unable to create poll");
  }
  const data = await res.json();
  return mapPoll(data);
}

export async function voteOnPoll(pollId: string, optionId: string) {
  if (isDemoMode()) return;
  const res = await fetch("/api/orgs/polls/vote", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pollId, optionId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? body?.error ?? "Unable to record vote");
  }
}

export async function updatePollStatus(orgId: string, pollId: string, status: "open" | "closed" | "archived") {
  if (isDemoMode()) return;
  const res = await fetch("/api/orgs/polls", {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgId, pollId, status }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? body?.error ?? "Unable to update poll");
  }
}

export async function deletePoll(orgId: string, pollId: string) {
  if (isDemoMode()) return;
  const res = await fetch(`/api/orgs/polls?orgId=${encodeURIComponent(orgId)}&pollId=${encodeURIComponent(pollId)}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? body?.error ?? "Unable to delete poll");
  }
}
