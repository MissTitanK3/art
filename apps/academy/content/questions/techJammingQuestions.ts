import { Question } from '@/components/mdx/QustionRenderer';

export const techJammingQuestions: Question[] = [
  {
    id: 'techjam-q1',
    type: 'multiple_choice',
    question: 'What is the primary purpose of using a Faraday bag in field operations?',
    options: [
      'To boost cell signal in low coverage areas',
      'To store documents securely',
      'To block all wireless signals to/from a device',
      'To reduce weight while transporting electronics',
    ],
    correct: 2,
  },
  {
    id: 'techjam-q2',
    type: 'true_false',
    question: 'It is legally acceptable to jam public emergency communication channels during high-risk protests.',
    correct: false,
  },
  {
    id: 'techjam-q3',
    type: 'multiple_select',
    question: 'Which of the following are wireless surveillance threats a Tech Jammer may need to detect?',
    options: [
      'IMSI catchers (Stingrays)',
      'Bluetooth sniffers',
      'WiFi injection attacks',
      'Firewall port scans',
      'Geofencing alerts',
    ],
    correct: [0, 1, 2, 4],
  },
  {
    id: 'techjam-q4',
    type: 'multiple_select',
    question: 'Which of the following are best practices for tech jammers during field deployment?',
    options: [
      'Use airplane mode or remove SIMs on active devices',
      'Pre-test mesh radios and fallback gear',
      'Leave radios unattended for signal scanning',
      'Lock and shield unused gear',
      'Share jammers with untrained volunteers',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'techjam-q5',
    type: 'multiple_choice',
    question: 'You detect an IMSI catcher in the protest zone. What is your correct first action?',
    options: [
      'Notify team leads and activate fallback comms',
      'Begin livestreaming to expose surveillance',
      'Ignore it unless people are being arrested',
      'Send group texts telling others to be careful',
    ],
    correct: 0,
  },
  {
    id: 'techjam-q6',
    type: 'true_false',
    question: 'Using VPNs with kill switches can help reduce the risk of data leaks when devices disconnect suddenly.',
    correct: true,
  },
  {
    id: 'techjam-q7',
    type: 'multiple_choice',
    question: 'What is one ethical post-action step Tech Jammers should take?',
    options: [
      'Upload disruption logs to a public transparency page',
      'Leave jamming tools powered on for reuse',
      'Wipe logs and rotate credentials before storing gear',
      'Use the same devices at the next action to avoid reconfiguring',
    ],
    correct: 2,
  },
  {
    id: 'techjam-q8',
    type: 'multiple_choice',
    question: 'When is a mesh radio network preferable to cellular communication?',
    options: [
      'When streaming video to large groups',
      'When cellular networks are jammed or monitored',
      'When communicating between cities',
      'When archiving encrypted conversations',
    ],
    correct: 1,
  },
  {
    id: 'techjam-q9',
    type: 'multiple_choice',
    question: 'How can you improvise a Faraday shield for a phone if a bag is unavailable?',
    options: [
      'Wrap it in aluminum foil and place it in a metal container',
      'Submerge it in water for 10 seconds',
      'Leave it under a running car engine',
      'Lock it in a wooden drawer',
    ],
    correct: 0,
  },
  {
    id: 'techjam-q10',
    type: 'multiple_choice',
    question: 'You suspect a volunteer is being tracked. What is the safest first step?',
    options: [
      'Destroy their phone immediately',
      'Place the phone in a Faraday bag or turn on airplane mode',
      'Give the phone to someone else to carry',
      'Continue using the phone but switch to a secure app',
    ],
    correct: 1,
  },
];
