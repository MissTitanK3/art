"use client";

import { useEffect, useMemo, useState } from "react";
import type { LocationMode } from "./LocationDrawer";
import { useTranslations } from "@/lib/il8n/useTranslations";

type Props = {
  mode: LocationMode;
  onClick: () => void;
};

export default function LocationButton({ mode, onClick }: Props) {
  const { t } = useTranslations();
  const [permissionState, setPermissionState] =
    useState<PermissionState | null>(null);

  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !(navigator as any).permissions?.query
    )
      return;
    let cancelled = false;
    let status: PermissionStatus | null = null;

    const update = () => {
      if (cancelled) return;
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
        if (!cancelled) setPermissionState(null);
      }
    })();

    return () => {
      cancelled = true;
      if (status?.removeEventListener) {
        status.removeEventListener("change", update);
      } else if (status) {
        (status as any).onchange = null;
      }
    };
  }, []);

  const label = useMemo(() => {
    if (mode === "off") return t("locationButtonOff");
    if (mode === "report") return t("locationButtonReport");
    return t("locationButtonTrusted");
  }, [mode, t]);

  const style = useMemo(() => {
    if (mode === "off") return "bg-zinc-700 hover:bg-zinc-600";
    if (mode === "report") return "bg-blue-600 animate-pulse";
    return "bg-blue-600";
  }, [mode]);

  const permissionLabel = useMemo(() => {
    if (permissionState === "granted")
      return t("locationPermissionStatusGranted");
    if (permissionState === "prompt")
      return t("locationPermissionStatusPrompt");
    if (permissionState === "denied")
      return t("locationPermissionStatusDenied");
    return null;
  }, [permissionState, t]);

  return (
    <button
      onClick={onClick}
      className={`fixed right-4 top-6 z-[43] px-4 py-2 rounded-full text-white shadow ${style}`}
    >
      <span className="flex flex-col leading-tight">
        <span>{label}</span>
        {permissionLabel && (
          <span className="text-xs text-white/80">{permissionLabel}</span>
        )}
      </span>
    </button>
  );
}
