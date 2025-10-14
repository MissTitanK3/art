import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const dispatchCoordinationQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the primary role of a dispatcher in the ICE Tea ecosystem?',
    options: [
      'To lead field operations directly',
      'To solve emergencies through solo decision-making',
      'To coordinate trusted responders while maintaining safety and clarity',
    ],
    correct: 2,
  },
  {
    id: 'q2',
    type: 'true_false',
    question:
      'A dispatcher should assign volunteers to roles even if they haven’t confirmed their consent yet, as long as it’s urgent.',
    correct: false,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which of the following responsibilities fall under a dispatcher’s role?',
    options: [
      'Activate field roles like medics and legal observers',
      'Directly confront ICE agents at checkpoints',
      'Maintain encrypted data integrity',
      'Update status and team coordination in real-time',
    ],
    correct: [0, 2, 3],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'What should a dispatcher do if a submitted report is encrypted and unreadable?',
    options: [
      'Publish it anyway and mark it as urgent',
      'Ask on public channels for the key',
      'Flag it for manual key retrieval or requester follow-up',
      'Guess the contents based on similar reports',
    ],
    correct: 2,
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    question: 'What does the dispatcher dashboard (Live Dispatch Map) allow you to do?',
    options: [
      'Assign, monitor, and close out dispatches',
      'Issue legal guidance to field teams',
      'Access private social media accounts',
    ],
    correct: 0,
  },
  {
    id: 'q6',
    type: 'true_false',
    question: 'Only Admin Dispatchers can manage users and access full system controls.',
    correct: true,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'What factors should a dispatcher consider when assigning a field role?',
    options: [
      'Risk level and required skills',
      'Location and time availability',
      'Volunteer’s social media presence',
      'Tags like language ability or trauma-informed training',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q8',
    type: 'multiple_select',
    question: 'In an urgent ICE raid, which of the following roles should be activated immediately?',
    options: ['Legal observer', 'Photographer', 'De-escalator', 'Press liaison', 'Childcare support'],
    correct: [0, 2],
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    question: 'Why are pre-built dispatch templates important?',
    options: [
      'They guarantee a lower response time from ICE',
      'They reduce friction by pre-matching roles and coverage types',
      'They prevent dispatchers from making decisions independently',
    ],
    correct: 1,
  },
  {
    id: 'q10',
    type: 'multiple_choice',
    question: 'After a dispatch is closed, what is one responsible action a dispatcher should take?',
    options: [
      'Delete all related messages immediately',
      'Celebrate by posting on social media',
      'Log decisions and debrief with the team',
      'Ignore follow-ups and move on',
    ],
    correct: 2,
  },
];
