import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const logisticsResourceManagementQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question:
      "Why is strong logistics critical for pods during actions or emergencies?",
    options: [
      "It reduces reliance on volunteers and other pods",
      "It prevents fuel shortages, supply gaps, and stranded teams that can fracture operations",
      "It eliminates the need for fallback planning entirely",
    ],
    correct: 1,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "Staging areas should have multiple exits and low visibility from roads or aerial surveillance.",
    correct: true,
  },
  {
    id: "q3",
    type: "multiple_select",
    question: "Which are key criteria when selecting a staging area?",
    options: [
      "Close enough for resupply but far enough to avoid exposure",
      "At least two escape routes for vehicles and people",
      "Access to utilities like water or electricity if possible",
      "Use the same location repeatedly for consistency",
    ],
    correct: [0, 1, 2],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question:
      "How much water should be stocked per person per day, at minimum?",
    options: ["Half a gallon", "One gallon", "Two gallons"],
    correct: 1,
  },
  {
    id: "q5",
    type: "true_false",
    question:
      "Fuel caches should be split across multiple sites and stored at least 50 feet from structures or heat sources.",
    correct: true,
  },
  {
    id: "q6",
    type: "multiple_choice",
    question:
      "Which system helps avoid a single point of failure for logistics details?",
    options: [
      "Rotating supply drops every day",
      "Three Deep System (3 people know key logistics details)",
      "Using only one lead for all logistics tasks",
    ],
    correct: 1,
  },
  {
    id: "q7",
    type: "multiple_select",
    question: "Which practices improve logistics security?",
    options: [
      "Sharing staging locations with all volunteers for transparency",
      "Rotating routes and staging points",
      "Using clean, unmarked vehicles for supply runs",
      "Maintaining at least one logistics runner per event",
    ],
    correct: [1, 2, 3],
  },
  {
    id: "q8",
    type: "multiple_choice",
    question:
      "How often should perishable supplies be cycled out of staging areas?",
    options: [
      "Every 7–14 days",
      "Once every 30 days",
      "Only when supplies run out",
    ],
    correct: 0,
  },
  {
    id: "q9",
    type: "true_false",
    question:
      "Fallback caches should be waterproof, rodent-proof, and checked on a regular schedule.",
    correct: true,
  },
  {
    id: "q10",
    type: "multiple_select",
    question: "Which are common logistics failure points to avoid?",
    options: [
      "Exhausted batteries or charging capacity during actions",
      "Over-reliance on one staging area or vehicle",
      "Weather damage to poorly protected supplies",
      "Volunteer turnover without knowledge transfer",
    ],
    correct: [0, 1, 2, 3],
  },
];
