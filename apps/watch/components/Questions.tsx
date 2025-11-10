"use client";

import { TranslationKey } from "@/lib/il8n/translations";
import { useTranslations } from "@/lib/il8n/useTranslations";

export default function ICEArrestQuestions() {
  const { t } = useTranslations();

  const questions = [
    "locationLabel",
    "timeLabel",
    "nameLabel",
    "dobLabel",
    "anumberLabel",
    "agencyLabel",
    "warrantLabel",
    "entryLabel",
    "contactLabel",
    "kidsLabel",
    "healthLabel",
    "identityLabel",
    "courtHistoryLabel",
    "nextStepsLabel",
    "callsLabel",
    "lawyerLabel",
  ];

  return (
    <section className="w-full mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">{t("arrestSubTitle")}</h2>
      <p>{t("arrestDesc")}</p>

      <div className="mt-5 text-left">
        <ul className="list-disc list-inside space-y-2 indent-8">
          {questions.map((key) => (
            <li className="text-l" key={key}>
              {t(key as TranslationKey)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
