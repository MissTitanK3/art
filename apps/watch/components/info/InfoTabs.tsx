"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "@/lib/il8n/useTranslations";
import JoinDispatchPanel from "@/components/features/JoinDispatch/JoinDispatchPanel";
import LanguageSupportPanel from "@/components/info/LanguageSupportPanel";
import GroupedImmigrantResources from "@/components/GroupedImmigrantResources";
import TransparencyPanel from "@/components/info/TransparencyPanel";
import LinkButton from "@/components/ui/FrostedLink";

type TabKey = "join" | "language" | "resources" | "transparency";

export default function InfoTabs() {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<TabKey>("join");

  const tabs = useMemo(
    () => [
      {
        id: "join" as TabKey,
        label: t("joinDispatchTitle"),
        content: <JoinDispatchPanel />,
      },
      {
        id: "language" as TabKey,
        label: t("requestLanguageSupport"),
        content: <LanguageSupportPanel compact />,
      },
      {
        id: "resources" as TabKey,
        label: t("immigrantResourcesTitle"),
        content: <GroupedImmigrantResources />,
      },
      {
        id: "transparency" as TabKey,
        label: t("transparencyTitle"),
        content: <TransparencyPanel />,
      },
    ],
    [t],
  );

  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="space-y-4">
      <LinkButton
        label={t("supportProject")}
        size="lg"
        variant="primary"
        className="w-full text-center"
        target="_blank"
        rel="noreferrer"
        title={t("supportProject")}
      />

      <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 rounded-full border transition ${
              activeTab === tab.id
                ? "border-white bg-white text-black"
                : "border-white/30 text-white/70 hover:border-white hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="border-t border-white/15 pt-4 text-sm">
        {currentTab?.content}
      </div>
    </div>
  );
}
