import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const aslInterpreterMicroBadgeQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question:
      "What is the primary role of an ASL interpreter during field actions?",
    options: [
      "To advocate for Deaf and hard-of-hearing participants",
      "To provide communication access and stay neutral",
      "To help lead field actions and coordinate protests",
    ],
    correct: 1,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "Interpreters should always wear bright, visible badges to ensure they are easy to identify.",
    correct: false,
  },
  {
    id: "q3",
    type: "multiple_select",
    question:
      "Which of the following are recommended practices for interpreters in loud or low-light environments?",
    options: [
      "Use tactile signing when visual cues fail",
      "Position yourself between the speaker and the DHH person",
      "Shout key phrases to the DHH participant",
      "Use exaggerated facial expressions when needed",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question:
      "What is the correct positioning for an interpreter during a street protest?",
    options: [
      "Directly in front of the speaker and DHH participant",
      "At a 45° angle to both the speaker and DHH participant",
      "Standing on a platform so everyone can see",
    ],
    correct: 1,
  },
  {
    id: "q5",
    type: "true_false",
    question:
      "Interpreters should pause, stabilize, and only resume interpreting once safely positioned in a dense crowd.",
    correct: true,
  },
  {
    id: "q6",
    type: "multiple_choice",
    question:
      "Why is it important to pre-learn legal and crisis vocabulary in ASL?",
    options: [
      "It allows interpreters to editorialize for clarity",
      "It ensures accuracy and speed during high-stress events",
      "It helps interpreters replace complex terms with easier words",
    ],
    correct: 1,
  },
  {
    id: "q7",
    type: "multiple_select",
    question:
      "Which hand signals should interpreters coordinate with field leads?",
    options: [
      "🖐️ = Pause interpretation due to security risk",
      "✊ = Switch to tactile signing",
      "🤙 = Request backup interpreter",
      "👋 = Signal to begin interpreting loudly",
    ],
    correct: [0, 1, 2],
  },
  {
    id: "q8",
    type: "multiple_choice",
    question:
      "What is the recommended interpreter rotation schedule to prevent fatigue?",
    options: ["Every 10 minutes", "Every 20–30 minutes", "Every hour"],
    correct: 1,
  },
  {
    id: "q9",
    type: "true_false",
    question:
      "Interpreters should mirror the speaker’s emotional tone while ensuring the DHH person can still observe their surroundings.",
    correct: true,
  },
  {
    id: "q10",
    type: "multiple_select",
    question:
      "Which items are part of the recommended ASL interpreter field kit?",
    options: [
      "Black gloves for nighttime visibility",
      "Mini notepad for backup communication",
      "Bright yellow vest with “ASL” printed on it",
      "Small flashlight for discreet lighting",
    ],
    correct: [0, 1, 3],
  },
];
