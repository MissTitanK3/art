import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const digitalSecurityBasicsQuestions: Question[] = [
  {
    id: 'dsb-q1',
    type: 'multiple_choice',
    question: 'Which app should you use for all dispatch-related messaging in ICE Tea?',
    options: ['WhatsApp', 'Signal', 'Telegram', 'Text Messages'],
    correct: 1,
  },
  {
    id: 'dsb-q2',
    type: 'true_false',
    question: 'Photos taken on your phone include GPS and device info by default.',
    correct: true,
  },
  {
    id: 'dsb-q3',
    type: 'multiple_select',
    question: 'Which of the following are good digital security habits?',
    options: [
      'Lock your phone with a passcode',
      'Share screenshots of internal chats',
      'Turn off auto-backups to cloud',
      'Post ICE activity to a secure Twitter account',
      'Use Proton Mail for ICE Tea communications',
    ],
    correct: [0, 2, 4],
  },
  {
    id: 'dsb-q4',
    type: 'multiple_choice',
    question: 'What is the best way to send a photo that removes metadata automatically?',
    options: ['Upload to Dropbox', 'Share via iMessage', 'Send through Signal', 'Post on Instagram and delete later'],
    correct: 2,
  },
];
