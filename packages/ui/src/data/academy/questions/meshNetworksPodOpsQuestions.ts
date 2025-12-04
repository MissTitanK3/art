import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const meshNetworksPodOpsQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question:
      "Why is it important to create a new channel name and PSK (pre-shared key) for each mission?",
    options: [
      "To make the messages more readable for new users",
      "To reduce the risk of outsiders joining or eavesdropping on your network",
      "To increase battery life by lowering transmission power",
    ],
    correct: 1,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "A single relay node is usually enough to cover any size urban pod without backup.",
    correct: false,
  },
  {
    id: "q3",
    type: "multiple_select",
    question:
      "Which devices are commonly used for pod-level Meshtastic networks?",
    options: [
      "LilyGO T-Beams as handheld units",
      "Heltec V3 as lightweight backups or relays",
      "RAK or ESP32-based relay nodes for fixed coverage",
      "Standard Wi-Fi routers flashed with custom firmware",
    ],
    correct: [0, 1, 2],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question:
      "What is the recommended relay spacing in urban areas to maintain consistent coverage?",
    options: ["500 meters apart", "1–2 km apart", "5–10 km apart"],
    correct: 1,
  },
  {
    id: "q5",
    type: "true_false",
    question:
      "It is best practice to share your pod’s encryption keys over public chat channels for convenience.",
    correct: false,
  },
  {
    id: "q6",
    type: "multiple_select",
    question:
      "Which practices help keep a pod network powered during a long event?",
    options: [
      "Carrying at least one 10,000–20,000 mAh battery pack per active node",
      "Using solar panels for stationary relays",
      "Keeping one backup relay powered down until needed",
      "Running all relays at maximum transmission power at all times",
    ],
    correct: [0, 1, 2],
  },
  {
    id: "q7",
    type: "multiple_choice",
    question: "What is the primary purpose of a relay node?",
    options: [
      "To jam unwanted signals and block surveillance",
      "To extend the network’s range by forwarding messages between devices",
      "To act as a central command hub for all pod decisions",
    ],
    correct: 1,
  },
];
