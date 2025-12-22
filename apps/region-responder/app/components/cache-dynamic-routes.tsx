"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useIntakeDraftIndexStore } from "@workspace/store/useIntakeDraftIndexStore";
import { useRegionResponseStore } from "@workspace/store/useRegionResponseStore";

const STATIC_PATHS = ["/", "/intake", "/region-response"];

function buildDataPath(buildId: string, path: string) {
  const trimmed = path === "/" ? "" : path.replace(/^\//, "");
  const normalized = trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
  const slug = normalized || "index";
  return `/_next/data/${buildId}/${slug}.json`;
}

export function CacheDynamicRoutes() {
  const router = useRouter();
  const intakeDrafts = useIntakeDraftIndexStore((state) => state.drafts);
  const responseSessions = useRegionResponseStore((state) => state.sessions);

  const intakeIds = useMemo(() => intakeDrafts.map((draft) => draft.id).filter(Boolean), [intakeDrafts]);
  const responseIds = useMemo(
    () => Object.keys(responseSessions ?? {}).filter(Boolean),
    [responseSessions],
  );

  const sent = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const buildId = (window as any).__NEXT_DATA__?.buildId ?? "";
    const paths = new Set<string>(STATIC_PATHS);
    intakeIds.forEach((id) => paths.add(`/intake/${encodeURIComponent(id)}`));
    responseIds.forEach((id) => paths.add(`/region-response/${encodeURIComponent(id)}`));

    paths.forEach((path) => {
      if (sent.current.has(path)) return;
      sent.current.add(path);

      // Warm Next's prefetch cache so JS/data are requested while online.
      try {
        router.prefetch(path);
      } catch {
        // Ignore prefetch errors in offline/unsupported contexts.
      }

      if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
      navigator.serviceWorker.ready
        .then((registration) => {
          const active = registration.active;
          if (!active) return;
          const normalizedPath = path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
          const dataPath = buildId ? buildDataPath(buildId, normalizedPath) : undefined;
          active.postMessage({ type: "CACHE_ROUTE", path: normalizedPath, dataPath });
        })
        .catch(() => undefined);
    });
  }, [router, intakeIds.join(","), responseIds.join(",")]);

  return null;
}
