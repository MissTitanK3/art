'use client'

import * as React from 'react'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@workspace/ui/components/drawer'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Card, CardContent } from '@workspace/ui/components/card'
import { DateTimePicker } from '@workspace/ui/components/DateTimePicker'
import { formatSessionRange, modalityLabels, instructorTypeLabels } from './utils'
import type {
  AcademyInstructorProfile,
  AcademySessionUnderstandingLevel,
  AcademyTrainingSession,
  AcademyTrainingSessionDraft,
  AcademyTrainingSessionParticipant,
} from '@workspace/store/types/academy.ts'

type SessionFilterValue = 'all' | AcademyTrainingSession['status']

type SessionsBoardProps = {
  sessions: AcademyTrainingSession[]
  onCreateSession?: (session: AcademyTrainingSessionDraft) => void
  onUpdateSessionStatus?: (sessionId: string, status: AcademyTrainingSession['status']) => void
  onUpdateSession?: (sessionId: string, patch: Partial<AcademyTrainingSession>) => void
  onDeleteSession?: (sessionId: string) => void
}

type EditableParticipant = {
  id: string
  name: string
  signalHandle: string
  understanding: AcademySessionUnderstandingLevel
  status: 'confirmed' | 'waitlist'
}

const sessionStatusColumns: Array<{
  status: AcademyTrainingSession['status']
  label: string
  accent: string
}> = [
    { status: 'scheduled', label: 'Scheduled', accent: 'border-sky-300/60' },
    { status: 'in_progress', label: 'In Progress', accent: 'border-amber-300/70' },
    { status: 'completed', label: 'Completed', accent: 'border-emerald-300/70' },
  ]

const sessionStatusFilterOptions: Array<{ value: SessionFilterValue; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

const manageSessionStatusOptions: Array<{ value: AcademyTrainingSession['status']; label: string }> = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

const understandingLevelLabels: Record<AcademySessionUnderstandingLevel, string> = {
  needs_support: 'Needs support',
  building: 'Building understanding',
  confident: 'Confident',
}

export function SessionsBoard({
  sessions,
  onCreateSession,
  onUpdateSessionStatus,
  onUpdateSession,
  onDeleteSession,
}: SessionsBoardProps) {
  const handleCreateSession = onCreateSession ?? (() => { })
  const handleUpdateStatus = onUpdateSessionStatus ?? (() => { })
  const handleUpdateSession = onUpdateSession ?? (() => { })
  const handleDeleteSession = onDeleteSession ?? (() => { })

  const [sessionStatusFilter, setSessionStatusFilter] = React.useState<SessionFilterValue>('all')
  const [showArchivedSessions, setShowArchivedSessions] = React.useState(false)

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false)
  const [newSessionTitle, setNewSessionTitle] = React.useState('')
  const [newSessionStart, setNewSessionStart] = React.useState('')
  const [newSessionEnd, setNewSessionEnd] = React.useState('')
  const [newSessionModality, setNewSessionModality] = React.useState<AcademyTrainingSession['modality']>('online')
  const [newSessionLocation, setNewSessionLocation] = React.useState('')
  const [newSessionSeats, setNewSessionSeats] = React.useState('')
  const [newSessionStatus, setNewSessionStatus] = React.useState<AcademyTrainingSessionDraft['status']>('scheduled')
  const [newSessionTopic, setNewSessionTopic] = React.useState('')
  const [createFormError, setCreateFormError] = React.useState<string | null>(null)

  const [isManageDrawerOpen, setIsManageDrawerOpen] = React.useState(false)
  const [managedSessionId, setManagedSessionId] = React.useState<string | null>(null)
  const [manageSessionTitle, setManageSessionTitle] = React.useState('')
  const [manageSessionStart, setManageSessionStart] = React.useState('')
  const [manageSessionEnd, setManageSessionEnd] = React.useState('')
  const [manageSessionModality, setManageSessionModality] = React.useState<AcademyTrainingSession['modality']>('online')
  const [manageSessionStatus, setManageSessionStatus] = React.useState<AcademyTrainingSession['status']>('scheduled')
  const [manageSessionLocation, setManageSessionLocation] = React.useState('')
  const [manageSessionMeetingUrl, setManageSessionMeetingUrl] = React.useState('')
  const [manageSessionCapacity, setManageSessionCapacity] = React.useState('')
  const [manageSessionInstructorName, setManageSessionInstructorName] = React.useState('')
  const [manageSessionInstructorType, setManageSessionInstructorType] =
    React.useState<AcademyInstructorProfile['type']>('dispatcher')
  const [manageSessionTimezone, setManageSessionTimezone] = React.useState('')
  const [manageSessionTopic, setManageSessionTopic] = React.useState('')
  const [manageSessionParticipants, setManageSessionParticipants] = React.useState<EditableParticipant[]>([])
  const [manageFormError, setManageFormError] = React.useState<string | null>(null)

  const createParticipantId = React.useCallback(() => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }
    return `participant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }, [])

  const managedSession = React.useMemo(() => {
    if (!managedSessionId) return null
    return sessions.find((session) => session.id === managedSessionId) ?? null
  }, [managedSessionId, sessions])

  const archivedSessions = React.useMemo(
    () => sessions.filter((session) => session.status === 'archived'),
    [sessions],
  )

  const activeSessionsCount = React.useMemo(
    () => sessions.filter((session) => session.status !== 'archived').length,
    [sessions],
  )

  const sessionStatusCounts = React.useMemo(() => {
    return {
      all: sessions.length,
      scheduled: sessions.filter((session) => session.status === 'scheduled').length,
      in_progress: sessions.filter((session) => session.status === 'in_progress').length,
      completed: sessions.filter((session) => session.status === 'completed').length,
      archived: archivedSessions.length,
    } satisfies Record<SessionFilterValue, number>
  }, [archivedSessions.length, sessions])

  React.useEffect(() => {
    if (sessionStatusFilter === 'archived' && archivedSessions.length > 0) {
      setShowArchivedSessions(true)
    }
  }, [archivedSessions.length, sessionStatusFilter])

  const filteredSessions = React.useMemo(() => {
    if (sessionStatusFilter === 'all') {
      return sessions
    }
    return sessions.filter((session) => session.status === sessionStatusFilter)
  }, [sessionStatusFilter, sessions])

  const confirmedParticipantsCount = React.useMemo(
    () => manageSessionParticipants.filter((participant) => participant.status === 'confirmed').length,
    [manageSessionParticipants],
  )

  const waitlistParticipantsCount = React.useMemo(
    () => manageSessionParticipants.filter((participant) => participant.status === 'waitlist').length,
    [manageSessionParticipants],
  )

  const resetCreateForm = React.useCallback(() => {
    setNewSessionTitle('')
    setNewSessionStart('')
    setNewSessionEnd('')
    setNewSessionModality('online')
    setNewSessionLocation('')
    setNewSessionSeats('')
    setNewSessionStatus('scheduled')
    setNewSessionTopic('')
    setCreateFormError(null)
  }, [])

  const resetManageForm = React.useCallback(() => {
    setManageSessionTitle('')
    setManageSessionStart('')
    setManageSessionEnd('')
    setManageSessionModality('online')
    setManageSessionStatus('scheduled')
    setManageSessionLocation('')
    setManageSessionMeetingUrl('')
    setManageSessionCapacity('')
    setManageSessionInstructorName('')
    setManageSessionInstructorType('dispatcher')
    setManageSessionTimezone('')
    setManageSessionTopic('')
    setManageSessionParticipants([])
    setManageFormError(null)
  }, [])

  const handleOpenManageSession = React.useCallback((sessionId: string) => {
    setManagedSessionId(sessionId)
    setManageFormError(null)
    setIsManageDrawerOpen(true)
  }, [])

  const handleManageDrawerChange = React.useCallback(
    (open: boolean) => {
      setIsManageDrawerOpen(open)
      if (!open) {
        setManagedSessionId(null)
        resetManageForm()
      }
    },
    [resetManageForm],
  )

  React.useEffect(() => {
    if (!managedSession || !isManageDrawerOpen) {
      return
    }

    setManageSessionTitle(managedSession.title)
    setManageSessionStart(managedSession.start)
    setManageSessionEnd(managedSession.end)
    setManageSessionModality(managedSession.modality)
    setManageSessionStatus(managedSession.status)
    setManageSessionLocation(managedSession.location ?? '')
    setManageSessionMeetingUrl(managedSession.meetingUrl ?? '')
    setManageSessionCapacity(String(managedSession.seats.capacity ?? 0))
    setManageSessionInstructorName(managedSession.instructorName)
    setManageSessionInstructorType(managedSession.instructorType)
    setManageSessionTimezone(managedSession.timezone ?? '')
    setManageSessionTopic(managedSession.relatedTopic ?? '')
    setManageSessionParticipants(
      (managedSession.participants ?? []).map((participant) => ({
        id: participant.id || createParticipantId(),
        name: participant.name,
        signalHandle: participant.signalHandle ?? '',
        understanding: participant.understanding,
        status: participant.status,
      })),
    )
    setManageFormError(null)
  }, [createParticipantId, isManageDrawerOpen, managedSession])

  const handleArchiveSession = React.useCallback(
    (sessionId: string) => {
      setShowArchivedSessions(true)
      handleUpdateStatus(sessionId, 'archived')
    },
    [handleUpdateStatus],
  )

  const updateParticipant = React.useCallback((participantId: string, patch: Partial<EditableParticipant>) => {
    setManageSessionParticipants((participants) =>
      participants.map((participant) =>
        participant.id === participantId
          ? {
            ...participant,
            ...patch,
          }
          : participant,
      ),
    )
  }, [])

  const handleParticipantFieldChange = React.useCallback(
    (participantId: string, field: keyof Omit<EditableParticipant, 'id'>, value: string) => {
      if (field === 'understanding') {
        updateParticipant(participantId, { understanding: value as AcademySessionUnderstandingLevel })
        return
      }

      if (field === 'status') {
        updateParticipant(participantId, { status: value as EditableParticipant['status'] })
        return
      }

      updateParticipant(participantId, { [field]: value } as Partial<EditableParticipant>)
    },
    [updateParticipant],
  )

  const handleAddParticipant = React.useCallback(() => {
    setManageSessionParticipants((participants) => [
      ...participants,
      {
        id: createParticipantId(),
        name: '',
        signalHandle: '',
        understanding: 'building',
        status: 'confirmed',
      },
    ])
  }, [createParticipantId])

  const handleRemoveParticipant = React.useCallback((participantId: string) => {
    setManageSessionParticipants((participants) => participants.filter((participant) => participant.id !== participantId))
  }, [])

  const handleSaveManagedSession = React.useCallback(() => {
    if (!managedSessionId || !managedSession) {
      setManageFormError('No session selected to manage.')
      return
    }

    const trimmedTitle = manageSessionTitle.trim()
    if (!trimmedTitle) {
      setManageFormError('Title is required.')
      return
    }

    if (!manageSessionStart || !manageSessionEnd) {
      setManageFormError('Start and end times are required.')
      return
    }

    const capacity = Number.parseInt(manageSessionCapacity || String(managedSession.seats.capacity ?? 0), 10)
    if (!Number.isFinite(capacity) || capacity <= 0) {
      setManageFormError('Capacity must be a positive number.')
      return
    }

    for (const participant of manageSessionParticipants) {
      if (!participant.name.trim()) {
        setManageFormError('Participant names are required.')
        return
      }
    }

    if (confirmedParticipantsCount > capacity) {
      setManageFormError('Confirmed participants exceed available seats.')
      return
    }

    setManageFormError(null)

    const participantsPayload: AcademyTrainingSessionParticipant[] = manageSessionParticipants.map((participant) => ({
      id: participant.id || createParticipantId(),
      name: participant.name.trim(),
      signalHandle: participant.signalHandle.trim() || undefined,
      understanding: participant.understanding,
      status: participant.status,
    }))

    handleUpdateSession(managedSessionId, {
      title: trimmedTitle,
      start: manageSessionStart,
      end: manageSessionEnd,
      modality: manageSessionModality,
      status: manageSessionStatus,
      location: manageSessionLocation.trim() || undefined,
      meetingUrl: manageSessionMeetingUrl.trim() || undefined,
      seats: {
        capacity,
        confirmed: confirmedParticipantsCount,
        waitlist: waitlistParticipantsCount,
      },
      instructorName: manageSessionInstructorName.trim() || managedSession.instructorName,
      instructorType: manageSessionInstructorType,
      timezone: manageSessionTimezone.trim() || undefined,
      relatedTopic: manageSessionTopic.trim() || undefined,
      participants: participantsPayload,
    })

    if (manageSessionStatus === 'archived') {
      setShowArchivedSessions(true)
    }

    setIsManageDrawerOpen(false)
    resetManageForm()
    setManagedSessionId(null)
  }, [
    confirmedParticipantsCount,
    createParticipantId,
    handleUpdateSession,
    manageSessionCapacity,
    manageSessionEnd,
    manageSessionInstructorName,
    manageSessionInstructorType,
    manageSessionLocation,
    manageSessionMeetingUrl,
    manageSessionModality,
    manageSessionParticipants,
    manageSessionStart,
    manageSessionStatus,
    manageSessionTimezone,
    manageSessionTitle,
    manageSessionTopic,
    managedSession,
    managedSessionId,
    resetManageForm,
    setShowArchivedSessions,
    waitlistParticipantsCount,
  ])

  const handleCreateSessionSubmit = React.useCallback(() => {
    const trimmedTitle = newSessionTitle.trim()

    if (!trimmedTitle) {
      setCreateFormError('Title is required.')
      return
    }
    if (!newSessionStart || !newSessionEnd) {
      setCreateFormError('Start and end times are required.')
      return
    }

    const capacity = Number.parseInt(newSessionSeats, 10)
    if (!Number.isFinite(capacity) || capacity <= 0) {
      setCreateFormError('Available seats must be a positive number.')
      return
    }

    const payload: AcademyTrainingSessionDraft = {
      title: trimmedTitle,
      start: newSessionStart,
      end: newSessionEnd,
      modality: newSessionModality,
      location: newSessionLocation.trim() || undefined,
      seatsCapacity: capacity,
      status: newSessionStatus,
      relatedTopic: newSessionTopic.trim() || undefined,
    }

    handleCreateSession(payload)
    setCreateFormError(null)
    setIsCreateDrawerOpen(false)
    resetCreateForm()
  }, [
    handleCreateSession,
    newSessionEnd,
    newSessionLocation,
    newSessionModality,
    newSessionSeats,
    newSessionStart,
    newSessionStatus,
    newSessionTitle,
    newSessionTopic,
    resetCreateForm,
  ])

  const renderActiveSessionCard = React.useCallback(
    (session: AcademyTrainingSession) => {
      if (session.status === 'archived') {
        return null
      }

      const seatsRemaining = Math.max(session.seats.capacity - session.seats.confirmed, 0)

      return (
        <Card key={session.id} className="border border-border/70 shadow-none">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold leading-tight">{session.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSessionRange(session.start, session.end, session.timezone)}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs capitalize">
                {modalityLabels[session.modality]}
              </Badge>
            </div>

            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span>
                Instructor: {session.instructorName} · {instructorTypeLabels[session.instructorType]}
              </span>
              {session.location ? <span>Location: {session.location}</span> : null}
              {session.meetingUrl ? (
                <a className="text-primary underline" href={session.meetingUrl} target="_blank" rel="noreferrer">
                  Join meeting
                </a>
              ) : null}
              <span>
                {session.seats.confirmed}/{session.seats.capacity} confirmed · {seatsRemaining} open ·
                {session.seats.waitlist} waitlist
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => handleOpenManageSession(session.id)}>
                Manage
              </Button>
              {session.status === 'scheduled' ? (
                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(session.id, 'in_progress')}>
                  Mark in progress
                </Button>
              ) : null}
              {session.status !== 'completed' ? (
                <Button size="sm" onClick={() => handleUpdateStatus(session.id, 'completed')}>
                  Mark completed
                </Button>
              ) : null}
              {session.status === 'completed' ? (
                <>
                  <Badge variant="outline" className="text-xs">
                    Completed
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={() => handleArchiveSession(session.id)}>
                    Archive session
                  </Button>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )
    },
    [handleArchiveSession, handleOpenManageSession, handleUpdateStatus],
  )

  const renderArchivedSessionCard = React.useCallback(
    (session: AcademyTrainingSession) => {
      if (session.status !== 'archived') {
        return null
      }

      const seatsRemaining = Math.max(session.seats.capacity - session.seats.confirmed, 0)

      return (
        <Card key={session.id} className="border border-border/70 shadow-none">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold leading-tight">{session.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSessionRange(session.start, session.end, session.timezone)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="secondary" className="text-xs capitalize">
                  {modalityLabels[session.modality]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Archived
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span>
                Instructor: {session.instructorName} · {instructorTypeLabels[session.instructorType]}
              </span>
              {session.location ? <span>Location: {session.location}</span> : null}
              {session.meetingUrl ? (
                <a className="text-primary underline" href={session.meetingUrl} target="_blank" rel="noreferrer">
                  Join meeting
                </a>
              ) : null}
              <span>
                {session.seats.confirmed}/{session.seats.capacity} confirmed · {seatsRemaining} open ·
                {session.seats.waitlist} waitlist
              </span>
              {session.relatedTopic ? <span>Topic: {session.relatedTopic}</span> : null}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => handleOpenManageSession(session.id)}>
                Manage
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(session.id, 'completed')}>
                Restore to completed
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDeleteSession(session.id)}>
                Delete session
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    },
    [handleDeleteSession, handleOpenManageSession, handleUpdateStatus],
  )

  return (
    <>
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Training Sessions Board</h2>
            <p className="text-sm text-muted-foreground">
              {activeSessionsCount} active sessions coordinating in-person and online instruction
              {archivedSessions.length > 0 ? ` · ${archivedSessions.length} archived` : ''}. Update status as pods learn.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {sessionStatusFilterOptions.map((option) => {
                const isActive = sessionStatusFilter === option.value
                const count = sessionStatusCounts[option.value]

                return (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={isActive ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                    onClick={() => setSessionStatusFilter(option.value)}
                  >
                    <span>{option.label}</span>
                    <Badge variant={isActive ? 'secondary' : 'outline'} className="text-[11px]">
                      {count}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>
          <Button size="sm" onClick={() => setIsCreateDrawerOpen(true)}>
            New training session
          </Button>
        </div>

        {sessionStatusFilter === 'all' ? (
          <div className="grid gap-4 md:grid-cols-3">
            {sessionStatusColumns.map((column) => {
              const columnSessions = sessions.filter((session) => session.status === column.status)

              return (
                <div
                  key={column.status}
                  className={`flex min-h-[320px] flex-col gap-3 rounded-2xl border bg-card/60 p-4 shadow-sm ${column.accent}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {column.label}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {columnSessions.length}
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-3">
                    {columnSessions.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
                        No sessions yet.
                      </p>
                    ) : (
                      columnSessions.map((session) => renderActiveSessionCard(session))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : sessionStatusFilter === 'archived' ? (
          archivedSessions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
              No archived sessions yet.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {archivedSessions.map((session) => renderArchivedSessionCard(session))}
            </div>
          )
        ) : (
          <div className="space-y-3">
            {filteredSessions.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                No sessions currently marked as {sessionStatusFilter.replaceAll('_', ' ')}.
              </p>
            ) : (
              filteredSessions.map((session) => renderActiveSessionCard(session))
            )}
          </div>
        )}
      </section>

      {sessionStatusFilter === 'all' && archivedSessions.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Archived Sessions</h3>
              <p className="text-sm text-muted-foreground">
                Sessions hidden after review. Restore them to the board or remove them permanently.
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowArchivedSessions((value) => !value)}>
              {showArchivedSessions ? 'Hide archived' : `Show archived (${archivedSessions.length})`}
            </Button>
          </div>

          {showArchivedSessions ? (
            <div className="grid gap-3 md:grid-cols-2">
              {archivedSessions.map((session) => renderArchivedSessionCard(session))}
            </div>
          ) : null}
        </section>
      ) : null}

      <Drawer open={isManageDrawerOpen} onOpenChange={handleManageDrawerChange}>
        <DrawerContent className="bg-card text-card-foreground m-auto h-full w-full max-w-3xl rounded-t-3xl border border-border/70 shadow-xl">
          <DrawerHeader className="sm:text-left">
            <DrawerTitle>Manage Training Session</DrawerTitle>
            <DrawerDescription>Review session details, update scheduling information, and track participants.</DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
            {manageFormError ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {manageFormError}
              </p>
            ) : null}

            {managedSession ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="manage-session-title">Session title</Label>
                    <Input
                      id="manage-session-title"
                      value={manageSessionTitle}
                      onChange={(event) => setManageSessionTitle(event.target.value)}
                      placeholder="Advanced dispatch drill"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manage-session-status">Status</Label>
                    <Select
                      value={manageSessionStatus}
                      onValueChange={(value) => setManageSessionStatus(value as AcademyTrainingSession['status'])}
                    >
                      <SelectTrigger id="manage-session-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {manageSessionStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-1">
                  <DateTimePicker label="Starts" value={manageSessionStart} onChange={setManageSessionStart} />
                  <DateTimePicker label="Ends" value={manageSessionEnd} onChange={setManageSessionEnd} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="manage-session-modality">Modality</Label>
                    <Select
                      value={manageSessionModality}
                      onValueChange={(value) => setManageSessionModality(value as AcademyTrainingSession['modality'])}
                    >
                      <SelectTrigger id="manage-session-modality">
                        <SelectValue placeholder="Select modality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_person">In person</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manage-session-instructor-type">Instructor type</Label>
                    <Select
                      value={manageSessionInstructorType}
                      onValueChange={(value) => setManageSessionInstructorType(value as AcademyInstructorProfile['type'])}
                    >
                      <SelectTrigger id="manage-session-instructor-type">
                        <SelectValue placeholder="Select instructor type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dispatcher">Dispatcher</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                        <SelectItem value="expert">Subject expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="manage-session-instructor-name">Instructor name</Label>
                    <Input
                      id="manage-session-instructor-name"
                      value={manageSessionInstructorName}
                      onChange={(event) => setManageSessionInstructorName(event.target.value)}
                      placeholder="Taylor Jordan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manage-session-timezone">Timezone</Label>
                    <Input
                      id="manage-session-timezone"
                      value={manageSessionTimezone}
                      onChange={(event) => setManageSessionTimezone(event.target.value)}
                      placeholder="America/Los_Angeles"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="manage-session-location">Location</Label>
                    <Input
                      id="manage-session-location"
                      value={manageSessionLocation}
                      onChange={(event) => setManageSessionLocation(event.target.value)}
                      placeholder="Dispatch HQ — Training Room"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manage-session-meeting-link">Meeting link</Label>
                    <Input
                      id="manage-session-meeting-link"
                      value={manageSessionMeetingUrl}
                      onChange={(event) => setManageSessionMeetingUrl(event.target.value)}
                      placeholder="https://meet.alwaysready.tools/session"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="manage-session-capacity">Capacity</Label>
                    <Input
                      id="manage-session-capacity"
                      value={manageSessionCapacity}
                      onChange={(event) => setManageSessionCapacity(event.target.value)}
                      inputMode="numeric"
                      min={1}
                      type="number"
                    />
                    <p className="text-xs text-muted-foreground">
                      {confirmedParticipantsCount} confirmed · {waitlistParticipantsCount} waitlist
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manage-session-topic">Related topic</Label>
                    <Input
                      id="manage-session-topic"
                      value={manageSessionTopic}
                      onChange={(event) => setManageSessionTopic(event.target.value)}
                      placeholder="Link to course, unit, or describe focus"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium">Participants</p>
                      <p className="text-xs text-muted-foreground">
                        Track confirmed seats and waitlist to align with session capacity.
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddParticipant}>
                      Add participant
                    </Button>
                  </div>

                  {manageSessionParticipants.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border/60 p-3 text-sm text-muted-foreground">
                      No participants yet. Add confirmed attendees or maintain a waitlist.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {manageSessionParticipants.map((participant) => (
                        <div key={participant.id} className="space-y-3 rounded-lg border border-border/60 p-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`participant-name-${participant.id}`}>Name</Label>
                              <Input
                                id={`participant-name-${participant.id}`}
                                value={participant.name}
                                onChange={(event) =>
                                  handleParticipantFieldChange(participant.id, 'name', event.target.value)
                                }
                                placeholder="Jordan Rivera"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`participant-signal-${participant.id}`}>Signal handle</Label>
                              <Input
                                id={`participant-signal-${participant.id}`}
                                value={participant.signalHandle}
                                onChange={(event) =>
                                  handleParticipantFieldChange(participant.id, 'signalHandle', event.target.value)
                                }
                                placeholder="@dispatch-ally"
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`participant-understanding-${participant.id}`}>Understanding level</Label>
                              <Select
                                value={participant.understanding}
                                onValueChange={(value) =>
                                  handleParticipantFieldChange(
                                    participant.id,
                                    'understanding',
                                    value as AcademySessionUnderstandingLevel,
                                  )
                                }
                              >
                                <SelectTrigger id={`participant-understanding-${participant.id}`}>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(Object.entries(understandingLevelLabels) as Array<[
                                    AcademySessionUnderstandingLevel,
                                    string,
                                  ]>).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`participant-status-${participant.id}`}>Status</Label>
                              <Select
                                value={participant.status}
                                onValueChange={(value) =>
                                  handleParticipantFieldChange(
                                    participant.id,
                                    'status',
                                    value as EditableParticipant['status'],
                                  )
                                }
                              >
                                <SelectTrigger id={`participant-status-${participant.id}`}>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="waitlist">Waitlist</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveParticipant(participant.id)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                Select a session to manage its details.
              </p>
            )}
          </div>

          <DrawerFooter className="gap-2 border-t border-border/70 bg-muted/20 sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Button onClick={handleSaveManagedSession} disabled={!managedSession}>
              Save changes
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={isCreateDrawerOpen} onOpenChange={(open) => {
        setIsCreateDrawerOpen(open)
        if (!open) {
          resetCreateForm()
        }
      }}>
        <DrawerContent className="bg-card text-card-foreground m-auto h-full w-full max-w-2xl rounded-t-3xl border border-border/70 shadow-xl">
          <DrawerHeader className="sm:text-left">
            <DrawerTitle>Set Up Training Session</DrawerTitle>
            <DrawerDescription>
              Plan a focused learning block for individuals or pods—even if it is not tied to an existing academy topic.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
            {createFormError ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {createFormError}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="new-session-title">Session title</Label>
              <Input
                id="new-session-title"
                value={newSessionTitle}
                onChange={(event) => setNewSessionTitle(event.target.value)}
                placeholder="Advanced radio dispatch scenarios"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-1">
              <DateTimePicker label="Starts" value={newSessionStart} onChange={setNewSessionStart} />
              <DateTimePicker label="Ends" value={newSessionEnd} onChange={setNewSessionEnd} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-session-modality">Modality</Label>
                <Select
                  value={newSessionModality}
                  onValueChange={(value) => setNewSessionModality(value as AcademyTrainingSession['modality'])}
                >
                  <SelectTrigger id="new-session-modality">
                    <SelectValue placeholder="Select modality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_person">In person</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-session-status">Status</Label>
                <Select
                  value={newSessionStatus}
                  onValueChange={(value) => setNewSessionStatus(value as AcademyTrainingSessionDraft['status'])}
                >
                  <SelectTrigger id="new-session-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-session-location">Location or meeting link</Label>
              <Input
                id="new-session-location"
                value={newSessionLocation}
                onChange={(event) => setNewSessionLocation(event.target.value)}
                placeholder="Dispatch HQ — Training Room 3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-session-seats">Available seats</Label>
              <Input
                id="new-session-seats"
                value={newSessionSeats}
                onChange={(event) => setNewSessionSeats(event.target.value)}
                placeholder="12"
                type="number"
                min={1}
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-session-topic">Related academy topic (optional)</Label>
              <Input
                id="new-session-topic"
                value={newSessionTopic}
                onChange={(event) => setNewSessionTopic(event.target.value)}
                placeholder="Link to course, unit, or describe focus"
              />
            </div>
          </div>

          <DrawerFooter className="gap-2 border-t border-border/70 bg-muted/20 sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Button onClick={handleCreateSessionSubmit}>Create session</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
