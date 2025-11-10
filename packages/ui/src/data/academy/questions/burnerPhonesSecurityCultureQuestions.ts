import { Question } from "@workspace/ui/components/academy/QuestionRenderer";

export const burnerPhonesSecurityCultureQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question:
      "Why are burner phones valuable for mutual aid and direct action work?",
    options: [
      "They provide total anonymity, even if seized or hacked",
      "They reduce exposure by separating operations from personal devices",
      "They let you bypass all surveillance and tracking automatically",
      "They are cheaper than normal phones so less to lose",
    ],
    correct: 1,
  },
  {
    id: "q2",
    type: "multiple_choice",
    question: "What is the most secure way to purchase a burner phone?",
    options: [
      "Online with a prepaid credit card",
      "At a local retailer with loyalty points",
      "In person with cash and no ID",
      "Using your personal debit card for convenience",
    ],
    correct: 2,
  },
  {
    id: "q3",
    type: "multiple_select",
    question: "Which of these practices compromise a burner phone’s security?",
    options: [
      "Using your personal Google or Apple ID on the device",
      "Enabling full-device encryption",
      "Installing Signal or another encrypted messenger",
      "Turning on biometric unlock (fingerprint/face ID)",
    ],
    correct: [0, 3],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question: "When should you destroy or wipe a burner phone?",
    options: [
      "Only if it was confiscated by police",
      "After every action or operation it was used for",
      "Once the SIM card expires",
      "Only if you suspect malware",
    ],
    correct: 1,
  },
  {
    id: "q5",
    type: "multiple_choice",
    question:
      "What is the main reason to keep a burner phone powered off and in airplane mode when not in use?",
    options: [
      "To preserve the battery life",
      "To prevent location tracking and background pings",
      "Because it can’t receive texts otherwise",
      "To make it harder for you to lose it",
    ],
    correct: 1,
  },
  {
    id: "q6",
    type: "multiple_select",
    question:
      "Which of the following is a good practice for protecting media shared from a burner phone?",
    options: [
      "Scrubbing EXIF and metadata before sending",
      "Disabling geotags on the device",
      "Posting immediately to public social media to get ahead of disinformation",
      "Using tools like ObscuraCam to blur and sanitize images",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q7",
    type: "multiple_choice",
    question:
      "If a burner phone is seized by authorities, what assumption should you make?",
    options: [
      "That encrypted messages will remain secure indefinitely",
      "That all device contents, contacts, and metadata are compromised",
      "That your personal devices are automatically safe",
      "That the phone can be reused once returned",
    ],
    correct: 1,
  },
  {
    id: "q8",
    type: "multiple_choice",
    question:
      "What is a red flag that a burner phone might draw unwanted attention?",
    options: [
      "It’s turned off when not in use",
      "It’s a prepaid phone purchased for cash",
      "It’s your only phone during border or checkpoint crossings",
      "It only has Signal installed",
    ],
    correct: 2,
  },
  {
    id: "q9",
    type: "multiple_select",
    question: "Which of these actions align with good security culture?",
    options: [
      "Only sharing pod-specific info with people who need to know",
      "Reviewing and updating burner protocols after every deployment",
      "Logging all conversations for record-keeping",
      "Pairing burners with clean SIMs and no crossover to personal devices",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q10",
    type: "multiple_choice",
    question: "What should you always do after retiring a burner phone?",
    options: [
      "Sell it online for extra funds",
      "Store it as a backup for emergencies",
      "Physically destroy or factory reset it and document the debrief",
      "Keep the SIM card in case you need the number later",
    ],
    correct: 2,
  },
];
