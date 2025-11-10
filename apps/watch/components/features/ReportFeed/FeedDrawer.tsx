"use client";

import BottomDrawer from "@/components/ui/BottomDrawer";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Report } from "@/types/wizard";
import FeedItem from "./FeedItem";
import { useTranslations } from "@/lib/il8n/useTranslations";

type FeedDrawerProps = {
  zoom: number;
  openAtZoom?: number; // default 12
  openExternal?: boolean; // controlled open from parent (e.g., FAB)
  onCloseExternal?: () => void;
  reports?: Report[];
  onZoomTo?: (pos: { lat: number; lng: number }) => void;
};

export default function FeedDrawer({
  zoom,
  openAtZoom = 12,
  openExternal,
  onCloseExternal,
  reports,
  onZoomTo,
}: FeedDrawerProps) {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);
  const lastZoomRef = useRef<number>(zoom);

  const shouldAutoOpen = useMemo(() => zoom >= openAtZoom, [zoom, openAtZoom]);

  useEffect(() => {
    if (openExternal !== undefined) return; // controlled mode, skip auto behavior
    // auto open when crossing threshold upward; close when below
    const last = lastZoomRef.current;
    if (
      !open &&
      !Number.isNaN(last) &&
      last < openAtZoom &&
      zoom >= openAtZoom
    ) {
      setOpen(true);
    }
    if (open && zoom < openAtZoom) {
      setOpen(false);
    }
    lastZoomRef.current = zoom;
  }, [zoom, open, openAtZoom, openExternal]);

  const isControlled = openExternal !== undefined;
  const isOpen = isControlled ? !!openExternal : open || shouldAutoOpen;

  return (
    <BottomDrawer
      isOpen={isOpen}
      heightClassName="h-[70vh] max-w-lg mx-auto"
      onClose={() => {
        if (isControlled) {
          onCloseExternal?.();
        } else {
          setOpen(false);
        }
      }}
      title={t("reportsInViewTitle")}
    >
      <FeedContent reports={reports} onZoomTo={onZoomTo} />
    </BottomDrawer>
  );
}

// Internal content is a stub; parent will replace via context in a follow-up pass.
function FeedContent({
  reports,
  onZoomTo,
}: {
  reports?: Report[];
  onZoomTo?: (pos: { lat: number; lng: number }) => void;
}) {
  const { t } = useTranslations();
  if (!reports || reports.length === 0) {
    return <div className="text-sm text-white/60">{t("noReportsInView")}</div>;
  }
  return (
    <ul className="space-y-3">
      {reports.map((r) => (
        <FeedItem key={r.id} report={r} onZoomTo={onZoomTo} />
      ))}
    </ul>
  );
}
