import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const knowYourRightsBasicsQuestions: Question[] = [
  {
    id: "kyr-q1",
    type: "true_false",
    question:
      "Everyone in the U.S., regardless of immigration status, has constitutional rights.",
    correct: true,
  },
  {
    id: "kyr-q2",
    type: "multiple_choice",
    question:
      "What kind of warrant must ICE present to enter your home without permission?",
    options: [
      "Verbal warrant from any agent",
      "Administrative ICE warrant",
      "Judicial warrant signed by a judge",
    ],
    correct: 2,
  },
  {
    id: "kyr-q3",
    type: "multiple_select",
    question:
      "Which of the following are rights you can assert during an encounter?",
    options: [
      "Right to remain silent",
      "Right to demand a search of their vehicle",
      "Right to refuse a search",
      "Right to a lawyer",
      "Right to demand others stop filming you in public",
    ],
    correct: [0, 2, 3],
  },
  {
    id: "kyr-q4",
    type: "multiple_choice",
    question:
      "If law enforcement tries to search your bag without probable cause, what should you say?",
    options: [
      "“It’s okay, just be quick.”",
      "“I do not consent to a search.”",
      "“I’m not hiding anything.”",
    ],
    correct: 1,
  },
  {
    id: "kyr-q5",
    type: "true_false",
    question:
      "An administrative warrant gives ICE legal authority to enter your home by force.",
    correct: false,
  },
  {
    id: "kyr-q6",
    type: "multiple_choice",
    question:
      "What should you do if ICE or police knock on your door without a signed judicial warrant?",
    options: [
      "Open the door and ask why they’re there",
      "Ignore it completely",
      "Say: “I do not consent to entry.”",
    ],
    correct: 2,
  },
  {
    id: "kyr-q7",
    type: "multiple_choice",
    question: "How can you legally check whether you’re being detained?",
    options: [
      "Ask: “Am I being detained, or am I free to go?”",
      "Say nothing and wait for them to speak first",
      "Ask them why they’re wearing uniforms",
    ],
    correct: 0,
  },
  {
    id: "kyr-q8",
    type: "true_false",
    question:
      "If you are undocumented, you still have the right to remain silent.",
    correct: true,
  },
  {
    id: "kyr-q9",
    type: "multiple_select",
    question: "What are safe ways to protect yourself and your community?",
    options: [
      "Carry a KYR card in multiple languages",
      "Log details of any encounter right before it happens",
      "Write a trusted contact’s number on your body",
      "Memorize short rights-based scripts",
    ],
    correct: [0, 2, 3],
  },
  {
    id: "kyr-q10",
    type: "true_false",
    question: "It’s safer to lie to police than to remain silent.",
    correct: false,
  },
  {
    id: "kyr-q11",
    type: "multiple_choice",
    question: "What does a “Stop-and-ID” law allow police to do?",
    options: [
      "Demand immigration status without cause",
      "Require people to carry a passport",
      "Ask for identification if they suspect a crime or if they are in a Stop and ID zone",
      "Search your phone during a traffic stop",
    ],
    correct: 2,
  },
];
