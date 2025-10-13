import { Question } from '@/components/mdx/QustionRenderer';

export const heatmapVerificationQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the primary purpose of the ICE Tea heatmap?',
    options: [
      'To display all ICE sightings regardless of verification',
      'To provide accurate alerts and support coordination',
      'To document historical ICE presence for research',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'You should always prioritize speed over clarity when verifying urgent reports.',
    correct: false,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which of the following are required for a valid report?',
    options: [
      'Specific and real location',
      'Recent timestamp (preferably within 12 hours)',
      'Direct observation or firsthand account',
      'At least two attached media files',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'A report says “ICE is everywhere today” with no location or time. What do you do?',
    options: [
      'Verify and publish immediately due to urgency',
      'Send it back requesting clarification',
      'Mark it as verified with a caution label',
      'Ignore it completely',
    ],
    correct: 1,
  },
  {
    id: 'q5',
    type: 'true_false',
    question: 'You may download and store media from a report for personal use if it might be useful later.',
    correct: false,
  },
  {
    id: 'q6',
    type: 'multiple_select',
    question: 'Which are acceptable actions when reviewing a submitted report?',
    options: [
      'Verify and publish',
      'Send back for clarification',
      'Edit the original report to fix grammar',
      'Mark as unverifiable',
      'Escalate to a senior verifier',
    ],
    correct: [0, 1, 3, 4],
  },
  {
    id: 'q7',
    type: 'multiple_choice',
    question: 'Why should you reverse-image search attached media?',
    options: [
      'To verify authenticity and location match',
      'To check if it’s trending on social media',
      'To look for similar images to add to the report',
    ],
    correct: 0,
  },
  {
    id: 'q8',
    type: 'true_false',
    question: 'EXIF metadata in images can sometimes help confirm timestamps and device location.',
    correct: true,
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    question: 'What’s a red flag that might justify marking a report as unverifiable?',
    options: [
      'Report uses slang or casual tone',
      'Time listed is in the future',
      'Location includes two cross-streets',
    ],
    correct: 1,
  },
  {
    id: 'q10',
    type: 'multiple_choice',
    question: 'What core principle should guide every verifier?',
    options: [
      'Post all urgent reports to avoid delays',
      'Protect public trust through careful, ethical review',
      'Favor reports that sound emotionally compelling',
    ],
    correct: 1,
  },
];
