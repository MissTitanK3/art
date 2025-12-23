"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@workspace/ui/primitives";
import { toast } from "@workspace/ui/primitives/sonner";
import {
  formatLocalDateTime,
  useRegionResponseStore,
} from "@workspace/store/useRegionResponseStore";
import { listRouteIndexEntries, type RouteIndexEntry } from "@workspace/store/persistence/routeIndex";
import { ArrowLeft } from "lucide-react";
import { RegionResponseDetail } from "./region-response-detail";

function buildDataPath(buildId: string | undefined, path: string) {
  if (!buildId) return undefined;
  const [pathname] = path.split("?");
  const normalizedPath = pathname || "/";
  const trimmed = normalizedPath === "/" ? "" : normalizedPath.replace(/^\//, "");
  const normalized = trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
  const slug = normalized || "index";
  return `/_next/data/${buildId}/${slug}.json`;
}

export default function RegionResponseIndexPage() {
  const router = useRouter();
  const activeId = useRegionResponseStore((state) => state.activeId);
  const startSession = useRegionResponseStore((state) => state.startSession);
  const setActive = useRegionResponseStore((state) => state.setActive);
  const clearSession = useRegionResponseStore((state) => state.clearSession);

  const [routes, setRoutes] = useState<RouteIndexEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [showListView, setShowListView] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listRouteIndexEntries("region-response").then((entries) => {
      if (!cancelled) setRoutes(entries);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      router.prefetch("/region-response");
    } catch {
      // Ignore prefetch failures in environments that don't return a promise
    }
  }, [router]);

  useEffect(() => {
    if (selectedId) return;
    if (activeId) {
      setSelectedId(activeId);
      return;
    }
    if (routes.length) {
      setSelectedId(routes[0]?.id ?? "");
    }
  }, [activeId, routes, selectedId]);

  const handleStart = async () => {
    const session = await startSession();
    toast.success(`Response started (${session.responseRef})`);
    const createdAt = new Date(session.startedAt).getTime();
    const updatedAt = new Date(session.lastUpdatedAt).getTime();
    setRoutes((current) => [
      {
        id: session.id,
        kind: "region-response",
        createdAt,
        updatedAt,
        version: 1,
        label: session.responseRef,
      },
      ...current.filter((entry) => entry.id !== session.id),
    ]);

    setSelectedId(session.id);
    setShowListView(false);

    try {
      const buildId = (window as any).__NEXT_DATA__?.buildId as string | undefined;
      const dataPath = buildDataPath(buildId, "/region-response");
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.active?.postMessage({ type: "CACHE_ROUTE", path: "/region-response", dataPath });
        });
      }
    } catch {
      // Ignore SW warmup failures.
    }
  };

  const handleOpen = (id: string) => {
    setActive(id);
    setSelectedId(id);
    setShowListView(false);
  };

  const handleClear = async (id: string) => {
    await clearSession(id);
    toast.success("Response cleared");
    setRoutes((current) => current.filter((entry) => entry.id !== id));
    setSelectedId((current) => {
      if (current === id) {
        setShowListView(true);
        return "";
      }
      return current;
    });
  };

  const handleCloseDetail = () => {
    setShowListView(true);
  };

  const showDetail = Boolean(selectedId && !showListView);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-12">
      {showDetail ? (
        <RegionResponseDetail sessionId={selectedId} onBack={handleCloseDetail} />
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Region Response</p>
            <h1 className="text-2xl font-semibold leading-tight text-foreground">Start or continue a response</h1>
            <p className="text-sm text-muted-foreground">
              Launch a new response, or reopen a previous one to review history and export a dispatcher-ready summary.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button size="lg" className="h-12" onClick={handleStart}>
                Start Region Response
              </Button>
            </div>
          </div>

          <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Saved responses</p>
                <p className="text-sm text-muted-foreground">All responses are stored locally for offline access.</p>
              </div>
            </div>

            {!routes.length ? (
              <p className="text-sm text-muted-foreground">No responses yet. Start one to begin logging.</p>
            ) : (
              <div className="space-y-3">
                {routes.map((entry) => {
                  const isSelected = selectedId === entry.id;
                  return (
                    <div
                      key={entry.id}
                      className={`rounded-xl border bg-background p-4 ${isSelected ? "ring-2 ring-primary" : ""}`}
                    >
                      <div className="flex flex-col items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="h-7 rounded-full px-3">
                              {entry.label || entry.id}
                            </Badge>
                            {activeId === entry.id ? (
                              <Badge variant="secondary" className="h-7 rounded-full px-3">
                                Active
                              </Badge>
                            ) : null}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Started: {formatLocalDateTime(new Date(entry.createdAt).toISOString())}</p>
                            <p>Last updated: {formatLocalDateTime(new Date(entry.updatedAt).toISOString())}</p>
                            <p className="text-xs">Offline ready · v{entry.version}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full justify-evenly">
                          <Button size="sm" className="h-9" onClick={() => handleOpen(entry.id)}>
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9"
                            onClick={() => handleClear(entry.id)}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
