import { Question } from "@workspace/ui/components/academy/QuestionRenderer";

export const careSupportQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question: "What is the primary goal of emotional support?",
    options: [
      "To help someone move on quickly from distress",
      "To solve someone’s emotional problems",
      "To help someone feel seen, safe, and steady in a hard moment",
    ],
    correct: 2,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "It’s okay to offer physical comfort like a hug without asking, as long as you mean well.",
    correct: false,
  },
  {
    id: "q3",
    type: "multiple_select",
    question:
      "Which of the following are appropriate trauma responses someone might have?",
    options: [
      "Crying or shaking",
      "Laughing nervously",
      "Staying completely silent or dissociating",
      "Immediately calming down and offering support to others",
    ],
    correct: [0, 1, 2],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question:
      "What’s one way you can check if someone is open to emotional support?",
    options: [
      "Immediately give them a hug to show support",
      "Ask, “Do you want to talk or would you prefer space right now?”",
      "Start crying with them to show empathy",
      "Follow them until they respond",
    ],
    correct: 1,
  },
  {
    id: "q5",
    type: "multiple_choice",
    question: "Which of these responses is the most grounding in a crisis?",
    options: [
      "“Let’s focus on the positive.”",
      "“That was intense. Would you like to sit quietly together?”",
      "“Calm down, you’re making others anxious.”",
    ],
    correct: 1,
  },
  {
    id: "q6",
    type: "true_false",
    question:
      "You should skip offering support if you’re not a trained therapist.",
    correct: false,
  },
  {
    id: "q7",
    type: "multiple_select",
    question: "What are good practices for emotional support in the field?",
    options: [
      "Use the person’s name if known",
      "Speak softly and offer grounding tools like water or breathwork",
      "Insist they explain what happened",
      "Mirror calm breathing and body language",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q8",
    type: "multiple_select",
    question:
      "Which of the following should you avoid doing when someone is in distress?",
    options: [
      "Interrupting them or speaking over them",
      "Telling them to “calm down” or minimize their feelings",
      "Listening quietly and nodding",
      "Assuming you know what they need without asking",
      "Giving them space if they ask for it",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q9",
    type: "multiple_choice",
    question:
      "Which role is most focused on helping teammates decompress after an action?",
    options: ["Trauma Buddy", "Aftercare Lead", "Field Supporter"],
    correct: 1,
  },
  {
    id: "q10",
    type: "multiple_choice",
    question:
      "Before offering emotional care, what should you check in with yourself about?",
    options: [
      "Whether you have snacks or water to offer",
      "Whether you’re feeling calm and grounded enough to be supportive",
      "Whether you know the person’s full story",
      "Whether the person has asked for help directly",
    ],
    correct: 1,
  },
  {
    id: "q11",
    type: "multiple_choice",
    question:
      "How might you adjust your care for someone from a different cultural background?",
    options: [
      "Avoid offering support at all to avoid offending them",
      "Ask for consent and offer verbal or non-contact forms of support",
      "Use physical touch to show you care, regardless of their culture",
      "Explain that your intentions are harmless and continue as usual",
    ],
    correct: 1,
  },
  {
    id: "q12",
    type: "true_false",
    question: "Skipping your own debrief helps you stay strong for others.",
    correct: false,
  },
];
