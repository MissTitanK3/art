import { Question } from '@/components/mdx/QustionRenderer';

export const academyOverviewQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the primary purpose of the ICE Tea Academy?',
    options: [
      'To provide general community education without certification',
      'To coordinate ICE raids',
      'To prepare and certify volunteers for field and support roles',
    ],
    correct: 2,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'Certified courses require a reviewed assessment or reflection.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_choice',
    question: 'Which callout is used to indicate an optional deep dive?',
    options: ['warning', 'success', 'rabbit-hole'],
    correct: 2,
  },
  {
    id: 'q4',
    type: 'true_false',
    question: 'Qualified courses require passing a quiz to complete.',
    correct: false,
  },
  {
    id: 'q5',
    type: 'multiple_select',
    question: 'Which of these are goals of the ICE Tea Academy?',
    options: [
      'Equip volunteers with actionable knowledge',
      'Replace all law enforcement with community patrols',
      'Verify understanding for dispatch trust',
      'Prepare volunteers for field roles',
    ],
    correct: [0, 2, 3],
  },
];
