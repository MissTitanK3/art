"use client";
import { useTranslations } from "@/lib/il8n/useTranslations";
export const DataAccessExplainer = () => {
  const { t } = useTranslations();
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6 bg-background text-foreground">
      <h1 className="text-2xl font-bold">{t("dataSeizureTitle")}</h1>

      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold">{t("dataSeizureLawsTitle")}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t("dataSeizureLawCLOUD")}</li>
            <li>{t("dataSeizureLawFISA")}</li>
            <li>{t("dataSeizureLawPatriot")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            {t("dataSeizureMitigationTitle")}
          </h2>
          <table className="w-full text-sm border border-border">
            <thead>
              <tr className="bg-muted text-left">
                <th className="p-2 border-b border-border">Mitigation</th>
                <th className="p-2 border-b border-border">Effectiveness</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-b border-border">
                  {t("dataSeizureMitigationEncryption")}
                </td>
                <td className="p-2 border-b border-border">✅</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-border">
                  {t("dataSeizureMitigationForeignHost")}
                </td>
                <td className="p-2 border-b border-border">⚠️</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-border">
                  {t("dataSeizureMitigationMinimalData")}
                </td>
                <td className="p-2 border-b border-border">✅</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-border">
                  {t("dataSeizureMitigationLocalTools")}
                </td>
                <td className="p-2 border-b border-border">✅</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t("dataSeizureGDPRTitle")}</h2>
          <p>{t("dataSeizureGDPRDesc")}</p>
        </section>

        <section className="bg-muted p-4 rounded border border-border">
          <p className="font-semibold">{t("dataSeizureTLDR")}</p>
        </section>
      </div>
    </div>
  );
};
