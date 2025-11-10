import { Question } from "@workspace/ui/components/academy/QuestionRenderer";

export const mentoringNewDispatchersQuestions: Question[] = [
  {
    id: "mentor-q1",
    type: "multiple_choice",
    question: "What is the primary goal of mentoring new dispatchers?",
    options: [
      "To ensure they follow every rule without question",
      "To teach calm, confidence, and ethical field coordination",
      "To speed up response times at all costs",
      "To limit who can become a dispatcher",
    ],
    correct: 1,
  },
  {
    id: "mentor-q2",
    type: "true_false",
    question: "Mentorship is only about sharing information and protocols.",
    correct: false,
  },
  {
    id: "mentor-q3",
    type: "multiple_select",
    question: "What are good mentorship practices?",
    options: [
      "Debriefing after major ops",
      "Publicly criticizing new dispatchers for mistakes",
      "Shadowing and guided practice",
      "Explaining decisions out loud when appropriate",
    ],
    correct: [0, 2, 3],
  },
  {
    id: "mentor-q4",
    type: "multiple_choice",
    question: "How should mentors give feedback?",
    options: [
      "Only during public team meetings",
      "Using guilt as motivation",
      "Privately, clearly, and with a focus on learning",
      "By removing trainees who make a single error",
    ],
    correct: 2,
  },
  {
    id: "mentor-q5",
    type: "true_false",
    question:
      "A good mentor protects their trainee’s safety and confidence during live operations.",
    correct: true,
  },
  {
    id: "mentor-q6",
    type: "multiple_select",
    question: "Which documentation methods support mentorship?",
    options: [
      "Using tags like #shadowing or #reviewed-by-[name]",
      "Logging trainee progress in secure docs",
      "Avoiding documentation to keep it informal",
      "Randomly testing dispatchers without notice",
    ],
    correct: [0, 1],
  },
];
