export type AcademyCourseGroupConfig = {
  label: string;
  track?: string;
  courses: Array<{ slug: string; icon?: string }>;
};

