import { Question } from "@workspace/ui/components/academy/QuestionRenderer";

export const digitalResilienceCommsQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question:
      "What is the primary reason pods must train with contingency comms like mesh, LoRa, and radios?",
    options: [
      "They are more convenient than standard apps",
      "Signal and phone networks may fail during actions, disasters, or suppression",
      "They allow pods to avoid encryption and operate faster",
    ],
    correct: 1,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "Mesh networking apps like Bridgefy and Briar can function without internet or cell service when properly configured.",
    correct: true,
  },
  {
    id: "q3",
    type: "multiple_select",
    question: "Which practices improve mesh network deployment?",
    options: [
      'Use role-based usernames like "Medic1" instead of real names',
      "Pre-load devices with offline maps like Organic Maps",
      "Confirm functionality by testing in airplane mode",
      "Allow chats to stay discoverable for easier finding by other groups",
    ],
    correct: [0, 1, 2],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question:
      "For LoRa/Meshtastic use, what is the recommended security measure for even benign messages?",
    options: [
      "Use AES-128 encryption",
      "Only transmit unencrypted to speed up delivery",
      "Rely on private frequency alone without encryption",
    ],
    correct: 0,
  },
  {
    id: "q5",
    type: "true_false",
    question:
      "Each pod should train only one tech operator on contingency comms tools to keep roles specialized.",
    correct: false,
  },
  {
    id: "q6",
    type: "multiple_choice",
    question:
      "What is the correct message format for LoRa texts to keep them efficient?",
    options: [
      "[SENDER] [SIGNAL STRENGTH] [TIME]",
      "[PRIORITY] [LOCATION] [ACTION]",
      "[MESSAGE] [PASSWORD] [SIGNATURE]",
    ],
    correct: 1,
  },
  {
    id: "q7",
    type: "multiple_select",
    question:
      "What are standard radio fallback practices when networks are fully down?",
    options: [
      "Switch to pre-set VHF/UHF channels immediately",
      'Use numbered codes like "Charlie 4" for common needs',
      "Hold 30-minute check-ins for accountability",
      "Always use public, plain English for faster understanding",
    ],
    correct: [0, 1, 2],
  },
  {
    id: "q8",
    type: "multiple_choice",
    question:
      "During a 6+ hour network blackout, which fallback method is recommended?",
    options: [
      "Continue using mesh apps exclusively",
      "Dead drops and runners with pre-arranged coded locations",
      "Only rely on radios without check-ins",
    ],
    correct: 1,
  },
  {
    id: "q9",
    type: "true_false",
    question:
      "Carrying laminated frequency charts and code sheets is part of the recommended gear checklist.",
    correct: true,
  },
  {
    id: "q10",
    type: "multiple_select",
    question:
      "Which security steps should pods include in their contingency comms audit?",
    options: [
      "Ensure radio privacy codes and encryption are active",
      "Clear chat history after each action",
      "Keep LoRa antennas concealed when in use",
      "Use “testing 1-2-3” for all radio checks to avoid confusion",
    ],
    correct: [0, 1, 2],
  },
];
