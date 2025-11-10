import { Question } from "@workspace/ui/components/academy/QuestionRenderer";

export const runnersAndRidesQuestions: Question[] = [
  {
    id: "rrides-q1",
    type: "multiple_choice",
    question:
      "When is it safest to use a runner instead of digital communication?",
    options: [
      "When you need to send a meme",
      "When transporting sensitive documents during surveillance risk",
      "When someone needs emotional support in person",
      "When you don’t trust the driver to follow directions",
    ],
    correct: 1,
  },
  {
    id: "rrides-q2",
    type: "true_false",
    question:
      "Rideshare drivers should always know the names of the people they are transporting.",
    correct: false,
  },
  {
    id: "rrides-q3",
    type: "multiple_select",
    question:
      "Which of the following are valid reasons to cancel a planned ride or runner route?",
    options: [
      "The runner forgot their phone",
      "You suspect surveillance or tailing",
      "The driver feels emotionally dysregulated",
      "The weather is slightly rainy",
      "The drop point has been compromised",
    ],
    correct: [1, 2, 4],
  },
  {
    id: "rrides-q4",
    type: "multiple_select",
    question: "What items should be in a ride coordination kit?",
    options: [
      "Walkie-talkie",
      "Printed flyers with personal names and addresses",
      "First-aid kit",
      "Pre-sanitized masks or gloves",
      "Gas card or cash",
    ],
    correct: [0, 2, 3, 4],
  },
  {
    id: "rrides-q5",
    type: "multiple_choice",
    question:
      "You’re the route captain for a sensitive handoff of documents. Mid-route, the runner notices an unmarked car following them for several blocks. What’s the best immediate step?",
    options: [
      "Have them turn around and confront the vehicle",
      "Tell them to proceed quickly to the handoff location",
      "Instruct them to divert to a neutral safe spot and cancel the handoff",
      "Ignore it and proceed — you can’t prove it’s surveillance yet",
    ],
    correct: 2,
  },
  {
    id: "rrides-q6",
    type: "true_false",
    question:
      "Emotional decompression is important even if a runner or driver didn’t experience anything visibly traumatic.",
    correct: true,
  },
  {
    id: "rrides-q7",
    type: "multiple_choice",
    question:
      "What is one method of confirming a successful handoff without exposing names or sensitive content?",
    options: [
      "Send a group photo of everyone involved",
      "Use a pre-agreed non-suspicious code phrase",
      "Text the recipient’s full name to confirm",
      "Call and describe the item out loud",
    ],
    correct: 1,
  },
  {
    id: "rrides-q8",
    type: "multiple_choice",
    question: "Which runner cover story is most effective if questioned?",
    options: [
      "“I’m delivering legal documents for a protest.”",
      "“I’m bringing soup to my sick neighbor.”",
      "“I don’t answer questions.”",
      "“I’m lost and looking for directions.”",
    ],
    correct: 1,
  },
  {
    id: "rrides-q9",
    type: "multiple_choice",
    question: "How might a runner nonverbally signal a handoff is compromised?",
    options: [
      "Wave both hands overhead",
      "Place their hat on their head backward",
      "Start singing loudly",
      "Text the coordinator immediately",
    ],
    correct: 1,
  },
];
