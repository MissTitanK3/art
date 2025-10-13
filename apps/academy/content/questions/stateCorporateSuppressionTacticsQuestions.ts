import { Question } from '@/components/mdx/QustionRenderer';

export const stateCorporateSuppressionTacticsQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'Why is it important for pods to understand state and corporate suppression tactics?',
    options: [
      'Because these tactics are rare and mostly historic, with little relevance today',
      'Because recognizing infiltration, surveillance, and disinformation helps movements survive and maintain trust',
      'Because it allows pods to accuse anyone acting strangely without evidence',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question:
      'Modern suppression tactics include predictive policing, facial recognition at protests, and bot-driven disinformation campaigns.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which signs may indicate infiltration or agent provocateur behavior?',
    options: [
      'Consistently pushing for unnecessary risk or illegal escalation',
      'Over-eagerness to take on sensitive roles like finances or logistics',
      'Creating interpersonal conflicts or spreading rumors',
      'Quietly asking how they can help with low-risk tasks',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'If a pod suspects surveillance from strange vehicles or individuals, what is the correct first step?',
    options: [
      'Publicly accuse the suspected parties immediately',
      'Document patterns, license plates, and alter routes quietly',
      'Ignore the behavior until there is definitive proof',
    ],
    correct: 1,
  },
  {
    id: 'q5',
    type: 'true_false',
    question: 'Controlled burn techniques involve feeding harmless false info to suspected sources to test for leaks.',
    correct: true,
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    question: 'What is the purpose of compartmentalization in security practices?',
    options: [
      'To isolate suspected infiltrators completely from the group without cause',
      'To ensure people only have access to the information they need, reducing risk if compromised',
      'To make operations more secretive for its own sake',
    ],
    correct: 1,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'Which digital practices help mitigate modern surveillance and manipulation?',
    options: [
      'Using encrypted apps like Signal or Matrix',
      'Regularly posting sensitive operational details online to confuse surveillance',
      'Using VPNs and airplane mode to reduce tracking',
      'Scrubbing metadata from shared images (using tools like ObscuraCam)',
    ],
    correct: [0, 2, 3],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'What should pods avoid when addressing suspicious activity?',
    options: [
      'Documenting behavior discreetly and escalating through leads',
      'Publicly accusing individuals without verifiable evidence and group consensus',
      'Limiting suspected individuals’ access to sensitive roles until a review is done',
    ],
    correct: 1,
  },
  {
    id: 'q9',
    type: 'true_false',
    question:
      'Paranoia can fracture pods faster than real infiltration, so suspicions must be vetted carefully before escalation.',
    correct: true,
  },
  {
    id: 'q10',
    type: 'multiple_select',
    question: 'Which steps build resilience against state and corporate suppression?',
    options: [
      'Verifying identities for sensitive roles',
      'Maintaining a secure log of suspicious behavior',
      'Avoiding public accusations unless evidence is verified',
      'Going fully underground at all times to avoid any visibility',
    ],
    correct: [0, 1, 2],
  },
];
