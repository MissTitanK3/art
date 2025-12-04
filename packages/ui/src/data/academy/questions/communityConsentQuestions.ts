import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const communityConsentQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question: "What question lies at the heart of community consent?",
    options: [
      "Who has the loudest voice in the room?",
      "Who is affected, and did they ask for this?",
      "Can we act quickly and efficiently?",
    ],
    correct: 1,
  },
  {
    id: "q2",
    type: "true_false",
    question: "Community consent ends once someone says “yes.”",
    correct: false,
  },
  {
    id: "q3",
    type: "multiple_select",
    question: "Which are valid forms of violating community consent?",
    options: [
      "Organizing a vigil in someone’s name without checking with them",
      "Filming a raid without input from affected families",
      "Providing aid only after a formal written agreement",
      "Launching patrols without coordinating with local groups",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q4",
    type: "true_false",
    question:
      "If a family or group directly asks you not to show up, you should respect their wishes and not go.",
    correct: true,
  },
  {
    id: "q5",
    type: "multiple_choice",
    question: "What does “meaningful” consent mean?",
    options: [
      "Consent gathered only from leadership",
      "Consent assumed from silence",
      "Consent offered freely, with room to say no",
    ],
    correct: 2,
  },
  {
    id: "q6",
    type: "true_false",
    question: "You can act “for the community” as long as you mean well.",
    correct: false,
  },
  {
    id: "q7",
    type: "multiple_select",
    question:
      "Which of the following are tools for practicing community consent?",
    options: [
      "Consent checkpoints during actions",
      "Power mapping affected communities",
      "Requiring notarized forms from community members",
      "Advisory councils of impacted people",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q8",
    type: "multiple_choice",
    question:
      "Why is informed consent not always the same as meaningful consent?",
    options: [
      "Because people might say yes just to avoid conflict, even if they’re uncomfortable.",
      "Because consent can only be given in writing.",
      "Because verbal consent is legally invalid.",
      "Because people always need a translator to give consent.",
    ],
    correct: 0,
  },
  {
    id: "q9",
    type: "multiple_choice",
    question: "If consent is unclear, what should your default action be?",
    options: [
      "Act anyway to avoid losing momentum",
      "Pause and clarify with trusted local voices",
      "Let media drive the narrative",
    ],
    correct: 1,
  },
  {
    id: "q10",
    type: "multiple_select",
    question:
      "Which of the following are ways community consent applies in the ICE Tea ecosystem? (Select all that apply)",
    options: [
      "Not entering a neighborhood if the local mutual aid group says no",
      "Asking before sharing sensitive footage even if it’s legally allowed",
      "Assuming consent if someone doesn’t say no",
      "Building shared agreements about what kind of help is wanted",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q11",
    type: "true_false",
    question:
      "Consent from a single community leader always represents the whole group.",
    correct: false,
  },
  {
    id: "q12",
    type: "multiple_choice",
    question:
      "What is a key limitation of only providing consent forms in English?",
    options: [
      "It reduces legal protection for the organizers",
      "It prevents meaningful understanding for non-English speakers",
      "It’s less professional looking",
      "It violates national law",
    ],
    correct: 1,
  },
  // {
  //   id: 'q13',
  //   type: 'matching',
  //   question: 'Match the violation with an appropriate repair action:',
  //   pairs: [
  //     {
  //       prompt: 'Filmed someone at an action without consent',
  //       options: [
  //         'Ignore it unless they complain',
  //         'Delete footage, apologize, and notify team lead',
  //         'Use the footage but blur their face',
  //       ],
  //       correct: 1,
  //     },
  //     {
  //       prompt: 'Launched a support patrol without local input',
  //       options: [
  //         'Host a listening session and offer to adapt or step back',
  //         'Keep going unless someone intervenes',
  //         'Send more volunteers to gain support',
  //       ],
  //       correct: 0,
  //     },
  //     {
  //       prompt: 'Planned an event in someone’s name without asking',
  //       options: [
  //         'Change the name and issue a public apology',
  //         'Say it was well-intentioned and continue',
  //         'Blame miscommunication',
  //       ],
  //       correct: 0,
  //     },
  //   ],
  // },
];
