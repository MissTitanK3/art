import type { AcademyCourseGroupConfig } from "./group-types";

export const CUSTOM_ACADEMY_COURSE_GROUPS: AcademyCourseGroupConfig[] = [
  {
    label: "K-12 Teachers: Student Safety & Intervention Track",
    courses: [
      { slug: "bystander-support" },
      { slug: "deescalation-basics" },
      { slug: "crisis-debrief-care" },
      { slug: "medical-basics-field-safety" },
    ],
  },
  {
    label: "K-12 Teachers: Trauma-Informed Education Track",
    courses: [
      { slug: "mental-health-resilience" },
      { slug: "care-support" },
      { slug: "peer-support-checkins" },
      { slug: "trauma-risk-awareness" },
    ],
  },
  {
    label: "K-12 Teachers: Civic Literacy & Rights Education Track",
    courses: [
      { slug: "kyr-basics" },
      { slug: "fourth-amendment-rights" },
      { slug: "community-consent" },
      { slug: "mutual-aid-history" },
    ],
  },
  {
    label: "K-12 Teachers: School-Community Coordination Track",
    courses: [
      { slug: "outreach-messaging-community-trust" },
      { slug: "media-awareness-volunteers" },
      { slug: "documentation-safety" },
      { slug: "signal-basics-accessible" },
    ],
  },
  {
    label: "K-12 Teachers: Optional Specializations",
    courses: [
      { slug: "child-specialist" },
      { slug: "social-worker-crisis-support" },
    ],
  },
];
