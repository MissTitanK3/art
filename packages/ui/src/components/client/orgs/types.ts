import { VisibilityScope } from "@workspace/store/utils/permissions/types";
export type OrgPermissions = {
  canViewPods?: boolean;
  canLinkPods?: boolean;
  canManagePods?: boolean;
  canManageMembers?: boolean;
  canEditOrg?: boolean;
  canTransferOwnership?: boolean;
  canViewNorms?: boolean;
  canEditNorms?: boolean;
  isOrgOwner?: boolean;
  isOrgAdmin?: boolean;
};

export type OrgNormsSingleCategory = {
  type: string | null;
  other: string | null;
};

export type OrgNormsMultiCategory = {
  type: string[] | null;
  other: string | null;
};

export type OrgNormsCategory = OrgNormsSingleCategory | OrgNormsMultiCategory;

export type OrgNormPresetOption = {
  value: string;
  label: string;
  description: string;
  examples?: string[];
};

export interface OrgNorms {
  decision_making?: OrgNormsSingleCategory | null;
  safety_level?: OrgNormsSingleCategory | null;
  communication?: OrgNormsMultiCategory | null;
  conflict_resolution?: OrgNormsSingleCategory | null;
  safety_protocols?: OrgNormsMultiCategory | null;
  role_boundaries?: OrgNormsSingleCategory | null;
  accountability?: OrgNormsSingleCategory | null;
  onboarding?: OrgNormsMultiCategory | null;
  offboarding?: OrgNormsMultiCategory | null;
  values_culture?: OrgNormsMultiCategory | null;
}

export const ORG_NORM_PRESETS = {
  decision_making: [
    {
      value: "consensus",
      label: "Consensus",
      description: "Everyone must agree before the group acts. Slow but high trust; one person can block.",
    },
    {
      value: "modified_consensus",
      label: "Modified consensus",
      description: "Aim for agreement, but proceed with a strong majority and no major objections. Faster, still collaborative.",
    },
    {
      value: "majority_vote",
      label: "Majority vote",
      description: "50% plus one decides. Clear and fast, but can lower buy-in.",
    },
    {
      value: "delegated",
      label: "Delegated",
      description: "A small team or trusted volunteers make decisions for the group. Useful for operational speed.",
    },
    {
      value: "rotating_facilitator",
      label: "Rotating facilitator",
      description: "A different person leads each decision meeting. Helps prevent power from concentrating.",
    },
    {
      value: "leader_decides_with_feedback",
      label: "Leader decides with feedback",
      description: "A coordinator gathers input then makes the final decision. Useful in emergencies.",
    },
    {
      value: "other",
      label: "Other",
      description: "Custom or hybrid model written by the group.",
    },
  ],
  safety_level: [
    {
      value: "basic",
      label: "Basic",
      description: "Normal community safety awareness; minimal risk.",
    },
    {
      value: "moderate",
      label: "Moderate",
      description: "Some training expected, such as situational awareness.",
    },
    {
      value: "high",
      label: "High",
      description: "Frequent field operations, protests, or higher-risk activities.",
    },
    {
      value: "other",
      label: "Other",
      description: "Custom description.",
    },
  ],
  communication: [
    {
      value: "signal_required",
      label: "Signal required",
      description: "Signal is the primary channel for urgent communication.",
    },
    {
      value: "weekly_checkins",
      label: "Weekly check-ins",
      description: "A weekly update is expected from active members.",
    },
    {
      value: "async_first",
      label: "Async first",
      description: "People respond when able. Meetings happen only when needed.",
    },
    {
      value: "synchronous_priority",
      label: "Synchronous priority",
      description: "Live conversations are preferred for clarity.",
    },
    {
      value: "written_notes_required",
      label: "Written notes required",
      description: "Major decisions and events must be recorded.",
    },
    {
      value: "meeting_notes_required",
      label: "Meeting notes required",
      description: "Each meeting must have a notetaker, summary, and posted notes.",
    },
    {
      value: "no_debate_after_meetings",
      label: "No debate after meetings",
      description: "Decisions are not reopened after the meeting ends.",
    },
    {
      value: "other",
      label: "Other",
      description: "Custom communication approach.",
    },
  ],
  conflict_resolution: [
    {
      value: "call_in_first",
      label: "Call in first",
      description: "Start gently, one-on-one, with care. Focus on repair, not blame.",
    },
    {
      value: "mediated",
      label: "Mediated",
      description: "A neutral person helps both sides talk and resolve the issue.",
    },
    {
      value: "restorative_circle",
      label: "Restorative circle",
      description: "Structured group conversation focusing on harm, needs, and repair.",
    },
    {
      value: "cooling_off_required",
      label: "Cooling off required",
      description: "No discussion until emotions settle to avoid heated reactions.",
    },
    {
      value: "escalation_path_defined",
      label: "Escalation path defined",
      description: "Clear steps: talk to person → talk to mediator → final decision group.",
    },
    {
      value: "other",
      label: "Other",
      description: "Custom approach.",
    },
  ],
  safety_protocols: [
    {
      value: "buddy_system",
      label: "Buddy system",
      description: "No one works alone in field conditions.",
    },
    {
      value: "checkins_required",
      label: "Check-ins required",
      description: "Members use check-ins to confirm safety.",
    },
    {
      value: "deescalation_training",
      label: "De-escalation training",
      description: "Members are trained to reduce tension safely.",
    },
    {
      value: "gear_required",
      label: "Gear required",
      description: "Required gear such as radios, vests, masks, or kits.",
    },
    {
      value: "digital_hygiene_required",
      label: "Digital hygiene required",
      description: "Basic digital safety: passwords, no screenshots, limited forwarding.",
    },
    {
      value: "emergency_callouts",
      label: "Emergency callouts",
      description: "Rapid alert system for critical incidents.",
    },
    {
      value: "shadow_mode_allowed",
      label: "Shadow mode allowed",
      description: "Members can observe quietly before fully joining an activity.",
    },
    {
      value: "other",
      label: "Other",
      description: "Custom safety protocols.",
    },
  ],
  role_boundaries: [
    {
      value: "clear_roles",
      label: "Clear roles",
      description: "Every role is well-defined and stable.",
    },
    {
      value: "rotating_roles",
      label: "Rotating roles",
      description: "Roles change hands regularly.",
    },
    {
      value: "shared_responsibility",
      label: "Shared responsibility",
      description: "Most work is done collectively without strong role boundaries.",
    },
    {
      value: "defined_scope_limits",
      label: "Defined scope limits",
      description: "Roles have hard edges to avoid overreach.",
    },
    {
      value: "other",
      label: "Other",
      description: "Custom boundaries.",
    },
  ],
  accountability: [
    {
      value: "support_first",
      label: "Support first",
      description: "Check in, understand barriers, offer support before consequences.",
    },
    {
      value: "restorative",
      label: "Restorative",
      description: "Works through harm with a focus on repair and community healing.",
    },
    {
      value: "consequence_path_defined",
      label: "Consequence path defined",
      description: "Clear steps: warning → action → removal.",
    },
    {
      value: "removal_path_defined",
      label: "Removal path defined",
      description: "Direct, fast path for removing harmful actors.",
    },
    {
      value: "other",
      label: "Other",
      description: "Custom accountability approach.",
    },
  ],
  onboarding: [
    {
      value: "buddy_system",
      label: "Buddy system",
      description: "New members paired with an experienced member.",
    },
    {
      value: "checklist_required",
      label: "Checklist required",
      description: "A clear list must be completed before joining operations.",
    },
    {
      value: "one_meeting_required",
      label: "One meeting required",
      description: "Attend one meeting to meet the group.",
    },
    {
      value: "safety_training_required",
      label: "Safety training required",
      description: "Complete required safety or field training.",
    },
    {
      value: "required_readings",
      label: "Required readings",
      description: "Read intro docs or protocols.",
    },
    {
      value: "shadow_another_volunteer",
      label: "Shadow another volunteer",
      description: "New members accompany an experienced volunteer to learn.",
    },
    {
      value: "other",
      label: "Other",
      description: "Custom onboarding approach.",
    },
  ],
  offboarding: [
    {
      value: "return_items",
      label: "Return items",
      description: "Return borrowed gear or supplies.",
    },
    {
      value: "permissions_cleanup",
      label: "Permissions cleanup",
      description: "Access to accounts, drives, or spaces is removed.",
    },
    {
      value: "exit_conversation",
      label: "Exit conversation",
      description: "Short conversation about reasons and improvements.",
    },
    {
      value: "data_handover",
      label: "Data handover",
      description: "Transfer documents, notes, or responsibilities.",
    },
    {
      value: "other",
      label: "Other",
      description: "Custom offboarding approach.",
    },
  ],
  values_culture: [
    {
      value: "mutual_aid",
      label: "Mutual aid",
      description: "The group focuses on community care and solidarity.",
    },
    {
      value: "anti_oppression",
      label: "Anti-oppression",
      description: "Commitment to confronting racism, sexism, ableism, etc.",
    },
    {
      value: "trauma_informed",
      label: "Trauma-informed",
      description: "Awareness of trauma and avoiding harmful behaviors.",
    },
    {
      value: "accessibility_first",
      label: "Accessibility first",
      description: "Commitment to access needs: captions, plain language, mobility.",
    },
    {
      value: "conflict_is_normal",
      label: "Conflict is normal",
      description: "Conflict is expected and managed constructively.",
    },
    {
      value: "transparency",
      label: "Transparency",
      description: "Share information openly unless safety requires otherwise.",
    },
    {
      value: "community_first",
      label: "Community first",
      description: "Decisions prioritize community needs over individual ego.",
    },
    {
      value: "other",
      label: "Other",
      description: "Custom values and culture.",
    },
  ],
} satisfies Record<keyof OrgNorms, OrgNormPresetOption[]>;

export type Org = {
  id: string;
  name: string;
  description?: string | null;
  slug?: string | null;
  regionId?: string | null;
  metadata?: Record<string, unknown>;
  norms?: OrgNorms | null;
  visibilityScope?: VisibilityScope | null;
};

export type OrgPod = {
  id: string;
  name: string;
  slug?: string | null;
  area?: string | null;
  description?: string | null;
  linkedAt?: string | null;
};

export type OrgMember = {
  id: string;
  displayName: string;
  role: string;
  title?: string | null;
  joinedAt?: string | null;
  avatarUrl?: string | null;
  membershipId?: string;
};

export type OrgPollStatus = "open" | "closed" | "archived";

export type OrgPollOption = {
  id: string;
  label: string;
  emoji?: string | null;
  votes: number;
};

export type OrgPoll = {
  id: string;
  title: string;
  options: OrgPollOption[];
  status?: OrgPollStatus;
  closesAt?: string | null;
  allowMultiple?: boolean;
  createdAt?: string | null;
  createdBy?: string | null;
  note?: string | null;
};

export type OrgPollCreateInput = {
  title: string;
  options: Array<{ label: string; emoji?: string | null }>;
  closesAt?: string | null;
  allowMultiple?: boolean;
};

export const ORG_POLL_PRIVACY_NOTE =
  "Polls only record a title and votes. Keep sensitive context in secure channels and document details in the organization.";

export type OrgRoleOption = {
  value: string;
  label: string;
  description?: string;
};

export type OrgRegisteredUser = {
  id: string;
  displayName: string;
  detail?: string | null;
};

export type OrgSummary = {
  org: Org;
  pods?: OrgPod[];
  members?: OrgMember[];
  userRole?: string | null;
  permissions?: OrgPermissions;
};

export type OrgTabKey =
  | "overview"
  | "team"
  | "polls"
  | "settings"
  | "pods"
  | "members";
