import type { NormalizedCertification } from '../types/pod.ts';

export type AcademyInstructorRegistrationStatus = 'registered' | 'unregistered' | 'pending';

export type AcademySummaryStat = {
  label: string;
  value: string;
  helper?: string;
  /** Optional link target. When provided, stat cards can render as links (e.g., to in-page anchors). */
  href?: string;
};

export type AcademyCourseSummary = {
  slug: string;
  title: string;
  description: string;
  version?: number;
  type: 'qualified' | 'certified';
  icon?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'review';
};

export type AcademyCourseGroup = {
  id: string;
  label: string;
  trackLabel?: string;
  variant?: string;
  courses: AcademyCourseSummary[];
};

export type AcademySessionUnderstandingLevel = 'needs_support' | 'building' | 'confident';

export type AcademyTrainingSessionParticipant = {
  id: string;
  name: string;
  signalHandle?: string;
  understanding: AcademySessionUnderstandingLevel;
  status: 'confirmed' | 'waitlist';
};

export type AcademyMemberProgress = {
  id: string;
  name: string;
  podName: string;
  role: string;
  status: string;
  certifications: NormalizedCertification[];
  pendingLessons?: number;
  completedLessons?: number;
  lastActivity?: string;
};

export type AcademyInstructorVettingStatus = 'awaiting_verification' | 'needs_review' | 'cleared';

export type AcademyInstructorProfile = {
  id: string;
  name: string;
  type: 'dispatcher' | 'mentor' | 'expert';
  focus: string;
  availability: 'available' | 'limited' | 'unavailable';
  timezone?: string;
  certifications: NormalizedCertification[];
  registrationStatus: AcademyInstructorRegistrationStatus;
  vettingStatus: AcademyInstructorVettingStatus;
};

export type AcademyInstructorDraft = Omit<AcademyInstructorProfile, 'id' | 'certifications'> & {
  certifications?: NormalizedCertification[];
};

export type AcademyTrainingClass = {
  id: string;
  title: string;
  description: string;
  track: string;
  modality: 'in_person' | 'online' | 'hybrid';
  instructorType: 'dispatcher' | 'mentor' | 'expert';
  durationHours: number;
  sessionsScheduled: number;
  nextSession?: string;
  status: 'draft' | 'needs_instructor' | 'scheduled' | 'completed';
};

export type AcademyTrainingSessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'archived';

export type AcademyTrainingSession = {
  id: string;
  classId: string;
  title: string;
  start: string;
  end: string;
  modality: 'in_person' | 'online' | 'hybrid';
  location?: string;
  meetingUrl?: string;
  instructorName: string;
  instructorType: 'dispatcher' | 'mentor' | 'expert';
  status: AcademyTrainingSessionStatus;
  seats: {
    capacity: number;
    confirmed: number;
    waitlist: number;
  };
  timezone?: string;
  relatedTopic?: string;
  participants: AcademyTrainingSessionParticipant[];
};

export type AcademyTrainingSessionDraft = {
  title: string;
  start: string;
  end: string;
  modality: AcademyTrainingSession['modality'];
  location?: string;
  seatsCapacity: number;
  status: Exclude<AcademyTrainingSessionStatus, 'archived'>;
  relatedTopic?: string;
  participants?: AcademyTrainingSessionParticipant[];
};
