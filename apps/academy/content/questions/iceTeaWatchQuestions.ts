import { Question } from '@/components/mdx/QustionRenderer';

export const iceTeaWatchQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the main purpose of ICE Tea Watch?',
    options: [
      'To identify people without legal immigration status',
      'To empower communities to observe and report ICE activity safely',
      'To broadcast live ICE raids for public viewing',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'You must log in or create an account to use ICE Tea Watch.',
    correct: false,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which of the following are valid types of ICE Tea Watch reports?',
    options: [
      'Unmarked vans parked outside homes or businesses',
      'Agents detaining people at bus stops or grocery stores',
      'Rumors shared on Facebook about an upcoming ICE raid',
      'Surveillance presence near community gathering spots',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q4',
    type: 'true_false',
    question: 'Sharing unverifiable secondhand reports can create confusion or fear.',
    correct: true,
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    question: 'What happens after you submit a report to ICE Tea Watch?',
    options: [
      'It’s automatically shown on the heatmap with no review',
      'It’s filtered for spam and reviewed by a verifier before publishing',
      'It’s sent to ICE for investigation',
    ],
    correct: 1,
  },
  {
    id: 'q6',
    type: 'true_false',
    question: 'Photos you submit may include metadata like time and location unless removed.',
    correct: true,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'What safety tips should you follow while reporting?',
    options: [
      'Only record media if it’s safe to do so',
      'Avoid direct contact with agents or law enforcement',
      'Report only what you personally observe',
      'Include your name and phone in case someone needs to follow up',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'What’s a safe action to take if you suspect ICE presence but can’t confirm?',
    options: [
      'Don’t report unless you’re 100% sure it’s ICE',
      'Report with the clearest detail you can provide and let verifiers handle it',
      'Approach the agents and ask for their agency',
    ],
    correct: 1,
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    question: 'Which platform allows you to report anonymously and without logging in?',
    options: ['ICE Tea Dispatch', 'ICE Tea Watch', 'ICE internal hotline'],
    correct: 1,
  },
  {
    id: 'q10',
    type: 'multiple_choice',
    question: 'Why are community-submitted reports valuable to ICE Tea Watch?',
    options: [
      'They inform ICE when operations are disrupted',
      'They create fear to keep people indoors',
      'They help others stay safe and allow communities to respond quickly',
    ],
    correct: 2,
  },
];
