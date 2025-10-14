import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const meshNetworksIntroQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the main advantage of using a mesh network like Meshtastic?',
    options: [
      'It relies on cell towers and the internet for greater reach',
      'It allows devices to communicate directly without towers or the internet',
      'It automatically encrypts all messages by default, no setup needed',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'Meshtastic devices can still pass messages even when there is no phone signal or Wi-Fi.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which situations are good use cases for Meshtastic?',
    options: [
      'Coordinating at protests when networks may be shut down',
      'Sharing sensitive passwords over unencrypted default channels',
      'Mutual aid or rural team communications without cell service',
      'Urban pods testing off-grid messaging tools',
    ],
    correct: [0, 2, 3],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'What is a “node” in a Meshtastic network?',
    options: [
      'A central tower that controls all communication',
      'Any device (like a T-Beam or Heltec) that can send and forward messages',
      'A type of antenna upgrade for long-range connections',
    ],
    correct: 1,
  },
  {
    id: 'q5',
    type: 'true_false',
    question: 'It is safe to use Meshtastic’s default public channels and keys for all pod communications.',
    correct: false,
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    question: 'What is the typical range of a Meshtastic device in a dense urban environment?',
    options: ['100–500 meters', '1–3 km', '10+ km'],
    correct: 1,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'Which practices help maintain range and reliability for beginners?',
    options: [
      'Keeping the antenna vertical and unobstructed',
      'Testing from inside dense concrete buildings',
      'Placing nodes on elevated locations like balconies or hills',
      'Using multiple nodes spaced apart so messages can hop',
    ],
    correct: [0, 2, 3],
  },
  {
    id: 'q8',
    type: 'true_false',
    question: 'Even if messages are encrypted, transmissions can still be detected by someone scanning for signals.',
    correct: true,
  },
];
