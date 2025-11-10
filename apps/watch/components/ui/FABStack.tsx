"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/il8n/provider";
import { useTranslations } from "@/lib/il8n/useTranslations";
import {
  Plus,
  Map as MapIcon,
  Settings,
  RefreshCw,
  Languages,
  Compass,
  BookOpen,
  ArrowLeftFromLine,
  ArrowRightFromLine,
} from "lucide-react";

type Props = {
  onAddReport?: () => void;
  onFilters?: () => void;
  onToggleLive?: () => void;
  onInfo?: () => void;
  liveActive?: boolean;
  unit?: "km" | "mi";
  onToggleUnit?: () => void;
  onMapSettings?: () => void;
  isReporting?: boolean;
  onCancelReport?: () => void;
};

export default function FABStack({
  onAddReport,
  onFilters,
  onToggleLive,
  onInfo,
  liveActive,
  unit,
  onToggleUnit,
  onMapSettings,
  isReporting,
  onCancelReport,
}: Props) {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslations();
  const [compact, setCompact] = useState(false);

  // hydrate compact preference
  if (
    typeof window !== "undefined" &&
    !compact &&
    localStorage.getItem("fab_compact") === "1"
  ) {
    // minimal hydration without useEffect to avoid flicker
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setCompact(true);
  }

  const setCompactPersist = (v: boolean) => {
    setCompact(v);
    try {
      localStorage.setItem("fab_compact", v ? "1" : "0");
    } catch {}
  };

  const label = (icon: React.ReactNode, text: string) =>
    compact ? (
      <span
        className="inline-flex items-center gap-2"
        aria-label={text}
        title={text}
      >
        {icon}
      </span>
    ) : (
      <span className="inline-flex items-center gap-2">
        {icon}
        {text}
      </span>
    );

  return (
    <div className="fixed bottom-6 right-4 z-[43] flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col items-end gap-2 mb-18">
          {/* Top action: Add or Cancel report */}
          <button
            onClick={() => {
              onMapSettings?.();
              setOpen(false);
            }}
            className={`px-4 py-2 rounded-full bg-zinc-700 text-white shadow hover:bg-zinc-600 ${compact ? "w-20" : "w-44"}`}
          >
            {label(<MapIcon className="w-4 h-4" />, t("basemap"))}
          </button>
          <button
            onClick={() => {
              onToggleLive?.();
              setOpen(false);
            }}
            className={`px-4 py-2 rounded-full text-white shadow ${liveActive ? "bg-red-600 hover:bg-red-700" : "bg-zinc-700 hover:bg-zinc-600"} ${compact ? "w-20" : "w-44"}`}
          >
            {label(
              <RefreshCw className="w-4 h-4" />,
              liveActive ? t("liveOn") : t("liveOff"),
            )}
          </button>
          <button
            onClick={() => {
              setLanguage(language === "en" ? "es" : "en");
              setOpen(false);
            }}
            className={`px-4 py-2 rounded-full bg-zinc-700 text-white shadow hover:bg-zinc-600 ${compact ? "w-20" : "w-44"}`}
          >
            {label(
              <Languages className="w-4 h-4" />,
              t(`language.${language}` as any),
            )}
          </button>
          <button
            onClick={() => {
              onToggleUnit?.();
              setOpen(false);
            }}
            className={`px-4 py-2 rounded-full bg-zinc-700 text-white shadow hover:bg-zinc-600 ${compact ? "w-20" : "w-44"}`}
          >
            {label(
              <Compass className="w-4 h-4" />,
              `${t(`unit.${unit ?? "km"}` as any)}`,
            )}
          </button>
          <button
            onClick={() => {
              onInfo?.();
              setOpen(false);
            }}
            className={`px-4 py-2 rounded-full bg-zinc-700 text-white shadow hover:bg-zinc-600 ${compact ? "w-20" : "w-44"}`}
          >
            {label(<BookOpen className="w-4 h-4" />, t("info"))}
          </button>
          <button
            onClick={() => setCompactPersist(!compact)}
            className={`px-4 py-2 rounded-full bg-zinc-700 text-white shadow hover:bg-zinc-600 ${compact ? "w-20" : "w-44"}`}
          >
            {compact
              ? label(
                  <ArrowLeftFromLine className="w-4 h-4" />,
                  t("showLabels"),
                )
              : label(
                  <ArrowRightFromLine className="w-4 h-4" />,
                  t("iconsOnly"),
                )}
          </button>
          <button
            onClick={() => {
              onFilters?.();
              setOpen(false);
            }}
            className={`px-4 py-2 rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-700 ${compact ? "w-20" : "w-44"}`}
          >
            {label(<Settings className="w-4 h-4" />, t("filters"))}
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="fixed right-4 bottom-6 z-[43] px-4 py-2 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white shadow inline-flex items-center gap-2"
      >
        {open ? "✕" : "⋮"}
        <span>Options</span>
      </button>
    </div>
  );
}
