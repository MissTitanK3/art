import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const spiritualMoralSupportQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question:
      "What is the primary purpose of the Spiritual & Moral Support role?",
    options: [
      "To provide religious guidance and evangelize during actions",
      "To offer calm, centering, non-denominational support and grounding during stressful events",
      "To act as a crisis counselor and mediate conflicts",
    ],
    correct: 1,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "Volunteers in this role are allowed to proselytize or share their personal faith to comfort others.",
    correct: false,
  },
  {
    id: "q3",
    type: "multiple_select",
    question: "Which practices are part of the Spiritual & Moral Support role?",
    options: [
      "Leading breathwork, silence, or song (by request)",
      "Listening and providing moral presence",
      "Providing trauma therapy and clinical counseling",
      "Assisting in aftercare or healing circles post-action",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question:
      "What should a Spiritual & Moral Support volunteer do if their presence begins escalating tensions?",
    options: [
      "Continue offering grounding practices anyway",
      "Step back immediately to prevent worsening the situation",
      "Switch to leading prayer or religious rituals to calm people",
    ],
    correct: 1,
  },
  {
    id: "q5",
    type: "true_false",
    question:
      "This role requires formal faith or religious training to become certified.",
    correct: false,
  },
  {
    id: "q6",
    type: "multiple_choice",
    question:
      "Which identifier is recommended for this role when visibility is appropriate?",
    options: [
      "A bright, faith-specific sash or robe",
      "A plain purple armband as a neutral identifier",
      "A vest labeled with your personal spiritual tradition",
    ],
    correct: 1,
  },
  {
    id: "q7",
    type: "multiple_select",
    question: "What are examples of grounding tools a volunteer might carry?",
    options: [
      "Water and stress-relief items",
      "Journaling paper and printed breathwork guides",
      "Religious texts to distribute to everyone present",
      "Small comfort items for emotional support",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q8",
    type: "multiple_choice",
    question:
      "In the case study where a pod member begins dissociating at a vigil, what is the *first* recommended action?",
    options: [
      "Begin guiding them through a breathing exercise immediately",
      "Ask if they would like company or grounding before acting",
      "Signal for medical or mental health support without interaction",
    ],
    correct: 1,
  },
  {
    id: "q9",
    type: "true_false",
    question:
      "Spiritual & Moral Support volunteers are expected to assist with debriefs or healing spaces after actions.",
    correct: true,
  },
  {
    id: "q10",
    type: "multiple_select",
    question:
      "Which items are required for this badge’s certification checklist?",
    options: [
      "Ability to lead grounding practices like silence or breathwork",
      "Understanding how to stay neutral and step back when needed",
      "Formal religious ordination or clergy approval",
      "Familiarity with at least one foundational resource, such as *Trauma Stewardship*",
    ],
    correct: [0, 1, 3],
  },
];
