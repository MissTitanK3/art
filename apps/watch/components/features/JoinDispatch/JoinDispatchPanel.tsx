"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/il8n/useTranslations";
import { roleKeys } from "@/lib/il8n/translations";

export default function JoinDispatchPanel() {
  const { t } = useTranslations();

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-xl font-bold">{t("joinDispatchTitle")}</h3>
        <p className="text-white/90">{t("joinDispatchIntro")}</p>
        <p className="text-white/70 text-sm">{t("joinDispatchNote")}</p>
        <Link
          href="https://www.alwaysreadytools.org/regions"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 px-4 py-2 bg-blue-700 text-white font-bold rounded hover:bg-blue-800 transition"
        >
          🔗 {t("joinDispatchContactButton")}
        </Link>
        <p className="text-xs text-white/70 mt-2">
          {t("joinDispatchRegionNote")}
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold mb-3">
          🚨 {t("joinDispatchRolesTitle")}
        </h4>
        <ul className="grid grid-cols-1 gap-2">
          {roleKeys.map((key) => (
            <li
              key={key}
              className="bg-white/10 rounded-md px-3 py-2 border border-white/15 text-white/95"
            >
              {t(key)}
            </li>
          ))}
        </ul>
      </section>

      <section className="text-xs text-white/70 border-t border-white/10 pt-3">
        <p>{t("joinDispatchFooter")}</p>
        <p className="text-yellow-300 mt-1">{t("joinDispatchLanguageNote")}</p>
      </section>
    </div>
  );
}
