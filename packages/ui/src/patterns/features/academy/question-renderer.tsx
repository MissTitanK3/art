"use client";

import { Textarea } from "@workspace/ui/primitives/textarea";

export type Question = {
  id: string;
  type:
    | "multiple_choice"
    | "multiple_select"
    | "short_answer"
    | "long_answer"
    | "true_false";
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

export function QuestionRenderer({
  question,
  value,
  onChange,
  submitted,
}: QuestionRendererProps) {
  switch (question.type) {
    case "multiple_choice":
      return (
        <div className="mt-2 space-y-1">
          {question.options?.map((option, index) => {
            const isCorrect = submitted && question.correct === index;
            const isSelected = value === String(index);
            const stateClass = submitted
              ? isCorrect
                ? "text-green-500 font-bold"
                : isSelected
                  ? "text-red-500 line-through"
                  : ""
              : "";

            return (
              <label
                key={option}
                className={`flex items-center gap-2 ${stateClass}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={isSelected}
                  onChange={() => onChange(String(index))}
                  disabled={submitted}
                />
                {option}
              </label>
            );
          })}
        </div>
      );
    case "multiple_select":
      return (
        <div className="mt-2 space-y-1">
          {question.options?.map((option) => {
            const correctAnswers = Array.isArray(question.correct)
              ? question.correct.map((i) => question.options?.[i])
              : [];
            const isCorrect = submitted && correctAnswers.includes(option);
            const selectedValues = Array.isArray(value) ? value : [];
            const isSelected = selectedValues.includes(option);
            const stateClass = submitted
              ? isCorrect
                ? "text-green-500 font-bold"
                : isSelected
                  ? "text-red-500 line-through"
                  : ""
              : "";

            return (
              <label
                key={option}
                className={`flex items-center gap-2 ${stateClass}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    const updated = isSelected
                      ? selectedValues.filter((item) => item !== option)
                      : [...selectedValues, option];
                    onChange(updated);
                  }}
                  disabled={submitted}
                />
                {option}
              </label>
            );
          })}
        </div>
      );
    case "true_false":
      return (
        <div className="mt-2 space-y-1">
          {["True", "False"].map((option) => {
            const isCorrect =
              submitted && question.correct === (option === "True");
            const isSelected = value === option;
            const stateClass = submitted
              ? isCorrect
                ? "text-green-500 font-bold"
                : isSelected
                  ? "text-red-500 line-through"
                  : ""
              : "";

            return (
              <label
                key={option}
                className={`flex items-center gap-2 ${stateClass}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={isSelected}
                  onChange={() => onChange(option)}
                  disabled={submitted}
                />
                {option}
              </label>
            );
          })}
        </div>
      );
    case "short_answer":
      return (
        <Textarea
          className="mt-2 resize-y"
          value={(value as string) ?? ""}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          placeholder="Your answer"
        />
      );
    case "long_answer":
      return (
        <Textarea
          className="mt-2 resize-y"
          value={(value as string) ?? ""}
          onChange={(event) => onChange(event.target.value)}
          rows={8}
          placeholder="Your response"
        />
      );
    default:
      return <p className="text-red-500">Unsupported question type.</p>;
  }
}
