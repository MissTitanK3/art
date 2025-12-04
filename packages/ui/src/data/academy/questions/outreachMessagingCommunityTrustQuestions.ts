import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const outreachMessagingCommunityTrustQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question:
      "What is the correct order for structuring conversations with businesses and community members?",
    options: [
      "Tools → Safety First → How They Can Help → Local Updates → Close",
      "Safety First → Local Updates → Tools With Optional Demo → How They Can Help → Unapologetic Close",
      "Local Updates → Safety First → Unapologetic Close → Tools → How They Can Help",
    ],
    correct: 1,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "Field teams should be able to deliver both a 30-second and 2-minute version of their outreach pitch without notes.",
    correct: true,
  },
  {
    id: "q3",
    type: "multiple_select",
    question:
      "Which items should every field team carry during outreach actions?",
    options: [
      "Flyers and Know Your Rights red cards",
      "A demo device for showing ICE Tea Tools",
      "A portable speaker for broadcasting announcements",
      "A clipboard or secure method for logging leads",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question:
      "What is the recommended response if a business owner or community member reacts negatively or becomes hostile?",
    options: [
      "Stand your ground and argue your case until they understand",
      "Stay calm, de-escalate, exit safely, log the interaction, and reconnect later if appropriate",
      "Call law enforcement immediately to report harassment",
    ],
    correct: 1,
  },
  {
    id: "q5",
    type: "true_false",
    question:
      "The “Unapologetic Close” (“Fuck ICE”) should be used at the start of the conversation to signal the team’s stance strongly.",
    correct: false,
  },
  {
    id: "q6",
    type: "multiple_choice",
    question:
      "What is the main purpose of the Bailout Protocol in this outreach context?",
    options: [
      "To quickly organize bail money for detained team members",
      "To guide safe disengagement and protect the team if interactions become hostile",
      "To alert other pods of a hostile business immediately",
    ],
    correct: 1,
  },
  {
    id: "q7",
    type: "multiple_select",
    question: "What are the correct steps in the Bailout Protocol?",
    options: [
      "Stay calm and neutral without escalating",
      "De-escalate with a short exit line (e.g., “Understood, we’ll move along. Stay safe.”)",
      "Exit the area quickly and move to a new location",
      "Publicly post the hostile location online to warn others",
      "Log the interaction internally and consider reconnecting later with a different team member",
    ],
    correct: [0, 1, 2, 4],
  },
  {
    id: "q8",
    type: "multiple_choice",
    question:
      "Why is it important to keep the five-step conversation structure consistent across all team members?",
    options: [
      "It reduces the need for printed materials",
      "It makes the outreach feel coordinated and trustworthy, even with multiple team members",
      "It helps field teams avoid using flyers or demo tools",
    ],
    correct: 1,
  },
  {
    id: "q9",
    type: "true_false",
    question:
      "Leads, such as detention reports or community concerns, should be logged securely rather than shared openly in the field.",
    correct: true,
  },
  {
    id: "q10",
    type: "multiple_select",
    question:
      "Which best practices should field teams follow for effective and safe outreach?",
    options: [
      "Vary visit times to avoid becoming predictable to law enforcement",
      "Match tone to the person (calm with fearful people, direct with angry people)",
      "Only engage if the business publicly posts anti-ICE stances",
      "Ensure at least one team member can demo the Tools quickly if requested",
    ],
    correct: [0, 1, 3],
  },
];
