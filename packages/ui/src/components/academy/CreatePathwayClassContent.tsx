'use client';

import * as React from 'react';
import { format } from 'date-fns';

import { TrackBadge } from '@workspace/ui/components/academy/TrackBadge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';

import type { AcademyClass } from '@workspace/store/usePodStore';
import type { CourseBlueprint } from '@workspace/ui/data/academy/course-blueprint';
import { DateTimePicker } from '@workspace/ui/components/DateTimePicker';

type CreatePathwayClassContentProps = {
  pathway: CourseBlueprint;
  onCreateClass: (academyClass: AcademyClass) => Promise<void> | void;
  onBackToAcademy: () => void;
  onCancel?: () => void;
};

function generateClassId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `cls_${Math.random().toString(36).slice(2, 10)}`;
}

function combineDateTimeToIso(date?: string, time?: string) {
  if (!date || !time) return undefined;
  const candidate = new Date(`${date}T${time}:00`);
  if (Number.isNaN(candidate.getTime())) return undefined;
  return candidate.toISOString();
}

export function CreatePathwayClassContent({
  pathway,
  onCreateClass,
  onBackToAcademy,
  onCancel,
}: CreatePathwayClassContentProps) {
  const defaultCourse = pathway.courses[0];
  const [submitting, setSubmitting] = React.useState(false);

  const [title, setTitle] = React.useState<string>(() =>
    defaultCourse ? `${pathway.label} · Cohort` : `${pathway.label} Class`,
  );
  const [capacity, setCapacity] = React.useState<string>('18');
  const [modality, setModality] = React.useState<'in_person' | 'online' | 'hybrid'>(
    defaultCourse?.modality ?? 'online',
  );
  const [instructorType, setInstructorType] = React.useState<'dispatcher' | 'mentor' | 'expert'>(
    defaultCourse?.instructorType ?? 'dispatcher',
  );
  const [durationHours, setDurationHours] = React.useState<string>(
    defaultCourse ? String(defaultCourse.durationHours ?? 1) : '1',
  );
  const [startDate, setStartDate] = React.useState<string>('');
  const [startTime, setStartTime] = React.useState<string>('');
  const [location, setLocation] = React.useState<string>('');
  const [meetingUrl, setMeetingUrl] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');
  const dateTimeValue = React.useMemo(
    () => combineDateTimeToIso(startDate, startTime),
    [startDate, startTime],
  );

  const handleDateTimeChange = React.useCallback(
    (isoString: string) => {
      if (!isoString) {
        setStartDate('');
        setStartTime('');
        return;
      }

      const next = new Date(isoString);
      if (Number.isNaN(next.getTime())) return;

      setStartDate(format(next, 'yyyy-MM-dd'));
      setStartTime(format(next, 'HH:mm'));
    },
    [setStartDate, setStartTime],
  );

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const classId = generateClassId();
      const parsedDuration = Number.parseFloat(durationHours) || 1;
      const parsedCapacity = Number.parseInt(capacity, 10) || 0;
      const nextSession = combineDateTimeToIso(startDate, startTime);
      const description =
        pathway.trackLabel ?? `Live cohort moving through the ${pathway.label} pathway together.`;

      const academyClass: AcademyClass = {
        id: classId,
        pathwayId: pathway.id,
        pathwayLabel: pathway.label,
        trackLabel: pathway.trackLabel,
        variant: pathway.variant,
        title,
        description,
        modality,
        instructorType,
        durationHours: parsedDuration,
        capacity: parsedCapacity > 0 ? parsedCapacity : undefined,
        startDate: startDate || undefined,
        startTime: startTime || undefined,
        location: location || undefined,
        meetingUrl: meetingUrl || undefined,
        notes: notes || undefined,
        instructorName: undefined,
        members: [],
        sessions: [],
        sessionsScheduled: nextSession ? 1 : 0,
        nextSession,
        status: 'needs_instructor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        setSubmitting(true);
        await onCreateClass(academyClass);
      } finally {
        setSubmitting(false);
      }
    },
    [
      capacity,
      durationHours,
      instructorType,
      location,
      meetingUrl,
      modality,
      notes,
      onCreateClass,
      pathway.id,
      pathway.label,
      pathway.trackLabel,
      pathway.variant,
      startDate,
      startTime,
      title,
    ],
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Qualification pathway</p>
          <h1 className="mt-2 text-3xl font-semibold">{pathway.label}</h1>
          {pathway.trackLabel ? (
            <p className="mt-3 text-sm text-muted-foreground">{pathway.trackLabel}</p>
          ) : null}
          {pathway.variant ? (
            <div className="mt-4">
              <TrackBadge variant={pathway.variant} />
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" onClick={onBackToAcademy}>
            Back to Academy
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class details</CardTitle>
          <CardDescription>
            Set up a live cohort so mentors, instructors, and learners can move through this track together.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Label htmlFor="class-title">Class title</Label>
            <Input
              id="class-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Level 2 Cohort · April Dispatchers"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <DateTimePicker label="Date" value={dateTimeValue} onChange={handleDateTimeChange} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-2 space-x-2">


                    <Label htmlFor="class-capacity">Capacity</Label>
                    <Input
                      id="class-capacity"
                      type="number"
                      min={1}
                      value={capacity}
                      onChange={(event) => setCapacity(event.target.value)}
                      placeholder="18"
                    />
                  </div>
                  <div className="space-y-2 space-x-2">

                    <Label htmlFor="class-duration">Duration (hours)</Label>
                    <Input
                      id="class-duration"
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={durationHours}
                      onChange={(event) => setDurationHours(event.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Modality</Label>
                <Select value={modality} onValueChange={(value) => setModality(value as typeof modality)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in_person">In person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <div className="space-y-2">
                <Label>Instructor focus</Label>
                <Select
                  value={instructorType}
                  onValueChange={(value) => setInstructorType(value as typeof instructorType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dispatcher">Dispatcher Instructor</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="expert">Subject Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="class-location">Location or meeting link</Label>
                <Input
                  id="class-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Community Safety Hub — Oakland"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="class-meeting-url">Video meeting URL (optional)</Label>
                <Input
                  id="class-meeting-url"
                  type="url"
                  value={meetingUrl}
                  onChange={(event) => setMeetingUrl(event.target.value)}
                  placeholder="https://meet.alwaysready.tools/dispatch-drill"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="class-notes">Notes for mentors & coordinators</Label>
                <Textarea
                  id="class-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  placeholder="Outline preparation needs, resource links, and who will coordinate updates."
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => onCancel?.()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} aria-busy={submitting}>
                {submitting ? 'Saving…' : 'Save class details'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
