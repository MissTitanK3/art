import { Question } from '@workspace/ui/components/academy/QuestionRenderer';

export const howToReportQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What are the most important details to include in an ICE Tea Watch report?',
    options: [
      'Your personal opinion about ICE',
      'Time, location, number of agents, vehicle details, and media (if safe)',
      'A summary of what someone told you earlier',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'It’s okay to report what you heard from a friend even if you didn’t witness it yourself.',
    correct: false,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which of the following are safe and appropriate actions when reporting ICE activity?',
    options: [
      'Observing from a distance without interfering',
      'Filming if it’s safe for you and others',
      'Approaching agents to ask for information',
      'Submitting the report using the ICE Tea Watch form',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'Why should you avoid sharing rumors or secondhand info in a report?',
    options: [
      'Because it makes the report longer',
      'Because it can spread fear or misinformation',
      'Because it’s rarely verifiable and wastes verification time',
      'Because it helps law enforcement respond faster',
    ],
    correct: 2,
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    question: 'What happens after you submit a report?',
    options: [
      'It is immediately posted to social media',
      'It is verified and added to the map if valid',
      'It is shared with ICE for confirmation',
    ],
    correct: 1,
  },
  {
    id: 'q6',
    type: 'true_false',
    question: 'ICE Tea Watch reports are encrypted and never shared with law enforcement or corporations.',
    correct: true,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'What tools or info can improve the usefulness of your report?',
    options: [
      'License plate numbers (if safe)',
      'Direction the agents or vehicles were heading',
      'Date of your last ICE sighting',
      'Photos or video if it can be captured safely',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'What should you do if it’s not safe to record during an ICE encounter?',
    options: [
      'Keep recording no matter what',
      'Record secretly even if it puts you at risk',
      'Prioritize safety — observe, remember details, and report later',
      'Leave immediately and do not share anything',
    ],
    correct: 2,
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    question: 'Which tool should you use to submit a public report without logging in?',
    options: ['ICE Tea Dispatch', 'ICE Tea Watch', 'Email or text message'],
    correct: 1,
  },
  {
    id: 'q10',
    type: 'multiple_choice',
    question: 'What is the first thing you should do before reporting an ICE encounter?',
    options: [
      'Take a photo or video immediately',
      'Post about it on social media to warn others',
      'Make sure you are physically safe and not being watched or tracked',
      'Call the news to get coverage',
    ],
    correct: 2,
  },
];
