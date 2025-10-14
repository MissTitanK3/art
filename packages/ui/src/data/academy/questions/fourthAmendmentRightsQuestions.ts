import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const fourthAmendmentRightsQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the central protection provided by the Fourth Amendment?',
    options: [
      'Freedom of speech and assembly',
      'Protection from unreasonable searches and seizures',
      'Right to remain silent during questioning',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'Police can always frisk someone after a stop without suspicion, according to Sibron v. NY.',
    correct: false,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which rulings define when officers can order drivers or passengers out of a vehicle?',
    options: ['Pennsylvania v. Mimms', 'Maryland v. Wilson', 'Commonwealth v. Gonsalves', 'Carroll v. US'],
    correct: [0, 1, 2],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'Which Supreme Court case held that sobriety checkpoints are constitutional?',
    options: ['Indianapolis v. Edmond', 'Michigan v. Sitz', 'Illinois v. Lidster'],
    correct: 1,
  },
  {
    id: 'q5',
    type: 'true_false',
    question: 'Border searches carry the same expectation of privacy as searches conducted away from borders.',
    correct: false,
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    question: 'Under Schneckloth v. Bustamonte, what makes consent to a search valid?',
    options: [
      'It must be fully informed and documented in writing',
      'It must be voluntary, but doesn’t have to be fully informed',
      'It is valid only if given by all occupants present',
    ],
    correct: 1,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'Which rulings restrict warrantless searches during or after an arrest?',
    options: [
      'Chimel v. California (grabbable area only)',
      'Riley v. California (phones need a warrant)',
      'Knowles v. Iowa (citation ≠ search permission)',
      'Maryland v. King (DNA swabs before arraignment)',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'Which case allows warrantless searches of cars if they are mobile and there is probable cause?',
    options: ['Carroll v. US', 'Wyoming v. Houghton', 'South Dakota v. Opperman'],
    correct: 0,
  },
  {
    id: 'q9',
    type: 'true_false',
    question: 'Inventory searches of impounded vehicles are always lawful, even without a standard policy.',
    correct: false,
  },
  {
    id: 'q10',
    type: 'multiple_select',
    question: 'Which rulings set limits or permissions for invasive searches and detention conditions?',
    options: [
      'U.S. v. Montoya de Hernandez (body cavity searches need suspicion)',
      'Maryland v. King (DNA swabs allowed after arraignment)',
      'Florence v. Freeholders (strip searches upheld for all arrests)',
      'Cupp v. Murphy (short-lived evidence can justify quick action)',
    ],
    correct: [0, 1, 2, 3],
  },
];
