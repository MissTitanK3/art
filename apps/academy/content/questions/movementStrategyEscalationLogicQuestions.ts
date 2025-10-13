import { Question } from '@/components/mdx/QustionRenderer';

export const movementStrategyEscalationLogicQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'Why is it dangerous for pods to escalate actions without a clear strategy?',
    options: [
      'It can lead to burnout, repression, and loss of community trust',
      'It guarantees more media coverage but no risks',
      'It automatically strengthens community relationships',
    ],
    correct: 0,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'Escalation done with purpose, timing, and consent can help shift power and protect people.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'What does the STAR framework stand for when analyzing risk and impact?',
    options: [
      'Safety, Timing, Alignment, Resources',
      'Strategy, Timing, Actions, Responses',
      'Security, Tactics, Alliance, Risk',
    ],
    correct: [0],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question:
      'Which tactic in the escalation matrix carries very high visibility and high risk, requiring arrest support and logistics?',
    options: ['Sit-in', 'Banner Drop', 'Road Blockade', 'Vigil or March'],
    correct: 2,
  },
  {
    id: 'q5',
    type: 'true_false',
    question:
      'Red lines, like police escalation beyond a threshold or harmful media narratives, should be agreed upon before actions.',
    correct: true,
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    question: 'What is the purpose of the “Pre-Mortem Exercise” in scenario planning?',
    options: [
      'To anticipate possible failure points and create contingency plans',
      'To assign blame for past mistakes',
      'To discourage escalation entirely',
    ],
    correct: 0,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'Which communication tools help pods coordinate escalation or de-escalation?',
    options: [
      'Hand signals like flat hand rotation (de-escalate) and fist pump (escalate)',
      'Coded phrases like “Package is ready” or “Need coffee”',
      'Sharing all real-time plans on social media for transparency',
      'Hands on head = emergency extraction',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'During unpredictable actions, how often should pods reassess their tactics and goals?',
    options: ['Every 5 minutes', 'Every 15 minutes', 'Only at the start and end of the action'],
    correct: 1,
  },
  {
    id: 'q9',
    type: 'true_false',
    question: 'Pods should never pressure members into taking risks they didn’t explicitly agree to.',
    correct: true,
  },
  {
    id: 'q10',
    type: 'multiple_select',
    question: 'Which steps should pods take to align escalation decisions with strategy and safety?',
    options: [
      'Run STAR analysis before any escalation',
      'Agree on red lines and hand signals beforehand',
      'Practice escalation and de-escalation drills',
      'Always escalate to the most disruptive tactic available',
    ],
    correct: [0, 1, 2],
  },
];
