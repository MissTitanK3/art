"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { TranslationKey, TRANSLATIONS } from "./translations";

type Language = "en" | "es";

type LanguageContextType = {
  language: Language;
  t: (key: TranslationKey) => string;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Language | null;
    if (stored) setLanguage(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  const t = (key: TranslationKey) => TRANSLATIONS[language]?.[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
