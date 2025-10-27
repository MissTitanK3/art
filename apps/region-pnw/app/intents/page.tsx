export default function IntentsPage() {
  type IntentGroup = {
    emoji: string;
    title: string;
    description: string;
    checklist: string[];
  };

  const INTENT_EXPLAINERS: IntentGroup[] = [
    {
      emoji: '🚸',
      title: 'Care Roles',
      description:
        'Support children, elders, disabled people, or culturally grounded participants by offering attentive, respectful, and trauma-informed presence.',
      checklist: [
        'You proactively check in with those who may need extra care or reassurance.',
        'You communicate clearly and respectfully across age, ability, or cultural context.',
        'You assist with access, mobility, or sensory needs without drawing attention.',
        'You create or support spaces for grounding, rest, or cultural/spiritual connection.',
      ],
    },
    {
      emoji: '🤝',
      title: 'Community Support & Logistics',
      description:
        'Help sustain people in the field by ensuring access to resources, coordination, and check-ins. This keeps everything running and everyone supported.',
      checklist: [
        'You bring or distribute food, water, and other key supplies.',
        'You check in on people who may be isolated, overwhelmed, or new.',
        'You help with rides, deliveries, or coordinated support.',
        'You know how to access medic, mental health, or legal help if needed.',
      ],
    },
    {
      emoji: '📡',
      title: 'Comms & Tech Support',
      description:
        'Maintain communication, privacy, and surveillance resistance. You support the tech backbone of safe organizing.',
      checklist: [
        'You maintain Signal chains, radios, or comms relays clearly.',
        'You help monitor enforcement or LE movement in real-time.',
        'You support livestreams, encrypted devices, or data security.',
        'You know when and how to jam surveillance (if pre-agreed).',
      ],
    },
    {
      emoji: '🧭',
      title: 'Custom Planning',
      description:
        'You’re executing a specialized or high-coordination plan. These must be pre-cleared with dispatch and include clear support and fallback. Do not freelance this.',
      checklist: [
        'You’ve confirmed the plan with dispatch, ops, or organizers.',
        'You understand success criteria, risks, and backup procedures.',
        'You document your goals and outcomes clearly and discreetly.',
        'You never act alone unless explicitly agreed upon in advance.',
      ],
    },
    {
      emoji: '🚨',
      title: 'Direct Action / Protective Roles',
      description:
        'You are physically or strategically intervening, blocking, or shielding. This is a high-risk category and demands clarity, trust, and control.',
      checklist: [
        'You are calm and grounded in physical proximity to risk.',
        'You know the group’s safety plan, fallback route, and escalation thresholds.',
        'You’re trained in redirection, disengagement, or nonviolent blockading.',
        'You do not provoke, escalate, or deviate from agreed protocols.',
      ],
    },
    {
      emoji: '⚖️',
      title: 'Legal & Advocacy Support',
      description:
        'You protect legal rights, track enforcement, and assist with legal navigation in-field or post-event. Accuracy and discretion are key.',
      checklist: [
        'You help people understand their rights, next steps, or court process.',
        'You document arrests, detentions, or legal violations safely.',
        'You accompany or track individuals through legal touchpoints.',
        'You know how to escalate legal needs to lawyers or dispatch.',
      ],
    },
    {
      emoji: '🧠',
      title: 'Mental Health & De-escalation',
      description:
        'You offer emotional grounding and defuse tense situations. This role centers nervous system safety and collective calm.',
      checklist: [
        'You listen with empathy and validate without judgment.',
        'You recognize signs of overwhelm and trauma responses.',
        'You use de-escalation or grounding techniques in the moment.',
        'You know when to call for help or quietly withdraw.',
      ],
    },
    {
      emoji: '📋',
      title: 'Observation & Documentation',
      description:
        'You act as a calm, alert witness. This role creates public accountability and ensures key moments are captured for safety, legal, or advocacy use.',
      checklist: [
        'You remain quiet, focused, and emotionally neutral while observing.',
        'You log accurate time, place, and events—even under pressure.',
        'You use Signal, encrypted photos, or written logs safely.',
        'You report to dispatch or legal teams—not public channels.',
      ],
    },
  ];
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Action Intents & Guidance</h1>
      <p className="text-muted-foreground">
        Use this guide to understand what each action intent means and how to make sure you’re fulfilling it safely and
        effectively.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTENT_EXPLAINERS.map(({ emoji, title, description, checklist }) => (
          <div key={title} className="border rounded-lg p-4 space-y-2">
            <h2 className="text-lg font-semibold">
              {emoji} {title}
            </h2>
            <p className="text-sm text-muted-foreground">{description}</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {checklist.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}