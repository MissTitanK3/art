'use client'

import * as React from 'react'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import { COURSE_BLUEPRINT } from '@workspace/ui/data/academy/course-blueprint'
import { certificationColor, certificationLabel, CERTIFICATION_FILL } from '@workspace/ui/lib/utils'
import type {
  AcademyInstructorDraft,
  AcademyInstructorProfile,
  AcademyInstructorVettingStatus,
} from '@workspace/store/types/academy.ts'
import type { CertificationLevel, NormalizedCertification } from '@workspace/store/types/pod.ts'
import { X } from 'lucide-react'
import {
  availabilityLabels,
  instructorTypeLabels,
  instructorRegistrationLabels,
  instructorVettingClasses,
  instructorVettingLabels,
  instructorVettingMessages,
} from './utils'

function slugifyIdentifier(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function createCertification(label: string, idOverride?: string, idPrefix = 'custom'): NormalizedCertification {
  const trimmed = label.trim()
  const slug = slugifyIdentifier(trimmed)
  const fallback = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    id: idOverride ?? `${idPrefix}-${slug || fallback}`,
    display_name: trimmed,
  }
}

const academyCertificationOptions: Array<{ id: string; label: string }> = (() => {
  const unique = new Map<string, string>()
  for (const group of COURSE_BLUEPRINT) {
    for (const course of group.courses) {
      const optionId = course.certId ?? course.slug
      const optionLabel = course.title
      if (!optionLabel) continue
      if (!unique.has(optionId)) {
        unique.set(optionId, optionLabel)
      }
    }
  }
  return Array.from(unique.entries())
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
})()

type InstructorBenchProps = {
  instructors: AcademyInstructorProfile[]
  onCreateInstructor?: (instructor: AcademyInstructorDraft) => void
  onUpdateInstructor?: (instructorId: string, patch: Partial<AcademyInstructorProfile>) => void
  onRemoveInstructor?: (instructorId: string) => void
  learnerCount: number
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

export function InstructorBench({
  instructors,
  onCreateInstructor,
  onUpdateInstructor,
  onRemoveInstructor,
  learnerCount,
}: InstructorBenchProps) {
  const handleCreateInstructor = onCreateInstructor ?? (() => { })
  const handleUpdateInstructor = onUpdateInstructor ?? (() => { })
  const handleRemoveInstructor = onRemoveInstructor ?? (() => { })
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isManageSheetOpen, setIsManageSheetOpen] = React.useState(false)
  const totalInstructors = instructors.length
  const { registeredInstructorCount, guestInstructorCount, clearedInstructorCount, needsReviewInstructorCount, awaitingInstructorCount } =
    React.useMemo(() => {
      let registered = 0
      let guests = 0
      let cleared = 0
      let needsReview = 0
      let awaiting = 0
      for (const instructor of instructors) {
        if (instructor.registrationStatus === 'unregistered') {
          guests += 1
        } else {
          registered += 1
        }
        const vettingStatus: AcademyInstructorVettingStatus = instructor.vettingStatus ?? 'awaiting_verification'
        if (vettingStatus === 'cleared') {
          cleared += 1
        } else if (vettingStatus === 'needs_review') {
          needsReview += 1
        } else {
          awaiting += 1
        }
      }
      return {
        registeredInstructorCount: registered,
        guestInstructorCount: guests,
        clearedInstructorCount: cleared,
        needsReviewInstructorCount: needsReview,
        awaitingInstructorCount: awaiting,
      }
    }, [instructors])
  const instructorSummaryLabel = React.useMemo(() => {
    if (totalInstructors === 0) return 'No instructors added yet'
    const parts: string[] = []
    parts.push(
      `${totalInstructors} ${totalInstructors === 1 ? 'instructor' : 'instructors'}`,
    )
    const detailSegments: string[] = []
    if (registeredInstructorCount > 0) {
      detailSegments.push(
        `${registeredInstructorCount} registered`,
      )
    }
    if (guestInstructorCount > 0) {
      detailSegments.push(
        `${guestInstructorCount} guest SME${guestInstructorCount === 1 ? '' : 's'}`,
      )
    }
    if (clearedInstructorCount > 0) {
      detailSegments.push(`${clearedInstructorCount} cleared`)
    }
    if (needsReviewInstructorCount > 0) {
      detailSegments.push(`${needsReviewInstructorCount} needs review`)
    }
    if (awaitingInstructorCount > 0) {
      detailSegments.push(`${awaitingInstructorCount} awaiting verification`)
    }
    if (detailSegments.length > 0) {
      parts.push(`(${detailSegments.join(' · ')})`)
    }
    return parts.join(' ')
  }, [
    awaitingInstructorCount,
    clearedInstructorCount,
    guestInstructorCount,
    needsReviewInstructorCount,
    registeredInstructorCount,
    totalInstructors,
  ])
  const learnerSummaryLabel = React.useMemo(
    () => `${learnerCount} active learner${learnerCount === 1 ? '' : 's'}`,
    [learnerCount],
  )

  const [newInstructorName, setNewInstructorName] = React.useState('')
  const [newInstructorType, setNewInstructorType] =
    React.useState<AcademyInstructorProfile['type']>('dispatcher')
  const [newInstructorAvailability, setNewInstructorAvailability] =
    React.useState<AcademyInstructorProfile['availability']>('available')
  const [newInstructorFocus, setNewInstructorFocus] = React.useState('')
  const [newInstructorTimezone, setNewInstructorTimezone] = React.useState('')
  const [newInstructorRegistration, setNewInstructorRegistration] =
    React.useState<AcademyInstructorDraft['registrationStatus']>('registered')
  const [newInstructorVetting, setNewInstructorVetting] =
    React.useState<AcademyInstructorVettingStatus>('awaiting_verification')
  const [newInstructorCertifications, setNewInstructorCertifications] = React.useState<NormalizedCertification[]>([])
  const [newInstructorSkillSelect, setNewInstructorSkillSelect] = React.useState<string | undefined>(undefined)
  const [newInstructorCustomSkill, setNewInstructorCustomSkill] = React.useState('')
  const [addFormError, setAddFormError] = React.useState<string | null>(null)

  const [manageInstructorId, setManageInstructorId] = React.useState<string | null>(null)
  const [manageInstructorName, setManageInstructorName] = React.useState('')
  const [manageInstructorType, setManageInstructorType] =
    React.useState<AcademyInstructorProfile['type']>('dispatcher')
  const [manageInstructorAvailability, setManageInstructorAvailability] =
    React.useState<AcademyInstructorProfile['availability']>('available')
  const [manageInstructorFocus, setManageInstructorFocus] = React.useState('')
  const [manageInstructorTimezone, setManageInstructorTimezone] = React.useState('')
  const [manageInstructorRegistration, setManageInstructorRegistration] =
    React.useState<AcademyInstructorProfile['registrationStatus']>('registered')
  const [manageInstructorVetting, setManageInstructorVetting] =
    React.useState<AcademyInstructorVettingStatus>('awaiting_verification')
  const [manageInstructorCertifications, setManageInstructorCertifications] = React.useState<NormalizedCertification[]>([])
  const [manageInstructorSkillSelect, setManageInstructorSkillSelect] = React.useState<string | undefined>(undefined)
  const [manageInstructorCustomSkill, setManageInstructorCustomSkill] = React.useState('')
  const [manageFormError, setManageFormError] = React.useState<string | null>(null)

  const selectedInstructor = React.useMemo(
    () => instructors.find((instructor) => instructor.id === manageInstructorId) ?? null,
    [instructors, manageInstructorId],
  )

  const addNewCertification = React.useCallback((cert: NormalizedCertification) => {
    setNewInstructorCertifications((current) => {
      if (current.some((existing) => existing.id === cert.id || existing.display_name === cert.display_name)) {
        return current
      }
      return [...current, cert]
    })
  }, [])

  const removeNewCertification = React.useCallback((certId: string) => {
    setNewInstructorCertifications((current) => current.filter((cert) => cert.id !== certId))
  }, [])

  const addManagedCertification = React.useCallback((cert: NormalizedCertification) => {
    setManageInstructorCertifications((current) => {
      if (current.some((existing) => existing.id === cert.id || existing.display_name === cert.display_name)) {
        return current
      }
      return [...current, cert]
    })
  }, [])

  const removeManagedCertification = React.useCallback((certId: string) => {
    setManageInstructorCertifications((current) => current.filter((cert) => cert.id !== certId))
  }, [])

  React.useEffect(() => {
    if (!isManageSheetOpen) return
    if (instructors.length === 0) return
    setManageInstructorId((current) => current ?? instructors[0]?.id ?? null)
  }, [isManageSheetOpen, instructors])

  React.useEffect(() => {
    if (!isManageSheetOpen) {
      setManageInstructorId(null)
      setManageInstructorSkillSelect(undefined)
      setManageInstructorCustomSkill('')
      setManageInstructorCertifications([])
      setManageInstructorVetting('awaiting_verification')
      setManageFormError(null)
      return
    }
    if (!selectedInstructor) return
    setManageInstructorName(selectedInstructor.name)
    setManageInstructorType(selectedInstructor.type)
    setManageInstructorAvailability(selectedInstructor.availability)
    setManageInstructorFocus(selectedInstructor.focus)
    setManageInstructorTimezone(selectedInstructor.timezone ?? '')
    setManageInstructorRegistration(selectedInstructor.registrationStatus)
    setManageInstructorVetting(selectedInstructor.vettingStatus ?? 'awaiting_verification')
    setManageInstructorCertifications(
      selectedInstructor.certifications ? [...selectedInstructor.certifications] : [],
    )
    setManageInstructorSkillSelect(undefined)
    setManageInstructorCustomSkill('')
    setManageFormError(null)
  }, [selectedInstructor, isManageSheetOpen])

  React.useEffect(() => {
    if (isAddDialogOpen) return
    setNewInstructorName('')
    setNewInstructorType('dispatcher')
    setNewInstructorAvailability('available')
    setNewInstructorFocus('')
    setNewInstructorTimezone('')
    setNewInstructorRegistration('registered')
    setNewInstructorVetting('awaiting_verification')
    setNewInstructorCertifications([])
    setNewInstructorSkillSelect(undefined)
    setNewInstructorCustomSkill('')
    setAddFormError(null)
  }, [isAddDialogOpen])

  const instructorTypeOptions: Array<{ value: AcademyInstructorProfile['type']; label: string }> = [
    { value: 'dispatcher', label: instructorTypeLabels.dispatcher },
    { value: 'mentor', label: instructorTypeLabels.mentor },
    { value: 'expert', label: instructorTypeLabels.expert },
  ]

  const availabilityOptions: Array<{ value: AcademyInstructorProfile['availability']; label: string }> = [
    { value: 'available', label: availabilityLabels.available },
    { value: 'limited', label: availabilityLabels.limited },
    { value: 'unavailable', label: availabilityLabels.unavailable },
  ]
  const vettingOptions: Array<{ value: AcademyInstructorVettingStatus; label: string }> = [
    { value: 'awaiting_verification', label: instructorVettingLabels.awaiting_verification },
    { value: 'cleared', label: instructorVettingLabels.cleared },
    { value: 'needs_review', label: instructorVettingLabels.needs_review },
  ]

  const registrationOptions: Array<{ value: AcademyInstructorDraft['registrationStatus']; label: string }> = [
    { value: 'registered', label: instructorRegistrationLabels.registered },
    { value: 'unregistered', label: instructorRegistrationLabels.unregistered },
  ]

  function handleSubmitNewInstructor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!newInstructorName.trim()) {
      setAddFormError('Instructor name is required.')
      return
    }
    if (!newInstructorFocus.trim()) {
      setAddFormError('Focus area is required.')
      return
    }

    const pendingSkill = newInstructorCustomSkill.trim()
    let certifications = newInstructorCertifications
    if (pendingSkill) {
      const manualCert = createCertification(pendingSkill)
      if (!certifications.some((cert) => cert.id === manualCert.id || cert.display_name === manualCert.display_name)) {
        certifications = [...certifications, manualCert]
      }
      setNewInstructorCertifications(certifications)
      setNewInstructorCustomSkill('')
    }

    handleCreateInstructor({
      name: newInstructorName.trim(),
      type: newInstructorType,
      availability: newInstructorAvailability,
      focus: newInstructorFocus.trim(),
      timezone: newInstructorTimezone.trim() || undefined,
      registrationStatus: newInstructorRegistration,
      vettingStatus: newInstructorVetting,
      certifications,
    })

    setIsAddDialogOpen(false)
  }

  function handleSaveManagedInstructor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedInstructor) {
      setManageFormError('Select an instructor to manage.')
      return
    }
    if (!manageInstructorName.trim()) {
      setManageFormError('Instructor name is required.')
      return
    }
    if (!manageInstructorFocus.trim()) {
      setManageFormError('Focus area is required.')
      return
    }

    const pendingSkill = manageInstructorCustomSkill.trim()
    let certifications = manageInstructorCertifications
    if (pendingSkill) {
      const manualCert = createCertification(pendingSkill)
      if (!certifications.some((cert) => cert.id === manualCert.id || cert.display_name === manualCert.display_name)) {
        certifications = [...certifications, manualCert]
      }
      setManageInstructorCertifications(certifications)
      setManageInstructorCustomSkill('')
    }

    handleUpdateInstructor(selectedInstructor.id, {
      name: manageInstructorName.trim(),
      type: manageInstructorType,
      availability: manageInstructorAvailability,
      focus: manageInstructorFocus.trim(),
      timezone: manageInstructorTimezone.trim() || undefined,
      registrationStatus: manageInstructorRegistration,
      vettingStatus: manageInstructorVetting,
      certifications,
    })

    setIsManageSheetOpen(false)
  }

  function handleRemoveSelectedInstructor() {
    if (!selectedInstructor) {
      setManageFormError('Select an instructor to manage.')
      return
    }
    handleRemoveInstructor(selectedInstructor.id)
    setIsManageSheetOpen(false)
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Instructor Bench</h2>
          <p className="text-sm text-muted-foreground">
            {totalInstructors > 0
              ? `${instructorSummaryLabel}`
              : `No instructors on the bench yet. Add mentors or dispatcher instructors to support ${learnerSummaryLabel}.`}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="button" onClick={() => setIsAddDialogOpen(true)}>
            Add instructor
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsManageSheetOpen(true)}
            disabled={instructors.length === 0}
          >
            Manage instructors
          </Button>
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
            const previewCerts = instructor.certifications.slice(0, 3)
            const registrationStatus = instructor.registrationStatus ?? 'registered'
            const registrationLabel = instructorRegistrationLabels[registrationStatus]
            const isGuestInstructor = registrationStatus === 'unregistered'
            const vettingStatus: AcademyInstructorVettingStatus = instructor.vettingStatus ?? 'awaiting_verification'
            const vettingLabel = instructorVettingLabels[vettingStatus]
            const vettingClass = instructorVettingClasses[vettingStatus]
            const vettingMessage = instructorVettingMessages[vettingStatus]

            return (
              <Card key={instructor.id} className="border border-border/70 shadow-none">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-semibold">{instructor.name}</CardTitle>
                      <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                        {instructorTypeLabels[instructor.type]}
                      </CardDescription>
                      {isGuestInstructor ? (
                        <p className="mt-1 text-xs text-muted-foreground">Guest SME not yet registered in Dispatch.</p>
                      ) : null}
                    </div>
                    <Badge
                      variant={isGuestInstructor ? 'outline' : 'secondary'}
                      className="text-[10px] font-medium uppercase tracking-wide"
                    >
                      {registrationLabel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <Badge
                      variant={
                        instructor.availability === 'available'
                          ? 'default'
                          : instructor.availability === 'limited'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {availabilityLabels[instructor.availability]}
                    </Badge>
                    {instructor.timezone ? <span className="text-muted-foreground">{instructor.timezone}</span> : null}
                  </div>

                  <div>
                    <p className="text-sm font-medium">Focus</p>
                    <p className="text-xs text-muted-foreground">{instructor.focus}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Certifications</p>
                    </div>
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
                    <span className="text-[11px] font-medium uppercase text-muted-foreground">
                      Vetting status
                    </span>
                    <p className="text-xs text-muted-foreground">
                      <span className={`font-semibold ${vettingClass}`}>{vettingLabel}</span> · {vettingMessage}
                    </p>
                  </div>

                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Add instructor</DialogTitle>
            <DialogDescription>Track a new dispatcher instructor or guest SME on your bench.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmitNewInstructor}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-instructor-name">Name</Label>
                <Input
                  id="new-instructor-name"
                  value={newInstructorName}
                  onChange={(event) => setNewInstructorName(event.target.value)}
                  placeholder="Taylor Jordan"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-instructor-type">Type</Label>
                <Select value={newInstructorType} onValueChange={(value) => setNewInstructorType(value as AcademyInstructorProfile['type'])}>
                  <SelectTrigger id="new-instructor-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructorTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-instructor-availability">Availability</Label>
                <Select
                  value={newInstructorAvailability}
                  onValueChange={(value) => setNewInstructorAvailability(value as AcademyInstructorProfile['availability'])}
                >
                  <SelectTrigger id="new-instructor-availability">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-instructor-registration">Registration</Label>
                <Select
                  value={newInstructorRegistration}
                  onValueChange={(value) => setNewInstructorRegistration(value as AcademyInstructorDraft['registrationStatus'])}
                >
                  <SelectTrigger id="new-instructor-registration">
                    <SelectValue placeholder="Registration" />
                  </SelectTrigger>
                  <SelectContent>
                    {registrationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-instructor-vetting">Vetting status</Label>
              <Select
                value={newInstructorVetting}
                onValueChange={(value) => setNewInstructorVetting(value as AcademyInstructorVettingStatus)}
              >
                <SelectTrigger id="new-instructor-vetting">
                  <SelectValue placeholder="Vetting status" />
                </SelectTrigger>
                <SelectContent>
                  {vettingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-instructor-focus">Focus area</Label>
              <Input
                id="new-instructor-focus"
                value={newInstructorFocus}
                onChange={(event) => setNewInstructorFocus(event.target.value)}
                placeholder="Field coordination basics"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-instructor-timezone">Timezone</Label>
              <Input
                id="new-instructor-timezone"
                value={newInstructorTimezone}
                onChange={(event) => setNewInstructorTimezone(event.target.value)}
                placeholder="America/Los_Angeles"
              />
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="new-instructor-skill-select">Certifications / Skills</Label>
                <p className="text-xs text-muted-foreground">
                  Add from the Academy catalog or enter a custom skill to track this instructor&apos;s expertise.
                </p>
              </div>
              <Select
                value={newInstructorSkillSelect}
                onValueChange={(value) => {
                  setNewInstructorSkillSelect(undefined)
                  const option = academyCertificationOptions.find((item) => item.id === value)
                  if (!option) return
                  addNewCertification(createCertification(option.label, option.id, 'academy'))
                }}
              >
                <SelectTrigger id="new-instructor-skill-select">
                  <SelectValue placeholder="Add from Academy catalog" />
                </SelectTrigger>
                <SelectContent>
                  {academyCertificationOptions
                    .filter(
                      (option) => !newInstructorCertifications.some((cert) => cert.id === option.id),
                    )
                    .map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  id="new-instructor-custom-skill"
                  value={newInstructorCustomSkill}
                  onChange={(event) => setNewInstructorCustomSkill(event.target.value)}
                  placeholder="Add custom skill"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (!newInstructorCustomSkill.trim()) return
                    addNewCertification(createCertification(newInstructorCustomSkill))
                    setNewInstructorCustomSkill('')
                  }}
                >
                  Add skill
                </Button>
              </div>
              {newInstructorCertifications.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {newInstructorCertifications.map((cert) => (
                    <button
                      key={cert.id}
                      type="button"
                      onClick={() => removeNewCertification(cert.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition hover:bg-secondary/80"
                      aria-label={`Remove ${cert.display_name}`}
                    >
                      {cert.display_name}
                      <X className="size-3" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {addFormError ? <p className="text-sm text-destructive">{addFormError}</p> : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save instructor</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Sheet open={isManageSheetOpen} onOpenChange={setIsManageSheetOpen}>
        <SheetContent side="right" className="flex h-full flex-col p-0 sm:w-[520px] lg:w-[640px] bg-card text-card-foreground">
          <SheetHeader className="space-y-2 border-b px-6 py-5">
            <SheetTitle>Manage instructors</SheetTitle>
            <SheetDescription>
              Update instructor details, registration status, and the skills you track for the bench.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {instructors.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add an instructor to start managing the bench.</p>
            ) : (
              <form id="manage-instructor-form" className="space-y-5" onSubmit={handleSaveManagedInstructor}>
                <div className="space-y-2">
                  <Label htmlFor="manage-instructor-select">Select instructor</Label>
                  <Select
                    value={manageInstructorId ?? undefined}
                    onValueChange={(value) => setManageInstructorId(value)}
                  >
                    <SelectTrigger id="manage-instructor-select">
                      <SelectValue placeholder="Choose instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="manage-instructor-name">Name</Label>
                    <Input
                      id="manage-instructor-name"
                      value={manageInstructorName}
                      onChange={(event) => setManageInstructorName(event.target.value)}
                      placeholder="Taylor Jordan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manage-instructor-type">Type</Label>
                    <Select
                      value={manageInstructorType}
                      onValueChange={(value) => setManageInstructorType(value as AcademyInstructorProfile['type'])}
                    >
                      <SelectTrigger id="manage-instructor-type">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructorTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="manage-instructor-availability">Availability</Label>
                    <Select
                      value={manageInstructorAvailability}
                      onValueChange={(value) =>
                        setManageInstructorAvailability(value as AcademyInstructorProfile['availability'])
                      }
                    >
                      <SelectTrigger id="manage-instructor-availability">
                        <SelectValue placeholder="Availability" />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manage-instructor-registration">Registration</Label>
                    <Select
                      value={manageInstructorRegistration}
                      onValueChange={(value) =>
                        setManageInstructorRegistration(value as AcademyInstructorProfile['registrationStatus'])
                      }
                    >
                      <SelectTrigger id="manage-instructor-registration">
                        <SelectValue placeholder="Registration" />
                      </SelectTrigger>
                      <SelectContent>
                        {registrationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manage-instructor-vetting">Vetting status</Label>
                  <Select
                    value={manageInstructorVetting}
                    onValueChange={(value) =>
                      setManageInstructorVetting(value as AcademyInstructorVettingStatus)
                    }
                  >
                    <SelectTrigger id="manage-instructor-vetting">
                      <SelectValue placeholder="Vetting status" />
                    </SelectTrigger>
                    <SelectContent>
                      {vettingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manage-instructor-focus">Focus area</Label>
                  <Input
                    id="manage-instructor-focus"
                    value={manageInstructorFocus}
                    onChange={(event) => setManageInstructorFocus(event.target.value)}
                    placeholder="Field coordination basics"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manage-instructor-timezone">Timezone</Label>
                  <Input
                    id="manage-instructor-timezone"
                    value={manageInstructorTimezone}
                    onChange={(event) => setManageInstructorTimezone(event.target.value)}
                    placeholder="America/Los_Angeles"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="manage-instructor-skill-select">Certifications / Skills</Label>
                    <p className="text-xs text-muted-foreground">
                      Track verified Academy courses or add custom skills for this instructor.
                    </p>
                  </div>
                  <Select
                    value={manageInstructorSkillSelect}
                    onValueChange={(value) => {
                      setManageInstructorSkillSelect(undefined)
                      const option = academyCertificationOptions.find((item) => item.id === value)
                      if (!option) return
                      addManagedCertification(createCertification(option.label, option.id, 'academy'))
                    }}
                  >
                    <SelectTrigger id="manage-instructor-skill-select">
                      <SelectValue placeholder="Add from Academy catalog" />
                    </SelectTrigger>
                    <SelectContent>
                      {academyCertificationOptions
                        .filter((option) => !manageInstructorCertifications.some((cert) => cert.id === option.id))
                        .map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      id="manage-instructor-custom-skill"
                      value={manageInstructorCustomSkill}
                      onChange={(event) => setManageInstructorCustomSkill(event.target.value)}
                      placeholder="Add custom skill"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        if (!manageInstructorCustomSkill.trim()) return
                        addManagedCertification(createCertification(manageInstructorCustomSkill))
                        setManageInstructorCustomSkill('')
                      }}
                    >
                      Add skill
                    </Button>
                  </div>
                  {manageInstructorCertifications.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {manageInstructorCertifications.map((cert) => (
                        <button
                          key={cert.id}
                          type="button"
                          onClick={() => removeManagedCertification(cert.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition hover:bg-secondary/80"
                          aria-label={`Remove ${cert.display_name}`}
                        >
                          {cert.display_name}
                          <X className="size-3" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                {manageFormError ? <p className="text-sm text-destructive">{manageFormError}</p> : null}
              </form>
            )}
          </div>

          <SheetFooter className="gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            {instructors.length > 0 ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleRemoveSelectedInstructor}
                  disabled={!selectedInstructor}
                >
                  Remove instructor
                </Button>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsManageSheetOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" form="manage-instructor-form">
                    Save changes
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex w-full justify-end">
                <Button type="button" variant="outline" onClick={() => setIsManageSheetOpen(false)}>
                  Close
                </Button>
              </div>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </section>
  )
}
