import { Question } from '@/components/mdx/QustionRenderer';

export const mythOfTotalAnonymityQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the main argument of the course?',
    options: [
      'True anonymity is still achievable with masks and burner phones',
      'Total anonymity is effectively impossible in 2025 due to overlapping surveillance technologies',
      'Pods should stop using masks and focus entirely on public-facing visibility',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question:
      'Facial recognition today can identify people even with full masks by using partial facial ratios, gait, and other cues.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which tracking methods now commonly overlap to identify individuals?',
    options: [
      'Partial facial and body ratios',
      'Voice recognition and ambient audio',
      'Cross-referenced phone tower and drone data',
      'Traditional paper warrant checks',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'What does the course recommend as a better investment of energy than chasing perfect invisibility?',
    options: [
      'Practicing resilience through redundant pods, secure data practices, and fallback drills',
      'Spending more money on advanced disguises and anti-camera gear',
      'Staying home and avoiding all direct actions',
    ],
    correct: 0,
  },
  {
    id: 'q5',
    type: 'true_false',
    question: 'Phone tower data can still track burner phones, even when not actively in use.',
    correct: true,
  },
  {
    id: 'q6',
    type: 'multiple_select',
    question: 'What strategies are emphasized for pods to survive surveillance and fallout?',
    options: [
      'Strong inter-pod networks and redundancy',
      'Data hygiene and compartmentalization',
      'Overreliance on masks and burner phones alone',
      'Practicing legal and fallout support drills',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q7',
    type: 'multiple_choice',
    question: 'In the Decision Flow, what should pods prioritize in heavy surveillance environments?',
    options: [
      'Pod resilience and fallout protocols',
      'Only stronger masks and burner phones',
      'Publicly challenging surveillance to deter it',
    ],
    correct: 0,
  },
  {
    id: 'q8',
    type: 'true_false',
    question: 'The course suggests that total invisibility is achievable with enough effort.',
    correct: false,
  },
  {
    id: 'q9',
    type: 'multiple_select',
    question: 'Which are practical takeaways from the course?',
    options: [
      'Aim for low exposure, not zero',
      'Accept traceability and prepare pods to absorb fallout',
      'Invest primarily in cutting-edge disguise tech',
      'Invest in resilience, secure networks, and legal/tech support',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q10',
    type: 'multiple_choice',
    question: 'What is the “bottom line” of the course?',
    options: [
      'Pods must chase total invisibility at all costs to avoid risk',
      'Pods thrive by being redundant, disciplined, and prepared for tracking and fallout',
      'Anonymity is irrelevant and should be abandoned entirely',
    ],
    correct: 1,
  },
];
