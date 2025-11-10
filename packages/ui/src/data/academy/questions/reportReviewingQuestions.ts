import { Question } from "@workspace/ui/components/academy/QuestionRenderer";

export const reportReviewingQuestions: Question[] = [
  {
    id: "rr-q1",
    type: "multiple_choice",
    question: "What is the primary purpose of the report review process?",
    options: [
      "To remove reports that mention ICE",
      "To ensure reports are posted as fast as possible",
      "To verify report accuracy and protect public safety",
      "To gather media files for social media campaigns",
    ],
    correct: 2,
  },
  {
    id: "rr-q2",
    type: "true_false",
    question: "You should reject any report that is submitted anonymously.",
    correct: false,
  },
  {
    id: "rr-q3",
    type: "multiple_select",
    question:
      "Which of the following are valid reasons to reject a report during review?",
    options: [
      "The report contains vague or hearsay information",
      "The report is a clear duplicate of another",
      "The report includes photos or video",
      "The report lacks a verified timestamp or location",
    ],
    correct: [0, 1, 3],
  },
  {
    id: "rr-q4",
    type: "multiple_select",
    question:
      "What information should you confirm when reviewing a valid report?",
    options: [
      "Specific location",
      "Timestamp accuracy",
      "First-hand observation or clear description",
      "Reporter’s identity and address",
      "Whether the report contains a known agent badge number",
    ],
    correct: [0, 1, 2],
  },
  {
    id: "rr-q5",
    type: "multiple_choice",
    question:
      'A report says: "ICE at Elm & 22nd. Two vans. One person detained. Happened 15 mins ago." No media is attached. The location checks out and is known for activity. What should you do?',
    options: [
      "Reject immediately — there’s no media",
      "Publish — it meets standards and is timely",
      "Send back for clarification — media is required",
      "Ignore it unless the reporter is verified",
    ],
    correct: 1,
  },
  {
    id: "rr-q6",
    type: "true_false",
    question:
      "It is acceptable to share submitted media with other volunteers outside the review platform if urgent.",
    correct: false,
  },
  {
    id: "rr-q7",
    type: "multiple_choice",
    question:
      "If you’re unsure about a report’s authenticity, what should you do before publishing?",
    options: [
      "Reject the report immediately",
      "Publish it with a disclaimer",
      "Tag it for senior review and add a moderation note",
      "Ignore it and wait for another report to confirm",
    ],
    correct: 2,
  },
  {
    id: "rr-q8",
    type: "multiple_choice",
    question: "Which detail might suggest a report is disinformation or fake?",
    options: [
      "It includes a license plate number",
      "It describes events with clear time and location",
      "It claims urgent presence but has a timestamp from six hours ago",
      "It matches known patterns from prior ICE activity",
    ],
    correct: 2,
  },
  {
    id: "rr-q9",
    type: "multiple_choice",
    question:
      "A report includes a close-up image of a detainee’s face. What is the correct action?",
    options: [
      "Publish it — it’s important to show the reality",
      "Redact or crop the image before publishing, or reject if not possible",
      "Send it to a trusted friend for outside feedback",
      "Use facial recognition to confirm their identity",
    ],
    correct: 1,
  },
];
