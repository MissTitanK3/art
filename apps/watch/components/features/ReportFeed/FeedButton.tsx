"use client";

import { List } from "lucide-react";
import { useTranslations } from "@/lib/il8n/useTranslations";

export default function FeedButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslations();
  return (
    <button
      onClick={onClick}
      className="fixed left-4 bottom-6 z-[43] px-4 py-2 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white shadow inline-flex items-center gap-2"
    >
      <List className="w-4 h-4" />
      <span>{t("feed")}</span>
    </button>
  );
}
