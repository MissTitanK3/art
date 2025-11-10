import { Question } from "@workspace/ui/components/academy/QuestionRenderer";

export const adminToolsQuestions: Question[] = [
  {
    id: "admin-q1",
    type: "multiple_choice",
    question:
      "What is one valid reason for manually creating a dispatch as an Admin?",
    options: [
      "You want to test the interface",
      "You’re bored and want to see how it works",
      "You received a trusted and urgent intel that needs immediate action",
      "You saw a vague post online with no source",
    ],
    correct: 2,
  },
  {
    id: "admin-q2",
    type: "true_false",
    question: "Admins can assign and change user trust levels.",
    correct: true,
  },
  {
    id: "admin-q3",
    type: "multiple_select",
    question: "Which of the following are actions Admins can take?",
    options: [
      "View and export dispatch logs",
      "Change other Admins’ passwords",
      "Set and manage coverage zones",
      "Approve or reject user-submitted reports",
    ],
    correct: [0, 2, 3],
  },
  {
    id: "admin-q4",
    type: "multiple_choice",
    question: "What should you do before adjusting a user’s trust level?",
    options: [
      "Check their certification and referral history",
      "Wait until you meet them in person",
      "Ask them to pay a donation",
      "Assign them a care station role first",
    ],
    correct: 0,
  },
  {
    id: "admin-q5",
    type: "true_false",
    question: "Coverage zones can only be based on counties or static cities.",
    correct: false,
  },
  {
    id: "admin-q6",
    type: "multiple_select",
    question: "What guidelines should Admins follow when reviewing reports?",
    options: [
      "Approve all reports automatically",
      "Remove duplicates or spam",
      "Document why a report was rejected",
      "Delete reports with offensive content without a log entry",
    ],
    correct: [1, 2],
  },
  {
    id: "admin-q7",
    type: "multiple_choice",
    question: "Why is it important to maintain logs and exports?",
    options: [
      "To prepare for police audits",
      "To punish people who make mistakes",
      "To support internal accountability and system improvement",
      "To generate content for social media",
    ],
    correct: 2,
  },
  {
    id: "admin-q8",
    type: "true_false",
    question:
      "Admins should only use their access to support safety and clarity — not control.",
    correct: true,
  },
];
