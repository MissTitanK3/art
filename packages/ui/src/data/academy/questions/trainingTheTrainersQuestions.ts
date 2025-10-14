import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const trainingTheTrainersQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the primary goal of the Training the Trainers course?',
    options: [
      'To centralize teaching within a single pod lead for consistency',
      'To prepare trainers to teach Academy material, mentor members, and build redundancy across pods',
      'To replace existing trainers with Zone Leads for quality control',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'Trainers must always teach the most current Academy version and track deviations with Zone Leads.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which practices help prevent trainer burnout and bottlenecks?',
    options: [
      'Limiting trainers to a maximum of 2 major trainings per month',
      'Mandating a 3-month sabbatical after a year of consistent teaching',
      'Relying on a single trainer to ensure consistency',
      'Always using co-trainers or shadow trainers to build redundancy',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'When adapting Academy lessons for local pods, what is the correct protocol?',
    options: [
      'Improvise freely to fit local needs, as long as core concepts are covered',
      'Document any content changes and review them with Zone Leads before use',
      'Skip alignment checks if the audience is small or informal',
    ],
    correct: 1,
  },
  {
    id: 'q5',
    type: 'true_false',
    question:
      'Trainers are encouraged to improvise outside the certified curriculum if they think it will improve engagement.',
    correct: false,
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    question: 'Which tools should trainers use to make lessons more accessible?',
    options: [
      'Lesson templates, adaptation guides, and multi-format materials like captions and printed handouts',
      'Only verbal instruction, to avoid distractions',
      'Avoiding language or cultural adjustments to maintain standardization',
    ],
    correct: 0,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'What steps should trainers take when running hybrid or field training sessions?',
    options: [
      'Use backup communication channels in case of tech issues',
      'Rely solely on internet-based tools to ensure everyone is connected',
      'Prepare low-tech backups like printouts and analog demos',
      'Plan for contingencies such as weather, safety, or law enforcement presence',
    ],
    correct: [0, 2, 3],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'What is the correct sequence in the Trainer Development Pathway?',
    options: [
      'Co-teach → Shadow sessions → Solo teach → Certification',
      'Identify potential trainer → Shadow sessions → Co-teach → Solo teach with feedback → Certification',
      'Teach solo immediately to accelerate the certification timeline',
    ],
    correct: 1,
  },
  {
    id: 'q9',
    type: 'true_false',
    question: 'Debriefing after every session helps refine delivery and identify future trainers.',
    correct: true,
  },
  {
    id: 'q10',
    type: 'multiple_select',
    question: 'Which responsibilities are part of a certified trainer’s role?',
    options: [
      'Deliver Academy lessons using official templates and guides',
      'Mentor new trainers and match them based on teaching styles',
      'Ensure pods stick to current Academy versions while allowing documented local adaptations',
      'Create entirely new, unsupervised courses for pods without Zone Lead oversight',
    ],
    correct: [0, 1, 2],
  },
];
