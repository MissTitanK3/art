import type { Pod, RosterEntry } from "@workspace/store/types/pod.ts";
import {
  makeProfile,
  makeRosterEntry,
} from "@workspace/store/utils/generator.ts";

const picardProfile = makeProfile(
  "profile-picard",
  "Jean-Luc Picard",
  ["community_organizer", "press_coordination"],
  "Starfleet Command",
  {
    contact_signal: "picard@ncc1701d.signal",
    coordination_zone: "sector-001",
    coverage_zones: ["sector-001", "neutral-zone"],
    operating_counties: ["alpha-quadrant"],
    city: "San Francisco",
  },
);

const rikerProfile = makeProfile(
  "profile-riker",
  "William Riker",
  ["defensive", "night_logistics"],
  "USS Enterprise NCC-1701-D",
  {
    contact_signal: "riker@ncc1701d.signal",
    coordination_zone: "sector-001",
    coverage_zones: ["sector-001"],
    operating_counties: ["alpha-quadrant"],
  },
);

const dataProfile = makeProfile(
  "profile-data",
  "Data",
  ["tech_support", "translator"],
  "USS Enterprise NCC-1701-D",
  {
    contact_signal: "data@lcars.signal",
    coordination_zone: "sector-001",
    coverage_zones: ["sector-001", "starbase-173"],
    operating_counties: ["alpha-quadrant"],
    city: "Omicron Theta Colony",
  },
);

const worfProfile = makeProfile(
  "profile-worf",
  "Worf",
  ["defensive", "security_witness"],
  "USS Enterprise NCC-1701-D",
  {
    // Mark unregistered (no linked user_id, no contact signal by default)
    registered: false,
    coordination_zone: "klingon-frontier",
    coverage_zones: ["sector-001", "deep-space-9"],
    operating_counties: ["alpha-quadrant"],
  },
);

const laforgeProfile = makeProfile(
  "profile-laforge",
  "Geordi La Forge",
  ["tech_support", "logistics"],
  "USS Enterprise NCC-1701-D",
  {
    contact_signal: "laforge@engineering.signal",
    coordination_zone: "sector-001",
    coverage_zones: ["sector-001", "utopia-planitia"],
    operating_counties: ["alpha-quadrant"],
  },
);

const crusherProfile = makeProfile(
  "profile-crusher",
  "Beverly Crusher",
  ["medic", "mental_health"],
  "USS Enterprise NCC-1701-D",
  {
    contact_signal: "crusher@medical.signal",
    coordination_zone: "sector-001",
    coverage_zones: ["sector-001", "starbase-515"],
    operating_counties: ["alpha-quadrant"],
  },
);

const troiProfile = makeProfile(
  "profile-troi",
  "Deanna Troi",
  ["mental_health", "grounding_support"],
  "USS Enterprise NCC-1701-D",
  {
    // Mark unregistered as well
    registered: false,
    coordination_zone: "sector-001",
    coverage_zones: ["sector-001", "betazed"],
    operating_counties: ["alpha-quadrant"],
  },
);

const picardRoster = makeRosterEntry(
  "crew-picard",
  picardProfile,
  "lead",
  "active",
  [
    { tag: "en", display_name: "Federation Standard", proficiency: "native" },
    { tag: "fr", display_name: "French", proficiency: "fluent" },
  ],
  ["command strategy", "first contact diplomacy", "mission briefing"],
  [
    {
      id: "starfleet-command",
      display_name: "Starfleet Command Qualification",
      level: "mentor",
    },
    {
      id: "diplomatic-corps",
      display_name: "Diplomatic Corps Liaison",
      level: "completed",
    },
  ],
  "2024-04-20T03:20:00Z",
  "Coordinating Alpha shift bridge readiness.",
);

const rikerRoster = makeRosterEntry(
  "crew-riker",
  rikerProfile,
  "member",
  "active",
  [{ tag: "en", display_name: "Federation Standard", proficiency: "native" }],
  ["tactical coordination", "away team leadership", "damage control drills"],
  [
    {
      id: "command-track",
      display_name: "Command Track Advanced",
      level: "completed",
    },
    {
      id: "helm-cert",
      display_name: "Starfleet Helm Certification",
      level: "completed",
    },
  ],
  "2024-04-20T03:00:00Z",
  "Rounded Beta shift status checks before relieving bridge.",
);

const dataRoster = makeRosterEntry(
  "crew-data",
  dataProfile,
  "member",
  "active",
  [
    { tag: "en", display_name: "Federation Standard", proficiency: "native" },
    { tag: "tlh", display_name: "Klingon", proficiency: "fluent" },
    {
      tag: "x-android",
      display_name: "Machine Code Interfaces",
      proficiency: "native",
    },
  ],
  [
    "computational analysis",
    "operations management",
    "emergency response tracking",
  ],
  [
    {
      id: "operations-diagnostic",
      display_name: "Operations Diagnostic Lead",
      level: "mentor",
    },
    {
      id: "universal-translator",
      display_name: "Universal Translator Specialist",
      level: "completed",
    },
  ],
  "2024-04-20T03:10:00Z",
  "Monitoring LCARS diagnostics during warp core recalibration window.",
);

const worfRoster = makeRosterEntry(
  "crew-worf",
  worfProfile,
  "member",
  "inactive",
  [
    { tag: "en", display_name: "Federation Standard", proficiency: "fluent" },
    { tag: "tlh", display_name: "Klingon", proficiency: "native" },
  ],
  ["security operations", "tactical response", "phaser certification"],
  [
    {
      id: "starfleet-security",
      display_name: "Starfleet Security Instructor",
      level: "mentor",
    },
    {
      id: "hand-to-hand",
      display_name: "Advanced Hand-to-Hand Combat",
      level: "completed",
    },
  ],
  "2024-03-31T11:00:00Z",
  "On detached duty to Deep Space 9 until stardate 47634.44.",
);

const laforgeRoster = makeRosterEntry(
  "crew-laforge",
  laforgeProfile,
  "member",
  "active",
  [
    { tag: "en", display_name: "Federation Standard", proficiency: "native" },
    {
      tag: "x-engineering",
      display_name: "Warp Systems Diagnostics",
      proficiency: "fluent",
    },
  ],
  ["warp systems", "engineering triage", "systems redundancy planning"],
  [
    {
      id: "warp-core-safety",
      display_name: "Warp Core Safety Officer",
      level: "mentor",
    },
    {
      id: "damage-control",
      display_name: "Starfleet Damage Control",
      level: "completed",
    },
  ],
  "2024-04-19T19:45:00Z",
  "Coordinated EPS relay inspections with Engineering Beta shift.",
);

const crusherRoster = makeRosterEntry(
  "crew-crusher",
  crusherProfile,
  "member",
  "active",
  [
    { tag: "en", display_name: "Federation Standard", proficiency: "native" },
    {
      tag: "x-medical",
      display_name: "Federation Medical Lexicon",
      proficiency: "fluent",
    },
  ],
  ["trauma response", "medical command", "biohazard containment"],
  [
    {
      id: "medical-director",
      display_name: "Starfleet Medical Director",
      level: "mentor",
    },
    {
      id: "xeno-medicine",
      display_name: "Xeno-Medicine Fellowship",
      level: "completed",
    },
  ],
  "2024-04-20T01:15:00Z",
  "Oversaw critical care drills for Hazard Team readiness.",
);

const troiRoster = makeRosterEntry(
  "crew-troi",
  troiProfile,
  "member",
  "active",
  [
    { tag: "en", display_name: "Federation Standard", proficiency: "native" },
    { tag: "x-betazoid", display_name: "Betazoid", proficiency: "native" },
  ],
  ["crew counseling", "readiness assessments", "critical incident debriefs"],
  [
    {
      id: "psionic-safety",
      display_name: "Psionic Safety Counselor",
      level: "completed",
    },
    {
      id: "critical-incident",
      display_name: "Critical Incident Response",
      level: "completed",
    },
  ],
  "2024-04-19T21:30:00Z",
  "Completed post-mission debrief with away team leadership.",
);

export const demoRoster: RosterEntry[] = [
  picardRoster,
  rikerRoster,
  dataRoster,
  worfRoster,
  laforgeRoster,
  crusherRoster,
  troiRoster,
];

export const demoPods: Pod[] = [
  {
    id: "5e5f5d6b-9237-4d9f-9ff8-bridge",
    slug: "pod-enterprise-bridge",
    name: "Enterprise Bridge Team",
    area: "Sector 001 — Flagship Operations",
    channels: [
      { type: "Signal", link: "https://subspace.star/ops/enterprise-bridge" },
      {
        type: "Matrix",
        link: "https://matrix.lcars/#/starfleet/enterprise/bridge",
      },
    ],
    team: [picardRoster, rikerRoster, dataRoster, troiRoster],
  },
  {
    id: "0bfa3cf7-4a9f-4a24-9923-engineering",
    slug: "pod-enterprise-engineering",
    name: "Enterprise Engineering",
    area: "Warp Systems & Diagnostics",
    channels: [
      {
        type: "Matrix",
        link: "https://matrix.lcars/#/starfleet/enterprise/engineering",
      },
    ],
    team: [laforgeRoster, dataRoster, crusherRoster],
  },
  {
    id: "a77b11d0-5867-41f5-84c6-security",
    slug: "pod-enterprise-security",
    name: "Enterprise Security",
    area: "Tactical Readiness Wing",
    channels: [
      { type: "Signal", link: "https://subspace.star/ops/enterprise-security" },
      { type: "LoRa" },
    ],
    team: [worfRoster, rikerRoster, troiRoster],
  },
];
