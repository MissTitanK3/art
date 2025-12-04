"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Button } from "@workspace/ui/primitives/button";
import { Input } from "@workspace/ui/primitives/input";
import { Textarea } from "@workspace/ui/primitives/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Switch } from "@workspace/ui/primitives/switch";
import { Badge } from "@workspace/ui/primitives/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/primitives/dialog";
import { Copy, Mail, Send, AtSign, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@workspace/ui/primitives/sheet";
import { getMissingPersonSlug } from "@workspace/ui/lib/missing-persons";
import type { DetaineeIntake } from "@workspace/ui/types/missing-person-intake";
import type { Profile } from "@workspace/store/types/global.ts";
import { roleLabel } from "@workspace/store/types/roles.ts";
import { useProfileStore } from "@workspace/store/useProfileStore";
import { useUnifiedAccess } from "@workspace/store/utils/permissions/useUnifiedAccess";
import { NavRole } from "@workspace/store/utils/permissions/types";

export type AdvocacyGroup = {
  id: string;
  name: string;
  type: string | null;
  jurisdiction: string | null;
  contact_emails: string[] | null;
  contact_signal: string | null;
  preferred_format: "pdf" | "web" | "feed" | null;
  active_status: boolean;
  notes: string | null;
};

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
    payload: Partial<AdvocacyGroup> & { contact_emails?: string[] }
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
  const profileRoles = React.useMemo(
    () =>
      profileFromStore?.access_role
        ? [String(profileFromStore.access_role)]
        : [],
    [profileFromStore?.access_role]
  );

  const ctx = React.useMemo(
    () => ({ navRole: profileRoles[0] as NavRole }),
    [profileRoles]
  );
  const { access: canManageAdvocacy } = useUnifiedAccess(
    "manage_advocacy",
    ctx
  );

  const effectiveCanManage = React.useMemo(
    () => canManage ?? canManageAdvocacy ?? false,
    [canManage, canManageAdvocacy]
  );
  const [query, setQuery] = React.useState("");
  const [openAdd, setOpenAdd] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [contactEmailsText, setContactEmailsText] = React.useState("");
  const [emailOpen, setEmailOpen] = React.useState(false);
  const [emailTarget, setEmailTarget] = React.useState<AdvocacyGroup | null>(
    null
  );
  const [records, setRecords] = React.useState<DetaineeIntake[]>([]);
  const [loadingRecords, setLoadingRecords] = React.useState(false);
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>("");
  const [emailSubject, setEmailSubject] = React.useState<string>("");
  const [emailBody, setEmailBody] = React.useState<string>("");
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<AdvocacyGroup | null>(
    null
  );
  const [deleting, setDeleting] = React.useState(false);

  const [draft, setDraft] = React.useState<Partial<AdvocacyGroup>>({
    name: "",
    type: null,
    jurisdiction: "",
    contact_emails: [],
    contact_signal: "",
    preferred_format: "pdf",
    active_status: true,
    notes: "",
  });

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => {
      const hay = [
        g.name,
        g.type ?? "",
        g.jurisdiction ?? "",
        (g.contact_emails ?? []).join(", "),
      ]
        .join("\n")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [groups, query]);

  const openEmailForGroup = React.useCallback(
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

  const buildEmailContent = React.useCallback(
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

  const handleCaseSelect = React.useCallback(
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

  const copyText = React.useCallback(async (text: string, msg: string) => {
    try {
      await navigator.clipboard?.writeText(text);
      toast.success(msg);
    } catch (e) {
      toast.error("Failed to copy");
    }
  }, []);

  const openMailClient = React.useCallback(() => {
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
    const payload = {
      ...draft,
      contact_emails: String(contactEmailsText || "")
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean),
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
        contact_signal: "",
        preferred_format: "pdf",
        active_status: true,
        notes: "",
      });
      setContactEmailsText("");
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

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Advocacy Network</h1>
          <p className="text-sm text-muted-foreground">(ART-RAN)</p>
        </div>
        {canManage ? (
          <Sheet open={openAdd} onOpenChange={setOpenAdd}>
            <SheetTrigger asChild>
              <Button>Add Group</Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="max-h-[80vh] bg-card overflow-y-auto text-card-foreground max-w-2xl m-auto"
            >
              <SheetHeader>
                <SheetTitle>Add Advocacy Group</SheetTitle>
                <SheetDescription>
                  Trusted orgs automatically receive finalized missing-person
                  reports when enabled.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-3 p-4 pt-0">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Name"
                    value={draft.name ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, name: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Jurisdiction"
                    value={draft.jurisdiction ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, jurisdiction: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Select
                    value={draft.type ?? undefined}
                    onValueChange={(v) => setDraft((d) => ({ ...d, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={draft.preferred_format ?? undefined}
                    onValueChange={(v) =>
                      setDraft((d) => ({ ...d, preferred_format: v as any }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Preferred Format" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMATS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!draft.active_status}
                      onCheckedChange={(v) =>
                        setDraft((d) => ({ ...d, active_status: v }))
                      }
                    />
                    <span className="text-sm">Active</span>
                  </div>
                </div>
                <Input
                  placeholder="Emails (comma or space separated)"
                  value={contactEmailsText}
                  onChange={(e) => setContactEmailsText(e.target.value)}
                />
                <Input
                  placeholder="Signal handle (optional)"
                  value={draft.contact_signal ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, contact_signal: e.target.value }))
                  }
                />
                <Textarea
                  placeholder="Notes (internal only)"
                  value={draft.notes ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, notes: e.target.value }))
                  }
                />
              </div>
              <SheetFooter>
                <div className="flex w-full justify-end gap-3">
                  <Button variant="outline" onClick={() => setOpenAdd(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submitNew} disabled={saving}>
                    {saving ? "Saving…" : "Save Group"}
                  </Button>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trusted Organizations</CardTitle>
          <CardDescription>
            Active groups automatically receive finalized missing-person
            reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="grid gap-2">
            {filtered.map((g) => (
              <div
                key={g.id}
                className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{g.name}</span>
                    {g.type ? (
                      <Badge variant="outline">
                        {g.type.replace("_", " ")}
                      </Badge>
                    ) : null}
                    {g.preferred_format ? (
                      <Badge variant="secondary">
                        {g.preferred_format.toUpperCase()}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground break-words">
                    {(g.contact_emails ?? []).join(", ")}
                    {g.jurisdiction ? <> • {g.jurisdiction}</> : null}
                    {g.contact_signal ? (
                      <> • Signal: {g.contact_signal}</>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyText(
                        (g.contact_emails ?? []).join(", "),
                        "Emails copied"
                      )
                    }
                    disabled={
                      !g.contact_emails || g.contact_emails.length === 0
                    }
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy emails
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyText(g.contact_signal || "", "Signal copied")
                    }
                    disabled={!g.contact_signal}
                  >
                    <AtSign className="mr-2 h-4 w-4" /> Copy Signal
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => openEmailForGroup(g)}
                    disabled={
                      !g.contact_emails || g.contact_emails.length === 0
                    }
                  >
                    <Mail className="mr-2 h-4 w-4" /> Email
                  </Button>
                  {canManage ? (
                    <div className="ml-auto flex items-center gap-2 sm:ml-0">
                      <Switch
                        checked={g.active_status}
                        onCheckedChange={(v) => toggleActive(g, v)}
                      />
                      <span className="text-sm mr-2">
                        {g.active_status ? "Enabled" : "Disabled"}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openRemoveModal(g)}
                        aria-label={`Remove ${g.name}`}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="bg-card text-card-foreground max-h-2/3 overflow-y-auto max-w-2xl m-auto">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
            <DialogDescription>
              Select a missing person record to include in the message. You can
              review and edit before sending.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <Select
                value={selectedCaseId || undefined}
                onValueChange={handleCaseSelect}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingRecords ? "Loading records…" : "Select record"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {records.map((r) => (
                    <SelectItem key={r.caseId} value={r.caseId}>
                      {(r.fullName || r.caseId) as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <Textarea
              className="min-h-[200px]"
              placeholder="Message body"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyText(emailSubject, "Subject copied")}
                disabled={!emailSubject}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy Subject
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyText(emailBody, "Body copied")}
                disabled={!emailBody}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy body
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={openMailClient}
                disabled={!emailTarget || !emailBody}
              >
                <Send className="mr-2 h-4 w-4" /> Open email client
              </Button>
            </div>
          </div>
          <DialogFooter />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Remove Organization</DialogTitle>
            <DialogDescription>
              This will permanently remove &quot;{deleteTarget?.name}&quot; from
              the Advocacy Network. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 text-sm text-muted-foreground">
            {deleteTarget?.jurisdiction ? (
              <div>Jurisdiction: {deleteTarget.jurisdiction}</div>
            ) : null}
            {deleteTarget?.contact_emails?.length ? (
              <div>
                Emails: {(deleteTarget.contact_emails ?? []).join(", ")}
              </div>
            ) : null}
            {deleteTarget?.contact_signal ? (
              <div>Signal: {deleteTarget.contact_signal}</div>
            ) : null}
          </div>
          <DialogFooter>
            <div className="flex w-full justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveConfirmed}
                disabled={deleting}
              >
                {deleting ? "Removing…" : "Remove"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default AdvocacyGroupsAdmin;
