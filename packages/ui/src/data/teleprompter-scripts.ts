/**
 * Teleprompter scripts with lightweight placeholders.
 * Shared source of truth for all region apps.
 */
export type TeleprompterScriptId =
  | 'full_narrative'
  | 'thirty_seconds'
  | 'demo_cues'
  | 'ops_brief'
  | 'safety_check'
  | 'press_update_30'
  | 'team_intros'
  | 'roles_expectations'
  | 'tools_overview'
  | 'contingency_brief'
  | 'radio_check'
  | 'arrival_brief'
  | 'shift_handoff'
  | 'debrief_5'
  | 'media_protocol_60'
  | 'partner_coordination'
  | 'code_of_conduct'
  | 'weather_plan';

export const TELEPROMPTER_SCRIPTS: Record<TeleprompterScriptId, string> = {
  full_narrative: [
    'You’re on shift in Dispatch. The Watch map is up. [pause]',
    'A report pops in—you click the pin and create a Scout Team in one tap. [look up]',
    'They confirm a detention. You spin up a second team to the detention center to close the gap. [breathe]',
    'On site, the scouts capture key details—name, DOB, pronouns, A‑Number, agency. [pause]',
    'Dispatch finalizes the Missing Persons record; advocacy partners get it within minutes. [look up]',
    'A family member needs a ride—you post it to Meet‑A‑Need and it’s matched. [breathe]',
    'From first click to legal outreach and care: nobody’s alone. We show up—together. [pause]',
  ].join('\n\n'),
  thirty_seconds: [
    'Dispatch sees it. You click the pin, launch a scout team. [pause]',
    'Confirm detention; open Missing Persons intake, finalize to notify partners. [look up]',
    'Post a ride on Meet‑A‑Need. Done. We move in minutes. [breathe]',
  ].join('\n\n'),
  demo_cues: [
    'Welcome team. We’ll start with a quick overview. [pause]',
    'If you’re on comms, confirm batteries and backups now. [look up]',
    '',
    'Key points: maintain presence, document interactions, escalate via dispatch if needed. [breathe]',
    'Remember your buddy. Swap if you feel overloaded. [pause] [look up]',
    '',
    'If anything shifts rapidly, we’ll regroup on the east corner. [breathe] Stay flexible.',
  ].join('\n'),
  ops_brief: [
    'Operations brief: objective is safe presence and rapid documentation. Mission: [MISSION]. [pause]',
    'Team leads: confirm roles, boundaries, and handoffs. [look up]',
    'Comms: primary channel live, backup tested, check batteries. [breathe]',
    'Boundaries today: [BOUNDARIES]. Escalations route through dispatch; do not freelance decisions. [pause]',
    'We close with a quick debrief; flag anything urgent immediately. [look up]',
  ].join('\n\n'),
  safety_check: [
    'Safety check: PPE on, IDs tucked, hydration in pack. [pause]',
    'Buddy system active—stay within sight and earshot. [look up]',
    'If tension rises, slow your pace and breathe. [breathe]',
    'Document, don’t debate. Capture facts; escalate through dispatch. [pause]',
    'If you feel overloaded, swap or step back. We’ve got you. [look up]',
  ].join('\n\n'),
  press_update_30: [
    'Quick update from [ORG] at [LOCATION]: we’re on-site and documenting safely. [pause]',
    'We’re coordinating with dispatch and legal partners in real-time. [look up]',
    'Care requests are live on Meet‑A‑Need; response is moving. [breathe]',
    'We’ll share verified facts as they’re confirmed. Thank you for your support. [pause]',
  ].join('\n\n'),

  team_intros: [
    'Who we are: We are with [ORG]. Today’s team: [NAMES]. Lead: [LEAD_NAME]. [pause]',
    'Purpose: safe presence, fast info flow, and dignified care. Mission today: [MISSION]. [look up]',
    'Quick circle: name, role, any constraints (time, mobility), and your buddy. Keep it tight. [look up]',
    'Tone is calm, curious, and kind. If you feel overloaded, say so—we’ll adjust. [breathe]',
  ].join('\n\n'),

  roles_expectations: [
    'Mission today: [MISSION]. Roles: Scouts observe and record; Dispatch routes and verifies; Drivers handle transport; Floaters backfill. [pause]',
    'Expectations: consent, privacy, no debates in the field. Document facts; escalate decisions via dispatch. [look up]',
    'Boundaries: we don’t interfere with officials; we do ensure folks are seen, safe, and supported. Local: [BOUNDARIES]. [breathe]',
    'If unsure, pause, breathe, buddy-check, then call it in. [pause]',
  ].join('\n\n'),

  tools_overview: [
    'Tools quick tour: Watch map for pins and team status; Scout flow for field notes; Missing Persons intake for verified data. [pause]',
    'Meet‑A‑Need posts rides, goods, and tasks; partners see finalized records in minutes. [look up]',
    'Comms: primary channel is [CHANNEL], backup is [BACKUP_CHANNEL]; if both fail, contact dispatch: [DISPATCH_CONTACT]. [breathe]',
    'Keep batteries and backups ready; log actions as you go—don’t rely on memory. [pause]',
  ].join('\n\n'),

  contingency_brief: [
    'If comms drop: switch to [BACKUP_CHANNEL]; if still down, rendezvous at [RENDEZVOUS_POINT] on the [SYNC_MINUTE]. [pause]',
    'If conditions escalate: slow down, increase distance, switch to observe‑only posture, and notify dispatch. [look up]',
    'If a person requests privacy: stop recording, acknowledge, and shift to verbal notes. [breathe]',
    'If plans change: lead calls the pivot; everyone repeats back the new plan before moving. [pause]',
  ].join('\n\n'),

  radio_check: [
    'Comms check: Primary [CHANNEL], Backup [BACKUP_CHANNEL]. Call sign roll—Lead, Dispatch, Scout 1, Scout 2, Driver, Float. Respond with “copy” and battery %. [pause]',
    'Brevity: “Eyes on” for visual; “Log” for data entry; “Hold” to pause movement; “Clear” when finished. [look up]',
    'Keep transmissions short; move details to chat or notes. Protect PII on air. [breathe]',
  ].join('\n\n'),

  arrival_brief: [
    'Location: [LOCATION]. On arrival: park safe, lights off, gear check. Lead sets perimeter and approach path. [pause]',
    'Scouts: baseline the scene—who, where, what’s changing. Document quietly. [look up]',
    'Drivers: safe staging and nearest exit. Floaters: hydration and PPE top‑ups. [breathe]',
    'Report in: “Team on site, baseline captured, standing by for tasks.” [pause]',
  ].join('\n\n'),

  shift_handoff: [
    'Handoff script: current status [STATUS], open tasks [OPEN_TASKS], risks [RISKS], key contacts [KEY_CONTACTS], and next timebound actions [NEXT_ACTIONS]. [pause]',
    'Confirm access: comms, map, and any active Meet‑A‑Need posts. [look up]',
    'Questions, then explicit transfer: “Shift lead now [INCOMING_LEAD].” From [OUTGOING_LEAD] to [INCOMING_LEAD]. Everyone acknowledges. [breathe]',
  ].join('\n\n'),

  debrief_5: [
    'Five‑minute debrief: 1) What happened (facts), 2) What helped, 3) What hurt, 4) What we’ll change next time. [pause]',
    'Capture actions with owners and deadlines: [ACTION_ITEMS]. Log in dispatch notes before dispersing. [look up]',
    'Close with gratitude. Hydrate, breathe, rest. [breathe]',
  ].join('\n\n'),

  media_protocol_60: [
    'Sixty‑second statement. Who we are: We are with [ORG] and our names are [NAMES]. [pause]',
    'What we’re doing at [LOCATION]: “We’re documenting safely and connecting people to care. We share verified facts as they’re confirmed.” [look up]',
    'Route detailed questions to [MEDIA_LEAD] via dispatch [DISPATCH_CONTACT]. No speculation; protect privacy—no PII. [breathe]',
  ].join('\n\n'),

  partner_coordination: [
    'Partners: [PARTNERS] (legal, advocacy, mutual aid). Share finalized records, not raw notes. [pause]',
    'Confirm data handling: minimal necessary, timeboxed retention, secure channels only. Contact via [SHARE_CHANNEL]. [look up]',
    'Escalations go through dispatch so everyone sees the same picture. [breathe]',
  ].join('\n\n'),

  code_of_conduct: [
    'Conduct: dignity, consent, and harm reduction. We witness, we don’t inflame. [pause]',
    'No harassment, discrimination, or retaliation—internally or externally. [look up]',
    'Respect boundaries and identities. If you err, own it, repair, and reset. [breathe]',
  ].join('\n\n'),

  weather_plan: [
    'Weather plan for [WEATHER]: heat—shade cycles, electrolyte checks, and shorter rotations. [pause]',
    'Cold—layers, handwarmers, watch for numbness and slowed speech. [look up]',
    'Wet/wind—secure signage, keep electronics dry, reroute to sheltered vantage points. Shelter at [SHELTER_LOCATIONS]. [breathe]',
  ].join('\n\n'),
};

export const TELEPROMPTER_SCRIPT_META: Array<{ id: TeleprompterScriptId; label: string }> = [
  { id: 'full_narrative', label: 'Full narrative' },
  { id: 'thirty_seconds', label: '30‑second version' },
  { id: 'demo_cues', label: 'Demo with cues' },
  { id: 'ops_brief', label: 'Ops brief' },
  { id: 'safety_check', label: 'Safety check' },
  { id: 'press_update_30', label: 'Press update (30s)' },
  { id: 'team_intros', label: 'Team intros' },
  { id: 'roles_expectations', label: 'Roles and expectations' },
  { id: 'tools_overview', label: 'Tools overview' },
  { id: 'contingency_brief', label: 'Contingency brief' },
  { id: 'radio_check', label: 'Radio check' },
  { id: 'arrival_brief', label: 'Arrival brief' },
  { id: 'shift_handoff', label: 'Shift handoff' },
  { id: 'debrief_5', label: 'Debrief (5‑min)' },
  { id: 'media_protocol_60', label: 'Media protocol (60s)' },
  { id: 'partner_coordination', label: 'Partner coordination' },
  { id: 'code_of_conduct', label: 'Code of conduct' },
  { id: 'weather_plan', label: 'Weather plan' },
];
