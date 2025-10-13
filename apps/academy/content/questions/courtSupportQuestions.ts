import { Question } from '@/components/mdx/QustionRenderer';

export const courtSupportQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the most important role of a court supporter during a hearing?',
    options: [
      'To offer legal advice',
      'To speak on behalf of the person in court',
      'To sit silently and offer steady presence',
    ],
    correct: 2,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'You should always ask the person if they want you to attend court before showing up.',
    correct: true,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which of the following actions are appropriate during a court hearing?',
    options: [
      'Silently sitting and making eye contact with the supported person',
      'Writing down notes on what’s said in court',
      'Filming or recording parts of the hearing for documentation',
      'Reacting visibly to injustice to show disapproval',
    ],
    correct: [0, 1],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'What’s one appropriate way to support someone having an emotional reaction after court?',
    options: [
      'Offer grounding and ask if they want to talk or take space',
      'Tell them to calm down so you can plan next steps',
      'Let’s focus on the positive instead of being upset',
      'Ask them to share everything that happened in court right away',
    ],
    correct: 0,
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    question: 'What’s a key difference between immigration and criminal court?',
    options: [
      'Immigration court always provides a public defender',
      'Criminal court only deals with non-citizens',
      'Immigration court often lacks interpreters and public defenders',
    ],
    correct: 2,
  },
  {
    id: 'q6',
    type: 'true_false',
    question: 'You can post about a person’s court hearing on social media as long as you’re showing support.',
    correct: false,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'What should you prepare before attending court support?',
    options: [
      'Time and courtroom number',
      'Names and pronouns of the person you’re supporting',
      'A protest sign and camera',
      'Whether it’s an immigration or criminal case',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q8',
    type: 'true_false',
    question:
      'Dressing respectfully during court support helps prevent drawing unwanted attention and shows solidarity with impacted people.',
    correct: true,
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    question: 'If you arrive and the courtroom is too full, what should you do?',
    options: [
      'Leave the courthouse entirely',
      'Try to squeeze in anyway',
      'Show support by staying visible in the hallway or outside',
    ],
    correct: 2,
  },
  {
    id: 'q10',
    type: 'multiple_choice',
    question: 'What should you avoid doing after a court hearing unless you’re legally trained?',
    options: [
      'Giving legal advice or interpreting the outcome',
      'Offering to walk someone home',
      'Asking how they felt about the hearing',
      'Connecting them to a support group',
    ],
    correct: 0,
  },
  {
    id: 'q11',
    type: 'multiple_choice',
    question:
      'A family brings culturally significant items (e.g., incense, cloths) to court. What is your best response?',
    options: [
      'Hold the items and explain why they’re not allowed',
      'Encourage them to hide the items discreetly',
      'Respect their ritual, and alert them gently if something might be flagged by security',
    ],
    correct: 2,
  },
  {
    id: 'q12',
    type: 'multiple_choice',
    question: 'If ICE arrests someone outside the courthouse, what should you do first?',
    options: [
      'Start filming immediately to gather evidence',
      'Alert the legal support hotline or designated contact person',
      'Chase ICE to get a license plate and broadcast on social media',
    ],
    correct: 1,
  },
];
