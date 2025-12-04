import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const createAPodQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question:
      "What is the primary purpose of a pod within the ICE Tea network?",
    options: [
      "To act as a formal branch of ICE Tea with centralized authority",
      "To provide a small, trusted local team for rapid response and mutual aid",
      "To serve as a public-facing recruitment hub for activists",
    ],
    correct: 1,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "Pods must register with ICE Tea and follow strict central directives to be recognized.",
    correct: false,
  },
  {
    id: "q3",
    type: "multiple_select",
    question: "Which of the following are core functions of a pod?",
    options: [
      "Tracking local patterns or threats",
      "Mobilizing field support",
      "Centralizing command decisions for the region",
      "Building trust and safety among local members",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question: "What is the minimum recommended starting size for a pod?",
    options: ["1 person", "2–3 people", "5–10 people"],
    correct: 1,
  },
  {
    id: "q5",
    type: "true_false",
    question:
      "Pod creators get priority support for becoming Verified Dispatchers, but must still complete all required training and trust-building steps.",
    correct: true,
  },
  {
    id: "q6",
    type: "multiple_choice",
    question:
      "What is the recommended disappearing message time range for a new Signal group?",
    options: ["1–2 hours", "6–12 hours", "24 hours"],
    correct: 1,
  },
  {
    id: "q7",
    type: "multiple_select",
    question: "What are some security best practices for pod communication?",
    options: [
      "Never name Signal groups with terms like “ICE”",
      "Use encrypted email services like Proton or Riseup",
      "Forward full chat logs to other pods for context",
      "Delete expired reports and avoid screenshots",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q8",
    type: "multiple_choice",
    question: "How should new pods connect to the wider ICE Tea network?",
    options: [
      "By registering with a central directory",
      "By building relationships and shared protocols through trusted contacts",
      "By applying to a formal approval board",
    ],
    correct: 1,
  },
  {
    id: "q9",
    type: "true_false",
    question:
      "Pods are encouraged to use centralized control to ensure quick decisions across regions.",
    correct: false,
  },
  {
    id: "q10",
    type: "multiple_select",
    question:
      "Which tools and practices help keep pod operations secure and effective?",
    options: [
      "Using Padlock or CryptPad for encrypted document sharing",
      "Assigning a “data cleaner” to purge old reports",
      "Summarizing sensitive info instead of forwarding logs",
      "Making all communications public for transparency",
    ],
    correct: [0, 1, 2],
  },
];
