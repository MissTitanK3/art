import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const documentationSafetyQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the primary goal of documenting incidents involving ICE or police?',
    options: [
      'To go viral and raise awareness online',
      'To protect vulnerable people and support accountability',
      'To gather footage for future promotions',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'Even if filming is legal, consent and context still matter when recording people.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which of the following are good practices when recording an incident?',
    options: [
      'Narrate the time, place, and what’s happening',
      'Use landscape mode and hold the phone steady',
      'Use flash in low light conditions',
      'Capture badge numbers or vehicle plates if safe',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q4',
    type: 'true_false',
    question: 'Blurring faces before sharing footage online helps protect the identity and safety of those involved.',
    correct: true,
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    question: 'What should you do if you’re not the one filming but want to help?',
    options: [
      'Stand in front of the camera to protect the filmer’s view',
      'Narrate, watch their back, or help upload safely',
      'Shout directions to draw attention',
    ],
    correct: 1,
  },
  {
    id: 'q6',
    type: 'true_false',
    question: 'You should always livestream high-risk encounters as they happen.',
    correct: false,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'Which tools help protect data or vulnerable identities?',
    options: [
      'ObscuraCam for blurring faces and stripping metadata',
      'Auto-upload via Signal or Dropbox',
      'Posting raw footage to social media immediately',
      'Naming files clearly with date, location, and incident type',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'What is one valid reason to avoid recording even if something harmful is happening in public?',
    options: [
      'You’re not sure how to use your camera',
      'Recording could escalate the situation or put someone at further risk',
      'There’s too much background noise',
      'You prefer to tell others about it later instead',
    ],
    correct: 1,
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    question: 'What should you include in your narration while filming?',
    options: [
      'The names of undocumented people if known',
      'The time, place, and what is happening',
      'How angry you are about the situation',
    ],
    correct: 1,
  },
  {
    id: 'q10',
    type: 'multiple_choice',
    question: 'What is one step you should take after recording a high-risk encounter?',
    options: [
      'Upload it immediately to social media',
      'Share it only with trusted legal or support teams',
      'Edit out unclear parts first',
      'Send it to everyone in your contact list',
    ],
    correct: 1,
  },
  {
    id: 'q11',
    type: 'true_false',
    question: 'Police officers can legally delete your footage if they say it’s evidence.',
    correct: false,
  },
];
