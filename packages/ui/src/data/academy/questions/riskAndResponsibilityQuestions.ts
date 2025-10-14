import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const riskAndResponsibilityQuestions: Question[] = [
  {
    id: 'rrisk-q1',
    type: 'multiple_choice',
    question: 'Which of the following is a valid reason to say “No” to participating in an action?',
    options: [
      'You don’t feel like it today',
      'You’re not trained for the assigned role',
      'You don’t agree with the organizer’s politics',
      'You want to stay anonymous on social media',
    ],
    correct: 1,
  },
  {
    id: 'rrisk-q2',
    type: 'multiple_select',
    question: 'What are examples of collective care in high-risk environments?',
    options: [
      'Debriefing after actions',
      'Only accepting veteran team members',
      'Using duress words or check-ins',
      'Avoiding group coordination to stay safe',
    ],
    correct: [0, 2],
  },
  {
    id: 'rrisk-q3',
    type: 'multiple_choice',
    question: 'What is a safe way to communicate with team members during direct action?',
    options: ['Group SMS thread', 'Public Discord server', 'Signal with disappearing messages', 'Instagram group chat'],
    correct: 2,
  },
  {
    id: 'rrisk-q4',
    type: 'multiple_select',
    question: 'Which of the following are personal risk factors you should evaluate before taking action?',
    options: [
      'Your immigration status or outstanding warrants',
      'Whether your phone is fully charged',
      'Your emotional or physical health',
      'If you know anyone else attending',
      'Whether you’re carrying sensitive data or items',
    ],
    correct: [0, 2, 4],
  },
  {
    id: 'rrisk-q5',
    type: 'multiple_choice',
    question:
      'You’re the rideshare coordinator during a courthouse protest. Someone texts asking to be picked up 6 blocks away, but you don’t recognize the number. What should you do?',
    options: [
      'Share your name and location to build trust',
      'Ignore the request unless confirmed by dispatch',
      'Verify identity through a known contact or dispatch first',
      'Send a different volunteer to avoid risk',
    ],
    correct: 2,
  },
  {
    id: 'rrisk-q6',
    type: 'true_false',
    question: 'Burnout and trauma are legitimate risks that should be factored into safety planning.',
    correct: true,
  },
  {
    id: 'rrisk-q7',
    type: 'multiple_choice',
    question: 'How could your presence increase risk for someone more vulnerable?',
    options: [
      'You might unintentionally draw law enforcement attention toward them',
      'Your presence always decreases risk for others',
      'Vulnerable people aren’t affected by others’ presence',
      'If you aren’t doing anything illegal, you pose no risk to others',
    ],
    correct: 0,
  },
  {
    id: 'rrisk-q8',
    type: 'multiple_choice',
    question: 'If law enforcement demands your phone, what should you say?',
    options: [
      '"It’s unlocked, take what you need."',
      '"I do not consent to a search and I want a lawyer."',
      '"I’ll delete everything first, then hand it over."',
      '"You can’t take it unless I say so."',
    ],
    correct: 1,
  },
  {
    id: 'rrisk-q9',
    type: 'multiple_choice',
    question: 'A teammate starts livestreaming on Facebook without warning. What is the most responsible response?',
    options: [
      'Join the livestream to boost visibility',
      'Publicly call them out for safety violations',
      'Quietly remind them of metadata and doxxing risks',
      'Ignore it — it’s not your problem',
    ],
    correct: 2,
  },
  {
    id: 'rrisk-q10',
    type: 'multiple_choice',
    question: 'Which of the following best defines a “duress word”?',
    options: [
      'A legal phrase used in court',
      'A trigger warning for trauma',
      'A code used to silently signal danger to teammates',
      'A term for encrypted chat platforms',
    ],
    correct: 2,
  },
];
