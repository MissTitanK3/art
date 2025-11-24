"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { DateTimePicker } from "@workspace/ui/components/DateTimePicker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { cn } from "@workspace/ui/lib/utils";
import { useProfileStore } from "@workspace/store/useProfileStore";
import { useUnifiedAccess } from "@workspace/store/utils/permissions/useUnifiedAccess";
import { NavRole } from "@workspace/store/utils/permissions/types";

import type {
  AcademyClass,
  AcademyClassMember,
  AcademyClassSession,
} from "@workspace/store/usePodStore";

export type InstructorOption = {
  id: string;
  name: string;
  type: "dispatcher" | "mentor" | "expert";
  podName?: string;
  status?: "active" | "inactive" | "suspended";
};

type ClassAssignmentContentProps = {
  classId: string;
  academyClass?: AcademyClass;
  instructorOptions: InstructorOption[];
  modules?: Array<{
    slug: string;
    title: string;
    durationHours?: number;
    icon?: string;
    type?: "qualified" | "certified";
  }>;
  onSave: (updatedClass: AcademyClass) => Promise<void> | void;
  onDelete: (classId: string) => Promise<void> | void;
  onBackToAcademy: () => void;
  onGoBack?: () => void;
  onCreateNewClass?: () => void;
};

type SessionDraft = {
  label: string;
  startsAt: string;
  durationHours: string;
  notes: string;
};

const instructorTypeLabels = {
  dispatcher: "Dispatcher Instructor",
  mentor: "Mentor",
  expert: "Subject Expert",
} as const;

function memberId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `mem_${Math.random().toString(36).slice(2, 10)}`;
}

function sessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ses_${Math.random().toString(36).slice(2, 10)}`;
}

function makeEmptySessionDraft(): SessionDraft {
  return {
    label: "",
    startsAt: "",
    durationHours: "1",
    notes: "",
  };
}

function determineStatusAfterAssignment(
  cls: AcademyClass,
  instructorName: string,
  nextSessionOverride?: string,
) {
  const trimmedInstructor = instructorName.trim();
  if (!trimmedInstructor) {
    return "needs_instructor" as const;
  }
  if (nextSessionOverride ?? cls.nextSession) {
    return "scheduled" as const;
  }
  return "draft" as const;
}

export function ClassAssignmentContent({
  classId,
  academyClass,
  instructorOptions,
  modules = [],
  onSave,
  onDelete,
  onBackToAcademy,
  onGoBack,
  onCreateNewClass,
}: ClassAssignmentContentProps) {
  const profileFromStore = useProfileStore((s) => s.profile);
  const profileRoles = React.useMemo(
    () => (profileFromStore?.access_role ? [String(profileFromStore.access_role)] : []),
    [profileFromStore?.access_role],
  );
  const ctx = React.useMemo(() => ({ navRole: profileRoles[0] as NavRole }), [profileRoles]);
  const { access: effectiveCanManage } = useUnifiedAccess('manage_instructors', ctx);
  const [instructorName, setInstructorName] = React.useState<string>("");
  const [selectedInstructorId, setSelectedInstructorId] =
    React.useState<string>("manual");
  const [memberName, setMemberName] = React.useState<string>("");
  const [memberNotes, setMemberNotes] = React.useState<string>("");
  const [members, setMembers] = React.useState<AcademyClassMember[]>([]);
  const [membersDirty, setMembersDirty] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<{
    id: string;
    name: string;
    notes: string;
  } | null>(null);
  const [sessions, setSessions] = React.useState<AcademyClassSession[]>([]);
  const [sessionsDirty, setSessionsDirty] = React.useState(false);
  const [newSession, setNewSession] = React.useState<SessionDraft>(() =>
    makeEmptySessionDraft(),
  );
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [instructorDirty, setInstructorDirty] = React.useState(false);

  const filteredInstructorOptions = React.useMemo(() => {
    if (!academyClass) return instructorOptions;
    const matches = instructorOptions.filter(
      (option) => option.type === academyClass.instructorType,
    );
    return matches.length > 0 ? matches : instructorOptions;
  }, [academyClass, instructorOptions]);

  React.useEffect(() => {
    if (!instructorName) {
      setSelectedInstructorId("manual");
      return;
    }
    const match = instructorOptions.find(
      (option) => option.name === instructorName,
    );
    setSelectedInstructorId(match ? match.id : "manual");
  }, [instructorName, instructorOptions]);

  React.useEffect(() => {
    if (!academyClass) return;
    setInstructorName(academyClass.instructorName ?? "");
    setMembers(academyClass.members ?? []);
    if (!sessionsDirty) {
      setSessions(academyClass.sessions ?? []);
    }
    setEditingMember(null);
  }, [academyClass, sessionsDirty]);

  // Reset dirty status when switching classes
  React.useEffect(() => {
    setSessionsDirty(false);
    setMembersDirty(false);
    setInstructorDirty(false);
  }, [classId]);

  const handleInstructorSelect = React.useCallback(
    (value: string) => {
      if (value === "manual") {
        setSelectedInstructorId("manual");
        return;
      }
      setSelectedInstructorId(value);
      const match = instructorOptions.find((option) => option.id === value);
      if (match) {
        setInstructorName(match.name);
        setInstructorDirty(true);
      }
    },
    [instructorOptions],
  );

  const makeAcademyClassMember = React.useCallback(
    (name: string, notes?: string): AcademyClassMember => {
      return {
        id: memberId(),
        name: name.trim(),
        notes: notes?.trim() || undefined,
        participationCount: 0,
      };
    },
    [],
  );

  const handleAddMember = React.useCallback(() => {
    if (!memberName.trim()) return;
    setMembers((prev) => [
      ...prev,
      makeAcademyClassMember(memberName, memberNotes),
    ]);
    setMembersDirty(true);
    setMemberName("");
    setMemberNotes("");
  }, [makeAcademyClassMember, memberName, memberNotes]);

  const handleUpdateMember = React.useCallback(
    (id: string, patch: Partial<AcademyClassMember>) => {
      setMembers((prev) =>
        prev.map((member) =>
          member.id === id ? { ...member, ...patch } : member,
        ),
      );
      setMembersDirty(true);
    },
    [],
  );

  const handleRemoveMember = React.useCallback((id: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
    setEditingMember((prev) => (prev?.id === id ? null : prev));
    setMembersDirty(true);
  }, []);

  const beginEditMember = React.useCallback((member: AcademyClassMember) => {
    setEditingMember({
      id: member.id,
      name: member.name,
      notes: member.notes ?? "",
    });
  }, []);

  const updateEditingMember = React.useCallback(
    (patch: Partial<{ name: string; notes: string }>) => {
      setEditingMember((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    [],
  );

  const cancelEditingMember = React.useCallback(
    () => setEditingMember(null),
    [],
  );

  const saveEditingMember = React.useCallback(() => {
    if (!editingMember) return;
    const nextName = editingMember.name.trim();
    const nextNotes = editingMember.notes.trim();
    if (!nextName) return;

    handleUpdateMember(editingMember.id, {
      name: nextName,
      notes: nextNotes ? nextNotes : undefined,
    });
    setEditingMember(null);
    setMembersDirty(true);
  }, [editingMember, handleUpdateMember]);

  const handleUpdateSession = React.useCallback(
    (id: string, patch: Partial<AcademyClassSession>) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === id ? { ...session, ...patch } : session,
        ),
      );
      setSessionsDirty(true);
    },
    [],
  );

  const handleSaveAssignments = React.useCallback(async () => {
    if (!academyClass) return;

    const trimmedInstructor = instructorName.trim();
    const normalizedMembers = members
      .map((member) => ({
        ...member,
        name: member.name.trim(),
        notes: member.notes?.trim() ? member.notes.trim() : undefined,
      }))
      .filter((member) => member.name.length > 0);

    const normalizedSessions = sessions.map((session, index) => ({
      ...session,
      label: session.label?.trim()
        ? session.label.trim()
        : `Session ${index + 1}`,
      notes: session.notes?.trim() ? session.notes.trim() : undefined,
      date: session.date?.trim() ? session.date : undefined,
      durationHours:
        typeof session.durationHours === "number" &&
          !Number.isNaN(session.durationHours)
          ? session.durationHours
          : undefined,
    }));

    const sessionsWithDate = normalizedSessions.filter((s) =>
      Boolean(s.date),
    ) as Array<AcademyClassSession & { date: string }>;
    const sortedSessions = [...sessionsWithDate].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const upcomingSession =
      sortedSessions.find(
        (session) => new Date(session.date).getTime() >= Date.now(),
      ) ?? sortedSessions[0];
    const nextSessionForUpdate =
      upcomingSession?.date ?? academyClass.nextSession;
    const sessionsScheduled =
      normalizedSessions.length > 0
        ? normalizedSessions.length
        : academyClass.sessionsScheduled > 0
          ? academyClass.sessionsScheduled
          : nextSessionForUpdate
            ? 1
            : 0;
    const status = determineStatusAfterAssignment(
      academyClass,
      instructorName,
      nextSessionForUpdate,
    );

    const updatedClass: AcademyClass = {
      ...academyClass,
      instructorName: trimmedInstructor || undefined,
      members: normalizedMembers,
      sessions: normalizedSessions,
      sessionsScheduled,
      nextSession: nextSessionForUpdate,
      status,
    };

    try {
      setSaving(true);
      await onSave(updatedClass);
      setInstructorDirty(false);
      setMembersDirty(false);
      setSessionsDirty(false);
    } finally {
      setSaving(false);
    }
  }, [academyClass, instructorName, members, onSave, sessions]);

  // Debounced autosave when any tracked section becomes dirty
  React.useEffect(() => {
    if (!academyClass) return;
    if (!effectiveCanManage) return;
    if (!(instructorDirty || membersDirty || sessionsDirty)) return;
    const t = window.setTimeout(() => {
      void handleSaveAssignments();
    }, 800);
    return () => window.clearTimeout(t);
  }, [
    academyClass,
    instructorDirty,
    membersDirty,
    sessionsDirty,
    instructorName,
    members,
    sessions,
    handleSaveAssignments,
    effectiveCanManage,
  ]);

  const handleDeleteClass = React.useCallback(async () => {
    if (!academyClass) return;
    try {
      setDeleting(true);
      await onDelete(academyClass.id);
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  }, [academyClass, onDelete]);

  const handleCreateClass = onCreateNewClass ?? onBackToAcademy;

  if (!academyClass) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-12">
        <Card className="border border-dashed border-border/60 shadow-none">
          <CardHeader>
            <CardTitle>Class not found</CardTitle>
            <CardDescription>
              We couldn&apos;t find that class. It may have been removed or not
              saved correctly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={onBackToAcademy}>
              Back to Academy hub
            </Button>
            <Button type="button" onClick={handleCreateClass}>
              Create a new class
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Academy cohort
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">{academyClass.title}</h1>
          <Badge variant="outline" className="text-xs uppercase">
            Class ID · {academyClass.id}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {academyClass.pathwayLabel}
          {academyClass.startDate ? ` · Starts ${academyClass.startDate}` : ""}
          {academyClass.startTime ? ` at ${academyClass.startTime}` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={onBackToAcademy}>
          Back to Academy Hub
        </Button>
      </div>

      {modules.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Modules in this class</CardTitle>
            <CardDescription>
              Learners will complete these lessons together as part of the
              cohort timeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2">
              {modules.map((module) => (
                <li
                  key={module.slug}
                  className="rounded-md border border-border/60 px-3 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium leading-tight">
                        {module.icon ? `${module.icon} ` : ""}
                        {module.title}
                      </p>
                    </div>
                    {module.durationHours ? (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {module.durationHours}h
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Assign instructor</CardTitle>
          <CardDescription>
            Pick who will facilitate this cohort and coordinate logistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="class-instructor">Instructor or mentor lead</Label>
            <Select
              value={selectedInstructorId}
              onValueChange={handleInstructorSelect}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select from roster" />
              </SelectTrigger>
              <SelectContent>
                {filteredInstructorOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {instructorTypeLabels[option.type]}
                        {option.podName ? ` · ${option.podName}` : ""}
                        {option.status && option.status !== "active"
                          ? ` · ${option.status.charAt(0).toUpperCase()}${option.status.slice(1)}`
                          : null}
                      </span>
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="manual">
                  Someone else (type below)
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="class-instructor"
              value={instructorName}
              onChange={(event) => {
                setSelectedInstructorId("manual");
                setInstructorName(event.target.value);
                setInstructorDirty(true);
              }}
              placeholder="Add a primary instructor"
            />
            <p className="text-xs text-muted-foreground">
              Choose from active instructors or enter a new lead.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Build the roster</CardTitle>
          <CardDescription>
            Add the volunteers who will attend this session and any context they
            should know.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-[2fr,1fr]">
            <div className="space-y-2">
              <Label htmlFor="member-name">Member name</Label>
              <Input
                id="member-name"
                value={memberName}
                onChange={(event) => setMemberName(event.target.value)}
                placeholder="Volunteer or dispatcher name"
              />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="member-notes">Notes</Label>
              <Textarea
                id="member-notes"
                value={memberNotes}
                onChange={(event) => setMemberNotes(event.target.value)}
                rows={2}
                placeholder="Role, timezone, accessibility needs..."
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleAddMember}
              disabled={!memberName.trim() || !effectiveCanManage}
            >
              Add to roster
            </Button>
          </div>

          {members.length > 0 ? (
            <ul className="space-y-3">
              {members.map((member) => {
                const isEditing = editingMember?.id === member.id;
                const displayNotes = member.notes?.trim()
                  ? member.notes
                  : "No notes yet.";
                const canSave = isEditing
                  ? Boolean(editingMember?.name.trim())
                  : false;

                return (
                  <li
                    key={member.id}
                    className="space-y-3 rounded-lg border border-border/60 p-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-[2fr,2fr,auto] sm:items-start">
                      <div className="space-y-1">
                        <Label
                          htmlFor={`roster-${member.id}-name`}
                          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                        >
                          Name
                        </Label>
                        {isEditing ? (
                          <Input
                            id={`roster-${member.id}-name`}
                            value={editingMember?.name ?? ""}
                            onChange={(event) =>
                              updateEditingMember({ name: event.target.value })
                            }
                            placeholder="Member name"
                          />
                        ) : (
                          <div className="rounded-md border border-dashed border-border/60 px-3 py-2 text-sm font-medium">
                            {member.name}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor={`roster-${member.id}-notes`}
                          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                        >
                          Notes
                        </Label>
                        {isEditing ? (
                          <Textarea
                            id={`roster-${member.id}-notes`}
                            value={editingMember?.notes ?? ""}
                            onChange={(event) =>
                              updateEditingMember({ notes: event.target.value })
                            }
                            rows={2}
                            placeholder="Role, timezone, accessibility needs..."
                          />
                        ) : (
                          <div className="rounded-md border border-dashed border-border/60 px-3 py-2 text-sm text-muted-foreground">
                            {displayNotes}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-stretch justify-end gap-2 sm:items-end">
                        {isEditing ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditingMember}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={saveEditingMember}
                              disabled={!canSave}
                            >
                              Save
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => beginEditMember(member)}
                              disabled={!effectiveCanManage}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={!effectiveCanManage}
                            >
                              Remove
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No members added yet. Use the form above to start building your
              roster.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Class Sessions</CardTitle>
          <CardDescription>
            Schedule sessions and record attendance or engagement levels.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-[1.5fr,1fr,1fr,1.5fr]">
            <div>
              <Label htmlFor="session-label">Session name</Label>
              <Input
                id="session-label"
                value={newSession.label}
                onChange={(e) =>
                  setNewSession((prev) => ({
                    ...prev,
                    label: e.target.value,
                  }))
                }
                placeholder="Session 1 · Orientation"
              />
            </div>
            <DateTimePicker
              label="Start date & time"
              value={newSession.startsAt}
              onChange={(value) =>
                setNewSession((prev) => ({
                  ...prev,
                  startsAt: value,
                }))
              }
            />
            <div>
              <Label htmlFor="session-duration">Duration (hrs)</Label>
              <Input
                id="session-duration"
                type="number"
                min="0.5"
                step="0.5"
                value={newSession.durationHours}
                onChange={(e) =>
                  setNewSession((prev) => ({
                    ...prev,
                    durationHours: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="session-notes">Notes</Label>
              <Input
                id="session-notes"
                value={newSession.notes}
                onChange={(e) =>
                  setNewSession((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => {
                if (!newSession.startsAt) return;
                const id = sessionId();
                const parsedDuration = Number.parseFloat(
                  newSession.durationHours,
                );
                const durationHours = Number.isNaN(parsedDuration)
                  ? undefined
                  : parsedDuration;
                const label = newSession.label.trim();
                const notes = newSession.notes.trim();
                setSessions((prev) => [
                  ...prev,
                  {
                    id,
                    label: label || `Session ${prev.length + 1}`,
                    date: newSession.startsAt,
                    durationHours,
                    notes: notes || undefined,
                    participants: [],
                  },
                ]);
                setSessionsDirty(true);
                setNewSession(makeEmptySessionDraft());
              }}
            >
              Add Session
            </Button>
          </div>

          {sessions.length > 0 ? (
            <ul className="space-y-4">
              {sessions.map((session, index) => (
                <li
                  key={session.id}
                  className="space-y-4 rounded-lg border border-border/60 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Session {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSessions((prev) =>
                          prev.filter((s) => s.id !== session.id),
                        );
                        setSessionsDirty(true);
                      }}
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1.5fr,1fr,1fr] sm:items-end">
                    <div className="space-y-1">
                      <Label
                        htmlFor={`session-${session.id}-label`}
                        className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        Label
                      </Label>
                      <Input
                        id={`session-${session.id}-label`}
                        value={session.label ?? ""}
                        onChange={(event) =>
                          handleUpdateSession(session.id, {
                            label: event.target.value,
                          })
                        }
                      />
                    </div>
                    <DateTimePicker
                      label="Scheduled start"
                      value={session.date}
                      onChange={(value) =>
                        handleUpdateSession(session.id, { date: value })
                      }
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor={`session-${session.id}-duration`}
                        className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        Duration (hrs)
                      </Label>
                      <Input
                        id={`session-${session.id}-duration`}
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={
                          session.durationHours !== undefined &&
                            !Number.isNaN(session.durationHours)
                            ? String(session.durationHours)
                            : ""
                        }
                        onChange={(event) => {
                          const parsed = Number.parseFloat(event.target.value);
                          handleUpdateSession(session.id, {
                            durationHours: Number.isNaN(parsed)
                              ? undefined
                              : parsed,
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor={`session-${session.id}-notes`}
                      className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      Notes
                    </Label>
                    <Textarea
                      id={`session-${session.id}-notes`}
                      value={session.notes ?? ""}
                      onChange={(event) =>
                        handleUpdateSession(session.id, {
                          notes: event.target.value || undefined,
                        })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Attendance & Engagement
                    </Label>
                    {members.map((member) => {
                      const existing = session.participants.find(
                        (p) => p.memberId === member.id,
                      ) ?? {
                        memberId: member.id,
                        present: false,
                        engagement: "medium",
                        understanding: "building",
                      };
                      return (
                        <div
                          key={member.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-md p-2"
                        >
                          <p className="text-sm font-medium">{member.name}</p>
                          <div className="flex flex-wrap gap-3 text-xs">
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Attendance
                              </span>
                              <div className="inline-flex items-center gap-1 rounded-full border border-input bg-muted/40 p-1">
                                {[
                                  {
                                    label: "Attended",
                                    value: true,
                                    icon: Check,
                                  },
                                  { label: "Missed", value: false, icon: X },
                                ].map(({ label, value, icon: Icon }) => {
                                  const isActive = existing.present === value;
                                  return (
                                    <button
                                      key={label}
                                      type="button"
                                      aria-label={`${label} for ${member.name}`}
                                      aria-pressed={isActive}
                                      className={cn(
                                        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                                        isActive
                                          ? "bg-primary text-primary-foreground shadow-sm"
                                          : "text-muted-foreground hover:bg-background/80",
                                      )}
                                      onClick={() => {
                                        if (isActive) return;
                                        const updated = sessions.map((s) =>
                                          s.id === session.id
                                            ? {
                                              ...s,
                                              participants: s.participants
                                                .filter(
                                                  (p) =>
                                                    p.memberId !== member.id,
                                                )
                                                .concat({
                                                  ...existing,
                                                  present: value,
                                                }),
                                            }
                                            : s,
                                        );
                                        setSessions(updated);
                                        setSessionsDirty(true);
                                      }}
                                    >
                                      <Icon className="h-3.5 w-3.5" />
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Engagement
                              </span>
                              <Select
                                value={existing.engagement}
                                onValueChange={(value) => {
                                  const updated = sessions.map((s) =>
                                    s.id === session.id
                                      ? {
                                        ...s,
                                        participants: s.participants
                                          .filter(
                                            (p) => p.memberId !== member.id,
                                          )
                                          .concat({
                                            ...existing,
                                            engagement: value as
                                              | "low"
                                              | "medium"
                                              | "high",
                                          }),
                                      }
                                      : s,
                                  );
                                  setSessions(updated);
                                  setSessionsDirty(true);
                                }}
                              >
                                <SelectTrigger
                                  size="sm"
                                  className="w-[140px] justify-between text-xs"
                                >
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Understanding
                              </span>
                              <Select
                                value={existing.understanding}
                                onValueChange={(value) => {
                                  const updated = sessions.map((s) =>
                                    s.id === session.id
                                      ? {
                                        ...s,
                                        participants: s.participants
                                          .filter(
                                            (p) => p.memberId !== member.id,
                                          )
                                          .concat({
                                            ...existing,
                                            understanding: value as
                                              | "needs_support"
                                              | "building"
                                              | "confident",
                                          }),
                                      }
                                      : s,
                                  );
                                  setSessions(updated);
                                  setSessionsDirty(true);
                                }}
                              >
                                <SelectTrigger
                                  size="sm"
                                  className="w-[160px] justify-between text-xs"
                                >
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="needs_support">
                                    Needs Support
                                  </SelectItem>
                                  <SelectItem value="building">
                                    Building
                                  </SelectItem>
                                  <SelectItem value="confident">
                                    Confident
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No sessions added yet.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="ghost"
            onClick={onBackToAcademy}
            disabled={saving || deleting}
          >
            Cancel
          </Button>
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={deleting}>
                Delete class
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-accent text-accent-foreground">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this class?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the cohort, members, and scheduled sessions
                  for <strong>{academyClass?.title}</strong>. This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteClass}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting…" : "Delete class"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Button
          type="button"
          onClick={handleSaveAssignments}
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
