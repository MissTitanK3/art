'use client'

import * as React from 'react'

import { Callout } from '@workspace/ui/components/academy/Callout'
import { AcademyStatsGrid } from '@workspace/ui/components/academy/pod/AcademyStatsGrid'
import { ActiveClassesSection } from '@workspace/ui/components/academy/pod/ActiveClassesSection'
import { SessionsBoard } from '@workspace/ui/components/academy/pod/SessionsBoard'
import { InstructorBench } from '@workspace/ui/components/academy/pod/InstructorBench'
import { QualificationPathwaysSection } from '@workspace/ui/components/academy/pod/QualificationPathwaysSection'
import type {
  AcademyCourseGroup,
  AcademyInstructorProfile,
  AcademyInstructorDraft,
  AcademyMemberProgress,
  AcademySummaryStat,
  AcademyTrainingClass,
  AcademyTrainingSession,
  AcademyTrainingSessionDraft,
} from '@workspace/store/types/academy.ts'

export type {
  AcademySummaryStat,
  AcademyCourseGroup,
  AcademyMemberProgress,
  AcademyInstructorProfile,
  AcademyInstructorDraft,
  AcademyTrainingClass,
  AcademyTrainingSession,
  AcademyTrainingSessionDraft,
  AcademyTrainingSessionParticipant,
  AcademySessionUnderstandingLevel,
  AcademyTrainingSessionStatus,
} from '@workspace/store/types/academy.ts'

export type PodAcademyDashboardLayoutProps = {
  heading?: {
    title: string
    subtitle?: string
    cta?: React.ReactNode
  }
  stats: AcademySummaryStat[]
  courseGroups: AcademyCourseGroup[]
  members: AcademyMemberProgress[]
  instructors: AcademyInstructorProfile[]
  trainingClasses: AcademyTrainingClass[]
  sessions: AcademyTrainingSession[]
  onScheduleClass?: (classId: string) => void
  onUpdateSessionStatus?: (sessionId: string, status: AcademyTrainingSession['status']) => void
  onCreateInstructor?: (instructor: AcademyInstructorDraft) => void
  onUpdateInstructor?: (instructorId: string, patch: Partial<AcademyInstructorProfile>) => void
  onDeleteInstructor?: (instructorId: string) => void
  onCreatePathwayClass?: (pathwayId: string) => void
  onCreateTrainingSession?: (session: AcademyTrainingSessionDraft) => void
  onUpdateTrainingSession?: (sessionId: string, patch: Partial<AcademyTrainingSession>) => void
  onDeleteTrainingSession?: (sessionId: string) => void
}

export function PodAcademyDashboardLayout({
  heading = {
    title: 'Pod Academy Readiness',
    subtitle: 'Track how your dispatch pod is progressing through qualifications.',
  },
  stats,
  courseGroups,
  members,
  instructors,
  trainingClasses,
  sessions,
  onScheduleClass,
  onUpdateSessionStatus,
  onCreateInstructor,
  onUpdateInstructor,
  onDeleteInstructor,
  onCreatePathwayClass,
  onCreateTrainingSession,
  onUpdateTrainingSession,
  onDeleteTrainingSession,
}: PodAcademyDashboardLayoutProps) {
  const handleScheduleClass = onScheduleClass ?? (() => { })
  const handleUpdateSessionStatus = onUpdateSessionStatus ?? (() => { })
  const handleCreateInstructor = onCreateInstructor ?? (() => { })
  const handleUpdateInstructor = onUpdateInstructor ?? (() => { })
  const handleDeleteInstructor = onDeleteInstructor ?? (() => { })
  const handleCreatePathwayClass = onCreatePathwayClass ?? (() => { })
  const handleCreateTrainingSession = onCreateTrainingSession ?? (() => { })
  const handleUpdateTrainingSession = onUpdateTrainingSession ?? (() => { })
  const handleDeleteTrainingSession = onDeleteTrainingSession ?? (() => { })
  const benchStat = React.useMemo(() => {
    const total = instructors.length
    const registered = instructors.filter((instructor) => instructor.registrationStatus !== 'guest').length
    const guest = total - registered
    let cleared = 0
    let needsReview = 0
    let awaiting = 0
    for (const instructor of instructors) {
      const status = instructor.vettingStatus ?? 'awaiting_verification'
      if (status === 'cleared') {
        cleared += 1
      } else if (status === 'needs_review') {
        needsReview += 1
      } else {
        awaiting += 1
      }
    }
    if (total === 0) {
      return {
        label: 'Instructor Bench',
        value: '0',
        helper: 'Add instructors to begin scheduling live sessions',
      }
    }
    const helperSegments: string[] = []
    if (registered > 0) {
      helperSegments.push(`${registered} registered`)
    }
    if (guest > 0) {
      helperSegments.push(`${guest} guest SME${guest === 1 ? '' : 's'}`)
    }
    if (cleared > 0) {
      helperSegments.push(`${cleared} cleared`)
    }
    if (needsReview > 0) {
      helperSegments.push(`${needsReview} needs review`)
    }
    if (awaiting > 0) {
      helperSegments.push(`${awaiting} awaiting verification`)
    }
    if (helperSegments.length === 0) {
      helperSegments.push('Bench vetting not yet tracked')
    }
    return {
      label: 'Instructor Bench',
      value: String(total),
      helper: helperSegments.join(' · '),
    }
  }, [instructors])
  const statsWithBench = React.useMemo(() => {
    const filtered = stats.filter((stat) => stat.label !== 'Instructor Bench')
    return [benchStat, ...filtered]
  }, [benchStat, stats])

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-6 rounded-2xl border bg-card/40 p-6 text-card-foreground shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Academy Overview</p>
          <h1 className="mt-2 text-3xl font-semibold">{heading.title}</h1>
          {heading.subtitle ? (
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{heading.subtitle}</p>
          ) : null}
        </div>
        {heading.cta}
      </header>

      <AcademyStatsGrid stats={statsWithBench} />

      <Callout type="info">
        Classes are the training container — a group of learners working through a set of topics or a qualification track.
        Sessions are standalone events focused on a single lesson or topic. Sessions are managed independently (scheduling,
        status, and participants) and are not necessarily attached to a class. Use classes to organize curriculum and
        learning pathways; use sessions to run discrete, schedulable meetings or focused instruction.
      </Callout>

      <ActiveClassesSection classes={trainingClasses} onScheduleClass={handleScheduleClass} />

      <SessionsBoard
        sessions={sessions}
        onCreateSession={handleCreateTrainingSession}
        onUpdateSessionStatus={handleUpdateSessionStatus}
        onUpdateSession={handleUpdateTrainingSession}
        onDeleteSession={handleDeleteTrainingSession}
      />

      <InstructorBench
        instructors={instructors}
        learnerCount={members.length}
        onCreateInstructor={handleCreateInstructor}
        onUpdateInstructor={handleUpdateInstructor}
        onRemoveInstructor={handleDeleteInstructor}
      />

      <QualificationPathwaysSection
        courseGroups={courseGroups}
        onCreatePathwayClass={handleCreatePathwayClass}
      />
    </section>
  )
}

export default PodAcademyDashboardLayout
