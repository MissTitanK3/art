"use client";
import { useCallback, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Input } from "@workspace/ui/primitives/input";
import { toast } from "sonner";
import { getMissingPersonSlug } from "@workspace/ui/lib/missing-persons";
import type { DetaineeIntake } from "@workspace/ui/types/missing-person-intake";
import type { Profile } from "@workspace/store/types/global.ts";
import { roleLabel } from "@workspace/store/types/roles.ts";
import { useProfileStore } from "@workspace/store/useProfileStore";
import { useUnifiedAccess } from "@workspace/store/utils/permissions/useUnifiedAccess";
import { NavRole } from "@workspace/store/utils/permissions/types";
import type { AdvocacyGroup } from "@workspace/store/types/advocacy";
export type { AdvocacyGroup } from "@workspace/store/types/advocacy";
import { AdvocacyGroupCard } from "./advocacy-group-card";
import { AdvocacyGroupSheet } from "./advocacy-group-sheet";
import { AdvocacyEmailDialog } from "./advocacy-email-dialog";
import { AdvocacyDeleteDialog } from "./advocacy-delete-dialog";

const TYPES = [
  { value: "legal_aid", label: "Legal Aid" },
  { value: "civil_rights", label: "Civil Rights" },
  { value: "immigrant_justice", label: "Immigrant Justice" },
  { value: "media_advocacy", label: "Media Advocacy" },
  { value: "public_defender", label: "Public Defender" },
  { value: "other", label: "Other" },
] as const;

const FORMATS = [
  { value: "pdf", label: "PDF" },
  { value: "web", label: "Web link" },
  { value: "feed", label: "Data feed" },
] as const;

export interface AdvocacyGroupsAdminProps {
  groups: AdvocacyGroup[];
  loading?: boolean;
  error?: string | null;
  canManage: boolean;
  profile: Profile | null;
  onReload: () => void;
  onAddGroup: (
    payload: Partial<AdvocacyGroup> & {
      contact_emails?: string[];
    }
  ) => Promise<void>;
  onToggleActive: (group: AdvocacyGroup, next: boolean) => Promise<void>;
  onRemoveGroup: (group: AdvocacyGroup) => Promise<void>;
  loadRecords: () => Promise<DetaineeIntake[]>;
}

export function AdvocacyGroupsAdmin({
  groups,
  loading,
  error,
  canManage,
  profile,
  onReload,
  onAddGroup,
  onToggleActive,
  onRemoveGroup,
  loadRecords,
}: AdvocacyGroupsAdminProps) {
  const profileFromStore = useProfileStore((s) => s.profile);
  const profileRoles = useMemo(
    () =>
      profileFromStore?.access_role
        ? [String(profileFromStore.access_role)]
        : [],
    [profileFromStore?.access_role]
  );
  const ctx = useMemo(
    () => ({ navRole: profileRoles[0] as NavRole }),
    [profileRoles]
  );
  const { access: canManageAdvocacy } = useUnifiedAccess(
    "manage_advocacy",
    ctx
  );
  const effectiveCanManage = useMemo(
    () => canManage ?? canManageAdvocacy ?? false,
    [canManage, canManageAdvocacy]
  );
  const [query, setQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState<AdvocacyGroup | null>(null);
  const [records, setRecords] = useState<DetaineeIntake[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailBody, setEmailBody] = useState<string>("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdvocacyGroup | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState<Partial<AdvocacyGroup>>({
    name: "",
    type: null,
    jurisdiction: "",
    contact_emails: [],
    contact_phones: [],
    contact_faxes: [],
    contact_signal: "",
    preferred_format: "pdf",
    active_status: true,
    notes: "",
  });
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => {
      const hay = [
        g.name,
        g.type ?? "",
        g.jurisdiction ?? "",
        (g.contact_emails ?? []).join(", "),
        (g.contact_phones ?? []).join(", "),
        (g.contact_faxes ?? []).join(", "),
      ]
        .join("\n")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [groups, query]);
  const openEmailForGroup = useCallback(
    async (g: AdvocacyGroup) => {
      setEmailTarget(g);
      setEmailOpen(true);
      if (records.length === 0 && !loadingRecords) {
        try {
          setLoadingRecords(true);
          const loaded = await loadRecords();
          setRecords(Array.isArray(loaded) ? loaded : []);
        } catch (e) {
          console.warn("[AdvocacyGroupsAdmin] failed to load records", e);
        } finally {
          setLoadingRecords(false);
        }
      }
    },
    [records.length, loadingRecords, loadRecords]
  );
  const buildEmailContent = useCallback(
    (group: AdvocacyGroup, record: DetaineeIntake) => {
      const subject = `Missing Person Report: ${record.fullName || record.caseId}`;
      let origin = "";
      if (typeof window !== "undefined") origin = window.location.origin;
      const slug = getMissingPersonSlug(record);
      const link = `${origin}/missing-persons/${encodeURIComponent(slug)}`;
      const signerName = (
        profile?.display_name || "Regional Dispatcher"
      ).trim();
      const credentials: string[] = [];
      if (profile?.affiliation) credentials.push(profile.affiliation);
      if (profile?.access_role)
        credentials.push(roleLabel(profile.access_role as any));
      if (profile?.city || profile?.state)
        credentials.push(
          [profile?.city, profile?.state].filter(Boolean).join(", ")
        );
      const credentialLine = credentials.length
        ? credentials.join(" • ")
        : null;
      const signalLine = profile?.contact_signal
        ? `Signal: ${profile.contact_signal}`
        : null;
      const sections: string[] = [];
      sections.push([`Hello ${group.name},`].join("\n"));
      sections.push(
        [
          "We're contacting you via the Regional Advocacy Network regarding a newly finalized missing person report.",
        ].join("\n")
      );
      sections.push(
        [
          `Case ID: ${record.caseId}`,
          record.fullName ? `Name: ${record.fullName}` : null,
          record.detentionDateTime
            ? `Detained: ${record.detentionDateTime}`
            : null,
          record.detentionLocation
            ? `Location: ${record.detentionLocation}`
            : null,
          record.arrestingAgency
            ? `Arresting Agency: ${record.arrestingAgency}`
            : null,
          record.lastKnownFacility
            ? `Last Known Facility: ${record.lastKnownFacility}`
            : null,
          record.lastKnownCity
            ? `Last Known City: ${record.lastKnownCity}`
            : null,
          Array.isArray(record.urgentNeeds) && record.urgentNeeds.length
            ? `Urgent Needs: ${record.urgentNeeds.join(", ")}`
            : null,
        ]
          .filter(Boolean)
          .join("\n")
      );
      sections.push([`View full report: ${link}`].join("\n"));
      sections.push(
        [
          "If your team is able to support, please reply to coordinate next steps. Thank you for your rapid assistance.",
        ].join("\n")
      );
      sections.push(
        [`— ${signerName}`, credentialLine, signalLine]
          .filter(Boolean)
          .join("\n")
      );
      const body = sections.filter(Boolean).join("\n\n");
      return { subject, body };
    },
    [profile]
  );
  const handleCaseSelect = useCallback(
    (caseId: string) => {
      setSelectedCaseId(caseId);
      if (!emailTarget) return;
      const rec = records.find((r) => r.caseId === caseId);
      if (rec) {
        const { subject, body } = buildEmailContent(emailTarget, rec);
        setEmailSubject(subject);
        setEmailBody(body);
      }
    },
    [records, emailTarget, buildEmailContent]
  );
  const copyText = useCallback(async (text: string, msg: string) => {
    try {
      await navigator.clipboard?.writeText(text);
      toast.success(msg);
    } catch (e) {
      toast.error("Failed to copy");
    }
  }, []);
  const openMailClient = useCallback(() => {
    if (!emailTarget) return;
    const emails = (emailTarget.contact_emails ?? []).join(",");
    const mailBody = emailBody.replace(/\n/g, "\r\n");
    const href = `mailto:${encodeURIComponent(emails)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(mailBody)}`;
    try {
      if (typeof window !== "undefined") window.location.href = href;
    } catch (e) {
      // ignore
    }
  }, [emailTarget, emailSubject, emailBody]);
  const submitNew = async () => {
    const toList = (list?: string[] | null) =>
      (list ?? []).map((s) => s.trim()).filter(Boolean);
    const payload = {
      ...draft,
      contact_emails: toList(draft.contact_emails),
      contact_phones: toList(draft.contact_phones),
      contact_faxes: toList(draft.contact_faxes),
    } as any;
    if (!payload.name) {
      toast.error("Name is required");
      return;
    }
    if (!effectiveCanManage) return;
    setSaving(true);
    try {
      await onAddGroup(payload);
      setDraft({
        name: "",
        type: null,
        jurisdiction: "",
        contact_emails: [],
        contact_phones: [],
        contact_faxes: [],
        contact_signal: "",
        preferred_format: "pdf",
        active_status: true,
        notes: "",
      });
      setOpenAdd(false);
      onReload();
      toast.success("Advocacy group saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };
  const toggleActive = async (g: AdvocacyGroup, next: boolean) => {
    if (!effectiveCanManage) return;
    try {
      await onToggleActive(g, next);
      toast.success(`${g.name} ${next ? "enabled" : "disabled"}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update");
      onReload();
    }
  };
  const openRemoveModal = (g: AdvocacyGroup) => {
    if (!effectiveCanManage) return;
    setDeleteTarget(g);
    setDeleteOpen(true);
  };
  const handleRemoveConfirmed = async () => {
    if (!effectiveCanManage || !deleteTarget) return;
    setDeleting(true);
    try {
      await onRemoveGroup(deleteTarget);
      toast.success(`${deleteTarget.name} removed`);
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to remove");
      onReload();
    } finally {
      setDeleting(false);
    }
  };

  const handleEditGroup = (group: AdvocacyGroup) => {
    if (!effectiveCanManage) return;
    setDraft({
      ...group,
      contact_emails: [...(group.contact_emails ?? [])],
      contact_phones: [...(group.contact_phones ?? [])],
      contact_faxes: [...(group.contact_faxes ?? [])],
    });
    setOpenAdd(true);
  };
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Advocacy Network</h1>
          <p className="text-sm text-muted-foreground">(ART-RAN)</p>
        </div>
        <AdvocacyGroupSheet
          canManage={canManage}
          open={openAdd}
          onOpenChange={setOpenAdd}
          draft={draft}
          setDraft={setDraft}
          saving={saving}
          onSubmit={submitNew}
          types={TYPES}
          formats={FORMATS}
        />
      </div>

      <h2 className="text-2xl font-bold">Trusted Organizations</h2>
      <p className="text-sm text-muted-foreground">
        Active groups automatically receive finalized missing-person reports.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by name, type, jurisdiction"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-80"
        />
        <div className="text-sm text-muted-foreground">
          {loading ? (
            "Loading…"
          ) : error ? (
            <span className="text-amber-600">{error}</span>
          ) : (
            `${filtered.length} groups`
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-wrap w-full">
        {filtered.map((g) => (
          <AdvocacyGroupCard
            key={g.id}
            group={g}
            canManage={canManage}
            copyText={copyText}
            openEmailForGroup={openEmailForGroup}
            toggleActive={toggleActive}
            openRemoveModal={openRemoveModal}
            onEdit={handleEditGroup}
          />
        ))}
      </div>

      <AdvocacyEmailDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        records={records}
        loadingRecords={loadingRecords}
        selectedCaseId={selectedCaseId}
        onCaseSelect={handleCaseSelect}
        emailSubject={emailSubject}
        setEmailSubject={setEmailSubject}
        emailBody={emailBody}
        setEmailBody={setEmailBody}
        copyText={copyText}
        openMailClient={openMailClient}
        emailTarget={emailTarget}
      />

      <AdvocacyDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        deleteTarget={deleteTarget}
        deleting={deleting}
        onConfirm={handleRemoveConfirmed}
      />
    </section>
  );
}

export default AdvocacyGroupsAdmin;
