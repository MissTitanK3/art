import { Question } from "@workspace/ui/components/academy/QuestionRenderer";

export const checkpointMonitoringQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question: "What is the primary goal of checkpoint monitoring?",
    options: [
      "To interfere with law enforcement procedures",
      "To document and observe clearly without escalating the situation",
      "To confront agents and defend drivers directly",
    ],
    correct: 1,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "It is legal to record law enforcement presence from a public sidewalk.",
    correct: true,
  },
  {
    id: "q3",
    type: "multiple_select",
    question: "What should you document during checkpoint monitoring?",
    options: [
      "Time and location",
      "Agent uniforms and vehicles",
      "License plate numbers of all drivers",
      "Behavior during stops, including abuse or bias",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question:
      "What should you say if an officer asks why you’re filming from a public space?",
    options: [
      "“I’m allowed to record in public. I’m not interfering.”",
      "“I don’t need to answer your questions.”",
      "“Because you might be doing something wrong.”",
      "“Please stop talking to me.”",
    ],
    correct: 0,
  },
  {
    id: "q5",
    type: "multiple_choice",
    question: "Which of these is NOT a safe or recommended practice?",
    options: [
      "Monitoring with a partner and checking in with a contact",
      "Wearing branded gear without coordination",
      "Filming your own interaction with officers",
    ],
    correct: 1,
  },
  {
    id: "q6",
    type: "true_false",
    question:
      "It’s safer to livestream checkpoint monitoring while you are still on-site.",
    correct: false,
  },
  {
    id: "q7",
    type: "multiple_select",
    question: "Which tools are useful for safe checkpoint monitoring?",
    options: [
      "Scanner app for license plates and notes",
      "De-escalation training",
      "Personal banner with slogans",
      "Charged phone with storage and secure unlock settings",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q8",
    type: "multiple_choice",
    question:
      "Which of the following is a red flag during a checkpoint stop, and what should you do?",
    options: [
      "An agent asks for ID without reasonable suspicion — you should comply immediately.",
      "A vehicle is searched without consent or a warrant — you should document and remain calm.",
      "Agents give directions in both English and Spanish — this is standard procedure.",
      "The checkpoint is near a border — you should always turn around.",
    ],
    correct: 1,
  },
  {
    id: "q9",
    type: "multiple_choice",
    question:
      "How should you interact with drivers or pedestrians who ask for help?",
    options: [
      "Give them Know Your Rights info and avoid advising them to disobey",
      "Encourage them to resist if they feel targeted",
      "Ask detailed questions about their immigration status",
    ],
    correct: 0,
  },
  {
    id: "q10",
    type: "multiple_choice",
    question: "Why is encryption important when handling checkpoint footage?",
    options: [
      "It reduces video file size for easier uploads.",
      "It hides your identity from the people in the video.",
      "It protects sensitive footage from being accessed or tampered with.",
      "It allows police to view it more easily in court.",
    ],
    correct: 2,
  },
  {
    id: "q11",
    type: "true_false",
    question:
      "Your buddy should always remain within eyesight during checkpoint monitoring.",
    correct: true,
  },
  {
    id: "q12",
    type: "multiple_choice",
    question:
      "What’s one way to support a non-English speaker who asks you for help?",
    options: [
      "Hand them a Know Your Rights flyer in their language, if available",
      "Speak slowly in English so they understand better",
      "Ask their immigration status to better assist them",
      "Tell them to avoid answering officers and keep walking",
    ],
    correct: 0,
  },
];
