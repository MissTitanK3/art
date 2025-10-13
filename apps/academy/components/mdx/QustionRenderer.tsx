'use client';

import { Textarea } from '../ui/textarea';

export type Question = {
  id: string;
  type: 'multiple_choice' | 'multiple_select' | 'short_answer' | 'long_answer' | 'true_false';
  question: string;
  options?: string[];
  correct?: number | number[] | boolean;
};

type QuestionRendererProps = {
  question: Question;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  submitted: boolean;
};

export function QuestionRenderer({ question, value, onChange, submitted }: QuestionRendererProps) {
  switch (question.type) {
    case 'multiple_choice':
      return (
        <div className="space-y-1 mt-2">
          {question.options?.map((opt, idx) => {
            const isCorrect = submitted && question.correct === idx;
            const isSelected = value === String(idx);
            return (
              <label
                key={idx}
                className={`flex items-center gap-2 ${
                  submitted
                    ? isCorrect
                      ? 'text-green-500 font-bold'
                      : isSelected && !isCorrect
                      ? 'text-red-500 line-through'
                      : ''
                    : ''
                }`}>
                <input
                  type="radio"
                  name={question.id}
                  checked={isSelected}
                  onChange={() => onChange(String(idx))}
                  disabled={submitted}
                />
                {opt}
              </label>
            );
          })}
        </div>
      );

    case 'multiple_select':
      return (
        <div className="space-y-1 mt-2">
          {question.options?.map((opt, idx) => {
            const correctAnswers = Array.isArray(question.correct)
              ? question.correct.map((i) => question.options?.[i])
              : [];
            const isCorrect = submitted && correctAnswers.includes(opt);
            const isSelected = Array.isArray(value) && value.includes(opt);
            return (
              <label
                key={opt + idx}
                className={`flex items-center gap-2 ${
                  submitted
                    ? isCorrect
                      ? 'text-green-500 font-bold'
                      : isSelected && !isCorrect
                      ? 'text-red-500 line-through'
                      : ''
                    : ''
                }`}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    const current: string[] = Array.isArray(value) ? value : [];
                    const updated = current.includes(opt) ? current.filter((o) => o !== opt) : [...current, opt];
                    onChange(updated);
                  }}
                  disabled={submitted}
                />
                {opt}
              </label>
            );
          })}
        </div>
      );

    case 'true_false':
      return (
        <div className="space-y-1 mt-2">
          {['True', 'False'].map((opt) => {
            const isCorrect = submitted && question.correct === (opt === 'True');
            const isSelected = value === opt;
            return (
              <label
                key={opt}
                className={`flex items-center gap-2 ${
                  submitted
                    ? isCorrect
                      ? 'text-green-500 font-bold'
                      : isSelected && !isCorrect
                      ? 'text-red-500 line-through'
                      : ''
                    : ''
                }`}>
                <input
                  type="radio"
                  name={question.id}
                  value={opt}
                  checked={isSelected}
                  onChange={() => onChange(opt)}
                  disabled={submitted}
                />
                {opt}
              </label>
            );
          })}
        </div>
      );

    case 'short_answer':
      return (
        <Textarea
          className="mt-2 resize-y"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder="Your answer"
        />
      );

    case 'long_answer':
      return (
        <Textarea
          className="mt-2 resize-y"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          placeholder="Your response"
        />
      );

    default:
      return <p className="text-red-500">Unsupported question type.</p>;
  }
}
