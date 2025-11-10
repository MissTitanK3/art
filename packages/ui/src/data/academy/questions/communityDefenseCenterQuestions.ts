import { Question } from "@workspace/ui/components/academy/QuestionRenderer";

export const communityDefenseCenterQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question: "What is the core purpose of a Community Defense Center (CDC)?",
    options: [
      "To sell ICE Tea Tools at local markets",
      "To provide surveillance on suspected ICE agents",
      "To serve as a mobile hub for outreach, safety training, and mutual aid",
    ],
    correct: 2,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "A CDC can be deployed with just a backpack, some flyers, and QR codes.",
    correct: true,
  },
  {
    id: "q3",
    type: "multiple_choice",
    question:
      "Which of the following roles is responsible for helping new people join the ICE Tea Academy?",
    options: [
      "Outreach Lead",
      "Academy Coach",
      "Tactical Coordinator",
      "Safety Watcher",
    ],
    correct: 1,
  },
  {
    id: "q4",
    type: "multiple_select",
    question: "Which activities are appropriate for a CDC station?",
    options: [
      "Mapping ICE/police sightings",
      "Offering Know Your Rights training",
      "Running neighborhood surveillance campaigns",
      "Helping people form Pods",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q5",
    type: "true_false",
    question:
      "You should destroy any contact info collected during a CDC once the event is over.",
    correct: false,
  },
  {
    id: "q6",
    type: "multiple_choice",
    question: "What is the “Rapid Academy” station designed to do?",
    options: [
      "Issue credentials for certified police liaisons",
      "Enroll people in ICE Tea Academy and explain training paths",
      "Sell courses to offset dispatch costs",
    ],
    correct: 1,
  },
  {
    id: "q7",
    type: "multiple_choice",
    question:
      "Which deployment method offers the most mobility for protests or street actions?",
    options: [
      "10x10 Tent Setup",
      "Van Conversion",
      "Cargo Bike or Cart",
      "Solar Command Trailer",
    ],
    correct: 2,
  },
  {
    id: "q8",
    type: "multiple_select",
    question: "Which tools or practices support effective CDC follow-up?",
    options: [
      "QR code-based signups",
      "Automated follow-up texts or emails",
      "Anonymous public shaming of ICE collaborators",
      "Airtable or Supabase to track leads",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q9",
    type: "true_false",
    question:
      "CDC deployments always require a generator, scanner, and hotspot.",
    correct: false,
  },
  {
    id: "q10",
    type: "multiple_choice",
    question: "What does the Community Defender Passport idea aim to do?",
    options: [
      "Track people who oppose abolitionist values",
      "Create a reward system to encourage engagement and learning",
      "Replace official ID with ICE Tea-issued documents",
    ],
    correct: 1,
  },
];
