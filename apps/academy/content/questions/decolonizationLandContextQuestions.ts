import { Question } from '@/components/mdx/QustionRenderer';

export const decolonizationLandContextQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the core principle behind the statement “Land Back isn’t a metaphor”?',
    options: [
      'It is a symbolic call for awareness without requiring action',
      'It requires material support and actions beyond words or acknowledgments',
      'It only applies to rural or unoccupied areas',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'Giving a land acknowledgment alone is considered sufficient solidarity with Indigenous communities.',
    correct: false,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which are examples of moving from symbolic to material solidarity?',
    options: [
      'Donating a percentage of pod funds to land taxes or Indigenous orgs',
      'Amplifying Indigenous campaigns directly rather than your own branding',
      'Offering shared storage or space access for Indigenous-led efforts',
      'Posting a solidarity graphic on social media without further action',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'Before taking action on contested or Indigenous land, what should a pod do first?',
    options: [
      'Consult local Indigenous communities and research active struggles',
      'Proceed immediately to avoid delays',
      'Host a public acknowledgment event to demonstrate awareness',
    ],
    correct: 0,
  },
  {
    id: 'q5',
    type: 'true_false',
    question:
      'It is acceptable to request free emotional labor or education from Indigenous leaders if your pod supports their causes.',
    correct: false,
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    question: 'What should a pod do if it realizes it has used cultural imagery without permission?',
    options: [
      'Keep using the materials but add a disclaimer',
      'Remove the materials and make a donation to the impacted community',
      'Ignore the issue since intent was positive',
    ],
    correct: 1,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'What are some intersections between Indigenous and migrant justice that pods should be aware of?',
    options: [
      'Border walls desecrate sacred sites like those of the Tohono O’odham Nation',
      'Tribal police may collaborate with ICE on some reservations',
      'Many Indigenous people also face migration challenges, such as Maya communities crossing borders',
      'Indigenous nations universally oppose migrant solidarity efforts',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'Which conflict resolution approach aligns with decolonial pod practices?',
    options: [
      'Using public call-outs to hold members accountable',
      'Relying solely on external authorities for disputes',
      'Using restorative circles instead of punitive measures',
    ],
    correct: 2,
  },
  {
    id: 'q9',
    type: 'true_false',
    question:
      'Pods are encouraged to acknowledge current Indigenous struggles (not just historical ones) during meetings and actions.',
    correct: true,
  },
  {
    id: 'q10',
    type: 'multiple_select',
    question: 'What steps should pods include in their decolonization checklist?',
    options: [
      'Researching active Indigenous land struggles in the area',
      'Compensating Indigenous advisors for time and expertise',
      'Auditing whether their pod occupies contested or sacred land',
      'Adding Indigenous contacts to emergency Signal groups with consent',
    ],
    correct: [0, 1, 2, 3],
  },
];
