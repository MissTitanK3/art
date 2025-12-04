import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const survivorEscortMicroBadgeQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question: "What is the primary role of a Survivor Escort volunteer?",
    options: [
      "To advocate legally on behalf of the survivor in court",
      "To provide discreet navigation, grounding, and consent-based support in legal and public spaces",
      "To mediate disputes between survivors and legal teams",
    ],
    correct: 1,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "Escorts should always ask for consent before any physical or verbal guidance, even in high-stress situations.",
    correct: true,
  },
  {
    id: "q3",
    type: "multiple_select",
    question: "Which practices demonstrate trauma-informed support?",
    options: [
      "Offering grounding phrases and choices, such as “Would you like me beside or behind you?”",
      "Using pre-agreed signals or exit gestures for comfort",
      "Forcing the survivor to stay in stressful spaces for resilience training",
      "Maintaining awareness of exits and quiet spaces without drawing attention",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question:
      "When entering a courthouse as a Survivor Escort, what is a key preparation step?",
    options: [
      "Ensure you bring personal weapons for protection",
      "Review prohibited items, locate bathrooms, quiet spaces, and emergency exits",
      "Avoid speaking with the legal team to remain impartial",
    ],
    correct: 1,
  },
  {
    id: "q5",
    type: "true_false",
    question:
      "Escorts should share case details and survivor information with other pod members to ensure coordination.",
    correct: false,
  },
  {
    id: "q6",
    type: "multiple_choice",
    question:
      "If a survivor begins showing signs of severe stress (shaking, shallow breathing, blank stare), what is the FIRST appropriate step?",
    options: [
      "Immediately confront anyone nearby who might be causing the stress",
      "Apply grounding techniques with consent, such as 5-4-3-2-1 or breathing cues",
      "Continue to the destination as quickly as possible to get it over with",
    ],
    correct: 1,
  },
  {
    id: "q7",
    type: "multiple_select",
    question: "Which actions help maintain safety and calm during an escort?",
    options: [
      "Walking at a calm, steady pace to avoid drawing attention",
      "Positioning yourself as a buffer if approached aggressively",
      "Using loud verbal commands to deter threats whenever possible",
      "Having a pre-agreed exit plan with the survivor and notifying the legal team if used",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q8",
    type: "multiple_choice",
    question: "Why is “soft navigation” emphasized for Survivor Escorts?",
    options: [
      "To avoid drawing unwanted attention while guiding survivors through security and public areas",
      "Because it is faster than other navigation approaches",
      "So the escort can take control of the survivor’s schedule",
    ],
    correct: 0,
  },
  {
    id: "q9",
    type: "true_false",
    question:
      "Drawing attention to yourself or the survivor in a tense public space can increase risks and intimidation.",
    correct: true,
  },
  {
    id: "q10",
    type: "multiple_select",
    question: "Which steps are part of proper post-escort follow-up?",
    options: [
      "Debriefing with the survivor to identify follow-up needs",
      "Debriefing with the legal team when appropriate",
      "Posting details of the escort online for community awareness",
      "Refining support protocols based on lessons learned",
    ],
    correct: [0, 1, 3],
  },
];
