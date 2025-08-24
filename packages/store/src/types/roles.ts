import z from 'zod';

// Role types (used throughout the app)
export const AccessRoles = ['team_member', 'dispatcher_basic', 'dispatcher_verified', 'dispatcher_admin'] as const;
export type AccessRole = (typeof AccessRoles)[number];

export const VerifiedBy = ['self', 'partner_org', 'admin'] as const;
export type VerifiedBy = (typeof VerifiedBy)[number];

// Descriptions for tooltips or help text
export const AccessRoleDescriptions: Record<AccessRole, string> = {
  team_member: 'Team members can view and respond to field tasks, but do not have dispatch privileges.',
  dispatcher_basic: 'Basic dispatchers can coordinate with field teams but cannot manage team members.',
  dispatcher_verified: 'Verified dispatchers are trusted coordinators with elevated permissions.',
  dispatcher_admin: 'Admins can fully manage dispatch operations, teams, and settings.',
};

export const VerifiedByDescriptions: Record<VerifiedBy, string> = {
  self: 'This user verified themselves during signup.',
  partner_org: 'Verified through a trusted partner organization.',
  admin: 'Verified directly by a system admin.',
};

export function verifierLabel(source: VerifiedBy): string {
  switch (source) {
    case 'self':
      return 'Self';
    case 'partner_org':
      return 'Partner Org';
    case 'admin':
      return 'Admin';
  }
}

export function roleLabel(role: AccessRole): string {
  switch (role) {
    case 'team_member':
      return 'Team Member';
    case 'dispatcher_basic':
      return 'Dispatcher (Basic)';
    case 'dispatcher_verified':
      return 'Dispatcher (Verified)';
    case 'dispatcher_admin':
      return 'Dispatcher Admin';
  }
}

export const FIELD_ROLE_OPTIONS = [
  'legal',
  'arrest_tracker',
  'rights_observer',
  'media_observer',
  'deescalation',
  'safety_marshall',
  'defensive',
  'medic',
  'mental_health',
  'disability_aid',
  'translator',
  'asl_interpreter',
  'dispatch_aide',
  'tech_support',
  'logistics',
  'child_specialist',
  'immigration_specialist',
  'faith_leader',
  'bondsman',
  'social_worker',
  'community_organizer',
  'tech_jammer',
  'vehicle_support',
  'care_station',
  'night_logistics',
  'resource_drop',
  'grounding_support',
  'wellness_float',
  'courthouse_marshal',
  'legal_liaison',
  'security_witness',
  'docket_tracker',
  'court_float_support',
  'press_coordination',
  'survivor_escort',
  'line_scheduler',
] as const;

/** Zod schema — use in forms */
export const FieldRoleSchema = z.enum(FIELD_ROLE_OPTIONS);

/** TS type — use in stores & props */
export type FieldRole = z.infer<typeof FieldRoleSchema>;

export type RoleValue = 'lead' | 'member' | 'trainee';

export type RoleOption = {
  value: RoleValue;
  label: string;
  dotClass: string; // Tailwind color for a small dot
  description?: string;
};

export const ROLE_OPTIONS: RoleOption[] = [
  { value: 'lead', label: 'Lead', dotClass: 'bg-emerald-500', description: 'Coordinates the pod' },
  { value: 'member', label: 'Member', dotClass: 'bg-amber-500', description: 'Active volunteer' },
  { value: 'trainee', label: 'Trainee', dotClass: 'bg-indigo-500', description: 'In training / shadowing' },
];

export const ROLE_BY_VALUE = Object.fromEntries(ROLE_OPTIONS.map((o) => [o.value, o] as const));

export const FIELD_ROLE_LABELS: Record<FieldRole, string> = {
  legal: 'Legal Support',
  arrest_tracker: 'Arrest Tracker',
  rights_observer: 'Know Your Rights Observer',
  media_observer: 'Media/Press Monitor',
  deescalation: 'De-escalation',
  safety_marshall: 'Safety Marshal',
  defensive: 'Defensive Presence',
  medic: 'Street Medic',
  mental_health: 'Mental Health',
  disability_aid: 'Disability Aid',
  translator: 'Translator',
  asl_interpreter: 'ASL Interpreter',
  dispatch_aide: 'Dispatch Assistant',
  tech_support: 'Tech Support',
  logistics: 'Logistics Support',
  child_specialist: 'Child Specialist',
  immigration_specialist: 'Immigration Specialist',
  faith_leader: 'Faith Leader',
  bondsman: 'Bondsman',
  social_worker: 'Social Worker',
  community_organizer: 'Community Organizer',
  tech_jammer: 'Tech Jammer',
  vehicle_support: 'Vehicle Support',
  care_station: 'Care Station Coordinator',
  night_logistics: 'Night Logistics',
  resource_drop: 'Resource Drop Coordinator',
  grounding_support: 'Grounding Support',
  wellness_float: 'Wellness Float',
  courthouse_marshal: 'Courthouse Marshal',
  legal_liaison: 'Legal Liaison',
  security_witness: 'Security Witness',
  docket_tracker: 'Docket Tracker',
  court_float_support: 'Court Float Support',
  press_coordination: 'Press Coordination',
  survivor_escort: 'Survivor Escort',
  line_scheduler: 'Line Scheduler',
};

export type EventType =
  | 'routine_check'
  | 'community_event'
  | 'protest_low'
  | 'protest_high'
  | 'raid_in_progress'
  | 'detention_center_action'
  | 'checkpoint_monitoring'
  | 'court_support'
  | 'home_visitation'
  | 'post_raid_support'
  | 'border_encounter'
  | 'transport_interdiction'
  | 'community_defense_center';

export type ActionPreset = (typeof ACTION_PRESETS)[number];

type TeamConfigPreset = {
  roles: Partial<Record<FieldRole, number>>;
  actions: ActionPreset[];
};

export const TEAM_CONFIG_PRESETS: Record<EventType, TeamConfigPreset> = {
  routine_check: {
    roles: {
      legal: 1,
      arrest_tracker: 1,
      rights_observer: 1,
      dispatch_aide: 1,
    },
    actions: [
      'Witnessing / observation only',
      'Document and report ICE/law enforcement activity',
      'Rights observation and legal witnessing',
    ],
  },
  community_event: {
    roles: {
      rights_observer: 1,
      media_observer: 1,
      medic: 1,
      translator: 1,
      dispatch_aide: 1,
      logistics: 1,
      care_station: 1,
      wellness_float: 1,
    },
    actions: [
      'Support community visibility and morale',
      'Provide food, water, or comfort supplies',
      'Coordinate check-ins and mutual aid relay',
      'Media or livestream monitoring and amplification',
      'Childcare or eldercare support on site',
    ],
  },
  protest_low: {
    roles: {
      legal: 1,
      deescalation: 2,
      safety_marshall: 2,
      medic: 1,
      arrest_tracker: 1,
      media_observer: 1,
      dispatch_aide: 1,
      wellness_float: 1,
    },
    actions: [
      'Provide trauma-informed de-escalation',
      'Rights observation and legal witnessing',
      'Document and report ICE/law enforcement activity',
    ],
  },
  protest_high: {
    roles: {
      legal: 2,
      deescalation: 3,
      safety_marshall: 4,
      defensive: 2,
      medic: 2,
      mental_health: 1,
      arrest_tracker: 2,
      media_observer: 2,
      logistics: 1,
      dispatch_aide: 1,
      tech_jammer: 1,
      care_station: 1,
      grounding_support: 1,
      resource_drop: 1,
    },
    actions: [
      'Coordinate direct intervention or obstruction',
      'Support disengagement and tactical withdrawal',
      'Monitor and intervene in escalating group tensions',
      'Media or livestream monitoring and amplification',
    ],
  },
  raid_in_progress: {
    roles: {
      legal: 2,
      arrest_tracker: 2,
      defensive: 2,
      translator: 1,
      disability_aid: 1,
      medic: 2,
      tech_support: 1,
      dispatch_aide: 1,
      tech_jammer: 1,
      night_logistics: 1,
    },
    actions: [
      'Coordinate direct intervention or obstruction',
      'Document and report ICE/law enforcement activity',
      'Maintain Signal/radio/tech comms relay',
      'Assist disabled individuals with access or evacuation',
    ],
  },
  detention_center_action: {
    roles: {
      legal: 2,
      rights_observer: 2,
      media_observer: 2,
      deescalation: 2,
      safety_marshall: 2,
      translator: 1,
      asl_interpreter: 1,
      logistics: 2,
      dispatch_aide: 1,
    },
    actions: [
      'Rights observation and legal witnessing',
      'Media or livestream monitoring and amplification',
      'On-site emotional or mental health support',
      'Support community visibility and morale',
    ],
  },
  checkpoint_monitoring: {
    roles: {
      legal: 2,
      rights_observer: 2,
      translator: 2,
      media_observer: 1,
      tech_support: 1,
      vehicle_support: 1,
      dispatch_aide: 1,
    },
    actions: [
      'Witnessing / observation only',
      'Map and monitor enforcement movement live',
      'Provide immigration-specific legal triage',
    ],
  },
  court_support: {
    roles: {
      legal: 2,
      immigration_specialist: 1,
      translator: 1,
      child_specialist: 1,
      community_organizer: 1,
      dispatch_aide: 1,
      bondsman: 1,
      courthouse_marshal: 1,
      legal_liaison: 1,
      security_witness: 1,
      docket_tracker: 1,
      court_float_support: 1,
      press_coordination: 1,
      survivor_escort: 1,
      line_scheduler: 1,
    },
    actions: [
      'Court accompaniment or support presence',
      'Assist individuals with legal navigation',
      'Provide immigration-specific legal triage',
      'Childcare or eldercare support on site',
    ],
  },
  home_visitation: {
    roles: {
      legal: 1,
      rights_observer: 1,
      translator: 1,
      faith_leader: 1,
      medic: 1,
      tech_support: 1,
    },
    actions: [
      'Provide cultural or spiritual grounding',
      'Assist individuals with legal navigation',
      'Document and report ICE/law enforcement activity',
      'Childcare or eldercare support on site',
    ],
  },
  post_raid_support: {
    roles: {
      social_worker: 2,
      mental_health: 2,
      community_organizer: 2,
      child_specialist: 1,
      logistics: 2,
      dispatch_aide: 1,
      bondsman: 1,
      grounding_support: 1,
      care_station: 1,
      night_logistics: 1,
    },
    actions: [
      'Coordinate check-ins and mutual aid relay',
      'On-site emotional or mental health support',
      'Support community visibility and morale',
      'Childcare or eldercare support on site',
    ],
  },
  border_encounter: {
    roles: {
      legal: 2,
      immigration_specialist: 1,
      defensive: 2,
      medic: 2,
      translator: 2,
      logistics: 1,
      vehicle_support: 1,
      tech_jammer: 1,
    },
    actions: [
      'Coordinate direct intervention or obstruction',
      'Provide immigration-specific legal triage',
      'Maintain Signal/radio/tech comms relay',
    ],
  },
  transport_interdiction: {
    roles: {
      legal: 1,
      rights_observer: 2,
      translator: 2,
      media_observer: 1,
      arrest_tracker: 1,
      dispatch_aide: 1,
    },
    actions: [
      'Document and report ICE/law enforcement activity',
      'Rights observation and legal witnessing',
      'Track arrests or detentions for legal follow-up',
    ],
  },
  community_defense_center: {
    roles: {
      rights_observer: 2,
      legal: 2,
      immigration_specialist: 1,
      defensive: 2,
      safety_marshall: 2,
      deescalation: 2,
      media_observer: 1,
      translator: 1,
      dispatch_aide: 1,
      tech_support: 1,
      grounding_support: 1,
      medic: 1,
      vehicle_support: 1,
    },
    actions: [
      'Document and report ICE/law enforcement activity',
      'Rights observation and legal witnessing',
      'Coordinate direct intervention or obstruction',
      'Support community visibility and morale',
      'Maintain Signal/radio/tech comms relay',
      'Assist individuals with legal navigation',
    ],
  },
};

export function applyMultiplier(
  baseTeam: Partial<Record<FieldRole, number>>,
  multiplier: number,
): Partial<Record<FieldRole, number>> {
  const scaled: Partial<Record<FieldRole, number>> = {};
  for (const role in baseTeam) {
    scaled[role as FieldRole] = Math.ceil((baseTeam[role as FieldRole] ?? 0) * multiplier);
  }
  return scaled;
}

export const ACTION_PRESETS = [
  '',
  'Witnessing / observation only',
  'Assist individuals with legal navigation',
  'Document and report ICE/law enforcement activity',
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

export const ACTION_PRESETS_GROUPED = {
  '📋 Observation & Documentation': [
    'Witnessing / observation only',
    'Document and report ICE/law enforcement activity',
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
    'Aims to interrupt, document, and deter ICE operations or hostile activity',
  ],

  '🧭 Custom Planning': ['Custom action plan (see notes below)'],
};

export type RiskLevel = 'low' | 'medium' | 'high';

type FieldRoleDetail = {
  role: keyof typeof FIELD_ROLE_LABELS;
  description: string;
  requiredSkills: string[];
  riskLevel: RiskLevel;
  bestSuitedFor: string;
};

export const FIELD_ROLE_DETAILS: FieldRoleDetail[] = [
  {
    role: 'legal',
    description:
      'Provides legal observation and coordination with legal teams, ensuring rights are upheld and escalations are documented.',
    requiredSkills: [
      'Understanding of civil rights and protest law',
      'Note-taking and documentation',
      'Ability to identify violations quickly',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'People with legal training or experience working with legal observers.',
  },
  {
    role: 'arrest_tracker',
    description:
      'Tracks who gets detained/arrested during actions, collects identifying info, and connects with jail support.',
    requiredSkills: [
      'Attention to detail',
      'Clear communication under pressure',
      'Comfort approaching witnesses or participants quickly',
    ],
    riskLevel: 'high',
    bestSuitedFor: 'Quick thinkers who stay calm under stress and can manage sensitive data.',
  },
  {
    role: 'rights_observer',
    description:
      'Observes and records rights violations or police misconduct during actions. Supports later accountability.',
    requiredSkills: [
      'Familiarity with constitutional rights',
      'Strong observation and recording skills',
      'Neutral, non-reactive presence',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Observers who can remain composed and document facts without escalation.',
  },
  {
    role: 'media_observer',
    description:
      'Tracks and supports press presence. Ensures accurate coverage, protects vulnerable participants from unwanted media.',
    requiredSkills: [
      'Understanding of media rights and boundaries',
      'Communication with journalists',
      'Confidence in high-visibility roles',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Media-savvy individuals who can advocate and deescalate with press present.',
  },
  {
    role: 'deescalation',
    description:
      'Engages with tense situations to prevent violence or escalation, using trauma-informed and verbal techniques.',
    requiredSkills: [
      'Conflict resolution and active listening',
      'Nonviolent communication',
      'Situational awareness and calm demeanor',
    ],
    riskLevel: 'high',
    bestSuitedFor: 'Experienced mediators, mental health workers, or trusted calm presences.',
  },
  {
    role: 'safety_marshall',
    description: 'Coordinates crowd movement, identifies safety hazards, and maintains group cohesion.',
    requiredSkills: [
      'Situational awareness',
      'Crowd management or herding instincts',
      'Ability to give clear, confident directions',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Organized and mobile people who can maintain overview and redirect calmly.',
  },
  {
    role: 'defensive',
    description: 'Stands in visible solidarity to deter violence. Acts as a physical presence near vulnerable groups.',
    requiredSkills: [
      'Calm and physically grounded presence',
      'Understanding of nonviolent discipline',
      'Ability to stay put even in tense situations',
    ],
    riskLevel: 'high',
    bestSuitedFor: 'Trustworthy, grounded individuals comfortable with close proximity to threat.',
  },
  {
    role: 'medic',
    description: 'Provides first aid and trauma support. Responds to injuries, chemical exposure, or panic attacks.',
    requiredSkills: [
      'Street medic or first responder training',
      'Carrying a fully stocked kit',
      'Ability to triage quickly',
    ],
    riskLevel: 'high',
    bestSuitedFor: 'Certified medics, EMTs, nurses, or those trained in trauma care.',
  },
  {
    role: 'mental_health',
    description: 'Supports emotional processing, trauma recovery, and grounding for distressed participants.',
    requiredSkills: [
      'Crisis counseling or peer support training',
      'Empathetic listening',
      'Understanding of trauma responses and debriefing',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Counselors, therapists, or emotionally intelligent supporters.',
  },
  {
    role: 'disability_aid',
    description:
      'Assists community members with mobility, sensory, or neurodiverse needs before, during, and after actions.',
    requiredSkills: [
      'Awareness of disability justice principles',
      'Physical support or interpretation skills',
      'Sensitivity and discretion',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Disability advocates or those with lived experience and strong empathy.',
  },
  {
    role: 'translator',
    description: 'Translates spoken or written language for participants to ensure equitable access to information.',
    requiredSkills: [
      'Fluency in at least two relevant languages',
      'Clarity and accuracy under pressure',
      'Familiarity with relevant vocabulary (legal, medical, etc.)',
    ],
    riskLevel: 'low',
    bestSuitedFor: 'Bilingual/multilingual individuals comfortable with on-the-spot translation.',
  },
  {
    role: 'asl_interpreter',
    description: 'Interprets spoken content into American Sign Language and vice versa during key moments.',
    requiredSkills: ['Fluent ASL skills', 'Visibility in group spaces', 'Respect for deaf community norms'],
    riskLevel: 'low',
    bestSuitedFor: 'Experienced ASL users or certified interpreters.',
  },
  {
    role: 'dispatch_aide',
    description: 'Assists dispatchers by tracking statuses, relaying updates, and managing logistical coordination.',
    requiredSkills: ['Clarity under pressure', 'Comfort with apps or radios', 'Strong communication and documentation'],
    riskLevel: 'low',
    bestSuitedFor: 'Reliable, detail-oriented supporters who work well with systems.',
  },
  {
    role: 'tech_support',
    description: 'Fixes, configures, or manages radios, encrypted devices, livestreams, and comms tools.',
    requiredSkills: [
      'Technical troubleshooting skills',
      'Understanding of privacy tools and comms apps',
      'Ability to work calmly during disruptions',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Tech-savvy individuals who can operate under time pressure.',
  },
  {
    role: 'logistics',
    description: 'Manages physical supplies like food, water, rest areas, bathrooms, and signs.',
    requiredSkills: [
      'Organizational skills',
      'Supply chain or prep knowledge',
      'Ability to coordinate drop-offs and routes',
    ],
    riskLevel: 'low',
    bestSuitedFor: 'Planners, helpers, or anyone good at anticipating group needs.',
  },
  {
    role: 'child_specialist',
    description: 'Ensures safety and emotional support for children present or impacted during actions.',
    requiredSkills: [
      'Experience with children',
      'Crisis soothing and safety planning',
      'Trauma-informed communication',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Caregivers, teachers, or youth workers with high trust and awareness.',
  },
  {
    role: 'immigration_specialist',
    description:
      'Supports non-citizens and mixed-status individuals by offering risk info, de-escalation, and legal navigation.',
    requiredSkills: [
      'Knowledge of ICE tactics and immigrant rights',
      'Cultural humility and language access',
      'Discretion and rapid support coordination',
    ],
    riskLevel: 'high',
    bestSuitedFor: 'Immigration advocates or those with legal/community defense experience.',
  },
  {
    role: 'faith_leader',
    description:
      'Provides spiritual or moral support, may lead prayer, hold space, or act as a trusted elder presence.',
    requiredSkills: ['Grounding practices or pastoral care', 'Community trust', 'Calm, visible presence'],
    riskLevel: 'low',
    bestSuitedFor: 'Clergy, spiritual workers, or respected elders in community networks.',
  },
  {
    role: 'bondsman',
    description: 'Coordinates bail-outs, connects people to legal resources, and navigates jail procedures.',
    requiredSkills: [
      'Understanding of bail and booking systems',
      'Rapid response communication',
      'Trustworthiness and follow-through',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Legal support team members or those experienced in post-arrest support.',
  },
  {
    role: 'social_worker',
    description: 'Provides crisis care and navigation of public support systems for impacted individuals.',
    requiredSkills: [
      'Crisis intervention or peer support skills',
      'Familiarity with housing, food, and health systems',
      'Compassionate communication',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Trained social workers, peer support providers, or resource connectors.',
  },
  {
    role: 'community_organizer',
    description: 'Ties event goals to long-term strategy. Tracks impact, gathers contacts, and supports follow-up.',
    requiredSkills: ['Relational organizing', 'Campaign planning', 'Conflict resolution and group facilitation'],
    riskLevel: 'medium',
    bestSuitedFor: 'Experienced organizers or leaders in community formations.',
  },
  {
    role: 'tech_jammer',
    description: 'Interrupts surveillance or tracking tools to protect community members and data.',
    requiredSkills: [
      'Strong understanding of legal/ethical boundaries',
      'Digital security knowledge',
      'Ability to act quickly and discreetly',
    ],
    riskLevel: 'high',
    bestSuitedFor: 'Highly trusted technologists with radical ethics and counter-surveillance experience.',
  },
  {
    role: 'vehicle_support',
    description: 'Transports people, gear, and emergency response teams. Also supports safe exits and drop-offs.',
    requiredSkills: [
      'Valid license and clean driving record',
      'Navigation and rerouting',
      'Vehicle prep (gas, supplies, emergency plan)',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Drivers with reliable vehicles and comfort with flexible or chaotic routes.',
  },
  {
    role: 'care_station',
    description: 'Oversees setup and soft operation of decompression zones or quiet corners at large events.',
    requiredSkills: [
      'Awareness of trauma-informed space setup',
      'Ability to manage soft boundaries without confrontation',
      'Coordination with mental health or medic teams',
    ],
    riskLevel: 'low',
    bestSuitedFor: 'Grounded, trusted individuals who can maintain a calm zone under pressure.',
  },
  {
    role: 'night_logistics',
    description: 'Supports nighttime movement, cool-down access, and low-visibility supply runs.',
    requiredSkills: [
      'Comfort moving during quiet/low-attention windows',
      'Logistics coordination under minimal light/sound',
      'Discretion and calm presence',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Night owls, late-shift volunteers, or quiet operators.',
  },
  {
    role: 'resource_drop',
    description: 'Coordinates supply drop-offs without requiring contact, such as water, blankets, or toiletries.',
    requiredSkills: [
      'Efficient route planning',
      'Comfort with anonymous drop logistics',
      'Reliable communication with dispatch',
    ],
    riskLevel: 'low',
    bestSuitedFor: 'Folks who prefer behind-the-scenes support and can follow protocols closely.',
  },
  {
    role: 'grounding_support',
    description: 'Provides quiet 1-on-1 support for people emotionally overwhelmed but not in full crisis.',
    requiredSkills: [
      'Somatic or peer grounding techniques',
      'Consent-based physical/emotional support',
      'Low-intervention holding space',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Peer support-trained individuals with calm presence.',
  },
  {
    role: 'wellness_float',
    description: 'Roams between sites or clusters to check for signs of burnout, overheating, or quiet distress.',
    requiredSkills: [
      'Empathy and proactive care',
      'Ability to defuse and redirect tension gently',
      'Radio/dispatch communication',
    ],
    riskLevel: 'low',
    bestSuitedFor: 'Trusted veterans who read crowds well and move lightly.',
  },
  {
    role: 'courthouse_marshal',
    description: 'Manages courthouse flow, monitors LE presence, and coordinates with field legal teams.',
    requiredSkills: [
      'Crowd movement and spatial awareness',
      'Boundary-setting and calm authority',
      'Radio or in-person communication with observers',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'People with presence and situational awareness near sensitive public institutions.',
  },
  {
    role: 'legal_liaison',
    description: 'Serves as bridge between legal defense teams and field volunteers before, during, or after court.',
    requiredSkills: [
      'Understanding of legal team dynamics',
      'Field-to-court communication skills',
      'Discretion and clarity',
    ],
    riskLevel: 'low',
    bestSuitedFor: 'Legal support or community defense veterans comfortable translating across contexts.',
  },
  {
    role: 'security_witness',
    description: 'Observes courthouse security activity and documents violations or misconduct.',
    requiredSkills: [
      'Strong observational detail',
      'Comfort documenting power imbalance',
      'Familiarity with LE behavior patterns',
    ],
    riskLevel: 'high',
    bestSuitedFor: 'Seasoned observers able to keep calm while witnessing potential intimidation.',
  },
  {
    role: 'docket_tracker',
    description: 'Tracks docket schedules, attendance, and updates for legal and observer teams.',
    requiredSkills: [
      'Understanding of court calendars',
      'Quick note-taking and update sharing',
      'Phone or desktop literacy',
    ],
    riskLevel: 'low',
    bestSuitedFor: 'Detail-oriented logistics people who can check updates and share clearly.',
  },
  {
    role: 'court_float_support',
    description: 'Engages outside courthouse with impacted people after proceedings, offering soft support.',
    requiredSkills: [
      'Peer support or trauma sensitivity',
      'Listening and quiet presence',
      'Cultural humility and discretion',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Empathetic community members who can be present without demanding attention.',
  },
  {
    role: 'press_coordination',
    description:
      'Coordinates media presence, ensures safe coverage, and protects vulnerable individuals from exposure.',
    requiredSkills: [
      'Media rights knowledge',
      'Confident communication with journalists',
      'De-escalation and consent negotiation',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Media-savvy defenders who can mediate with press under public scrutiny.',
  },
  {
    role: 'survivor_escort',
    description: 'Supports survivors or witnesses navigating courthouse spaces, from arrival through exit.',
    requiredSkills: [
      'Trauma-informed presence',
      'Courthouse navigation and gentle guidance',
      'Empathy and consent-based support',
    ],
    riskLevel: 'medium',
    bestSuitedFor: 'Calm individuals trusted by survivor communities.',
  },
  {
    role: 'line_scheduler',
    description: 'Coordinates early arrival or queue rotation for high-demand court appearances.',
    requiredSkills: ['Time awareness and queue logistics', 'Friendly assertiveness', 'Clear texting or radio updates'],
    riskLevel: 'low',
    bestSuitedFor: 'Reliable early birds who can organize and update arrival flow under time pressure.',
  },
];

export const FIELD_ROLE_TIERS: Record<FieldRole, 1 | 2 | 3 | 4> = {
  legal: 1,
  arrest_tracker: 2,
  rights_observer: 2,
  media_observer: 3,
  deescalation: 1,
  safety_marshall: 2,
  defensive: 2,
  medic: 1,
  mental_health: 3,
  disability_aid: 3,
  translator: 2,
  asl_interpreter: 2,
  dispatch_aide: 1,
  tech_support: 4,
  logistics: 2,
  child_specialist: 3,
  immigration_specialist: 2,
  faith_leader: 4,
  bondsman: 4,
  social_worker: 4,
  community_organizer: 4,
  tech_jammer: 4,
  vehicle_support: 4,
  care_station: 3,
  night_logistics: 4,
  resource_drop: 4,
  grounding_support: 3,
  wellness_float: 3,
  courthouse_marshal: 4,
  legal_liaison: 4,
  security_witness: 4,
  docket_tracker: 4,
  court_float_support: 4,
  press_coordination: 4,
  survivor_escort: 4,
  line_scheduler: 4,
};

export const tierColors: Record<1 | 2 | 3 | 4, string> = {
  1: 'text-red-400',
  2: 'text-yellow-400',
  3: 'text-green-400',
  4: 'text-gray-400',
};

export const tierLabels: Record<1 | 2 | 3 | 4, string> = {
  1: 'Essential',
  2: 'Stabilizing',
  3: 'Supportive',
  4: 'Auxiliary',
};
