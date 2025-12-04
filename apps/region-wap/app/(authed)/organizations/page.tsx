"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "@workspace/ui/primitives/sonner";
import { VisibilityScope } from "@workspace/store/utils/permissions/types";

import {
  addMemberToOrganization,
  addPodToOrganization,
  createOrganization,
  getOrganizationMembers,
  getOrganization,
  getOrganizationPods,
  getOrganizationPolls,
  getOrganizationsByRegion,
  removeMemberFromOrganization,
  removePodFromOrganization,
  transferOwnership,
  updateMemberRole,
  updateOrganization,
  updateOrganizationNorms,
  createOrganizationPoll,
  voteOnPoll,
  updatePollStatus,
  deletePoll,
  updateOrganizationVisibilityScope,
} from "@/lib/dal/organizations";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import { OrgDashboardDrawer } from "@workspace/ui/patterns/features/orgs/org-dashboard-drawer";
import { OrgSwitcher } from "@workspace/ui/patterns/features/orgs/org-switcher";
import { OrgCreateDrawer } from "@workspace/ui/patterns/features/orgs/org-create-drawer";
import { Button } from "@workspace/ui/primitives/button";
import type {
  Org,
  OrgMember,
  OrgNorms,
  OrgPermissions,
  OrgPod,
  OrgPoll,
  OrgRoleOption,
  OrgRegisteredUser,
} from "@workspace/ui/patterns/features/orgs/types";

const ROLE_OPTIONS: OrgRoleOption[] = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

export default function OrganizationsPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [podsByOrg, setPodsByOrg] = useState<Record<string, OrgPod[]>>({});
  const [membersByOrg, setMembersByOrg] = useState<Record<string, OrgMember[]>>(
    {}
  );
  const [pollsByOrg, setPollsByOrg] = useState<Record<string, OrgPoll[]>>({});
  const [allPods, setAllPods] = useState<OrgPod[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<OrgRegisteredUser[]>(
    []
  );
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<OrgPermissions>({
    canViewPods: true,
    canViewNorms: true,
  });
  const [createOpen, setCreateOpen] = useState(false);

  const loadRegisteredUsers = async () => {
    try {
      const res = await fetch("/api/dispatch/profiles", {
        credentials: "include",
      });
      if (!res.ok) return;
      const json = await res.json();
      const profiles = Array.isArray(json?.profiles) ? json.profiles : [];
      setRegisteredUsers(
        profiles
          .filter((profile: any) => profile?.id)
          .map((profile: any) => ({
            id: String(profile.id),
            displayName: profile.display_name ?? "Registered user",
            detail: profile.affiliation ?? profile.access_role ?? null,
          }))
      );
    } catch (e) {
      console.warn("[organizations/page] profile fetch error", e);
    }
  };

  useEffect(() => {
    if (permissions?.canManageMembers) {
      void loadRegisteredUsers();
    }
  }, [permissions?.canManageMembers]);

  const loadOrganizations = useCallback(async () => {
    const formatError = (err: any) =>
      err?.message ||
      err?.error_description ||
      err?.error ||
      "Unable to load organizations";

    setLoading(true);
    setError(null);
    try {
      // Resolve permissions based on the caller's nav role; RLS still enforces access.
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;
      const userId = userData?.user?.id;
      let navRole: string | null = null;
      if (userId) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, access_role")
          .eq("user_id", userId)
          .maybeSingle();
        if (profileError) throw profileError;
        navRole = (profile as any)?.access_role ?? null;
        setCurrentProfileId((profile as any)?.id ?? null);
      }
      const elevatedRoles = new Set([
        "pod_leader",
        "trainer",
        "dispatcher_basic",
        "dispatcher_verified",
        "dispatcher_admin",
        "admin",
        "regional_admin",
        "national_admin",
      ]);
      const canManage = elevatedRoles.has(navRole ?? "");
      setPermissions({
        canViewPods: true,
        canViewNorms: true,
        canLinkPods: canManage,
        canManagePods: canManage,
        canManageMembers: canManage,
        canEditOrg: canManage,
        canTransferOwnership: canManage,
        canEditNorms: canManage,
        isOrgAdmin: canManage,
        isOrgOwner: false,
      });

      const fetchedOrgs = await getOrganizationsByRegion();
      setOrgs(fetchedOrgs);
      setActiveOrgId((current) => current ?? fetchedOrgs[0]?.id ?? null);

      const [podEntries, memberEntries, pollEntries] = await Promise.all([
        Promise.all(
          fetchedOrgs.map(async (org) => {
            const orgPods = await getOrganizationPods(org.id);
            return [org.id, orgPods] as const;
          })
        ),
        Promise.all(
          fetchedOrgs.map(async (org) => {
            const orgMembers = await getOrganizationMembers(org.id);
            return [org.id, orgMembers] as const;
          })
        ),
        Promise.all(
          fetchedOrgs.map(async (org) => {
            const orgPolls = await getOrganizationPolls(org.id);
            return [org.id, orgPolls] as const;
          })
        ),
      ]);
      setPodsByOrg(Object.fromEntries(podEntries));
      setMembersByOrg(Object.fromEntries(memberEntries));
      setPollsByOrg(Object.fromEntries(pollEntries));

      const { data: podData, error: podError } = await supabase
        .from("pods")
        .select("id, name, slug, area, description")
        .is("deleted_at", null);
      if (podError) {
        console.warn("[organizations/page] pods fetch error", podError);
        toast.error(formatError(podError));
        setAllPods([]);
      } else {
        setAllPods(
          (podData ?? []).map((pod: any) => ({
            id: String(pod.id),
            name: pod.name ?? "Pod",
            slug: pod.slug ?? null,
            area: pod.area ?? null,
            description: pod.description ?? null,
          }))
        );
      }
    } catch (e: any) {
      console.error("[organizations/page] load error", e);
      setError(formatError(e));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  const refreshOrg = async (orgId: string) => {
    const [nextOrg, nextPods, nextMembers, nextPolls] = await Promise.all([
      getOrganization(orgId),
      getOrganizationPods(orgId),
      getOrganizationMembers(orgId),
      getOrganizationPolls(orgId),
    ]);
    if (nextOrg) {
      setOrgs((prev) =>
        prev.map((org) => (org.id === orgId ? { ...org, ...nextOrg } : org))
      );
    }
    setPodsByOrg((prev) => ({ ...prev, [orgId]: nextPods }));
    setMembersByOrg((prev) => ({ ...prev, [orgId]: nextMembers }));
    setPollsByOrg((prev) => ({ ...prev, [orgId]: nextPolls }));
  };

  const handleUpdateOrg = async (
    orgId: string,
    updates: { name: string; description?: string | null }
  ) => {
    try {
      await updateOrganization(orgId, updates);
      setOrgs((prev) =>
        prev.map((org) => (org.id === orgId ? { ...org, ...updates } : org))
      );
      toast.success("Organization updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to update organization");
    }
  };

  const handleLinkPod = async (orgId: string, podId: string) => {
    try {
      await addPodToOrganization(orgId, podId);
      toast.success("Pod linked");
      await refreshOrg(orgId);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to link pod");
    }
  };

  const handleRemovePod = async (orgId: string, podId: string) => {
    try {
      await removePodFromOrganization(orgId, podId);
      toast.success("Pod unlinked");
      await refreshOrg(orgId);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to unlink pod");
    }
  };

  const handleUpdateMemberRole = async (
    orgId: string,
    memberId: string,
    role: string
  ) => {
    try {
      await updateMemberRole(orgId, memberId, role);
      toast.success("Member updated");
      await refreshOrg(orgId);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to update member");
    }
  };

  const handleRemoveMember = async (orgId: string, memberId: string) => {
    try {
      await removeMemberFromOrganization(orgId, memberId);
      toast.success("Member removed");
      await refreshOrg(orgId);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to remove member");
    }
  };

  const handleTransferOwnership = async (orgId: string, memberId: string) => {
    try {
      await transferOwnership(orgId, memberId);
      toast.success("Ownership transferred");
      await refreshOrg(orgId);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to transfer ownership");
    }
  };

  const handleUpdateNorms = async (orgId: string, norms: OrgNorms) => {
    try {
      const res = await updateOrganizationNorms(orgId, norms);
      const nextNorms = (res as any)?.norms ?? norms ?? null;
      setOrgs((prev) =>
        prev.map((org) =>
          org.id === orgId ? { ...org, norms: nextNorms } : org
        )
      );
      await refreshOrg(orgId);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to update norms");
      throw e;
    }
  };

  const handleUpdateVisibilityScope = async (
    orgId: string,
    scope: VisibilityScope
  ) => {
    try {
      await updateOrganizationVisibilityScope(orgId, scope);
      setOrgs((prev) =>
        prev.map((org) =>
          org.id === orgId ? { ...org, visibilityScope: scope } : org
        )
      );
      toast.success("Visibility updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to update visibility");
    }
  };

  const handleCreatePoll = async (
    orgId: string,
    payload: {
      title: string;
      options: Array<{ label: string; emoji?: string | null }>;
      closesAt?: string | null;
      allowMultiple?: boolean;
    }
  ) => {
    try {
      const created = await createOrganizationPoll(orgId, payload);
      setPollsByOrg((prev) => ({
        ...prev,
        [orgId]: [created, ...(prev[orgId] ?? [])],
      }));
      toast.success("Poll created");
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to create poll");
      throw e;
    }
  };

  const handleVotePoll = async (
    orgId: string,
    pollId: string,
    optionId: string
  ) => {
    try {
      await voteOnPoll(pollId, optionId);
      await refreshOrg(orgId);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to record vote");
    }
  };

  const handleUpdatePollStatus = async (
    orgId: string,
    pollId: string,
    status: "open" | "closed" | "archived"
  ) => {
    try {
      await updatePollStatus(orgId, pollId, status);
      await refreshOrg(orgId);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to update poll");
    }
  };

  const handleDeletePoll = async (orgId: string, pollId: string) => {
    try {
      await deletePoll(orgId, pollId);
      setPollsByOrg((prev) => ({
        ...prev,
        [orgId]: (prev[orgId] ?? []).filter((poll) => poll.id !== pollId),
      }));
      toast.success("Poll deleted");
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to delete poll");
    }
  };

  const openOrgDashboard = async (orgId: string) => {
    setActiveOrgId(orgId);
    if (!podsByOrg[orgId] || !membersByOrg[orgId] || !pollsByOrg[orgId]) {
      await refreshOrg(orgId);
    }
  };

  const activeOrg = activeOrgId
    ? (orgs.find((org) => org.id === activeOrgId) ?? null)
    : null;
  const activePods = activeOrgId ? (podsByOrg[activeOrgId] ?? []) : [];
  const activeMembers = activeOrgId ? (membersByOrg[activeOrgId] ?? []) : [];
  const activePolls = activeOrgId ? (pollsByOrg[activeOrgId] ?? []) : [];
  const availablePods = activeOrgId
    ? allPods.filter(
        (pod) => !(podsByOrg[activeOrgId] ?? []).some((p) => p.id === pod.id)
      )
    : [];

  return (
    <div className="space-y-4">
      <div className="space-y-1 flex flex-col gap-2 items-center">
        <div className="flex flex-col md:flex-row w-full justify-between items-center">
          <h1 className="text-2xl font-semibold">Organizations</h1>
          <p className="text-sm text-muted-foreground">
            Create organizations and manage which pods belong to each one.
          </p>
        </div>
        <div className="flex w-full justify-between items-center gap-2">
          {orgs.length > 0 && (
            <OrgSwitcher
              userOrgs={orgs}
              activeOrgId={activeOrgId}
              onOpenOrg={openOrgDashboard}
            />
          )}
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            New organization
          </Button>
        </div>
        {loading && (
          <p className="text-xs text-muted-foreground">
            Loading organizations...
          </p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {activeOrg && (
        <OrgDashboardDrawer
          open={!!activeOrg}
          org={activeOrg}
          pods={activePods}
          members={activeMembers}
          polls={activePolls}
          visibilityScope={activeOrg.visibilityScope ?? null}
          userRole={null}
          permissions={permissions}
          availablePods={availablePods}
          memberRoles={ROLE_OPTIONS}
          onUpdateOrg={handleUpdateOrg}
          onLinkPod={handleLinkPod}
          onRemovePod={handleRemovePod}
          onUpdateMemberRole={handleUpdateMemberRole}
          onRemoveMember={handleRemoveMember}
          onTransferOwnership={handleTransferOwnership}
          registeredUsers={registeredUsers}
          onUpdateNorms={handleUpdateNorms}
          onUpdateVisibilityScope={handleUpdateVisibilityScope}
          onCreatePoll={(orgId, poll) => handleCreatePoll(orgId, poll)}
          onVotePoll={(orgId, pollId, optionId) =>
            handleVotePoll(orgId, pollId, optionId)
          }
          onClosePoll={(orgId, pollId) =>
            handleUpdatePollStatus(orgId, pollId, "closed")
          }
          onReopenPoll={(orgId, pollId) =>
            handleUpdatePollStatus(orgId, pollId, "open")
          }
          onDeletePoll={(orgId, pollId) => handleDeletePoll(orgId, pollId)}
          onAddMember={async (orgId, profileId, role) => {
            try {
              await addMemberToOrganization(orgId, profileId, role);
              toast.success("Member added");
              await refreshOrg(orgId);
            } catch (e: any) {
              toast.error(e?.message ?? "Unable to add member");
            }
          }}
        />
      )}

      <OrgCreateDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={async ({ name, description }) => {
          const created = await createOrganization({ name, description });
          setOrgs((prev) => [created, ...prev]);
          setPodsByOrg((prev) => ({ ...prev, [created.id]: [] }));
          setMembersByOrg((prev) => ({ ...prev, [created.id]: [] }));
          setPollsByOrg((prev) => ({ ...prev, [created.id]: [] }));
          setActiveOrgId(created.id);
          if (currentProfileId) {
            try {
              await addMemberToOrganization(
                created.id,
                currentProfileId,
                "owner"
              );
              await refreshOrg(created.id);
            } catch (e: any) {
              toast.error(e?.message ?? "Unable to add creator as owner");
            }
          }
        }}
      />
    </div>
  );
}
