import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const respondingToDispatchCallsQuestions: Question[] = [
  {
    id: "rdc-q1",
    type: "multiple_choice",
    question: "Where are ICE Tea dispatch calls typically sent?",
    options: [
      "Instagram DMs",
      "Email lists",
      "Signal threads or dispatch apps",
      "Public Telegram channels",
    ],
    correct: 2,
  },
  {
    id: "rdc-q2",
    type: "multiple_select",
    question: "What should you include in your response if you’re available?",
    options: [
      "Estimated arrival time",
      "Memes to boost morale",
      "Your preferred role or skills",
      "A voice memo with full commentary",
    ],
    correct: [0, 2],
  },
  {
    id: "rdc-q3",
    type: "true_false",
    question:
      "You should only respond to a call if you feel stable, prepared, and clear about your role.",
    correct: true,
  },
  {
    id: "rdc-q4",
    type: "multiple_choice",
    question: "What’s one way to prepare in advance for a call-up?",
    options: [
      "Keep a go kit with supplies and secure tools",
      "Write a public Facebook post about your readiness",
      "Forward every Signal message to your friends",
      "Assume dispatch will always call you first",
    ],
    correct: 0,
  },
];
