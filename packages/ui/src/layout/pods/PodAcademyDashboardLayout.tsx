import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Callout } from "@workspace/ui/components/academy/Callout"
import { TrackBadge, type TrackVariant } from "@workspace/ui/components/academy/TrackBadge"
import {
  certificationColor,
  certificationLabel,
  CERTIFICATION_FILL,
} from "@workspace/ui/lib/utils"
import type {
  CertificationLevel,
  NormalizedCertification,
} from "@workspace/store/types/pod.ts"

export type AcademySummaryStat = {
  label: string
  value: string
  helper?: string
}

export type AcademyCourseSummary = {
  slug: string
  title: string
  description: string
  version?: number
  type: "qualified" | "certified"
  icon?: string
  status: "not_started" | "in_progress" | "completed" | "review"
}

export type AcademyCourseGroup = {
  id: string
  label: string
  trackLabel?: string
  variant?: TrackVariant
  courses: AcademyCourseSummary[]
}

export type AcademyMemberProgress = {
  id: string
  name: string
  podName: string
  role: string
  status: string
  certifications: NormalizedCertification[]
  pendingLessons?: number
  completedLessons?: number
  lastActivity?: string
}

export type AcademyInstructorProfile = {
  id: string
  name: string
  type: "dispatcher" | "mentor" | "expert"
  focus: string
  availability: "available" | "limited" | "unavailable"
  timezone?: string
  certifications: NormalizedCertification[]
}

export type AcademyTrainingClass = {
  id: string
  title: string
  description: string
  track: string
  modality: "in_person" | "online" | "hybrid"
  instructorType: "dispatcher" | "mentor" | "expert"
  durationHours: number
  sessionsScheduled: number
  nextSession?: string
  status: "draft" | "needs_instructor" | "scheduled" | "completed"
}

export type AcademyTrainingSession = {
  id: string
  classId: string
  title: string
  start: string
  end: string
  modality: "in_person" | "online" | "hybrid"
  location?: string
  meetingUrl?: string
  instructorName: string
  instructorType: "dispatcher" | "mentor" | "expert"
  status: "scheduled" | "in_progress" | "completed"
  seats: {
    capacity: number
    confirmed: number
    waitlist: number
  }
  timezone?: string
}

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
  onUpdateSessionStatus?: (sessionId: string, status: AcademyTrainingSession["status"]) => void
  onContactInstructor?: (instructorId: string) => void
  onCreatePathwayClass?: (pathwayId: string) => void
}

function highestCertificationLevel(certs: NormalizedCertification[]): CertificationLevel | undefined {
  let current: CertificationLevel | undefined

  for (const cert of certs) {
    if (!cert.level) continue
    if (!current) {
      current = cert.level
      continue
    }
    if (CERTIFICATION_FILL[cert.level] > CERTIFICATION_FILL[current]) {
      current = cert.level
    }
  }

  return current
}

function formatSessionRange(startIso: string, endIso: string, tz?: string) {
  const start = new Date(startIso)
  const end = new Date(endIso)

  let safeTz: string | undefined = tz
  try {
    if (tz) {
      // Attempt to instantiate a formatter; invalid zones throw.
      new Intl.DateTimeFormat(undefined, { timeZone: tz })
    }
  } catch {
    safeTz = undefined
  }

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    timeZone: safeTz,
  })
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: safeTz,
  })

  const startDate = dateFormatter.format(start)
  const startTime = timeFormatter.format(start)
  const endTime = timeFormatter.format(end)
  const tzLabel = safeTz ? ` (${safeTz})` : ""

  return `${startDate} • ${startTime} → ${endTime}${tzLabel}`
}

const modalityLabels: Record<AcademyTrainingSession["modality"], string> = {
  in_person: "In Person",
  online: "Online",
  hybrid: "Hybrid",
}

const instructorTypeLabels: Record<AcademyInstructorProfile["type"], string> = {
  dispatcher: "Dispatcher Instructor",
  mentor: "Mentor",
  expert: "Subject Expert",
}

const availabilityLabels: Record<AcademyInstructorProfile["availability"], string> = {
  available: "Available",
  limited: "Limited",
  unavailable: "Unavailable",
}

function formatDurationLabel(hours: number) {
  if (!Number.isFinite(hours) || hours <= 0) {
    return "1 hr"
  }
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes} min`
  }
  if (Number.isInteger(hours)) {
    return `${hours} hr${hours === 1 ? "" : "s"}`
  }
  return `${hours.toFixed(1)} hr`
}

function formatNextSessionLabel(startIso?: string) {
  if (!startIso) {
    return undefined
  }
  const start = new Date(startIso)
  if (Number.isNaN(start.getTime())) {
    return undefined
  }
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
  return formatter.format(start)
}

const sessionStatusColumns: Array<{
  status: AcademyTrainingSession["status"]
  label: string
  accent: string
}> = [
    { status: "scheduled", label: "Scheduled", accent: "border-sky-300/60" },
    { status: "in_progress", label: "In Progress", accent: "border-amber-300/70" },
    { status: "completed", label: "Completed", accent: "border-emerald-300/70" },
  ]

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"]

const classStatusConfig: Record<AcademyTrainingClass["status"], { label: string; badge: BadgeVariant }> = {
  draft: { label: "Draft", badge: "outline" },
  needs_instructor: { label: "Needs Instructor", badge: "warning" },
  scheduled: { label: "Scheduled", badge: "info" },
  completed: { label: "Completed", badge: "success" },
}

const classStatusOrder: Record<AcademyTrainingClass["status"], number> = {
  needs_instructor: 0,
  draft: 1,
  scheduled: 2,
  completed: 3,
}

export function PodAcademyDashboardLayout({
  heading = {
    title: "Pod Academy Readiness",
    subtitle: "Track how your dispatch pod is progressing through qualifications.",
  },
  stats,
  courseGroups,
  members,
  instructors,
  trainingClasses,
  sessions,
  onScheduleClass,
  onUpdateSessionStatus,
  onContactInstructor,
  onCreatePathwayClass,
}: PodAcademyDashboardLayoutProps) {
  const handleScheduleClass = onScheduleClass ?? (() => { })
  const handleUpdateSessionStatus = onUpdateSessionStatus ?? (() => { })
  const handleContactInstructor = onContactInstructor ?? (() => { })
  const handleCreatePathwayClass = onCreatePathwayClass ?? (() => { })

  const activeClasses = React.useMemo(() => {
    const filtered = trainingClasses.filter((trainingClass) => trainingClass.status !== "completed")
    return filtered.sort((a, b) => {
      const statusDiff = classStatusOrder[a.status] - classStatusOrder[b.status]
      if (statusDiff !== 0) {
        return statusDiff
      }
      const aTime = a.nextSession ? new Date(a.nextSession).getTime() : Number.POSITIVE_INFINITY
      const bTime = b.nextSession ? new Date(b.nextSession).getTime() : Number.POSITIVE_INFINITY
      return aTime - bTime
    })
  }, [trainingClasses])

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border border-border/60 shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold">{stat.value}</CardTitle>
            </CardHeader>
            {stat.helper ? (
              <CardContent>
                <p className="text-xs text-muted-foreground">{stat.helper}</p>
              </CardContent>
            ) : null}
          </Card>
        ))}
      </div>

      <Callout type="info">
        Keep pods certification-ready by pairing Academy lessons with in-pod mentorship. Everyone should complete
        qualification quizzes before field deployment, and certification tests unlock when tracks are marked as
        complete.
      </Callout>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Active Classes</h2>
            <p className="text-sm text-muted-foreground">
              Cohorts currently being drafted, staffed, or scheduled.
            </p>
          </div>
          <Badge variant="outline">{activeClasses.length} active</Badge>
        </div>

        {activeClasses.length === 0 ? (
          <Card className="border border-dashed border-border/60 shadow-none">
            <CardContent className="py-6 text-sm text-muted-foreground">
              No active classes yet. Use the qualification pathways below to launch a new cohort.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeClasses.map((trainingClass) => {
              const statusDisplay = classStatusConfig[trainingClass.status]
              const nextSessionLabel = formatNextSessionLabel(trainingClass.nextSession)
              const sessionsLabel =
                trainingClass.sessionsScheduled === 1
                  ? "1 session scheduled"
                  : `${trainingClass.sessionsScheduled} sessions scheduled`

              return (
                <Card key={trainingClass.id} className="flex flex-col border border-border/70 shadow-none">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold">{trainingClass.title}</CardTitle>
                        <CardDescription>{trainingClass.description}</CardDescription>
                      </div>
                      <Badge variant={statusDisplay.badge}>{statusDisplay.label}</Badge>
                    </div>
                    <p className="text-xs uppercase text-muted-foreground">{trainingClass.track}</p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase text-muted-foreground">
                      <span>{modalityLabels[trainingClass.modality]}</span>
                      <span>•</span>
                      <span>{instructorTypeLabels[trainingClass.instructorType]}</span>
                      <span>•</span>
                      <span>{formatDurationLabel(trainingClass.durationHours)}</span>
                      <span>•</span>
                      <span>{sessionsLabel}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase text-muted-foreground">Next session</p>
                      <p className="text-sm font-medium">
                        {nextSessionLabel ?? "Not scheduled"}
                      </p>
                    </div>
                    <div className="mt-auto flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleScheduleClass(trainingClass.id)}
                      >
                        Manage class
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Instructor Bench</h2>
            <p className="text-sm text-muted-foreground">
              Mentors and dispatchers available to lead skill-building for {members.length} active learners.
            </p>
          </div>
        </div>

        {instructors.length === 0 ? (
          <Card className="border border-dashed border-border/60 shadow-none">
            <CardContent className="py-6 text-sm text-muted-foreground">
              Add mentors or dispatcher instructors to start scheduling live classes.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {instructors.map((instructor) => {
              const level = highestCertificationLevel(instructor.certifications)
              const levelLabel = certificationLabel(level)
              const levelClass = certificationColor(level)
              const previewCerts = instructor.certifications.slice(0, 3)

              return (
                <Card key={instructor.id} className="border border-border/70 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">{instructor.name}</CardTitle>
                    <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                      {instructorTypeLabels[instructor.type]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <Badge
                        variant={
                          instructor.availability === "available"
                            ? "default"
                            : instructor.availability === "limited"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {availabilityLabels[instructor.availability]}
                      </Badge>
                      {instructor.timezone ? (
                        <span className="text-muted-foreground">{instructor.timezone}</span>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-sm font-medium">Focus</p>
                      <p className="text-xs text-muted-foreground">{instructor.focus}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {previewCerts.map((cert) => (
                          <Badge key={cert.id} variant="outline" className="text-xs">
                            {cert.display_name}
                          </Badge>
                        ))}
                        {instructor.certifications.length > previewCerts.length ? (
                          <span className="text-xs text-muted-foreground">
                            +{instructor.certifications.length - previewCerts.length} more
                          </span>
                        ) : null}
                      </div>
                      <span className={`text-xs font-medium ${levelClass}`}>{levelLabel}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Can teach {instructor.type === "mentor" ? "mentorship" : "operational"} modules.</span>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="justify-start text-primary"
                      onClick={() => handleContactInstructor(instructor.id)}
                    >
                      Coordinate session
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Training Sessions Board</h2>
            <p className="text-sm text-muted-foreground">
              {sessions.length} sessions coordinating in-person and online instruction. Update status as pods learn.
            </p>
          </div>
        </div>

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
                    columnSessions.map((session) => {
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
                                <a
                                  className="text-primary underline"
                                  href={session.meetingUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Join meeting
                                </a>
                              ) : null}
                              <span>
                                {session.seats.confirmed}/{session.seats.capacity} confirmed · {seatsRemaining} open ·
                                {session.seats.waitlist} waitlist
                              </span>
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              {session.status === "scheduled" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateSessionStatus(session.id, "in_progress")}
                                >
                                  Mark in progress
                                </Button>
                              ) : null}
                              {session.status !== "completed" ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateSessionStatus(session.id, "completed")}
                                >
                                  Mark completed
                                </Button>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Qualification Pathways</h2>
          <Badge variant="outline">Live curriculum</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {courseGroups.map((group) => (
            <Card key={group.id} className="flex flex-col border border-border/70 shadow-none">
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-semibold">{group.label}</CardTitle>
                      {group.trackLabel ? (
                        <CardDescription className="text-sm text-muted-foreground">
                          {group.trackLabel}
                        </CardDescription>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="shrink-0"
                      variant="outline"
                      onClick={() => handleCreatePathwayClass(group.id)}
                    >
                      Create class
                    </Button>
                  </div>
                  {group.variant ? <TrackBadge variant={group.variant} /> : null}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ScrollArea className="h-[240px]">
                  <ul className="space-y-3 pr-3">
                    {group.courses.map((course) => (
                      <li key={course.slug}>
                        <div className="flex items-start gap-3 rounded-lg border border-dashed border-border/60 p-3">
                          <span className="shrink-0 text-xl">{course.icon ?? "📘"}</span>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium leading-tight">{course.title}</p>
                              <Badge
                                variant={
                                  course.status === "completed"
                                    ? "default"
                                    : course.status === "in_progress"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {course.status.replaceAll("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{course.description}</p>
                            <div className="flex items-center gap-2 text-[11px] uppercase text-muted-foreground">
                              <span>{course.type === "certified" ? "Certification" : "Qualification"}</span>
                              {typeof course.version !== "undefined" ? (
                                <>
                                  <span>•</span>
                                  <span>v{Number(course.version).toFixed(1)}</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>



    </section>
  )
}

export default PodAcademyDashboardLayout
