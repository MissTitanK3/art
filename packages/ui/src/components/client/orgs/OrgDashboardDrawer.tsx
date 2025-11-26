"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { OrgTabs } from "./OrgTabs";
import { OrgHeader } from "./OrgHeader";
import { OrgPodsPanel } from "./panels/OrgPodsPanel";
import { OrgMembersPanel } from "./panels/OrgMembersPanel";
import { OrgPollsPanel } from "./panels/OrgPollsPanel";
import { OrgEditSheet } from "./sheets/OrgEditSheet";
import { OrgLinkPodSheet } from "./sheets/OrgLinkPodSheet";
import { OrgTransferOwnershipSheet } from "./sheets/OrgTransferOwnershipSheet";
import { OrgMemberActionsSheet } from "./sheets/OrgMemberActionsSheet";
import { OrgNormsOverviewCard } from "./OrgNormsOverviewCard";
import { OrgNormsEditorSheet } from "./OrgNormsEditorSheet";
import { VisibilitySelector } from "@workspace/ui/components/permissions/VisibilitySelector";
import type { VisibilityScope } from "@workspace/store/utils/permissions/types";
import type {
  Org,
  OrgMember,
  OrgNorms,
  OrgPoll,
  OrgPermissions,
  OrgPod,
  OrgRoleOption,
  OrgRegisteredUser,
  OrgTabKey,
} from "./types";
import { ORG_NORM_PRESETS, ORG_POLL_PRIVACY_NOTE } from "./types";

type OrgDashboardDrawerProps = {
  open: boolean;
  org: Org;
  pods: OrgPod[];
  members: OrgMember[];
  userRole?: string | null;
  permissions?: OrgPermissions;
  availablePods?: OrgPod[];
  registeredUsers?: OrgRegisteredUser[];
  memberRoles?: OrgRoleOption[];
  onUpdateOrg?: (
    orgId: string,
    updates: { name: string; description?: string | null },
  ) => Promise<void> | void;
  onLinkPod?: (orgId: string, podId: string) => Promise<void> | void;
  onRemovePod?: (orgId: string, podId: string) => Promise<void> | void;
  onUpdateMemberRole?: (
    orgId: string,
    memberId: string,
    role: string,
  ) => Promise<void> | void;
  onRemoveMember?: (orgId: string, memberId: string) => Promise<void> | void;
  onTransferOwnership?: (
    orgId: string,
    memberId: string,
  ) => Promise<void> | void;
  onAddMember?: (
    orgId: string,
    profileId: string,
    role: string,
  ) => Promise<void> | void;
  onUpdateNorms?: (orgId: string, norms: OrgNorms) => Promise<void> | void;
  visibilityScope?: VisibilityScope | null;
  onUpdateVisibilityScope?: (
    orgId: string,
    scope: VisibilityScope,
  ) => Promise<void> | void;
  polls?: OrgPoll[];
  onCreatePoll?: (
    orgId: string,
    poll: {
      title: string;
      options: Array<{ label: string; emoji?: string | null }>;
      closesAt?: string | null;
      allowMultiple?: boolean;
    },
  ) => Promise<void> | void;
  onVotePoll?: (
    orgId: string,
    pollId: string,
    optionId: string,
  ) => Promise<void> | void;
  onClosePoll?: (orgId: string, pollId: string) => Promise<void> | void;
  onReopenPoll?: (orgId: string, pollId: string) => Promise<void> | void;
  onDeletePoll?: (orgId: string, pollId: string) => Promise<void> | void;
  initialTab?: OrgTabKey;
};

const DEFAULT_ROLES: OrgRoleOption[] = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

const normalizeTabKey = (tab: OrgTabKey) =>
  tab === "pods" || tab === "members" ? "team" : tab;

const isPollOpen = (poll: OrgPoll) => {
  if (poll.status === "closed" || poll.status === "archived") return false;
  if (poll.closesAt && new Date(poll.closesAt).getTime() < Date.now()) return false;
  return true;
};

const withPrivacyNote = (polls: OrgPoll[]) =>
  polls.map((poll) => ({
    ...poll,
    note: poll.note ?? ORG_POLL_PRIVACY_NOTE,
  }));

export function OrgDashboardDrawer({
  open,
  org,
  pods,
  members,
  userRole,
  permissions,
  availablePods = [],
  registeredUsers = [],
  memberRoles = DEFAULT_ROLES,
  onUpdateOrg,
  onLinkPod,
  onRemovePod,
  onUpdateMemberRole,
  onRemoveMember,
  onTransferOwnership,
  onAddMember,
  onUpdateNorms,
  visibilityScope,
  onUpdateVisibilityScope,
  polls: pollsProp,
  onCreatePoll,
  onVotePoll,
  onClosePoll,
  onReopenPoll,
  onDeletePoll,
  initialTab = "overview",
}: OrgDashboardDrawerProps) {
  const derivedPolls = useMemo(
    () => withPrivacyNote(pollsProp ?? []),
    [pollsProp],
  );
  const [activeTab, setActiveTab] = useState<OrgTabKey>(normalizeTabKey(initialTab));
  const [editOpen, setEditOpen] = useState(false);
  const [linkPodOpen, setLinkPodOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [memberSheetOpen, setMemberSheetOpen] = useState(false);
  const [memberSheetMode, setMemberSheetMode] = useState<"manage" | "add">(
    "manage",
  );
  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);
  const [openNormsEditor, setOpenNormsEditor] = useState(false);
  const [visibility, setVisibility] = useState<VisibilityScope>(
    visibilityScope ?? "org_specific",
  );
  const [polls, setPolls] = useState<OrgPoll[]>(derivedPolls);

  useEffect(() => {
    if (open) {
      setActiveTab(normalizeTabKey(initialTab));
    }
  }, [initialTab, open]);

  useEffect(() => {
    setPolls(derivedPolls);
  }, [derivedPolls]);

  useEffect(() => {
    if (visibilityScope) {
      setVisibility(visibilityScope);
    }
  }, [visibilityScope]);

  const handleRemovePod = async (podId: string) => {
    if (!onRemovePod) return;
    try {
      await onRemovePod(org.id, podId);
      toast.success("Pod unlinked");
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to unlink pod");
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: string) => {
    if (!onUpdateMemberRole) return;
    try {
      await onUpdateMemberRole(org.id, memberId, role);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to update member");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!onRemoveMember) return;
    try {
      await onRemoveMember(org.id, memberId);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to remove member");
    }
  };

  const handleAddMember = async (profileId: string, role: string) => {
    if (!onAddMember) return;
    try {
      await onAddMember(org.id, profileId, role);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to add member");
    }
  };

  const handleCreatePoll = async (input: {
    title: string;
    options: Array<{ label: string; emoji?: string | null }>;
    closesAt?: string | null;
    allowMultiple?: boolean;
  }) => {
    const title = input.title.trim();
    const options = input.options
      .map((opt) => ({ ...opt, label: opt.label.trim() }))
      .filter((opt) => Boolean(opt.label));

    if (!title || options.length === 0) {
      toast.error("Add a title and at least one option");
      return;
    }

    const now = Date.now();
    const newPoll: OrgPoll = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `poll-${now}`,
      title,
      options: options.map((option, index) => ({
        id: `${now}-${index}`,
        label: option.label,
        emoji: option.emoji ?? null,
        votes: 0,
      })),
      status: "open",
      closesAt: input.closesAt ?? null,
      allowMultiple: input.allowMultiple ?? false,
      createdAt: new Date(now).toISOString(),
      note: ORG_POLL_PRIVACY_NOTE,
    };

    setPolls((prev) => [newPoll, ...prev]);

    if (onCreatePoll) {
      try {
        await onCreatePoll(org.id, {
          title,
          options,
          closesAt: input.closesAt ?? null,
          allowMultiple: input.allowMultiple ?? false,
        });
      } catch (e: any) {
        toast.error(e?.message ?? "Unable to save poll");
      }
    }
  };

  const handleVotePoll = async (pollId: string, optionId: string) => {
    const target = polls.find((poll) => poll.id === pollId);
    if (!target) return;
    if (!isPollOpen(target)) {
      toast.error("Poll is closed");
      return;
    }

    setPolls((prev) =>
      prev.map((poll) =>
        poll.id === pollId
          ? {
            ...poll,
            options: poll.options.map((option) =>
              option.id === optionId
                ? { ...option, votes: option.votes + 1 }
                : option,
            ),
          }
          : poll,
      ),
    );

    if (onVotePoll) {
      try {
        await onVotePoll(org.id, pollId, optionId);
      } catch (e: any) {
        toast.error(e?.message ?? "Unable to record vote");
      }
    }
  };

  const handleClosePoll = async (pollId: string) => {
    setPolls((prev) =>
      prev.map((poll) =>
        poll.id === pollId ? { ...poll, status: "closed" } : poll,
      ),
    );

    if (onClosePoll) {
      try {
        await onClosePoll(org.id, pollId);
      } catch (e: any) {
        toast.error(e?.message ?? "Unable to close poll");
      }
    }
  };

  const handleReopenPoll = async (pollId: string) => {
    setPolls((prev) =>
      prev.map((poll) =>
        poll.id === pollId
          ? {
            ...poll,
            status: "open",
            closesAt:
              poll.closesAt && new Date(poll.closesAt).getTime() < Date.now()
                ? null
                : poll.closesAt ?? null,
          }
          : poll,
      ),
    );

    if (onReopenPoll) {
      try {
        await onReopenPoll(org.id, pollId);
      } catch (e: any) {
        toast.error(e?.message ?? "Unable to reopen poll");
      }
    }
  };

  const openAddMemberSheet = () => {
    setSelectedMember(null);
    setMemberSheetMode("add");
    setMemberSheetOpen(true);
  };

  const handleUpdateNorms = async (updatedNorms: OrgNorms) => {
    if (!onUpdateNorms) return;
    await onUpdateNorms(org.id, updatedNorms);
  };

  const settingsPanel = useMemo(() => {
    const canEdit = permissions?.canEditOrg;
    const canTransfer = permissions?.canTransferOwnership;
    const canEditNorms =
      permissions?.isOrgOwner ||
      permissions?.isOrgAdmin ||
      permissions?.canEditNorms ||
      permissions?.canManageMembers ||
      permissions?.canEditOrg;
    const visibilityCard = (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visibility</CardTitle>
          <CardDescription>
            Choose who can see this organization’s details. Invite people if you select
            “Selected Users.”
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VisibilitySelector
            value={visibility}
            onChange={async (scope) => {
              setVisibility(scope);
              if (onUpdateVisibilityScope) {
                try {
                  await onUpdateVisibilityScope(org.id, scope);
                  toast.success("Visibility updated");
                } catch (e: any) {
                  toast.error(e?.message ?? "Unable to update visibility");
                }
              }
            }}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>
    );
    return (
      <div className="grid gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization settings</CardTitle>
            <CardDescription>
              Update details and ownership. Shared components stay region-agnostic
              and depend on the callbacks provided by the region app.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={!canEdit}
                onClick={() => canEdit && setEditOpen(true)}
              >
                Edit details
              </Button>
              <Button
                variant="outline"
                disabled={!canEditNorms}
                onClick={() => canEditNorms && setOpenNormsEditor(true)}
              >
                Edit norms
              </Button>
              <Button
                variant="secondary"
                disabled={!canTransfer}
                onClick={() => canTransfer && setTransferOpen(true)}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Transfer ownership
              </Button>
            </div>
          </CardContent>
        </Card>
        {visibilityCard}
      </div>
    );
  }, [
    permissions?.canEditOrg,
    permissions?.canTransferOwnership,
    permissions?.canEditNorms,
    permissions?.canManageMembers,
    permissions?.isOrgAdmin,
    permissions?.isOrgOwner,
    visibility,
    onUpdateVisibilityScope,
    org.id,
  ]);

  const overviewPanel = (
    <div className="grid gap-3">
      <OrgNormsOverviewCard norms={org.norms} />
    </div>
  );

  const teamPanel = (
    <div className="grid gap-4">
      <OrgPodsPanel
        pods={pods}
        permissions={permissions}
        onLinkPod={() => setLinkPodOpen(true)}
        onRemovePod={handleRemovePod}
      />
      <OrgMembersPanel
        members={members}
        permissions={permissions}
        onAddMember={permissions?.canManageMembers ? openAddMemberSheet : undefined}
        onPromote={(id) => handleUpdateMemberRole(id, "admin")}
        onDemote={(id) => handleUpdateMemberRole(id, "member")}
        onRemove={handleRemoveMember}
        onSelectMember={(member) => {
          setSelectedMember(member);
          setMemberSheetMode("manage");
          setMemberSheetOpen(true);
        }}
      />
    </div>
  );

  const pollsPanel = (
    <OrgPollsPanel
      polls={polls}
      privacyNote={ORG_POLL_PRIVACY_NOTE}
      onCreatePoll={handleCreatePoll}
      onVote={handleVotePoll}
      onClosePoll={handleClosePoll}
      onReopenPoll={handleReopenPoll}
      onDeletePoll={(pollId) => onDeletePoll?.(org.id, pollId)}
    />
  );

  if (!open) return null;

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="border-b p-2">
          <OrgHeader
            org={org}
            userRole={userRole}
          />
        </div>
        <div className="p-2">
          <OrgTabs
            value={activeTab}
            onValueChange={setActiveTab}
            podsCount={pods.length}
            membersCount={members.length}
            pollsCount={polls.length}
            overviewPanel={overviewPanel}
            teamPanel={teamPanel}
            pollsPanel={pollsPanel}
            settingsPanel={settingsPanel}
          />
        </div>
      </div>

      <OrgNormsEditorSheet
        open={openNormsEditor}
        onOpenChange={setOpenNormsEditor}
        norms={org.norms}
        presets={ORG_NORM_PRESETS}
        onSave={handleUpdateNorms}
      />
      <OrgEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        org={org}
        onSubmit={(payload) => onUpdateOrg?.(org.id, payload)}
      />
      <OrgLinkPodSheet
        open={linkPodOpen}
        onOpenChange={setLinkPodOpen}
        availablePods={availablePods}
        onLink={(podId) => onLinkPod?.(org.id, podId)}
      />
      <OrgTransferOwnershipSheet
        open={transferOpen}
        onOpenChange={setTransferOpen}
        members={members}
        onTransfer={(memberId) => onTransferOwnership?.(org.id, memberId)}
      />
      <OrgMemberActionsSheet
        open={memberSheetOpen}
        onOpenChange={setMemberSheetOpen}
        member={selectedMember}
        mode={memberSheetMode}
        roles={memberRoles}
        registeredUsers={registeredUsers}
        onAddMember={(profileId, role) => handleAddMember(profileId, role)}
        onUpdateRole={(memberId, role) =>
          handleUpdateMemberRole(memberId, role)
        }
        onRemove={(memberId) => handleRemoveMember(memberId)}
      />
    </>
  );
}
