import { Question } from '@/components/mdx/QustionRenderer';

export const vehicleSpecialistMicroBadgeQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the primary responsibility of a Vehicle Specialist?',
    options: [
      'To coordinate only with logistics leads about supply runs',
      'To drive, stage, and support pod operations with safe vehicles during actions and mutual aid',
      'To serve as the pod’s primary mechanic and vehicle owner',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question:
      'Daily vehicle inspections should include tires, fluids, lights, brakes, and clearing any items that could identify the pod.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which items are required in a Vehicle Specialist’s emergency kit?',
    options: [
      'First-aid kit and blankets',
      'Fire extinguisher and window-break tool',
      'Jumper cables and basic tools',
      'GPS trackers for other pods',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'How should sensitive cargo (like medical supplies or documents) be handled?',
    options: [
      'Load everything into one vehicle for speed and security',
      'Distribute loads across multiple vehicles and conceal them from view',
      'Announce the location and timing of deliveries to the pod publicly for coordination',
    ],
    correct: 1,
  },
  {
    id: 'q5',
    type: 'true_false',
    question: 'Vehicle Specialists must plan at least one primary route and two alternate routes for each deployment.',
    correct: true,
  },
  {
    id: 'q6',
    type: 'multiple_select',
    question: 'Which practices reduce risk of surveillance or interception?',
    options: [
      'Rotating departure times and routes',
      'Using “clean cars” with no pod-identifying stickers or plates',
      'Broadcasting staging locations over Signal groups',
      'Watching for repeated or suspicious vehicles tailing you',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q7',
    type: 'multiple_choice',
    question: 'What is the correct procedure for medical evacuation?',
    options: [
      'Load the patient head-first for easier monitoring, choose the fastest route even if it passes police checkpoints',
      'Park for a quick exit, load the patient feet-first for airway monitoring, and avoid law enforcement zones',
      'Call dispatch for route approval before leaving, regardless of urgency',
    ],
    correct: 1,
  },
  {
    id: 'q8',
    type: 'true_false',
    question:
      'If a vehicle is blocked and there is no pre-planned route, the driver should immediately abandon the vehicle and evacuate on foot.',
    correct: false,
  },
  {
    id: 'q9',
    type: 'multiple_select',
    question: 'What are examples of red lines for Vehicle Specialists?',
    options: [
      'Overloading vehicles or failing to secure cargo',
      'Driving while fatigued or beyond personal skill',
      'Sharing staging locations over unencrypted apps',
      'Using distress code phrases when contacting dispatch',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q10',
    type: 'multiple_choice',
    question: 'When a tail is noticed during a supply run, what is the correct sequence?',
    options: [
      'Call law enforcement for escort, stay on primary route, and increase speed',
      'Switch to an alternate route, notify dispatch with a distress code, divert to a low-visibility safe zone if tail persists',
      'Stop immediately and confront the suspected tail to confirm intentions',
    ],
    correct: 1,
  },
];
