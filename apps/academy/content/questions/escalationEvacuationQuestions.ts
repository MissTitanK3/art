import { Question } from '@/components/mdx/QustionRenderer';

export const escalationEvacuationQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the “Golden Rule” for safe evacuation during field actions?',
    options: [
      'Evacuate only when the group votes unanimously',
      'Evacuate after confirming law enforcement presence',
      'Evacuate before you think you need to, to prevent injuries',
    ],
    correct: 2,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'Late exits account for most field injuries during volatile events.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which indicators should trigger a pod’s escalation alerts?',
    options: [
      'Police lines shifting from line to wedge formations',
      'Observation of gas masks or uniform swaps',
      'Counter-protesters shouting from a distance',
      'Kettling or flanking attempts by police',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'Which is considered a **non-negotiable evacuation trigger**?',
    options: [
      'Loss of 50% communications',
      'Chemical weapons deployed (tear gas, pepper spray)',
      'A small group of counter-protesters arriving nearby',
    ],
    correct: 1,
  },
  {
    id: 'q5',
    type: 'true_false',
    question:
      'Fallback routes should always be marked in advance with bright, visible signage so everyone can find them easily.',
    correct: false,
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    question: 'What does the voice command “Sunset now” signal to a pod?',
    options: [
      'Prepare to start the protest march',
      'Immediate dispersal without questions',
      'Switch to radio-only communication',
    ],
    correct: 1,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'Which drills should pods practice monthly to ensure effective evacuations?',
    options: [
      'Blindfold navigation to fallback points',
      'Runner relay for no-tech evacuation orders',
      'Blackout scenarios with whisper-only coordination',
      'Public regrouping at dispersal points for headcounts',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'What is the correct order of evacuation priority?',
    options: [
      'General participants, then legal observers, then medics',
      'Medics and legal observers first, then disabled participants, then marshals last',
      'Disabled participants, medics, legal observers first, then general participants, then marshals last',
    ],
    correct: 2,
  },
  {
    id: 'q9',
    type: 'true_false',
    question: 'Pods should always regroup at their dispersal point for quick headcounts after an evacuation.',
    correct: false,
  },
  {
    id: 'q10',
    type: 'multiple_select',
    question: 'Which items belong on a pod’s evacuation gear checklist?',
    options: [
      'Reflective or glow tape for night tracking',
      'Whistles with a 3-burst danger signal',
      'Preloaded burner metro or transit cards',
      'UV map tattoos for night navigation',
    ],
    correct: [0, 1, 2, 3],
  },
];
