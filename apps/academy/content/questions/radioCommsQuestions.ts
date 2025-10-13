import { Question } from '@/components/mdx/QustionRenderer';

export const radioCommsQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'Why should you avoid using real names or legal info over radio?',
    options: [
      'To sound more professional',
      'Because radios sometimes malfunction',
      'To reduce risk of identification and protect safety',
    ],
    correct: 2,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'It’s okay to use police or ICE agency names on open radio channels.',
    correct: false,
  },
  {
    id: 'q3',
    type: 'multiple_choice',
    question: 'What is the main purpose of codewords in field communications?',
    options: [
      'To make conversations faster',
      'To protect sensitive information from eavesdroppers',
      'To confuse new team members',
    ],
    correct: 1,
  },
  {
    id: 'q4',
    type: 'multiple_select',
    question: 'Which of the following are examples of strong callsigns?',
    options: ['Red 1', 'Alex B.', 'Blue 4', 'Observer 22', '911Helper'],
    correct: [0, 2, 3],
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    question: 'What does the phrase "Flooded" typically mean over radio?',
    options: [
      'The weather is getting worse',
      'The area has too many people',
      'The location is no longer safe or may be compromised',
    ],
    correct: 2,
  },
  {
    id: 'q6',
    type: 'true_false',
    question: 'Pre-arranged phrases help reduce confusion during stress or chaos.',
    correct: true,
  },
  {
    id: 'q7',
    type: 'multiple_choice',
    question: 'What should you do if someone says “Switch water” over radio?',
    options: ['Drink water', 'Move to a backup or secondary radio channel', 'Go silent for safety'],
    correct: 1,
  },
  {
    id: 'q8',
    type: 'multiple_select',
    question: 'What practices help improve radio discipline in the field?',
    options: [
      'Practicing callouts and responses during drills',
      'Using full legal names to be clear',
      'Keeping a printed callsign/codeword cheat sheet',
      'Making up phrases on the spot',
      'Repeating important messages calmly',
    ],
    correct: [0, 2, 4],
  },
];
