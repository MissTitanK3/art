import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const childSpecialistQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is your core responsibility as a Child Specialist during a crisis?',
    options: [
      'Explain the situation to the child in detail',
      'Act as a replacement for the child’s caregiver',
      'Help the child feel seen, safe, and supported',
    ],
    correct: 2,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'You should always offer a snack or blanket to comfort a child without asking.',
    correct: false,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which of the following are appropriate trauma responses in children?',
    options: ['Crying or screaming', 'Freezing or going silent', 'Laughing nervously', 'Running away or acting out'],
    correct: [0, 1, 2, 3],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'What is one way to help a child feel grounded during a panic response?',
    options: [
      'Ask them to explain what they’re feeling in detail',
      'Tell them to calm down and stop crying',
      'Offer them something they can see, touch, or smell to focus on',
      'Move them to a quiet place without saying anything',
    ],
    correct: 2,
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    question: 'When supporting a teen who witnessed family separation, your tone should be:',
    options: [
      'Cheerful and reassuring, to lighten the mood',
      'Respectful, calm, and direct',
      'Strict and formal to gain authority',
    ],
    correct: 1,
  },
  {
    id: 'q6',
    type: 'true_false',
    question: 'You may speak to law enforcement about a child if you are trying to help.',
    correct: false,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'Which of the following should you avoid as a Child Specialist?',
    options: [
      'Recording a child’s behavior for documentation',
      'Transporting a child alone',
      'Explaining legal details to a child',
      'Asking if they want to draw or sit with you',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'What’s a safe and supportive phrase you might say to a child in crisis?',
    options: [
      '“Let’s pretend this never happened.”',
      '“You’re safe now. I’m here with you.”',
      '“Stop crying or I can’t help you.”',
      '“Why are you acting like this?”',
    ],
    correct: 1,
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    question: 'If a non-verbal child is curled up and unresponsive during a raid, what is your first step?',
    options: [
      'Try to engage them with questions',
      'Gently announce your presence and speak to their caregiver',
      'Begin filming to document their reaction',
    ],
    correct: 1,
  },
  {
    id: 'q10',
    type: 'true_false',
    question:
      'It is important to never be alone with a child during field support to protect both the child and yourself.',
    correct: true,
  },
  {
    id: 'q11',
    type: 'multiple_choice',
    question: 'How might you adjust support for a Muslim child during Ramadan?',
    options: [
      'Offer candy to help calm them',
      'Avoid offering food or drink without checking with a caregiver first',
      'Make sure they eat something to feel better',
      'Encourage them to join a group activity immediately',
    ],
    correct: 1,
  },
  {
    id: 'q12',
    type: 'multiple_choice',
    question: 'A 3-year-old is crying uncontrollably. What’s a trauma-informed first response?',
    options: [
      'Ask them to calm down and explain what’s wrong',
      'Tell them everything is okay and try to distract them with jokes',
      'Sit nearby, offer a soft toy, and mirror slow breathing',
      'Start filming to assess if the behavior escalates',
    ],
    correct: 2,
  },
  // {
  //   id: 'q13',
  //   type: 'matching',
  //   question: 'Match the field role with its primary responsibility:',
  //   pairs: [
  //     {
  //       prompt: 'De-escalator',
  //       options: ['Offer legal aid', 'Ensure physical safety in tense moments', 'Drive children to shelters'],
  //       correct: 1,
  //     },
  //     {
  //       prompt: 'Legal Observer',
  //       options: ['Document child presence for records', 'Lead aftercare debriefs', 'Translate instructions for kids'],
  //       correct: 0,
  //     },
  //     {
  //       prompt: 'Care Team',
  //       options: ['Provide snacks', 'Coordinate follow-up emotional support', 'Protect from police'],
  //       correct: 1,
  //     },
  //     {
  //       prompt: 'Rideshare / Logistics',
  //       options: ['Escort people from danger', 'Coordinate pickup or family contact', 'Give grounding tools'],
  //       correct: 1,
  //     },
  //   ],
  // },
];
