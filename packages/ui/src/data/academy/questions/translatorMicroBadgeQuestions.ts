import { Question } from "@workspace/ui/components/academy/QuestionRenderer";

export const translatorMicroBadgeQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question: "What is the primary purpose of the Translator Micro-Badge?",
    options: [
      "To provide cultural mediation and de-escalation only",
      "To certify bilingual or multilingual volunteers for live translation in field, legal, and coordination settings",
      "To train volunteers to lead pods using multiple languages",
    ],
    correct: 1,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "Translators must pass both a fluency check and a stress-test before active field work.",
    correct: true,
  },
  {
    id: "q3",
    type: "multiple_select",
    question:
      "Which practices ensure accurate and safe translation during actions?",
    options: [
      "Standing in a position where both parties can hear while staying discreet",
      "Using calm, neutral tone and avoiding commentary",
      "Whispering or relaying for privacy when translating sensitive information",
      "Summarizing or “softening” content to avoid upsetting anyone",
    ],
    correct: [0, 1, 2],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question: "How should translators handle attorney-client conversations?",
    options: [
      "Translate only what is directed and never share outside the legal team",
      "Paraphrase the content for the rest of the pod so they understand",
      "Document full details for dispatch so the pod is updated",
    ],
    correct: 0,
  },
  {
    id: "q5",
    type: "true_false",
    question:
      "Taking breaks after 30 minutes of intensive translation helps prevent errors due to fatigue.",
    correct: true,
  },
  {
    id: "q6",
    type: "multiple_choice",
    question: "What should translators carry as part of their standard kit?",
    options: [
      "Offline-capable translation apps, optional noise-reducing ear protection, and a headset for dispatch use",
      "A camera and microphone for recording interactions",
      "Personal notes summarizing conversations for later use",
    ],
    correct: 0,
  },
  {
    id: "q7",
    type: "multiple_select",
    question: "What are examples of key crisis translation phrases?",
    options: [
      '"This person needs medical attention."',
      '"Where does it hurt?"',
      '"You have the right to remain silent."',
      '"Do you want to speak to the press about what happened?"',
    ],
    correct: [0, 1, 2],
  },
  {
    id: "q8",
    type: "multiple_choice",
    question:
      "How should translators respond if someone becomes overwhelmed during translation?",
    options: [
      "Pause or slow down, use a neutral tone, and respect the person’s pace",
      "Continue quickly to avoid interrupting the conversation",
      "Switch to summarizing instead of direct translation",
    ],
    correct: 0,
  },
  {
    id: "q9",
    type: "true_false",
    question:
      "Translators should coordinate directly with dispatchers, field leads, or attorneys when situations escalate.",
    correct: true,
  },
  {
    id: "q10",
    type: "multiple_select",
    question: "Which are red lines for field translators?",
    options: [
      "Adding or omitting details from a translation",
      "Continuing to work while fatigued",
      "Over-sharing sensitive information with bystanders",
      "Taking regular breaks and checking for accuracy under stress",
    ],
    correct: [0, 1, 2],
  },
];
