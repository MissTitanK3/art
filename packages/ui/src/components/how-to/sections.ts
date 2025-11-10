// Loosen to string so consumers can add new sections without editing types
export type HowToSectionId = string;

export type HowToSection = {
  id: HowToSectionId;
  label: string;
};

export const HOW_TO_SECTIONS: ReadonlyArray<HowToSection> = [
  { id: "user-guide", label: "Platform User Guide" },
  { id: "bug-tracker", label: "Bug Tracker" },
  // Core areas
  { id: "team-req", label: "Create – Team Requests" },
  { id: "dispatches", label: "Dispatches" },
  { id: "watch", label: "Community Watch" },
  { id: "schedules", label: "Coverage Schedules" },
  { id: "pods", label: "Pods" },
  { id: "pods-new", label: "Create Pod" },
  // Knowledge
  { id: "academy", label: "Academy" },
  { id: "academy-class", label: "Academy – Classes" },
  { id: "nav-roles", label: "Roles & Access (Nav)" },
  // { id: 'intents', label: 'Intents' },
  // { id: 'roles', label: 'Roles' },
  // { id: 'impact', label: 'Impact' },
  // Cases
  { id: "missing-persons", label: "Missing Persons" },
  { id: "missing-persons-intake", label: "Missing Persons – Intake" },
  { id: "missing-persons-case", label: "Missing Persons – Case View" },
  // Profile & settings
  { id: "my-profile", label: "My Profile" },
  { id: "my-profile-map", label: "My Profile – Map" },
  // { id: 'settings', label: 'Settings' },
  // { id: 'credentials', label: 'Credentials' },
  // Admin
  { id: "admin", label: "Admin" },
  { id: "admin-bug-reports", label: "Admin – Bug Reports" },
  { id: "admin-dispatch", label: "Admin – Dispatch" },
  { id: "admin-pods", label: "Admin – Pods" },
  { id: "admin-profiles", label: "Admin – Profiles" },
  { id: "admin-training", label: "Admin – Training" },
  { id: "admin-trust", label: "Admin – Trust" },
  // Other
  // { id: 'trust-management', label: 'Trust Management' },
  // { id: "warehousing", label: "Warehousing" },
] as const;

export const DEFAULT_HOW_TO_SECTION_ID: HowToSectionId = "user-guide";
