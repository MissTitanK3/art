"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "@/lib/il8n/useTranslations";

export type LocationMode = "off" | "report" | "trusted";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mode: LocationMode;
  onChangeMode: (m: LocationMode) => void;
  showRadius: boolean;
  radius: number;
  onToggleRadius: () => void;
  onErase: () => void;
};

export default function LocationDrawer({
  isOpen,
  onClose,
  mode,
  onChangeMode,
  showRadius,
  radius,
  onToggleRadius,
  onErase,
}: Props) {
  const { t } = useTranslations();
  const [permissionState, setPermissionState] =
    useState<PermissionState | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !(navigator as any).permissions?.query
    )
      return;
    let status: PermissionStatus | null = null;
    let canceled = false;

    const update = () => {
      if (canceled) return;
      setPermissionState(status?.state ?? null);
    };

    (async () => {
      try {
        status = await (navigator as any).permissions.query({
          name: "geolocation" as PermissionName,
        });
        update();
        status?.addEventListener?.("change", update);
      } catch {
        if (!canceled) setPermissionState(null);
      }
    })();

    return () => {
      canceled = true;
      if (status?.removeEventListener) {
        status.removeEventListener("change", update);
      } else if (status) {
        (status as any).onchange = null;
      }
    };
  }, []);

  const permissionLabel = useMemo(() => {
    if (permissionState === "granted")
      return t("locationPermissionStatusGranted");
    if (permissionState === "prompt")
      return t("locationPermissionStatusPrompt");
    if (permissionState === "denied")
      return t("locationPermissionStatusDenied");
    return null;
  }, [permissionState, t]);

  const trustedDisabled = permissionState === "denied";

  return (
    <div
      className={`fixed left-0 right-0 bottom-0 z-[47] bg-white/10 backdrop-blur-md border-t border-white/20 transition-transform duration-300 ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="px-4 py-3">
        <div className="mb-2 h-1.5 w-12 rounded bg-white/30 mx-auto" />
        <h3 className="text-lg font-semibold text-white mb-2">
          {t("locationSettingsTitle")}
        </h3>
        {permissionLabel && (
          <p className="mb-2 text-sm text-white/70">{permissionLabel}</p>
        )}
        <div className="space-y-2 text-white/90">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="locmode"
              checked={mode === "off"}
              onChange={() => onChangeMode("off")}
            />
            <span>
              {t("locationModeOffLabel")}: {t("locationModeOffDesc")}
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="locmode"
              checked={mode === "report"}
              onChange={() => onChangeMode("report")}
            />
            <span>
              {t("locationModeReportLabel")}: {t("locationModeReportDesc")}
            </span>
          </label>
          <label
            className={`flex items-center gap-2 ${trustedDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <input
              type="radio"
              name="locmode"
              checked={mode === "trusted"}
              onChange={() => onChangeMode("trusted")}
              disabled={trustedDisabled}
            />
            <span>
              {t("locationModeTrustedLabel")}: {t("locationModeTrustedDesc")}
            </span>
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={onToggleRadius}
            className="px-3 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-white"
          >
            <>
              {radius >= 1000
                ? `${(radius / 1000).toFixed(2)}${t("metersAbbrev")}`
                : `${radius}${t("metersAbbrev")}`}
            </>
          </button>
          <button
            onClick={onErase}
            className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
          >
            {t("eraseLocationData")}
          </button>
          <button
            onClick={onClose}
            className="ml-auto px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t("saveChoice")}
          </button>
        </div>
      </div>
    </div>
  );
}
