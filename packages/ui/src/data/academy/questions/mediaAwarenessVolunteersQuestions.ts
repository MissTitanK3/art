import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const mediaAwarenessVolunteersQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'Why is media awareness essential for all volunteers?',
    options: [
      'It helps volunteers gain more press attention for their actions',
      'It prevents exposure of vulnerable people, disinformation, and operational risks',
      'It ensures every volunteer can act as a spokesperson for the pod',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'You should always assume that cameras and livestreams are recording live, even if they say otherwise.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'What are safe ways to protect identities during media exposure?',
    options: [
      'Use masks and mindful angles',
      'Calmly redirect cameras away from faces',
      'Physically grab cameras without warning',
      'Move vulnerable individuals to less visible areas',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'What should you do if approached by press and you’re not the designated spokesperson?',
    options: [
      'Give them detailed updates about your pod’s plans',
      'Politely redirect them to a designated spokesperson',
      'Refuse to engage with any press under any circumstances',
    ],
    correct: 1,
  },
  {
    id: 'q5',
    type: 'true_false',
    question:
      'It’s safe to share event times, locations, and pod details with “friendly” journalists if they promise to keep it off record.',
    correct: false,
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    question: 'Which tool can help volunteers blur faces before sharing media?',
    options: ['Signal or ObscuraCam', 'Standard phone camera app', 'Public Instagram filters'],
    correct: 0,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'What are signs of potentially hostile or impersonating media?',
    options: [
      'Asking for names, staging details, or leadership roles',
      'Refusing to show press credentials',
      'Focusing heavily on faces rather than context',
      'Verifying with a safety marshal before recording',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'If sensitive activity is captured on a livestream, what’s your first step?',
    options: [
      'Alert your dispatcher or media observer immediately',
      'Post on social media to warn others',
      'Attempt to delete the livestream by confronting the streamer directly',
    ],
    correct: 0,
  },
  {
    id: 'q9',
    type: 'true_false',
    question: 'Only trained safety marshals or leads should physically block or intervene with cameras when needed.',
    correct: true,
  },
  {
    id: 'q10',
    type: 'multiple_select',
    question: 'Which steps should you take if sensitive info is accidentally recorded?',
    options: [
      'Notify your pod’s security or legal team immediately',
      'Document what was captured for mitigation',
      'Publicly identify everyone filmed so they can prepare',
      'Follow your pod’s mitigation plan for legal or PR response',
    ],
    correct: [0, 1, 3],
  },
];
