import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const meshNetworksLargeScaleQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'Why should roles like medics, scouts, and logistics use separate channels and PSKs?',
    options: [
      'To make messages easier to read by grouping them by team',
      'To reduce chatter, prevent leaks, and protect sensitive communications',
      'To save battery power by using fewer devices per channel',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question:
      'Leadership gateways that bridge to the internet should be minimized and protected to avoid surveillance.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'What are key components of a resilient city-wide Meshtastic network?',
    options: [
      'Primary rooftop relays for wide coverage',
      'Secondary mobile relays in vehicles or trailers',
      'Multiple backup relays stored and ready to deploy',
      'All pods operating on one massive shared channel for simplicity',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'What is the recommended relay spacing in rural or open terrain?',
    options: ['1–2 km', '3–5 km', '5–8 km'],
    correct: 2,
  },
  {
    id: 'q5',
    type: 'true_false',
    question:
      'Rotating PSKs (encryption keys) weekly during active operations helps protect against compromised nodes.',
    correct: true,
  },
  {
    id: 'q6',
    type: 'multiple_select',
    question: 'How can relays be camouflaged to avoid detection?',
    options: [
      'Placed in locked, weatherproof containers labeled “Environmental Sensors”',
      'Left openly visible on rooftops for easy access',
      'Mounted inside fake utility boxes or disguised as infrastructure',
      'Rotated to new locations every few days to avoid pattern tracking',
    ],
    correct: [0, 2, 3],
  },
  {
    id: 'q7',
    type: 'multiple_choice',
    question: 'What is the best coordination model for multiple pods linking together?',
    options: [
      'A hub-and-spoke model with limited, trusted bridge nodes',
      'One massive open channel with all pods on the same PSK',
      'Fully centralized command issuing instructions to all pods',
    ],
    correct: 0,
  },
];
