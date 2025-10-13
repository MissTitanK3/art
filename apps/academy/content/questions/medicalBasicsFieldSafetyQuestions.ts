import { Question } from '@/components/mdx/QustionRenderer';

export const medicalBasicsFieldSafetyQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'Why is basic medical training essential for field volunteers, even if they are not certified medics?',
    options: [
      'It helps them replace professional medics entirely',
      'It allows them to stabilize life-threatening conditions until EMS or trained medics arrive',
      'It ensures they can diagnose complex conditions on the spot',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question:
      'Bright, spurting bleeding indicates a venous bleed and should only be treated with pressure, not a tourniquet.',
    correct: false,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which actions are correct for controlling severe bleeding?',
    options: [
      'Apply firm direct pressure to the wound first',
      'Pack the wound if pressure alone is not enough',
      'Apply a tourniquet only if bleeding cannot be controlled by other means',
      'Never mark the time a tourniquet is applied',
    ],
    correct: [0, 1, 2],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'What is the first triage indicator in the RPM method?',
    options: ['Respiration', 'Pulse', 'Mentation'],
    correct: 0,
  },
  {
    id: 'q5',
    type: 'true_false',
    question: 'Milk is recommended for flushing eyes exposed to pepper spray or tear gas.',
    correct: false,
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    question:
      'In triage, someone breathing over 30 breaths per minute with a weak radial pulse and unable to follow commands is categorized as:',
    options: ['Green (walking wounded)', 'Yellow (delayed but stable)', 'Red (immediate)'],
    correct: 2,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'What are proper steps when assisting someone with chemical exposure?',
    options: [
      'Move them to fresh air and remove contaminated clothing',
      'Flush eyes with copious water or saline',
      'Apply oils or lotions to soothe skin irritation',
      'Assist with an inhaler if prescribed and symptoms persist',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'When practicing Stop the Bleed and CPR skills, how often should volunteers refresh their training?',
    options: ['Annually, at minimum', 'Every six months', 'Quarterly (every 3 months) with a partner or buddy'],
    correct: 2,
  },
  {
    id: 'q9',
    type: 'true_false',
    question:
      'Field volunteers should always document the care they provide, including times and actions taken, for legal and medical handoff.',
    correct: true,
  },
  {
    id: 'q10',
    type: 'multiple_select',
    question: 'Which items should be carried in a basic personal field first-aid kit?',
    options: [
      'Gloves, gauze, and saline',
      'Personal protective equipment (masks, eye protection)',
      'Advanced surgical tools for invasive procedures',
      'Reference cards for tourniquet and triage steps',
    ],
    correct: [0, 1, 3],
  },
];
