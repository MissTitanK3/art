import { Question } from '@/components/mdx/QustionRenderer';

export const whyWeDoThisQuestions: Question[] = [
  {
    id: 'why-q1',
    type: 'multiple_choice',
    question: 'What is the core purpose driving ICE Tea Academy’s work?',
    options: [
      'To assist ICE in more humane enforcement',
      'To strengthen state immigration policy',
      'To create community-led systems of protection and resistance',
      'To replace mutual aid with government-run services',
    ],
    correct: 2,
  },
  {
    id: 'why-q2',
    type: 'true_false',
    question: 'ICE Tea Academy collaborates with local law enforcement when needed.',
    correct: false,
  },
  {
    id: 'why-q3',
    type: 'multiple_select',
    question: 'Which traditions or movements does ICE Tea Academy draw from?',
    options: [
      'Indigenous land defense',
      'Mutual aid networks',
      'Corporate leadership coaching',
      'Abolitionist organizing',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'why-q4',
    type: 'multiple_select',
    question: 'Which of the following are commitments made by ICE Tea Academy?',
    options: [
      'Lobbying for better ICE funding',
      'Dismantling harmful systems',
      'Centering the most vulnerable',
      'Creating care systems beyond the state',
      'Making ICE more efficient and transparent',
    ],
    correct: [1, 2, 3],
  },
  {
    id: 'why-q5',
    type: 'true_false',
    question: 'ICE Tea Academy sees organized, local protective response as a moral obligation.',
    correct: true,
  },
  {
    id: 'why-q6',
    type: 'multiple_choice',
    question: 'Which group pioneered sanctuary networks for immigrants during the 1980s?',
    options: [
      'The American Civil Liberties Union (ACLU)',
      'Compañeras Latinas and faith-based coalitions',
      'The Department of Homeland Security',
      'Local police task forces',
    ],
    correct: 1,
  },
  {
    id: 'why-q7',
    type: 'true_false',
    question: 'Mutual aid is different from charity because it rejects hierarchy and centers solidarity.',
    correct: true,
  },
  {
    id: 'why-q8',
    type: 'multiple_choice',
    question: 'What does “decentralized” mean in the context of community protection?',
    options: [
      'Led by federal government task forces',
      'Organized without a single point of control',
      'Centered on charity organizations',
      'Managed by law enforcement liaisons',
    ],
    correct: 1,
  },
];
