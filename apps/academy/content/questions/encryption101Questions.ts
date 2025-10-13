import { Question } from '@/components/mdx/QustionRenderer';

export const encryption101Questions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What does end-to-end encryption (E2EE) mean?',
    options: [
      'Only ICE Tea admins can read the message',
      'The message is encrypted by the system after it’s stored',
      'Only the sender and intended recipient can read the message',
    ],
    correct: 2,
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'If you forget the encryption passphrase, ICE Tea staff can recover it for you.',
    correct: false,
  },
  {
    id: 'q3',
    type: 'multiple_select',
    question: 'Which of the following are good reasons to encrypt a dispatch?',
    options: [
      'The report includes someone’s undocumented status',
      'It contains identifying names or legal threats',
      'You are posting a public event announcement',
      'You are reporting surveillance near a sensitive site',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'What is a passphrase in ICE Tea’s encryption system?',
    options: [
      'A code name for volunteers to use in public',
      'A trigger phrase for emergency notifications',
      'A user-generated key used to encrypt and decrypt data',
      'A password for logging into the ICE Tea Academy',
    ],
    correct: 2,
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    question: 'What’s the safest way to share an encryption passphrase with a dispatcher?',
    options: ['Email or group chat', 'Text message or Instagram DM', 'Secure app like Signal or in-person'],
    correct: 2,
  },
  {
    id: 'q6',
    type: 'true_false',
    question: 'All reports in ICE Tea are automatically end-to-end encrypted, even without a passphrase.',
    correct: false,
  },
  {
    id: 'q7',
    type: 'multiple_select',
    question: 'Which of these help create a strong and secure passphrase?',
    options: [
      'Use at least four random words',
      'Avoid using your birthday or name',
      'Choose something easy like “password123”',
      'Include a mix of words or symbols you can remember',
    ],
    correct: [0, 1, 3],
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    question: 'Why is it risky to share encrypted content publicly—even without the passphrase?',
    options: [
      'It can confuse people who can’t open it',
      'Attackers may try to brute-force or analyze the encrypted data',
      'Encrypted files violate copyright automatically',
    ],
    correct: 1,
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    question: 'What does ICE Tea store when you encrypt a dispatch?',
    options: [
      'The encrypted content, but not the passphrase',
      'The unencrypted content and a passphrase backup',
      'Only your Signal ID and phone number',
    ],
    correct: 0,
  },
  {
    id: 'q10',
    type: 'true_false',
    question: 'Encryption protects the content of a message but not metadata like time or sender identity.',
    correct: true,
  },
  {
    id: 'q11',
    type: 'multiple_choice',
    question: 'Why should each encrypted report use a different passphrase?',
    options: [
      'It’s fun to make up new words',
      'It prevents chain decryption if one passphrase is leaked',
      'It speeds up the encryption process',
    ],
    correct: 1,
  },
  // {
  //   id: 'q12',
  //   type: 'matching',
  //   question: 'Match the term with its correct definition:',
  //   options: [
  //     { prompt: 'Salt', match: 'Random data added to a passphrase for added protection' },
  //     { prompt: 'Metadata', match: 'Information about the message like sender, time, or device' },
  //     { prompt: 'Brute-force', match: 'Trying many passphrases quickly to guess the key' },
  //     { prompt: 'Passphrase', match: 'A custom phrase that generates the encryption key' },
  //   ],
  // },
];
