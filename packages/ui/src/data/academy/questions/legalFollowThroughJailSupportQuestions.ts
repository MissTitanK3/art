import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const legalFollowThroughJailSupportQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the primary goal of the legal follow-through and jail support role?',
    options: [
      'To negotiate directly with police to release detained people',
      'To coordinate bail, liaise with lawyers and families, and provide post-release support without compromising security',
      'To provide legal advice to arrestees about their cases',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question:
      'Volunteers in this role should avoid collecting unnecessary personal data and always encrypt case notes.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which actions are part of bail coordination essentials?',
    options: [
      'Only work with trusted or vetted bail funds (2+ pod references)',
      'Use encrypted or bonded payment systems (not personal accounts)',
      'Track detainees using secure spreadsheets with minimal details',
      'Promise bail coverage before confirming available funds',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'What is the recommended **maximum volunteer shift length** for jail support to prevent burnout?',
    options: ['3 hours', '6 hours', '12 hours'],
    correct: 1,
  },
  {
    id: 'q5',
    type: 'true_false',
    question: 'Legal liaisons should freely discuss case details over Signal or phone to keep families fully informed.',
    correct: false,
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    question: 'Which script is appropriate for speaking with attorneys?',
    options: [
      '"We believe these arrests are illegal and want you to get people released immediately."',
      '"We have X individuals arrested at Y location. Can you confirm their status and representation? We are not discussing case facts over this channel."',
      '"We can’t give you any information until we review the case with our pod."',
    ],
    correct: 1,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'What are components of trauma-informed post-release support?',
    options: [
      'Offer water, snacks, warmth, and a calm ride',
      'Ask for consent before touching, hugging, or photographing',
      'Listen without pressing for details or giving legal advice',
      'Immediately debrief them publicly so the pod can learn from their arrest',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'When should pods escalate to outside organizations like the National Lawyers Guild?',
    options: [
      'Only when bail funds are low',
      'If local legal counsel is unavailable or a detainee disappears from tracking',
      'Whenever any arrest occurs, regardless of circumstances',
    ],
    correct: 1,
  },
  {
    id: 'q9',
    type: 'true_false',
    question: 'Volunteers should never promise bail coverage or outcomes they cannot guarantee.',
    correct: true,
  },
  {
    id: 'q10',
    type: 'multiple_select',
    question: 'Which practices are essential for secure and effective legal follow-through?',
    options: [
      'Memorize or securely store local jail intake phone numbers',
      'Work only with vetted bail funds and bonded agents',
      'Keep both encrypted and physical backups of key contact lists',
      'Share full case details over public or unsecured channels for transparency',
    ],
    correct: [0, 1, 2],
  },
];
