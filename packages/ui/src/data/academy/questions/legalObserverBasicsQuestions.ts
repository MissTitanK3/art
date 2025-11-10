import { Question } from "@workspace/ui/components/academy/QuestionRenderer";

export const legalObserverBasicsQuestions: Question[] = [
  {
    id: "lo-q1",
    type: "multiple_choice",
    question: "What is the primary role of a Legal Observer (LO)?",
    options: [
      "To chant with protestors while observing",
      "To give legal advice at the protest site",
      "To document law enforcement behavior neutrally",
      "To record protestors’ testimonies on camera",
    ],
    correct: 2,
  },
  {
    id: "lo-q2",
    type: "true_false",
    question:
      "Legal Observers may participate in chants as long as they document impartially.",
    correct: false,
  },
  {
    id: "lo-q3",
    type: "multiple_select",
    question: "Which items are essential for a Legal Observer to bring?",
    options: [
      "Notebook and pen",
      "Legal Observer badge",
      "Tear gas mask for protest use",
      "Timestamped watch",
      "Fully charged phone",
    ],
    correct: [0, 1, 3, 4],
  },
  {
    id: "lo-q4",
    type: "multiple_choice",
    question: "Which note is best for legal use in court?",
    options: [
      "“Officer Jameson was clearly being aggressive all day.”",
      "“At 2:47 PM, Officer Jameson (#4421) shoved a protestor without warning.”",
      "“I felt Officer Jameson crossed the line at 2:47 PM.”",
      "“Jameson hates protestors. It showed at 2:47 PM.”",
    ],
    correct: 1,
  },
  {
    id: "lo-q5",
    type: "multiple_choice",
    question:
      "When is it appropriate for a Legal Observer to speak directly to police?",
    options: [
      "To politely request badge numbers",
      "To demand a release of a detained person",
      "To scold them for misconduct",
      "Almost never — Legal Observers should remain silent and neutral",
    ],
    correct: 3,
  },
  {
    id: "lo-q6",
    type: "true_false",
    question:
      "You should use ink pens, not pencil or erasable pens, when taking field notes.",
    correct: true,
  },
  {
    id: "lo-q7",
    type: "multiple_choice",
    question:
      "If a dispersal order is issued, what should a Legal Observer do?",
    options: [
      "Leave unless your LO team has been authorized to remain",
      "Hide and continue taking notes covertly",
      "Link arms with protestors to resist removal",
    ],
    correct: 0,
  },
  {
    id: "lo-q8",
    type: "multiple_choice",
    question:
      "Why should Legal Observers avoid editing video footage before submission?",
    options: [
      "Because edited footage is harder to store securely",
      "Because it can be seen as tampering and reduce its credibility as evidence",
      "Because footage must always include protestor interviews",
      "Because it’s not allowed by dispatchers",
    ],
    correct: 1,
  },
  {
    id: "lo-q9",
    type: "true_false",
    question:
      "Some states require all parties to consent to audio recording. You must check your local laws before recording.",
    correct: true,
  },
  {
    id: "lo-q10",
    type: "multiple_choice",
    question:
      "Why is peer support important for Legal Observers after an event?",
    options: [
      "To plan the next action",
      "To decompress and process high-stress experiences safely",
      "To share gossip and event highlights",
    ],
    correct: 1,
  },
];
