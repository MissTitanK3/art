import { Question } from "@workspace/ui/components/academy/QuestionRenderer";

export const signalTipsQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question: "Why is Signal considered more secure than SMS or email?",
    options: [
      "It uses end-to-end encryption and doesn’t store messages on cloud servers",
      "It charges for extra encryption features",
      "It only works on burner phones",
    ],
    correct: 0,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "Signal automatically strips location and EXIF data from photos you send.",
    correct: true,
  },
  {
    id: "q3",
    type: "multiple_choice",
    question:
      "What is the best way to register for Signal if you want to stay anonymous?",
    options: [
      "Use your primary personal phone number for convenience",
      "Register with a VoIP or burner SIM not tied to your identity",
      "Use your work phone number since it’s already on record",
    ],
    correct: 1,
  },
  {
    id: "q4",
    type: "multiple_select",
    question: "Which features help protect your privacy on Signal?",
    options: [
      "Registration Lock PIN",
      "Disappearing Messages",
      "Screen Security (blocks screenshots)",
      "Saving all messages to Google Drive",
    ],
    correct: [0, 1, 2],
  },
  {
    id: "q5",
    type: "multiple_choice",
    question: "What’s the purpose of linking a Signal desktop client?",
    options: [
      "It lets you type and share files more easily while still encrypted",
      "It removes the need to use a phone at all",
      "It disables encryption for faster messaging",
    ],
    correct: 0,
  },
  {
    id: "q6",
    type: "true_false",
    question:
      "Signal groups automatically reveal every member’s phone number to each other.",
    correct: false,
  },
  {
    id: "q7",
    type: "multiple_choice",
    question:
      "How can you send a mass alert without revealing everyone’s identity?",
    options: [
      "Use Signal Broadcast Lists or forward messages manually instead of big groups",
      "Create a 1,000-person group and mute it",
      "Use email lists synced to Signal",
    ],
    correct: 0,
  },
  {
    id: "q8",
    type: "multiple_select",
    question:
      "Which practices improve security for high-risk pods and dispatchers?",
    options: [
      "Rotating burner numbers every 6–12 months",
      "Verifying safety numbers with trusted members",
      "Keeping disappearing messages off for permanent records",
      "Restarting Signal regularly to clear cached keys",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q9",
    type: "multiple_choice",
    question: "What is one situation where you should avoid using Signal?",
    options: [
      "When you need permanent records for legal or archival reasons",
      "When you want to encrypt media or calls",
      "When you want to use disappearing messages",
    ],
    correct: 0,
  },
  {
    id: "q10",
    type: "true_false",
    question:
      "Changing your phone’s notification settings so “Signal” shows as “Calendar” can help disguise sensitive chats.",
    correct: true,
  },
];
