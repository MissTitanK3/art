import { Question } from '@/components/mdx/QustionRenderer';

export const introToIceTeaQuestions: Question[] = [
  {
    id: 'ice-tea-q1',
    type: 'multiple_choice',
    question: 'What is ICE Tea Network primarily built to do?',
    options: [
      'Lobby for more humane immigration policies',
      'Coordinate rapid-response support to enforcement activity',
      'Run a national database of undocumented individuals',
      'Support law enforcement during operations',
    ],
    correct: 1,
  },
  {
    id: 'ice-tea-q2',
    type: 'true_false',
    question: 'ICE Tea relies on a central leadership team for coordination.',
    correct: false,
  },
  {
    id: 'ice-tea-q3',
    type: 'multiple_select',
    question: 'Which values guide the ICE Tea Network?',
    options: ['Decentralization', 'Abolitionism', 'Surveillance disruption', 'Hierarchy and command', 'Mutual aid'],
    correct: [0, 1, 2, 4],
  },
  {
    id: 'ice-tea-q4',
    type: 'multiple_choice',
    question: 'Who can be part of ICE Tea?',
    options: [
      'Only lawyers and trained organizers',
      'Anyone trusted and trained in the network’s roles',
      'Only people with government IDs',
      'Only dispatchers with full access',
    ],
    correct: 1,
  },
];
