import { Question } from "@workspace/ui/patterns/features/academy/question-renderer";

export const mentalHealthResilienceQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question:
      "Why is resilience training important for volunteers in high-pressure environments?",
    options: [
      "It teaches volunteers how to diagnose and treat trauma professionally",
      "It helps individuals manage stress and avoid burnout, preventing mistakes and frozen reactions",
      "It replaces the need for dispatchers or care leads during crises",
    ],
    correct: 1,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "The 5-4-3-2-1 method is a grounding technique that uses sensory awareness to stabilize someone under stress.",
    correct: true,
  },
  {
    id: "q3",
    type: "multiple_select",
    question:
      "Which of these are examples of grounding or stabilization techniques taught in this course?",
    options: [
      "5-4-3-2-1 sensory method",
      "Box or tactical breathing (inhale/hold/exhale/hold for 4 counts)",
      "Bilateral stimulation through tapping or walking",
      "Pressuring someone to recount their trauma for catharsis",
    ],
    correct: [0, 1, 2],
  },
  {
    id: "q4",
    type: "multiple_choice",
    question:
      "Which physical stress signals should volunteers watch for during field actions?",
    options: [
      "Tremors, tunnel vision, nausea, shaking hands",
      "Hunger and mild thirst",
      "Calm breathing and steady movement",
    ],
    correct: 0,
  },
  {
    id: "q5",
    type: "true_false",
    question:
      "Peer support check-ins should always include direct probing about trauma to ensure nothing is missed.",
    correct: false,
  },
  {
    id: "q6",
    type: "multiple_choice",
    question: "What is the proper sequence for the 3-Minute Check-In?",
    options: [
      '"What’s your name? What happened? Who caused this?"',
      '"How’s your body right now? What do you need in this moment? Can I help you get it?"',
      '"Do you want to leave? Can I record your reaction? Will you share with the group?"',
    ],
    correct: 1,
  },
  {
    id: "q7",
    type: "multiple_select",
    question:
      "Which practices align with the boundaries and self-care guidelines from this course?",
    options: [
      "Always ask for consent before offering touch or interventions",
      "Step back or call for help if you can’t focus or feel overwhelmed",
      "Block someone from leaving if they might be distressed",
      "Adapt techniques to personal preferences like prayer, silence, or movement",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "q8",
    type: "multiple_choice",
    question:
      "If a volunteer freezes and stares blankly during chaos, what is your first move?",
    options: [
      "Move them to a quieter, safe space and start a grounding technique",
      "Leave them where they are while continuing your task",
      "Immediately contact law enforcement for assistance",
    ],
    correct: 0,
  },
  {
    id: "q9",
    type: "true_false",
    question:
      "Volunteers are expected to stabilize, not treat trauma or diagnose mental health conditions.",
    correct: true,
  },
  {
    id: "q10",
    type: "multiple_select",
    question:
      "Which steps are recommended for maintaining resilience and preventing burnout?",
    options: [
      "Practice grounding techniques daily, even when calm",
      "Pair up for emotional check-ins during actions",
      "Memorize or keep quick access to local crisis and mental health contacts",
      "Force others to process their trauma to avoid bottling it up",
    ],
    correct: [0, 1, 2],
  },
];
