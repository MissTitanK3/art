import { GENERATED_COURSE_DETAILS } from './course-details.generated'

export type AcademyCourseGroupConfig = {
  label: string
  track?: string
  courses: Array<{ slug: string; icon?: string }>
}

export const ACADEMY_COURSE_GROUPS: AcademyCourseGroupConfig[] = [
  {
    label: 'Getting Started (Everyone)',
    track: '(Introductory context and foundation — all tracks require these)',
    courses: [
      {
        slug: 'academy-overview',
        icon: '🎓',
      },
      {
        slug: 'dispatch-training-pathway',
        icon: '🗺️',
      },
      {
        slug: 'why-we-do-this',
        icon: '🧱',
      },
      {
        slug: 'ice-tea-watch',
        icon: '👀',
      },
      {
        slug: 'how-to-report',
        icon: '📣',
      },

      {
        slug: 'data-ethics-pledge',
        icon: '🔐',
      },
      {
        slug: 'support-ice-tea-tools',
        icon: '🔐',
      },
    ],
  },
  {
    label: 'Level 1: Team Member Onboarding',
    track: '(For all new pod members and field volunteers)',
    courses: [
      {
        slug: 'intro-to-ice-tea',
        icon: '🧭',
      },
      {
        slug: 'kyr-basics',
        icon: '⚖️',
      },
      {
        slug: 'digital-security-basics',
        icon: '🔒',
      },
      // {
      //   slug: 'opsec-101',
      //   icon: '🛡️',
      // },
      {
        slug: 'signal-tips',
        icon: '📶',
      },
      {
        slug: 'mental-health-resilience',
        icon: '🧠',
      },
      {
        slug: 'media-awareness-volunteers',
        icon: '📢',
      },
      {
        slug: 'burner-phones-security-culture',
        icon: '🧨',
      },
      {
        slug: 'myth-of-total-anonymity',
        icon: '🕵️',
      },
      // {
      //   slug: 'legal-risk-tech',
      //   icon: '🧾',
      // },
      {
        slug: 'mesh-networks-intro',
        icon: '🛜',
      },
    ],
  },
  {
    label: 'Level 2: Field Coordination Basics (Basic Dispatcher)',
    track: '(For those starting dispatch or on-site coordination)',
    courses: [
      {
        slug: 'responding-to-dispatch-calls',
        icon: '📞',
      },
      {
        slug: 'field-role-training-hub',
        icon: '🧰',
      },
      {
        slug: 'medical-basics-field-safety',
        icon: '🚑',
      },
      {
        slug: 'escalation-evacuation-protocols',
        icon: '🛑',
      },
      {
        slug: 'logistics-resource-management',
        icon: '📦',
      },
      { slug: 'mesh-networks-hardware-guide', icon: '🔌' },
      { slug: 'outreach-messaging-community-trust', icon: '🗣️' },
    ],
  },
  {
    label: 'Level 3: Dispatcher Certification (Verified Dispatcher)',
    track: '(Certified dispatchers managing operations and teams)',
    courses: [
      {
        slug: 'dispatch-coordination',
        icon: '🧠',
      },
      {
        slug: 'trust-and-ethics-in-dispatch',
        icon: '🫱',
      },
      {
        slug: 'dealing-with-chaos',
        icon: '🌪️',
      },
      {
        slug: 'digital-resilience-contingency-comms',
        icon: '📡',
      },
      {
        slug: 'media-disinformation-handling',
        icon: '📰',
      },
      {
        slug: 'mesh-networks-pod-ops',
        icon: '📶',
      },
    ],
  },
  {
    label: 'Level 4: Zone Lead (Admin Dispatcher)',
    track: '(Senior dispatchers leading multiple pods/regions)',
    courses: [
      {
        slug: 'admin-tools',
        icon: '🖥️',
      },
      {
        slug: 'mentoring-new-dispatchers',
        icon: '👥',
      },
      {
        slug: 'inter-pod-regional-coordination',
        icon: '🌐',
      },
      {
        slug: 'after-action-data-hygiene',
        icon: '🗃️',
      },
      {
        slug: 'legal-followthrough-jail-support',
        icon: '⚖️',
      },
      {
        slug: 'advanced-logistics-resource-planning',
        icon: '📦',
      },
      {
        slug: 'training-the-trainers',
        icon: '🎓',
      },
      {
        slug: 'meshtastic-large-scale',
        icon: '♾️',
      },
    ],
  },
  {
    label: 'Pod Creation & Regional Readiness',
    // track: 'Regional Organizing',
    courses: [
      {
        slug: 'create-a-pod',
        icon: '🧩',
      },
      {
        slug: 'pod-directory',
        icon: '📍',
      },
      {
        slug: 'community-defense-center',
        icon: '🛠️',
      },
      {
        slug: 'pod-video-content',
        icon: '🎥',
      },
      {
        slug: 'radio-communications',
        icon: '📻',
      },
    ],
  },
  {
    label: 'Community Safety & Rights',
    // track: 'Street Support',
    courses: [
      {
        slug: '60-day-preparedness',
        icon: '🧭',
      },
      {
        slug: '60-day-checklist',
        icon: '📆',
      },
      {
        slug: 'kyr-basics',
        icon: '📜',
      },
      {
        slug: 'fourth-amendment-rights',
        icon: '📜',
      },
      {
        slug: 'bystander-support',
        icon: '🧍‍♀️',
      },
      {
        slug: 'documentation-safety',
        icon: '📷',
      },
      {
        slug: 'interacting-with-law-enforcement',
        icon: '🚔',
      },
    ],
  },
  {
    label: 'Advanced Tools',
    // track: 'Dispatcher Certification',
    courses: [
      {
        slug: 'dispatch-coordination',
        icon: '🧭',
      },
      {
        slug: 'heatmap-verification',
        icon: '🌡️',
      },
      {
        slug: 'report-reviewing',
        icon: '🔍',
      },
    ],
  },
  {
    label: 'Specialized Roles',
    // track: 'Field Deployment Options',
    courses: [
      {
        slug: 'child-specialist',
        icon: '🧒',
      },
      {
        slug: 'tech-jamming',
        icon: '📡',
      },
      {
        slug: 'legal-observer',
        icon: '📓',
      },
      {
        slug: 'runners-and-rides',
        icon: '🚙',
      },
    ],
  },
  {
    label: 'Theory & Ethics',
    // track: 'Foundational Literacy',
    courses: [
      {
        slug: 'mutual-aid-history',
        icon: '🤲',
      },
      {
        slug: 'abolition-ethics',
        icon: '🔥',
      },
      {
        slug: 'community-consent',
        icon: '📣',
      },
      {
        slug: 'risk-and-responsibility',
        icon: '⚠️',
      },
      {
        slug: 'movement-strategy-escalation-logic',
        icon: '🗺️',
      },
      {
        slug: 'state-corporate-suppression-tactics',
        icon: '🕵️',
      },
      {
        slug: 'solidarity-economics-resource-ethics',
        icon: '💰',
      },
      {
        slug: 'decolonization-land-context',
        icon: '🌎',
      },
      {
        slug: 'ethical-dilemmas-mutual-aid',
        icon: '⚖️',
      },
    ],
  },
  {
    label: 'Observation & Legal Track',
    track: '(Legal observers, rights monitors, arrest trackers, media observers)',
    courses: [
      { slug: 'kyr-basics', icon: '⚖️' },
      { slug: 'fourth-amendment-rights', icon: '📜' },
      { slug: 'documentation-safety', icon: '📷' },
      { slug: 'media-awareness-volunteers', icon: '📢' },
      { slug: 'media-disinformation-handling', icon: '📰' },
      { slug: 'legal-observer-basics', icon: '📓' },
      { slug: 'after-action-data-hygiene', icon: '🗃️' },
      { slug: 'legal-followthrough-jail-support', icon: '⚖️' },
      { slug: 'mutual-aid-history', icon: '🤲' },
    ],
  },
  {
    label: 'Field Safety & Stabilization Track',
    track: '(Medics, de-escalation, translators, safety marshals)',
    courses: [
      { slug: 'medical-basics-field-safety', icon: '🚑' },
      { slug: 'deescalation-basics', icon: '🤝' },
      { slug: 'field-safety', icon: '🦺' },
      { slug: 'escalation-evacuation-protocols', icon: '🛑' },
      { slug: 'signal-tips', icon: '📶' },
      { slug: 'logistics-resource-management', icon: '📦' },
      { slug: 'mutual-aid-history', icon: '🤲' },
    ],
  },
  {
    label: 'Community Care & Emotional Support Track',
    track: '(Mental health responders, child/disability specialists, peer supporters)',
    courses: [
      { slug: 'mental-health-resilience', icon: '🧠' },
      { slug: 'care-emotional-support', icon: '💞' },
      { slug: 'child-specialist-role', icon: '🧒' },
      { slug: 'bystander-support-tactics', icon: '🧍‍♀️' },
      { slug: 'grounding-support', icon: '🌱' },
      { slug: 'wellness-float', icon: '💧' },
      { slug: 'decolonization-land-context', icon: '🌎' },
      { slug: 'mutual-aid-history', icon: '🤲' },
    ],
  },
  {
    label: 'Direct Action & Protective Roles Track',
    track: '(High-risk field presence, tech defense, tactical support)',
    courses: [
      { slug: 'de-escalation-basics', icon: '🤝' },
      { slug: 'escalation-evacuation-protocols', icon: '🛑' },
      { slug: 'movement-strategy-escalation-logic', icon: '🗺️' },
      { slug: 'digital-resilience-contingency-comms', icon: '📡' },
      { slug: 'tech-jamming-signal-defense', icon: '📡' },
      { slug: 'checkpoint-monitoring', icon: '🚧' },
      { slug: 'heatmap-verification', icon: '🌡️' },
      { slug: 'mutual-aid-history', icon: '🤲' },
      // { slug: 'opsec-101', icon: '🛡️' },
    ],
  },
  {
    label: 'Tech & Comms Track',
    track: '(Comms operators, tech troubleshooters, radio and encryption specialists)',
    courses: [
      { slug: 'digital-security-basics', icon: '🔒' },
      { slug: 'secure-messaging-with-signal', icon: '📶' },
      { slug: 'radio-communications-protocols', icon: '📻' },
      { slug: 'digital-resilience-contingency-comms', icon: '📡' },
      { slug: 'logistics-resource-management', icon: '📦' },
      { slug: 'tech-jamming-signal-defense', icon: '📡' },
      { slug: 'reviewing-ice-reports', icon: '🔍' },
      { slug: 'mutual-aid-history', icon: '🤲' },
      { slug: 'mesh-networks-intro', icon: '🛜' },
      { slug: 'mesh-networks-pod-ops', icon: '📶' },
      { slug: 'meshtastic-large-scale', icon: '♾️' },
      { slug: 'mesh-networks-hardware-guide', icon: '🔌' },
    ],
  },
  {
    label: 'Logistics & Mutual Aid Operations Track',
    track: '(Supply, transport, staging, community aid nodes)',
    courses: [
      { slug: 'logistics-resource-management', icon: '📦' },
      { slug: 'advanced-logistics-resource-planning', icon: '📦' },
      { slug: 'deploying-community-defense-center', icon: '🛠️' },
      { slug: '60-day-preparedness', icon: '🧭' },
      { slug: 'weekly-community-readiness-plan', icon: '📆' },
      { slug: 'solidarity-economics-resource-ethics', icon: '💰' },
      { slug: 'resource-drop', icon: '📥' },
      { slug: 'mutual-aid-history', icon: '🤲' },
    ],
  },
  {
    label: 'Court & Post-Raid Support Track',
    track: '(Legal and care roles for post-action follow-up)',
    courses: [
      { slug: 'court-support-essentials', icon: '⚖️' },
      { slug: 'after-action-data-hygiene', icon: '🗃️' },
      { slug: 'legal-followthrough-jail-support', icon: '⚖️' },
      { slug: 'survivor-escort', icon: '🛡️' },
      { slug: 'grounding-support', icon: '🌱' },
      { slug: 'care-emotional-support', icon: '💞' },
      { slug: 'docket-tracker', icon: '📋' },
      { slug: 'mutual-aid-history', icon: '🤲' },
      // { slug: 'legal-risk-tech', icon: '🧾' },
    ],
  },
  {
    label: 'Pod Leadership & Organizing Track',
    track: '(Pod creators, trainers, multi-pod leads)',
    courses: [
      { slug: 'create-a-pod', icon: '🧩' },
      { slug: 'inter-pod-regional-coordination', icon: '🌐' },
      { slug: 'training-the-trainers', icon: '🎓' },
      { slug: 'mentoring-new-dispatchers', icon: '👥' },
      { slug: 'solidarity-economics-resource-ethics', icon: '💰' },
      { slug: 'movement-strategy-escalation-logic', icon: '🗺️' },
      { slug: 'decolonization-land-context', icon: '🌎' },
      { slug: 'mutual-aid-history', icon: '🤲' },
    ],
  },
  {
    label: 'Movement Strategy & Ethics Track',
    track: '(Strategists, zone leads, pod organizers)',
    courses: [
      { slug: 'abolition-ethics', icon: '🔥' },
      { slug: 'community-consent', icon: '📣' },
      { slug: 'risk-and-responsibility', icon: '⚠️' },
      { slug: 'movement-strategy-escalation-logic', icon: '🗺️' },
      { slug: 'state-corporate-suppression-tactics', icon: '🕵️' },
      { slug: 'decolonization-land-context', icon: '🌎' },
      { slug: 'ethical-dilemmas-mutual-aid', icon: '⚖️' },
      { slug: 'mutual-aid-history', icon: '🤲' },
      // { slug: 'legal-risk-tech', icon: '🧾' },
    ],
  },
  {
    label: 'Standalone Micro-Badges',
    track: '(For niche or auxiliary skills)',
    courses: [
      { slug: 'translator-micro-badge', icon: '🗣️' },
      { slug: 'asl-interpreter-micro-badge', icon: '🤟' },
      { slug: 'faith-support-micro-badge', icon: '🙏' },
      { slug: 'survivor-escort-micro-badge', icon: '🛡️' },
      { slug: 'vehicle-specialist-micro-badge', icon: '🚙' },
    ],
  },
]

export type AcademyCourseDetail = {
  title: string
  description: string
  icon?: string
  version?: number
  durationHours?: number
  modality?: "in_person" | "online" | "hybrid"
  instructorType?: "dispatcher" | "mentor" | "expert"
  type?: "qualified" | "certified"
  certId?: string
}

export const ACADEMY_COURSE_DETAILS: Record<string, AcademyCourseDetail> = GENERATED_COURSE_DETAILS;

export const CORE_ACADEMY_PATHWAYS = ACADEMY_COURSE_GROUPS.slice(0, 5)
