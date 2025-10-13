import { Question } from '@/components/mdx/QustionRenderer';

export const trustAndEthicsInDispatchQuestions: Question[] = [
  {
    id: 'ethics-q1',
    type: 'multiple_choice',
    question: 'What is the most important factor when deciding to activate a responder?',
    options: [
      'Their availability in the moment',
      'Whether they’ve been active recently',
      'Their qualifications and trustworthiness',
      'If they’re near the location',
    ],
    correct: 2,
  },
  {
    id: 'ethics-q2',
    type: 'true_false',
    question: 'Urgency always outweighs the need to protect a responder’s safety.',
    correct: false,
  },
  {
    id: 'ethics-q3',
    type: 'multiple_select',
    question: 'Which of the following are ethical practices for handling sensitive information?',
    options: [
      'Using initials or anonymized notes',
      'Sharing screenshots in team DMs',
      'Logging data only in secure systems',
      'Confirming consent before sharing names',
    ],
    correct: [0, 2, 3],
  },
  {
    id: 'ethics-q4',
    type: 'multiple_choice',
    question: 'What should you do if you’re unsure about activating someone?',
    options: [
      'Ping everyone just in case',
      'Pause, ask for admin backup, and verify',
      'Hope for the best and move forward',
      'Skip the activation and close the report',
    ],
    correct: 1,
  },
  {
    id: 'ethics-q5',
    type: 'true_false',
    question: 'Dispatchers should consider cultural power dynamics when giving direction.',
    correct: true,
  },
  {
    id: 'ethics-q6',
    type: 'multiple_select',
    question: 'What are signs you’re dispatching ethically?',
    options: [
      'You center safety over speed',
      'You verify before activating',
      'You tell stories from reports on social media to build awareness',
      'You invite only trusted, qualified responders',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'ethics-q7',
    type: 'multiple_choice',
    question: 'What does “moving at the speed of trust” mean in dispatch work?',
    options: [
      'Only working with people you’ve known for years',
      'Prioritizing control over communication',
      'Slowing down when needed to keep safety and consent at the center',
      'Letting trust grow naturally without making decisions',
    ],
    correct: 2,
  },
];
