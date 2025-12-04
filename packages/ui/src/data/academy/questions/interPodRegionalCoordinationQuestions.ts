import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const interPodRegionalCoordinationQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question:
      "Why is inter-pod coordination critical for large-scale or multi-day events?",
    options: [
      "Because individual pods often lack the resources or capacity to handle large incidents alone",
      "Because central leadership directs all pods during crises",
      "Because it eliminates the need for trust or verification between pods",
    ],
    correct: 0,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "Pods should always skip verification steps when linking up during a crisis to save time.",
    correct: false,
  },
  {
    id: "q3",
    type: "multiple_select",
    question:
      "What are key elements of a Reciprocal Agreement (MOU) between pods?",
    options: [
      "Clear resource-sharing expectations",
      "Defined primary and backup communications channels",
      "Automatic commitment to provide bail funds and legal defense",
      "Cross-verification and suspicious behavior reporting practices",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question:
      "Which method helps avoid extractive dynamics between larger and smaller pods?",
    options: [
      "Avoiding all resource-sharing agreements",
      "Tracking resource and labor flows to maintain balance",
      "Allowing larger pods to unilaterally dictate terms",
    ],
    correct: 1,
  },
  {
    id: "q5",
    type: "true_false",
    question:
      "Regional pod maps should have both encrypted digital copies and physical backups.",
    correct: true,
  },
  {
    id: "q6",
    type: "multiple_choice",
    question: "How often should pods aim to run regional coordination drills?",
    options: [
      "At least once per year",
      "Every month",
      "Only after a real crisis occurs",
    ],
    correct: 0,
  },
  {
    id: "q7",
    type: "multiple_select",
    question: "Which practices strengthen cross-pod trust and security?",
    options: [
      "Testing collaborations with low-risk exchanges before deep integration",
      "Cross-checking new pods with two trusted references",
      "Sharing all contact information publicly for efficiency",
      "Pausing links if a pod is under surveillance or infiltration",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q8",
    type: "multiple_choice",
    question:
      "What is the main priority when load balancing volunteers and resources across pods?",
    options: [
      "Triage based on urgency and capacity, focusing on life-safety first",
      "Evenly dividing volunteers among all pods, regardless of need",
      "Sending the largest possible team to the most visible incidents",
    ],
    correct: 0,
  },
  {
    id: "q9",
    type: "true_false",
    question:
      "Over-sharing information between pods can increase the risk of infiltration or surveillance.",
    correct: true,
  },
  {
    id: "q10",
    type: "multiple_select",
    question: "Which steps are part of effective inter-pod coordination?",
    options: [
      "Maintaining a private, redundant contact list of regional pods",
      "Pre-designating fallback staging and supply points",
      "Using multi-channel communications with backups like LoRa or radios",
      "Skipping MOUs to avoid slowing down collaboration",
    ],
    correct: [0, 1, 2],
  },
];
