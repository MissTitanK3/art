import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const lawEnforcementInteractionQuestions: Question[] = [
  {
    id: "le-q1",
    type: "multiple_choice",
    question:
      "What should you say if ICE or police approach and you’re unsure of your status?",
    options: [
      "“Am I being detained, or am I free to go?”",
      "“You’re violating my rights!”",
      "“Why are you harassing me?”",
    ],
    correct: 0,
  },
  {
    id: "le-q2",
    type: "true_false",
    question: "You are legally allowed to film ICE or police in public spaces.",
    correct: true,
  },
  {
    id: "le-q3",
    type: "multiple_select",
    question: "Which of the following are protected rights under U.S. law?",
    options: [
      "Right to remain silent",
      "Right to film public officials in public",
      "Right to physically resist if detained unfairly",
      "Right to refuse consent for a search",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "le-q4",
    type: "true_false",
    question:
      "Remaining silent is legally safer than lying to law enforcement.",
    correct: true,
  },
  {
    id: "le-q5",
    type: "multiple_choice",
    question: "What should you do if you witness someone being stopped by ICE?",
    options: [
      "Yell at the officers to stop",
      "Start recording and narrate key facts quietly",
      "Immediately approach and demand an explanation",
    ],
    correct: 1,
  },
  {
    id: "le-q6",
    type: "true_false",
    question: "You must open your door to ICE if they say they have a warrant.",
    correct: false,
  },
  {
    id: "le-q7",
    type: "multiple_select",
    question: "Which are helpful de-escalation phrases?",
    options: [
      "“I’m just here to observe and make sure everyone stays safe.”",
      "“I’m not interfering, just documenting from a legal distance.”",
      "“I know my rights better than you.”",
      "“Can you clarify under what authority you’re asking that?”",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "le-q8",
    type: "multiple_choice",
    question: "What kind of warrant must ICE present to legally enter a home?",
    options: [
      "ICE administrative warrant (Form I-200)",
      "Judicial warrant signed by a judge",
      "Verbal permission from a neighbor",
      "Deportation notice only",
    ],
    correct: 1,
  },
  {
    id: "le-q9",
    type: "multiple_choice",
    question:
      "What is a grounding technique for dealing with panic during an encounter?",
    options: [
      "Run from the scene quickly",
      "Use the 5-4-3-2-1 method to reconnect with your senses",
      "Yell loudly to distract the officers",
    ],
    correct: 1,
  },
  {
    id: "le-q10",
    type: "multiple_choice",
    question:
      "Why should you avoid physically intervening during an ICE or police encounter?",
    options: [
      "Because it might anger the officers",
      "Because it could escalate danger and lead to charges",
      "Because it’s not polite",
    ],
    correct: 1,
  },
  {
    id: "le-q11",
    type: "true_false",
    question: "You have the right to an interpreter during police questioning.",
    correct: true,
  },
  {
    id: "le-q12",
    type: "multiple_choice",
    question:
      "What is a safe and lawful script to say through a door during an ICE home visit?",
    options: [
      "“Come back later.”",
      "“I don’t want any trouble.”",
      "“I do not consent to entry. Please slide the warrant under the door.”",
    ],
    correct: 2,
  },
];
