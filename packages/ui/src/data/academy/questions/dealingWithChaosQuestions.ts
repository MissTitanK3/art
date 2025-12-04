import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const dealingWithChaosQuestions: Question[] = [
  {
    id: "chaos-q1",
    type: "multiple_choice",
    question:
      "What is the most important action when a dispatch operation begins to collapse?",
    options: [
      "Immediately end all communication",
      "Assign blame to the person who caused the issue",
      "Pause, reassess, and communicate clearly using a single channel",
      "Ignore it and hope it stabilizes",
    ],
    correct: 2,
  },
  {
    id: "chaos-q2",
    type: "true_false",
    question:
      "You should always believe what law enforcement tells you during a dispatch.",
    correct: false,
  },
  {
    id: "chaos-q3",
    type: "multiple_choice",
    question: "What is one goal of emotional regulation as a dispatcher?",
    options: [
      "To suppress your emotions entirely",
      "To set a calm tone that others can follow",
      "To show responders that chaos is normal",
      "To avoid taking responsibility for stressful moments",
    ],
    correct: 1,
  },
  {
    id: "chaos-q4",
    type: "multiple_select",
    question:
      "What are some key steps in the Rapid Reassessment Protocol (RRP)?",
    options: [
      "Pause and zoom out",
      "Reassign blame quickly",
      "Communicate clearly through one channel",
      "Update logs to reflect changes",
      "Ignore emotional responses from field teams",
    ],
    correct: [0, 2, 3],
  },
  {
    id: "chaos-q5",
    type: "true_false",
    question:
      "It is ethical to end a dispatch if the conditions on the ground become unsafe or unclear.",
    correct: true,
  },
  {
    id: "chaos-q6",
    type: "multiple_select",
    question: "What should an incident debrief include?",
    options: [
      "What went wrong and what went right",
      "Names of people who failed under pressure",
      "Follow-up needs and care opportunities",
      "System or tool improvements needed",
    ],
    correct: [0, 2, 3],
  },
  {
    id: "chaos-q7",
    type: "multiple_choice",
    question: "Which of these is a useful item in a chaos toolkit?",
    options: [
      "Auto-reply bots for your Signal chats",
      "Prewritten fallback messages for last-minute changes",
      "A backup bodycam",
      "A direct hotline to ICE",
    ],
    correct: 1,
  },
];
