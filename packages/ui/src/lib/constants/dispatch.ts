import { DispatchStatus } from '@workspace/store/types/dispatch.ts';

export const STATUS_META: Record<DispatchStatus, { label: string; color: string }> = {
  preplanning: { label: 'Preplanning', color: '!bg-slate-500' },
  unconfirmed: { label: 'Unconfirmed', color: '!bg-gray-500' },
  confirmed: { label: 'Confirmed', color: '!bg-blue-600' },
  mobilizing: { label: 'Mobilizing', color: '!bg-amber-500' },
  in_progress: { label: 'In Progress', color: '!bg-indigo-600' },
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
