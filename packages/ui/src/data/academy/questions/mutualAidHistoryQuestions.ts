import { Question } from "@workspace/ui/components/academy/QuestionRenderer";

export const mutualAidHistoryQuestions: Question[] = [
  {
    id: "ma-q1",
    type: "multiple_choice",
    question: "What is the key difference between mutual aid and charity?",
    options: [
      "Charity is always anonymous, mutual aid is not",
      "Charity is based on giving from the top down; mutual aid is based on solidarity and shared effort",
      "Charity is legally required, mutual aid is not",
      "Mutual aid only works during emergencies",
    ],
    correct: 1,
  },
  {
    id: "ma-q2",
    type: "true_false",
    question: "Mutual aid began during the COVID-19 pandemic.",
    correct: false,
  },
  {
    id: "ma-q3",
    type: "multiple_select",
    question: "Which of the following are historical examples of mutual aid?",
    options: [
      "Black Panther Free Breakfast Program",
      "Zapatista autonomous clinics",
      "Public police fundraising campaigns",
      "The Underground Railroad",
      "Korean rice cooperatives",
    ],
    correct: [0, 1, 3, 4],
  },
  {
    id: "ma-q4",
    type: "multiple_choice",
    question: 'What does it mean when we say mutual aid is "horizontal"?',
    options: [
      "It’s organized by large nonprofits and foundations",
      "It means support flows between equals, not from leaders to followers",
      "It focuses on short-term relief, not long-term care",
      "It’s funded mostly by government agencies",
    ],
    correct: 1,
  },
  {
    id: "ma-q5",
    type: "multiple_choice",
    question:
      "What did Peter Kropotkin argue in *Mutual Aid: A Factor of Evolution*?",
    options: [
      "Competition is the main driver of survival",
      "Capitalism supports cooperation best",
      "Mutual aid and cooperation are essential to how humans survive",
      "Mutual aid should only be practiced in emergencies",
    ],
    correct: 2,
  },
  {
    id: "ma-q6",
    type: "true_false",
    question: "The term “mutual aid” was first used by Indigenous communities.",
    correct: false,
  },
  {
    id: "ma-q7",
    type: "multiple_select",
    question:
      "Why is security culture important in mutual aid work? (Select all that apply)",
    options: [
      "To protect vulnerable or undocumented people",
      "To reduce exposure to state surveillance and infiltration",
      "To make the group secret and exclusive",
      "To prepare polished press releases",
    ],
    correct: [0, 1],
  },
  {
    id: "ma-q8",
    type: "multiple_choice",
    question:
      "Which Indigenous tradition used ceremonies to redistribute wealth in a mutual aid practice?",
    options: [
      "Potlatch (Pacific Northwest)",
      "Sun Dance (Lakota)",
      "Silent trade (Sahara)",
      "Feather exchanges (Maori)",
    ],
    correct: 0,
  },
  {
    id: "ma-q9",
    type: "multiple_choice",
    question: "Why is burnout a serious issue for mutual aid networks?",
    options: [
      "It lowers morale and follower count on social media",
      "It pushes groups to rely on corporate donations",
      "It weakens sustainability and makes long-term care harder",
    ],
    correct: 2,
  },
];
