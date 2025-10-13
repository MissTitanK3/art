import { Question } from '@/components/mdx/QustionRenderer';

export const ethicalDilemmasMutualAidQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'Why is it important for pods to practice responding to ethical dilemmas?',
    options: [
      'To avoid any conflict within the group entirely',
      'To ensure responses align with shared values and reduce harm during crises',
      'To avoid needing to work with other pods or networks',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'Without preparation, ethical dilemmas can fracture pods, endanger people, or compromise values.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which are common dilemmas pods may face?',
    options: [
      'Who to prioritize when resources are scarce',
      'Whether to risk escalation when police target members',
      'How to address unsafe volunteer behavior',
      'How to set up Signal for secure communications',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'Which tool helps pods make quick, inclusive decisions during high-stress situations?',
    options: [
      'Full consensus only, even if it takes hours',
      'Modified consensus or dot-voting',
      'Avoid making any decisions until tensions cool completely',
    ],
    correct: 1,
  },
  {
    id: 'q5',
    type: 'true_false',
    question: 'Forcing consensus can delay urgent decisions and put people at risk during field actions.',
    correct: true,
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    question: 'What is the purpose of debriefing after working through case studies or real incidents?',
    options: [
      'To assign blame to individuals',
      'To focus on healing and learning lessons without retraumatizing volunteers',
      'To finalize a pod-wide vote on punishment for mistakes',
    ],
    correct: 1,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'Which practices help build “muscle memory” for pods when facing dilemmas?',
    options: [
      'Practicing with simulated scenarios regularly',
      'Developing decision trees for recurring issues',
      'Documenting lessons after each incident',
      'Avoiding any review to “keep morale high”',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'What is one risk of overemphasizing speed in decision-making?',
    options: [
      'Silencing voices of those most impacted',
      'Causing pods to become more democratic',
      'Forcing everyone to use consensus',
    ],
    correct: 0,
  },
  {
    id: 'q9',
    type: 'true_false',
    question:
      'Trauma-aware facilitation during dilemma discussions can help prevent retraumatization and keep pods cohesive.',
    correct: true,
  },
  {
    id: 'q10',
    type: 'multiple_select',
    question: 'Which elements should be part of a pod’s protocol for handling future dilemmas?',
    options: [
      'Case study analysis skills',
      'Quick decision-making tools like dot-voting',
      'Trauma-aware facilitation and debriefing practices',
      'A pod-specific decision tree or framework',
    ],
    correct: [0, 1, 2, 3],
  },
];
