"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type QuizContextType = {
  passed: boolean;
  setPassed: (passed: boolean) => void;
  answers: Record<string, string | string[]>;
  setAnswers: (answers: Record<string, string | string[]>) => void;
};

const QuizContext = createContext<QuizContextType | null>(null);

export function useQuizStatus() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuizStatus must be used within <QuizProvider>");
  return ctx;
}

export function QuizProvider({
  children,
  slug,
}: {
  children: ReactNode;
  slug: string;
}) {
  const [passed, setPassedState] = useState(false);
  const [answers, setAnswersState] = useState<
    Record<string, string | string[]>
  >({});

  useEffect(() => {
    const storedPassed = localStorage.getItem(`quiz_passed:${slug}`);
    if (storedPassed === "true") setPassedState(true);

    const storedAnswers = localStorage.getItem(`quiz_answers:${slug}`);
    if (storedAnswers) {
      try {
        setAnswersState(JSON.parse(storedAnswers));
      } catch {
        setAnswersState({});
      }
    }
  }, [slug]);

  const setPassed = (value: boolean) => {
    setPassedState(value);
    localStorage.setItem(`quiz_passed:${slug}`, value.toString());
  };

  const setAnswers = (updated: Record<string, string | string[]>) => {
    setAnswersState(updated);
    localStorage.setItem(`quiz_answers:${slug}`, JSON.stringify(updated));
  };

  return (
    <QuizContext.Provider value={{ passed, setPassed, answers, setAnswers }}>
      {children}
    </QuizContext.Provider>
  );
}
