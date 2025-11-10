import { humanize } from "../../lib/utils";
import type { TrackVariant } from "../../components/academy/TrackBadge";
import { GENERATED_ACADEMY_COURSE_GROUPS as ACADEMY_COURSE_GROUPS } from "./course-groups.generated";
import { GENERATED_COURSE_DETAILS as ACADEMY_COURSE_DETAILS } from "./course-details.generated";

export type CourseBlueprintCourse = {
  slug: string;
  title: string;
  description: string;
  icon?: string;
  type: "qualified" | "certified" | "overview" | "appendix";
  version?: number;
  durationHours: number;
  modality: "in_person" | "online" | "hybrid";
  instructorType: "dispatcher" | "mentor" | "expert";
  certId?: string;
};

export type CourseBlueprint = {
  id: string;
  label: string;
  trackLabel?: string;
  variant?: TrackVariant;
  courses: CourseBlueprintCourse[];
};

export const QUALIFICATION_VARIANTS: Record<string, TrackVariant> = {
  "Getting Started (Everyone)": "movement-strategy",
  "Level 1: Team Member Onboarding": "community-care",
  "Level 2: Field Coordination Basics (Basic Dispatcher)": "field-safety",
  "Level 3: Dispatcher Certification (Verified Dispatcher)": "pod-leadership",
  "Level 4: Zone Lead (Admin Dispatcher)": "logistics",
};

export function slugifyLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export const COURSE_GROUPS = ACADEMY_COURSE_GROUPS;

export const COURSE_BLUEPRINT: CourseBlueprint[] = COURSE_GROUPS.map(
  (group) => {
    const fallbackId = slugifyLabel(group.label);
    const variant = QUALIFICATION_VARIANTS[group.label];
    const isCertifiedGroup = group.courses.some((course) => {
      const slug = course.slug as keyof typeof ACADEMY_COURSE_DETAILS;
      const meta = ACADEMY_COURSE_DETAILS[slug];
    });

    return {
      id: fallbackId,
      label: group.label,
      trackLabel: group.track,
      variant,
      courses: group.courses.map((course) => {
        const meta =
          course.slug in ACADEMY_COURSE_DETAILS
            ? ACADEMY_COURSE_DETAILS[
                course.slug as keyof typeof ACADEMY_COURSE_DETAILS
              ]
            : undefined;

        return {
          slug: course.slug,
          title:
            typeof meta?.title === "string"
              ? meta.title
              : Array.isArray(meta?.title)
                ? meta.title.join(" ")
                : humanize(course.slug),
          description:
            typeof meta?.description === "string"
              ? meta.description
              : Array.isArray(meta?.description)
                ? meta.description.join(" ")
                : "Details available in Academy.",
          icon:
            typeof (meta && "icon" in meta ? meta.icon : course.icon) ===
            "string"
              ? meta && "icon" in meta
                ? (meta.icon as string)
                : ((course.icon as string) ?? "📘")
              : "📘",
          type: meta?.type ?? (isCertifiedGroup ? "certified" : "qualified"),
          version:
            meta && "version" in meta ? (meta.version as number) : undefined,
          durationHours:
            meta && "durationHours" in meta
              ? (meta.durationHours as number)
              : 1,
          modality:
            meta && "modality" in meta
              ? (meta.modality as "in_person" | "online" | "hybrid")
              : "online",
          instructorType:
            meta && "instructorType" in meta
              ? (meta.instructorType as "dispatcher" | "mentor" | "expert")
              : "dispatcher",
          certId:
            meta && "certId" in meta ? (meta.certId as string) : undefined,
        };
      }),
    };
  },
);
