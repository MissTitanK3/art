import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const bystanderSupportQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is your first priority as a bystander during an incident?',
    options: [
      'Challenge the aggressor directly',
      'Record the event for social media',
      'Center the needs and safety of the targeted person',
    ],
    correct: 2,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'It is always best to use the “Direct” tactic to confront harm.',
    correct: false,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which of the following are part of the 5Ds of bystander intervention?',
    options: ['Direct', 'Deport', 'Delegate', 'Delay', 'De-escalate', 'Distract', 'Document'],
    correct: [0, 2, 3, 5, 6],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'What should you always consider before sharing a video of a bystander incident?',
    options: [
      'Whether the video will go viral',
      'If the targeted person consents to it being shared and it doesn’t expose them to risk',
      'Whether the lighting and audio quality are good',
      'If the platform allows videos longer than one minute',
    ],
    correct: 1,
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    question: 'Which tactic involves asking others to help support the target or de-escalate the situation?',
    options: ['Delegate', 'Distract', 'Delay', 'Direct'],
    correct: 0,
  },
  {
    id: 'q6',
    type: 'true_false',
    question: 'You can still offer meaningful support even after the incident has ended.',
    correct: true,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'Which of the following are things you should NOT do as a bystander?',
    options: [
      'Start yelling to escalate the situation',
      'Get physically between an officer and the person being stopped',
      'Film from a safe distance without interfering',
      'Make assumptions or accusations about what’s happening',
      'Stay calm and observe quietly',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q8',
    type: 'multiple_select',
    question: 'Which actions are considered supportive after an incident?',
    options: [
      'Blame the target for not speaking up',
      'Offer water or company',
      'Validate that the harm wasn’t okay',
      'Share a video without consent',
    ],
    correct: [1, 2],
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    question: 'What is the main purpose of the “Distract” tactic?',
    options: [
      'To confront the aggressor head-on',
      'To create a moment of pause or interruption that shifts the focus',
      'To make the situation more intense so bystanders pay attention',
    ],
    correct: 1,
  },
  {
    id: 'q10',
    type: 'multiple_choice',
    question: 'Why is cultural awareness important when offering bystander support?',
    options: [
      'It helps you follow police instructions more effectively',
      'It ensures your actions don’t unintentionally escalate or disrespect the person you’re supporting',
      'It allows you to film more confidently in public',
      'It makes your intervention go viral for more impact',
    ],
    correct: 1,
  },
  {
    id: 'q11',
    type: 'true_false',
    question: 'Filming ICE or police is always safe and legally protected in all contexts.',
    correct: false,
  },
  {
    id: 'q12',
    type: 'multiple_choice',
    question: 'What is one way to support someone who doesn’t speak English?',
    options: [
      'Speak louder so they understand your tone',
      'Use simple gestures or body language to signal support',
      'Avoid them so you don’t make things worse',
      'Assume they don’t need help unless they ask directly',
    ],
    correct: 1,
  },
  {
    id: 'q13',
    type: 'true_false',
    question:
      'It’s okay if you can’t intervene directly. The goal is to find a tactic that fits your capacity and safety.',
    correct: true,
  },
];
