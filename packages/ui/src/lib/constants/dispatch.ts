import { DispatchStatus } from '@workspace/store/types/dispatch.ts';

export const STATUS_META: Record<DispatchStatus, { label: string; color: string }> = {
  preplanning: { label: 'Preplanning', color: '!bg-slate-500' },
  unconfirmed: { label: 'Unconfirmed', color: '!bg-gray-500' },
  confirmed: { label: 'Confirmed', color: '!bg-blue-600' },
  mobilizing: { label: 'Mobilizing', color: '!bg-amber-500' },
  in_progress: { label: 'In Progress', color: '!bg-indigo-600' },
  verified_complete: { label: 'Verified', color: '!bg-emerald-700' },
  debriefing: { label: 'Debriefing', color: '!bg-purple-600' },
  completed: { label: 'Completed', color: '!bg-green-600' },
  cancelled: { label: 'Cancelled', color: '!bg-red-600' },
  expired: { label: 'Expired', color: '!bg-orange-700' },
  archived: { label: 'Archived', color: '!bg-stone-600' },
};

export const ACTION_PRESETS = [
  '',
  'Witnessing / observation only',
  'Assist individuals with legal navigation',
  'Document and report ICE/law enforcement presence',
  'Provide trauma-informed de-escalation',
  'Support community visibility and morale',
  'Coordinate direct intervention or obstruction',
  'Childcare or eldercare support on site',
  'Media or livestream monitoring and amplification',
  'Rights observation and legal witnessing',
  'Track arrests or detentions for legal follow-up',
  'On-site emotional or mental health support',
  'Support disengagement and tactical withdrawal',
  'Assist disabled individuals with access or evacuation',
  'Provide cultural or spiritual grounding',
  'Jam surveillance or hostile tech infrastructure',
  'Map and monitor enforcement movement live',
  'Custom action plan (see notes below)',
];

export const ACTION_PRESETS_GROUPED: Record<string, string[]> = {
  '📋 Observation & Documentation': [
    'Witnessing / observation only',
    'Document and report ICE/law enforcement presence',
    'Media or livestream monitoring and amplification',
    'Rights observation and legal witnessing',
  ],
  '⚖️ Legal & Advocacy Support': [
    'Assist individuals with legal navigation',
    'Track arrests or detentions for legal follow-up',
    'Court accompaniment or support presence',
    'Provide immigration-specific legal triage',
  ],
  '🧠 Mental Health & De-escalation': [
    'Provide trauma-informed de-escalation',
    'On-site emotional or mental health support',
    'Monitor and intervene in escalating group tensions',
  ],
  '🤝 Community Support & Logistics': [
    'Support community visibility and morale',
    'Provide food, water, or comfort supplies',
    'Assist with logistics and transportation needs',
    'Coordinate check-ins and mutual aid relay',
  ],
  '🚸 Care Roles': [
    'Childcare or eldercare support on site',
    'Assist disabled individuals with access or evacuation',
    'Provide cultural or spiritual grounding',
  ],
  '🚨 Direct Action / Protective Roles': [
    'Coordinate direct intervention or obstruction',
    'Act as defensive presence or human buffer',
    'Support disengagement and tactical withdrawal',
  ],
  '📡 Comms & Tech Support': [
    'Maintain Signal/radio/tech comms relay',
    'Jam surveillance or hostile tech infrastructure',
    'Map and monitor enforcement movement live',
  ],
  '🛡️ Community Defense Center': [
    'Rapid-response patrol or presence at high-risk areas (e.g., hotels, day laborer sites)',
    'Deploys trained observers, defensive presence, legal support, and community liaisons',
    'Aims to interrupt, document, and deter ICE operations or hostile presence',
  ],
  '🧭 Custom Planning': ['Custom action plan (see notes below)'],
};

export const STATUS_FLOW = [
  'not_contacted',
  'contacted',
  'en_route',
  'on_site',
  'leaving',
  'home_safe',
  'hospitalized',
  'imprisoned',
] as const;

export type DispatchPersonnelStatus = (typeof STATUS_FLOW)[number];

export const STATUS_INFO: Record<DispatchPersonnelStatus, { label: string; color: string }> = {
  not_contacted: { label: 'Not Contacted', color: 'gray' },
  contacted: { label: 'Contacted', color: 'blue' },
  en_route: { label: 'En Route', color: 'yellow' },
  on_site: { label: 'On Site', color: 'green' },
  leaving: { label: 'Leaving', color: 'purple' },
  home_safe: { label: 'Home Safe', color: 'emerald' },
  hospitalized: { label: 'Hospitalized', color: 'red' },
  imprisoned: { label: 'Imprisoned', color: 'orange' },
};

export const STATUS_COLOR_CLASSES: Record<DispatchPersonnelStatus, string> = {
  not_contacted: 'bg-gray-800 text-white',
  contacted: 'bg-blue-800 text-white',
  en_route: 'bg-yellow-700 text-black',
  on_site: 'bg-green-800 text-white',
  leaving: 'bg-purple-800 text-white',
  home_safe: 'bg-emerald-800 text-white',
  hospitalized: 'bg-red-800 text-white',
  imprisoned: 'bg-orange-800 text-white',
};

// Explanatory context for all enum values to improve accessibility
export const STATUS_EXPLANATIONS: Record<
  DispatchStatus,
  { definition: string; consequence: string; action: string; reversible: boolean }
> = {
  preplanning: {
    definition: 'Early coordination phase before confirmation',
    consequence: 'Volunteers are not yet formally notified',
    action: "Move to 'Confirmed' when ready to mobilize",
    reversible: true,
  },
  unconfirmed: {
    definition: 'Event reported but not yet verified',
    consequence: 'Volunteers may decline without context',
    action: "Verify details before advancing to 'Confirmed'",
    reversible: true,
  },
  confirmed: {
    definition: 'Event verified and ready for volunteer mobilization',
    consequence: 'Volunteers will receive notifications',
    action: "Assign roles and signal links before moving to 'Mobilizing'",
    reversible: true,
  },
  mobilizing: {
    definition: 'Volunteers are actively traveling to the location',
    consequence: 'Coordination is critical; changes affect people in transit',
    action: "Move to 'In Progress' when first volunteer arrives",
    reversible: true,
  },
  in_progress: {
    definition: 'Active response in progress on the ground',
    consequence: 'Real-time updates are critical for safety',
    action: "Post updates regularly; mark 'Completed' when done",
    reversible: true,
  },
  verified_complete: {
    definition: 'Action completed and verified by coordinator',
    consequence: 'Volunteers are notified they can stand down',
    action: "Proceed to 'Debriefing' for after-action report",
    reversible: true,
  },
  debriefing: {
    definition: 'Post-action reporting and lessons learned',
    consequence: 'Metrics and outcomes are being documented',
    action: "Complete impact metrics before marking 'Completed'",
    reversible: true,
  },
  completed: {
    definition: 'All work finished and documented',
    consequence: 'No further action expected; enters archive workflow',
    action: 'Cannot be reversed without coordinator override',
    reversible: false,
  },
  cancelled: {
    definition: 'Event cancelled before completion',
    consequence: 'Volunteers are notified not to proceed',
    action: 'Document reason in notes for audit trail',
    reversible: false,
  },
  expired: {
    definition: 'Event passed without action taken',
    consequence: 'Marked for cleanup; no volunteer action',
    action: 'Archive or delete based on retention policy',
    reversible: false,
  },
  archived: {
    definition: 'Historical record; no longer active',
    consequence: 'Read-only; cannot be modified',
    action: 'Contact admin to restore if needed',
    reversible: false,
  },
};

export const RISK_EXPLANATIONS = {
  unknown: {
    definition: 'No safety assessment completed',
    consequence: 'Volunteers may decline without context',
    action: 'Complete risk assessment before mobilizing',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  low: {
    definition: 'Minimal safety concerns; standard protocols apply',
    consequence: 'Routine volunteer deployment',
    action: 'Monitor for changes during event',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  medium: {
    definition: 'Some safety concerns present; enhanced caution needed',
    consequence: 'Only experienced volunteers should deploy',
    action: 'Brief volunteers on specific risks before arrival',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  high: {
    definition: 'Significant safety risks; protective measures required',
    consequence: 'Requires coordinator approval and safety planning',
    action: 'Establish check-in protocol and emergency contacts',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  critical: {
    definition: 'Severe safety threat; deployment may be unsafe',
    consequence: 'Volunteer safety cannot be guaranteed',
    action: 'Consider cancellation or remote support only',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
} as const;

export const VISIBILITY_EXPLANATIONS = {
  org_only: {
    definition: 'Visible only to members of your organization',
    whoCanSee: 'Your organization members',
    privacyLevel: 'Highest privacy',
    useWhen: 'Sensitive operations or internal-only events',
  },
  org_and_region_masked: {
    definition: 'Your org + region coordinators see details; others see general location only',
    whoCanSee: 'Your org + region coordinators (others see masked version)',
    privacyLevel: 'High privacy (default)',
    useWhen: 'Most operations requiring regional coordination',
  },
  region: {
    definition: 'All volunteers in your region can see full details',
    whoCanSee: 'All volunteers in your region',
    privacyLevel: 'Medium privacy',
    useWhen: 'Public actions or when seeking wide volunteer participation',
  },
  federated: {
    definition: 'Shared with partner organizations in other regions',
    whoCanSee: 'Multi-region network (federation partners)',
    privacyLevel: 'Lower privacy',
    useWhen: 'Cross-border or multi-region coordinated actions',
  },
  public: {
    definition: 'Publicly visible to anyone with the link',
    whoCanSee: 'Anyone with the link (no authentication required)',
    privacyLevel: 'No privacy',
    useWhen: 'Public events or community outreach actions',
  },
} as const;
