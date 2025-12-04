import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const solidarityEconomicsResourceEthicsQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question: "Why do pods often avoid corporate or government funding?",
    options: [
      "Because these sources typically provide too little money to matter",
      "Because such funding can bring surveillance, conditions, and reputational risks",
      "Because grassroots donations are always more reliable",
    ],
    correct: 1,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "Grassroots donations are highly autonomous but can be unpredictable, so building recurring donor circles is recommended.",
    correct: true,
  },
  {
    id: "q3",
    type: "multiple_select",
    question:
      "Which steps help build a transparent yet secure accounting system for pods?",
    options: [
      "Sharing full vendor and recipient details with the public for total transparency",
      "Using blind balance reporting (totals only)",
      "Requiring at least two verifiers for all withdrawals (three-person rule)",
      "Quarterly redacted public reports to maintain trust",
    ],
    correct: [1, 2, 3],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question:
      "What is the first step pods should take before seeking external funding?",
    options: [
      "Identify which foundations offer the most money",
      "Complete a skills and asset inventory to understand existing internal resources",
      "Immediately set up a fiscal sponsorship agreement",
    ],
    correct: 1,
  },
  {
    id: "q5",
    type: "true_false",
    question:
      "Time banks and skill exchanges are examples of alternative economies that can sustain pods without external grants.",
    correct: true,
  },
  {
    id: "q6",
    type: "multiple_choice",
    question:
      "According to the Funding Decision Flow, what should pods do when offered corporate funding?",
    options: [
      "Accept immediately if the amount is large enough",
      "Submit the offer to a pod vote and negotiate terms",
      "Reject immediately, unless it is a life-or-death emergency",
    ],
    correct: 2,
  },
  {
    id: "q7",
    type: "multiple_select",
    question:
      "What should shared infrastructure agreements between pods include?",
    options: [
      "Clear maintenance responsibilities and usage logs",
      "Rules for priority access during overlapping emergencies",
      "Public posting of all shared asset locations for transparency",
      "Repair fund agreements for jointly used equipment",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q8",
    type: "multiple_choice",
    question:
      "Which funding model provides local control and sustainability but takes longer to build?",
    options: [
      "Community-driven economies (time banks, skill trades, local donor circles)",
      "Corporate sponsorships",
      "Foundation grants with fiscal sponsors",
    ],
    correct: 0,
  },
  {
    id: "q9",
    type: "true_false",
    question:
      "Public fundraising should always share sensitive operational details to increase transparency and donor trust.",
    correct: false,
  },
  {
    id: "q10",
    type: "multiple_select",
    question:
      "Which practices help ensure autonomy and safety when funding pods?",
    options: [
      "Never letting one person control all finances or supplies",
      "Using blind balance reporting and verifier systems",
      "Avoiding any funding source that compromises member safety or data",
      "Relying exclusively on foundation grants for predictable funding",
    ],
    correct: [0, 1, 2],
  },
];
