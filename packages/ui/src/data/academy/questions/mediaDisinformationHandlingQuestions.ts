import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const mediaDisinformationHandlingQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'Why is strict verification critical before issuing alerts about ICE or police activity?',
    options: [
      'It reduces the need for pods to coordinate with dispatch',
      'It prevents wasted resources, panic, and network discrediting due to false reports',
      'It ensures all incidents are reported publicly, verified or not',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'Dispatch should only issue alerts after at least two independent checks are confirmed.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which methods are part of verifying reports?',
    options: [
      'Encrypted photo/video with location timestamps for ICE sightings',
      'Cross-confirmation by two pods via independent channels for police activity',
      'Reverse image search and EXIF checks for viral posts',
      'Publicly asking for witnesses on social media before confirming',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'Which behavior is a common indicator of bots or troll accounts spreading disinformation?',
    options: [
      'Consistent local posting with unique phrasing',
      'Numeric or generic usernames with burst posting of identical messages',
      'Posting updates verified by multiple pods',
    ],
    correct: 1,
  },
  {
    id: 'q5',
    type: 'true_false',
    question:
      'Deepfake or edited content often shows shadow mismatches, metadata inconsistencies, or pixelation around key elements.',
    correct: true,
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    question: 'What is the correct counter-messaging approach for unverified reports?',
    options: [
      'Publicly accuse the source of being fake immediately',
      'Quietly correct within trusted networks or issue a neutral public statement',
      'Share the report widely to crowdsource verification',
    ],
    correct: 1,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'Which security practices help protect verification and messaging?',
    options: [
      'Never share exact pod movements or verification methods publicly',
      'Use encrypted backchannels like Signal, Matrix, or PGP',
      'Rotate verification routes and responders to avoid predictability',
      'Always announce which pods are verifying so the public knows who to trust',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question:
      'Which response level involves issuing a neutral public statement like, “We have no verified reports of [incident] at this time. Verification ongoing.”?',
    options: [
      'Level 1 (Quiet Correction)',
      'Level 2 (Neutral Public Statement)',
      'Level 3 (Escalated Response with leads/admins)',
    ],
    correct: 1,
  },
  {
    id: 'q9',
    type: 'true_false',
    question: 'Verification duties should rotate hourly during high-volume events to reduce fatigue and errors.',
    correct: true,
  },
  {
    id: 'q10',
    type: 'multiple_select',
    question: 'Which red lines must dispatchers follow when handling disinformation?',
    options: [
      'Never share unverified reports, even in private channels',
      'Never confirm operational details while debunking reports',
      'Keep verification methods discreet to avoid exploitation',
      'Always call out suspected individuals publicly to warn others',
    ],
    correct: [0, 1, 2],
  },
];
