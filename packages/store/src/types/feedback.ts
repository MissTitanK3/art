export type BugReportStatus =
  | "open"
  | "triage"
  | "in_progress"
  | "resolved"
  | "closed";
export type BugReportPriority = "low" | "medium" | "high" | "critical" | null;

export type BugReport = {
  id: string;
  created_at: string;
  created_by: string; // auth user id
  title: string;
  area: string; // e.g., 'watch', 'pods', 'academy'
  steps?: string;
  expected?: string;
  actual?: string;
  status: BugReportStatus;
  priority: BugReportPriority;
  metadata?: Record<string, any> | null;
};
