import { Question } from "@workspace/ui/components/academy/QuestionRenderer";

export const abolitionEthicsQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question: "What is the primary ethical stance of abolition?",
    options: [
      "That punishment is necessary for justice",
      "That some people need to be removed from society",
      "That no one is disposable",
    ],
    correct: 2,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "Abolition ethics believe violence can be a necessary form of justice.",
    correct: false,
  },
  {
    id: "q3",
    type: "multiple_select",
    question:
      "Which of the following are examples of life-affirming alternatives to policing and prisons?",
    options: [
      "Healing circles",
      "Crisis response teams",
      "Deportation flights",
      "Mutual aid networks",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question: "Why do abolitionists reject reform as a long-term solution?",
    options: [
      "Reforms distract from systemic change",
      "Reforms are illegal under U.S. law",
      "Abolitionists are unwilling to negotiate",
    ],
    correct: 0,
  },
  {
    id: "q5",
    type: "multiple_choice",
    question:
      "Why do abolitionists often oppose institutions like ICE, police, and prisons?",
    options: [
      "They believe these institutions create safety and order",
      "They believe these institutions protect vulnerable communities",
      "They believe these institutions cause harm and uphold systemic oppression",
      "They believe these institutions are underfunded and need more support",
    ],
    correct: 2,
  },
  {
    id: "q6",
    type: "true_false",
    question:
      "Accountability in abolitionist practice means punishing someone for the harm they caused.",
    correct: false,
  },
  {
    id: "q7",
    type: "multiple_choice",
    question:
      "What does the quote “Abolition is about presence, not absence” mean?",
    options: [
      "It means we should keep the systems in place but reform them",
      "It emphasizes creating new structures that support life and care",
      "It suggests that abolishing institutions is enough",
    ],
    correct: 1,
  },
  {
    id: "q8",
    type: "multiple_choice",
    question:
      "In abolitionist practice, what does “building in the negative” mean?",
    options: [
      "Creating reforms to improve existing institutions like police or ICE",
      "Building entirely new systems by identifying what we don’t want and refusing to replicate it",
      "Eliminating all forms of community organization and governance",
      "Focusing only on protests and not on long-term infrastructure",
    ],
    correct: 1,
  },
  {
    id: "q9",
    type: "multiple_select",
    question: "Which practices reflect abolitionist values?",
    options: [
      "Using surveillance to track behavior",
      "Building mutual aid networks",
      "Calling for de-escalators instead of police",
      "Shaming people publicly for mistakes",
    ],
    correct: [1, 2],
  },
  {
    id: "q10",
    type: "true_false",
    question:
      "The ICE Tea ecosystem integrates abolitionist values into its design and operations.",
    correct: true,
  },
  {
    id: "q11",
    type: "multiple_choice",
    question:
      "Which of the following is NOT a historical influence on modern abolition?",
    options: [
      "The Black Radical Tradition",
      "Indigenous sovereignty movements",
      "Neoliberal economics",
      "Feminist and queer liberatory praxis",
    ],
    correct: 2,
  },
  {
    id: "q12",
    type: "multiple_choice",
    question:
      "What distinguishes transformative justice from punitive justice?",
    options: [
      "It focuses on revenge rather than healing",
      "It avoids addressing harm directly",
      "It centers healing, accountability, and community-based solutions",
    ],
    correct: 2,
  },
];
