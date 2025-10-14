import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const deescalationBasicsQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the core purpose of de-escalation?',
    options: [
      'To win arguments without violence',
      'To calm conflict and reduce harm without control or force',
      'To avoid responsibility by stepping back',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'You should always step in and intervene when you see tension rising.',
    correct: false,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which of the following are body language techniques used in de-escalation?',
    options: [
      'Standing too close to show engagement',
      'Keeping palms open and stance relaxed',
      'Turning slightly to the side to avoid direct confrontation',
      'Crowding the person to gain control',
    ],
    correct: [1, 2],
  },
  {
    id: 'q4',
    type: 'multiple_select',
    question: 'What should you avoid doing when someone is in a fight-or-flight state?',
    options: [
      'Yelling or raising your voice',
      'Touching them without consent',
      'Giving them time and space',
      'Telling them to calm down repeatedly',
      'Using grounding techniques like breathwork',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    question: 'Which response is most likely to escalate a police encounter?',
    options: [
      'Filming from a distance',
      'Asking for badge numbers calmly',
      'Shouting and physically confronting the officer',
    ],
    correct: 2,
  },
  {
    id: 'q6',
    type: 'true_false',
    question: 'Using silence is sometimes a powerful de-escalation tool.',
    correct: true,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'Which verbal techniques support de-escalation?',
    options: [
      'Using “I” statements instead of “you” accusations',
      'Reflecting feelings to show understanding',
      'Speaking quickly to overwhelm the person',
      'Offering simple, clear choices',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'Which situation is a good example of when to avoid direct engagement and call for help instead?',
    options: [
      'A person asking for directions in a quiet park',
      'A group loudly arguing near a store entrance',
      'A visibly armed person threatening someone',
      'A person quietly crying at a bus stop',
    ],
    correct: 2,
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    question: 'What is the best initial response when witnessing a public verbal conflict?',
    options: [
      'Jump in loudly to stop it',
      'Pause, assess safety, and gently check if support is wanted',
      'Record from up close and shout your support',
    ],
    correct: 1,
  },
  {
    id: 'q10',
    type: 'multiple_choice',
    question: 'In a de-escalation context, what does “buying time” mean and why is it important?',
    options: [
      'Delaying police arrival so the person can escape',
      'Stalling to wear the person down emotionally',
      'Creating space for calming, safe choices to emerge',
      'Distracting the person so others can intervene physically',
    ],
    correct: 2,
  },
  {
    id: 'q11',
    type: 'true_false',
    question: 'Direct eye contact is always respectful during de-escalation.',
    correct: false,
  },
  {
    id: 'q12',
    type: 'multiple_choice',
    question: 'What is a helpful first internal step before intervening in a tense situation?',
    options: [
      'Think about what to say first',
      'Decide how to get attention quickly',
      'Assess your emotional state and physical safety',
    ],
    correct: 2,
  },
];
