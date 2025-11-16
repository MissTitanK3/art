"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@workspace/ui/hooks/use-local-storage";

type QuizContextType = {
  passed: boolean;
  setPassed: (passed: boolean) => void;
  answers: Record<string, string | string[]>;
  setAnswers: (answers: Record<string, string | string[]>) => void;
};

const QuizContext = createContext<QuizContextType | null>(null);

const sanitizeAnswerMap = (
  payload: unknown,
): Record<string, string | string[]> => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }
  const next: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (typeof value === "string") {
      next[key] = value;
    } else if (
      Array.isArray(value) &&
      value.every((item) => typeof item === "string")
    ) {
      next[key] = [...value];
    }
  }
  return next;
};

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
}): React.ReactElement {
  const [passed, setPassed] = useLocalStorage<boolean>(
    `quiz_passed:${slug}`,
    false,
    {
      sync: true,
      serialize: (value) => String(Boolean(value)),
      deserialize: (raw) => raw === "true",
      migrate: (payload) => {
        if (typeof payload === "boolean") return payload;
        if (payload === "true") return true;
        if (payload === "false") return false;
        return undefined;
      },
    },
  );

  const defaultAnswers = useMemo<Record<string, string | string[]>>(
    () => ({}),
    [slug],
  );

  const [answers, setAnswers] = useLocalStorage<Record<string, string | string[]>>(
    `quiz_answers:${slug}`,
    defaultAnswers,
    {
      sync: true,
      serialize: (value) => JSON.stringify(value),
      deserialize: (raw) => {
        try {
          return sanitizeAnswerMap(JSON.parse(raw));
        } catch {
          return {};
        }
      },
      migrate: (payload) => sanitizeAnswerMap(payload),
    },
  );

  const handleSetPassed = useCallback(
    (value: boolean) => {
      setPassed(Boolean(value));
    },
    [setPassed],
  );

  const handleSetAnswers = useCallback(
    (updated: Record<string, string | string[]>) => {
      const sanitized: Record<string, string | string[]> = {};
      for (const [key, value] of Object.entries(updated)) {
        if (typeof value === "string") {
          sanitized[key] = value;
        } else if (
          Array.isArray(value) &&
          value.every((item) => typeof item === "string")
        ) {
          sanitized[key] = [...value];
        }
      }
      setAnswers(sanitized);
    },
    [setAnswers],
  );

  return (
    <QuizContext.Provider
      value={{ passed, setPassed: handleSetPassed, answers, setAnswers: handleSetAnswers }}
    >
      {children}
    </QuizContext.Provider>
  );
}
