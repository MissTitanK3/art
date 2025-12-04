import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const meshNetworksHardwareQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question: "Why are antenna upgrades recommended for most Meshtastic nodes?",
    options: [
      "Stock antennas are weak and upgrades can greatly improve range",
      "They reduce battery usage by lowering power output",
      "They automatically encrypt messages without extra setup",
    ],
    correct: 0,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "A single 10,000 mAh battery pack can typically power a T-Beam for 12–24 hours.",
    correct: true,
  },
  {
    id: "q3",
    type: "multiple_select",
    question: "What are reliable power strategies for stationary relay nodes?",
    options: [
      "Using 20,000–50,000 mAh battery banks",
      "Pairing relays with 20–40W solar panels for daytime charging",
      "Powering them exclusively from disposable AA batteries for simplicity",
      "Rotating multiple pre-charged battery packs during long operations",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question:
      "What is the typical cost for a fully equipped 5–8 node pod, including power and one relay?",
    options: ["$200–$400", "$750–$850", "$2,000+"],
    correct: 1,
  },
  {
    id: "q5",
    type: "true_false",
    question:
      "Weatherproof cases and coded labeling help protect equipment and maintain security.",
    correct: true,
  },
  {
    id: "q6",
    type: "multiple_select",
    question:
      "Which accessories are considered essential for pod-level operations?",
    options: [
      "Multi-port USB-C chargers",
      "Weatherproof enclosures for relays",
      "Quick-disconnect tripods or magnetic mounts",
      "Publicly labeling all devices with owner names",
    ],
    correct: [0, 1, 2],
  },
];
