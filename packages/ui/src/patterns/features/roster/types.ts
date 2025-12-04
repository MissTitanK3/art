export type RosterEditorSection = 'details' | 'coverage' | 'languages' | 'pathways';

export const ROSTER_EDITOR_SECTION_META: Record<RosterEditorSection, { title: string; description: string }> = {
  details: {
    title: 'General Information',
    description: 'Update call sign, role, roster status, important dates, and contact details.',
  },
  coverage: {
    title: 'Operational Coverage',
    description: 'Tag coverage interests so academy requirements stay aligned with deployments.',
  },
  languages: {
    title: 'Languages & Skills',
    description: 'Capture language proficiency and skill tags to match volunteers with requests.',
  },
  pathways: {
    title: 'Course Progress',
    description: 'Enroll the volunteer in qualification pathways and update certification progress.',
  },
};
