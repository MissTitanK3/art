// Shared types for Academy data/frontmatter used across apps

export type AcademyCourseFrontmatter = {
  slug: string;
  title?: string;
  description?: string;
  icon?: string;
  type?: "qualified" | "certified" | "overview" | "appendix";
  version?: number;
  // Some MDX files use either of these; keep both for compatibility
  estimatedReadingTime?: number;
  readingTime?: number;
  // Optional learning metadata often used in blueprints or classes
  durationHours?: number;
  modality?: "in_person" | "online" | "hybrid";
  instructorType?: "dispatcher" | "mentor" | "expert";
  certId?: string;
};
