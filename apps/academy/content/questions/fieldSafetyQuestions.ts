import { Question } from '@/components/mdx/QustionRenderer';

export const fieldSafetyQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the purpose of the OODA loop in field safety?',
    options: [
      'To memorize protest laws',
      'To stay mentally present and make safe decisions under pressure',
      'To train law enforcement response teams',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'If your role hasn’t been assigned yet, it’s fine to improvise on the ground alone.',
    correct: false,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which of the following are signs of escalating threats in the field?',
    options: [
      'Officers removing helmets or stepping back',
      'Unmarked vans or plainclothes agents appearing',
      'Crowd movements becoming chaotic or panicked',
      'Multiple people scanning rooftops calmly',
    ],
    correct: [1, 2],
  },
  {
    id: 'q4',
    type: 'multiple_select',
    question: 'What are two actions you should take if tear gas is deployed?',
    options: [
      'Run blindly through the smoke to escape quickly',
      'Cover your mouth and nose with a cloth or mask',
      'Flush eyes with water or saline if exposed',
      'Use gloves to move the canister safely if trained',
      'Rub your eyes to get rid of the stinging',
    ],
    correct: [1, 2],
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    question: 'Where should you position yourself if you’re not embedded in the crowd?',
    options: [
      'At the very front for the best view',
      'Near the center to stay hidden',
      'Along the edges for safer exits and visibility',
    ],
    correct: 2,
  },
  {
    id: 'q6',
    type: 'true_false',
    question: 'Carrying flyers or tools could be used against you as “evidence of intent.”',
    correct: true,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'What should every field team member do as part of basic safety protocol?',
    options: [
      'Check in and out with the team or dispatcher',
      'Avoid assigned zones to move freely',
      'Have fallback locations and clear roles',
      'Carry surveillance gear and high-zoom cameras',
    ],
    correct: [0, 2],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'What are “green/yellow/red zones” used for during a dispatch?',
    options: [
      'To assign volunteers to different field roles',
      'To designate rest areas, media zones, and exit points',
      'To indicate levels of safety and risk in a dynamic field area',
      'To signal when to start or end a dispatch',
    ],
    correct: 2,
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    question: 'If you feel tense or like something’s off during an operation, what’s the best response?',
    options: [
      'Push through and keep going unless told otherwise',
      'Ignore your feelings and stick close to law enforcement',
      'Trust your instincts, scan your surroundings, and alert your team',
    ],
    correct: 2,
  },
  {
    id: 'q10',
    type: 'multiple_choice',
    question: 'What is one thing you should never do if arrests are taking place, even if you are filming?',
    options: [
      'Narrate what’s happening for context',
      'Approach the officers to get a clearer shot',
      'Film from across the street',
      'Hold your camera steady and visible',
    ],
    correct: 1,
  },
  {
    id: 'q11',
    type: 'true_false',
    question: 'Sharing goggles between volunteers without sanitizing them poses a risk of infection.',
    correct: true,
  },
  {
    id: 'q12',
    type: 'multiple_choice',
    question: 'What’s a sign that your stress levels are too high to make safe decisions?',
    options: [
      'Steady breathing and slow movements',
      'Tunnel vision, trembling hands, or shortness of breath',
      'Quiet observation of surroundings',
    ],
    correct: 1,
  },
  {
    id: 'q13',
    type: 'multiple_choice',
    question: 'During a kettling scenario, what is the most effective movement strategy?',
    options: [
      'Move directly toward the line to negotiate',
      'Run in panic with the crowd',
      'Move diagonally toward crowd edges and locate alternate exits',
    ],
    correct: 2,
  },
];
