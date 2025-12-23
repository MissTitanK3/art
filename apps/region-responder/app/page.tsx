"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@workspace/ui/primitives";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/primitives/alert-dialog";
import { toast } from "@workspace/ui/primitives/sonner";
import ThemeToggle from "@workspace/ui/patterns/common/theme-toggle";
import { useRegionResponseStore } from "@workspace/store/useRegionResponseStore";
import { useIntakeDraftIndexStore } from "@workspace/store/useIntakeDraftIndexStore";
import { clearIntakeDraftPersistence, generateIntakeDraftId, initializeIntakeDraft } from "@workspace/store/useIntakeDraftStore";
import { listRouteIndexEntries } from "@workspace/store/persistence/routeIndex";
import { Info } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const startSession = useRegionResponseStore((state) => state.startSession);
  const setActive = useRegionResponseStore((state) => state.setActive);
  const clearResponses = useRegionResponseStore((state) => state.clearAll);
  const responseSessions = useRegionResponseStore((state) => state.sessions);

  const upsertDraft = useIntakeDraftIndexStore((state) => state.upsertDraft);
  const clearDraftIndex = useIntakeDraftIndexStore((state) => state.clearAll);
  const intakeDrafts = useIntakeDraftIndexStore((state) => state.drafts);

  const [swDetails, setSwDetails] = useState<{ scriptUrl?: string; state?: string; caches: string[] }>({
    caches: [],
  });
  const [exportingLogs, setExportingLogs] = useState(false);

  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "local-dev";
  const swCacheId = "region-responder-v1.0.003";
  const cacheNamespace = "region-responder";

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          const active = reg?.active;
          const swState = active?.state;
          const swUrl = active?.scriptURL;
          const cacheKeys = (await caches.keys())?.filter((key) => key.includes(cacheNamespace)) ?? [];
          if (!cancelled) {
            setSwDetails({ scriptUrl: swUrl, state: swState, caches: cacheKeys });
          }
        }
      } catch {
        // ignore diagnostics failures
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [cacheNamespace]);

  const intakeCount = intakeDrafts?.length ?? 0;
  const responseCount = useMemo(() => Object.keys(responseSessions ?? {}).length, [responseSessions]);

  const handleExportLogs = async () => {
    const code = typeof window !== "undefined" ? window.prompt("Enter diagnostics code") : null;
    if (code !== "4444") {
      toast.error("Incorrect code");
      return;
    }
    if (exportingLogs) return;
    setExportingLogs(true);
    try {
      const swReg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
      const active = swReg?.active;
      const cacheKeys = typeof caches !== "undefined" ? await caches.keys() : [];
      const filteredCaches = cacheKeys.filter((key) => key.includes(cacheNamespace));
      const routeIndex = await listRouteIndexEntries().catch(() => []);

      const payload = {
        generatedAt: new Date().toISOString(),
        appVersion,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        sw: {
          scriptUrl: active?.scriptURL,
          state: active?.state,
          scope: swReg?.scope,
          cacheId: swCacheId,
        },
        caches: filteredCaches,
        intakeDraftsCount: intakeCount,
        responseSessionsCount: responseCount,
        routeIndex,
        localStorageKeys:
          typeof localStorage !== "undefined"
            ? Object.keys(localStorage).filter((k) => k.toLowerCase().includes("region"))
            : [],
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `region-responder-diagnostics-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Diagnostics downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Unable to export diagnostics");
    } finally {
      setExportingLogs(false);
    }
  };

  const clearServiceWorkerState = async () => {
    if (typeof window === "undefined") return;
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          regs
            .filter((reg) => reg.scope && reg.scope.startsWith(window.location.origin + "/"))
            .map((reg) => reg.unregister().catch(() => undefined)),
        );
      }
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        const ours = keys.filter((key) => key.startsWith("region-responder"));
        await Promise.all(ours.map((key) => caches.delete(key).catch(() => false)));
      }
    } catch (err) {
      console.warn("Failed to clear service worker state", err);
    }
  };

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleStartResponse = async () => {
    const buildDataPath = (buildId: string | undefined, path: string) => {
      if (!buildId) return undefined;
      const [pathname] = path.split("?");
      const normalizedPath = pathname || "/";
      const trimmed = normalizedPath === "/" ? "" : normalizedPath.replace(/^\//, "");
      const normalized = trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
      const slug = normalized || "index";
      return `/_next/data/${buildId}/${slug}.json`;
    };

    const session = await startSession();
    setActive(session.id);
    const path = `/region-response`;

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

    router.push(path);
  };

  const handleStartIntake = async () => {
    const id = generateIntakeDraftId();
    const now = new Date().toISOString();
    await initializeIntakeDraft(id, { lastUpdatedAt: now });
    upsertDraft({ id, caseRef: "Pending", lastUpdatedAt: now, createdAt: now, status: "wip" });
    const path = `/intake`;
    router.push(path);
  };

  const handleResetAll = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      await clearResponses();
      clearDraftIndex();
      await clearIntakeDraftPersistence();
      await clearServiceWorkerState();
      toast.success("All local data cleared");
      setShowResetDialog(false);
    } catch (error) {
      console.error(error);
      toast.error("Unable to clear local data. Try again.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center px-3 py-10">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between w-full items-center">

            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Field Intake</p>
            <ThemeToggle />
          </div>
          <h1 className="text-2xl leading-tight text-foreground">
            Capture what you see and report to dispatch, even offline.
          </h1>
          <p className="text-base text-muted-foreground">
            Choose a flow and start. Large tap targets and high contrast for fast, one-handed entry.
          </p>
        </div>

        <div className="space-y-3">
          <Button size="lg" className="w-full h-14 text-lg font-semibold" onClick={handleStartResponse}>
            Start Region Response
          </Button>
          <p className="text-sm text-muted-foreground">
            Guided steps for what to check, gather, and send back from the field.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            variant="outline"
            className="w-full h-14 text-lg font-semibold"
            onClick={handleStartIntake}
          >
            Start Missing Person Intake
          </Button>
          <p className="text-sm text-muted-foreground">
            Use alone or attach to a Region Response. Collect person details and hand off to dispatch.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            variant="destructive"
            className="w-full h-12 text-base"
            onClick={() => setShowResetDialog(true)}
          >
            Clear All Local Data
          </Button>
          <p className="text-sm text-muted-foreground">
            Deletes all saved responses and intake drafts from this device. This cannot be undone.
          </p>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>No account needed. Works offline and keeps entries on this device until you forward.</p>
          <p>Share the generated report with dispatch over Signal.</p>
        </div>

        <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
          <p>This RR tool is maintained by a small independent developer.</p>
          <p>Any optional support helps sustain long-term work on calm, community-centered tools.</p>
          <p>The tool is complete without payment.</p>
          <p>If you would like to offer support outside the tool, you can do so on Ko-fi.</p>
          <p className="text-xs">This opens an external page and is optional.</p>
          <a
            href="https://ko-fi.com/techwitch"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-lg bg-accent/60 px-3 py-2 text-center text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            Open Ko-fi (external)
          </a>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Info className="h-4 w-4" aria-hidden />
            <span>Build diagnostics</span>
          </div>
          <div className="grid grid-cols-1 gap-1">
            <div>SW script: {swDetails.scriptUrl ?? "not registered"}</div>
            <div>SW state: {swDetails.state ?? "unknown"}</div>
            <div>SW cache id: {swCacheId}</div>
            <div>App caches: {swDetails.caches.length ? swDetails.caches.join(", ") : "none"}</div>
            <div>Intakes: {intakeCount}</div>
            <div>Response sessions: {responseCount}</div>
          </div>
          <div className="pt-2">
            <Button size="sm" variant="outline" disabled={exportingLogs} onClick={handleExportLogs}>
              {exportingLogs ? "Preparing…" : "Export diagnostics (code)"}
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all local data?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes every saved Region Response and Intake draft from this device. You cannot undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
              disabled={resetting}
              onClick={handleResetAll}
            >
              {resetting ? "Clearing..." : "Yes, clear all"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
