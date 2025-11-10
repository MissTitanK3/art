"use client";

import LinkButton from "@/components/ui/FrostedLink";
import LanguageSupportPanel from "@/components/info/LanguageSupportPanel";
import { useTranslations } from "@/lib/il8n/useTranslations";

export default function RequestLanguageSupportPage() {
  const { t } = useTranslations();

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-end">
        <LinkButton
          label={t("quickExit")}
          size="2xl"
          variant="red"
          href="https://wikipedia.org"
          target="_blank"
          rel="noreferrer"
        />
      </div>

      <LanguageSupportPanel />
    </main>
  );
}
