"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" | string }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  const mq =
    window.matchMedia && window.matchMedia("(display-mode: standalone)");
  // iOS Safari
  const iosStandalone =
    typeof navigator !== "undefined" &&
    "standalone" in navigator &&
    (navigator as any).standalone;
  return (mq && mq.matches) || iosStandalone;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // already installed
    if (typeof window === "undefined") return;
    if (localStorage.getItem("pwaInstalled") === "1") return;
    if (localStorage.getItem("pwaPromptDismissed") === "1") return;

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onAppInstalled = () => {
      localStorage.setItem("pwaInstalled", "1");
      setVisible(false);
      setDeferred(null);
      try {
        console.info("PWA installed");
      } catch (error) {
        console.warn("[pwa] logging install event failed", error);
      }
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (!visible || !deferred) return null;

  const onInstall = async () => {
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice?.outcome === "accepted") {
        localStorage.setItem("pwaInstalled", "1");
      }
    } catch (error) {
      console.warn("[pwa] install prompt failed", error);
    }
    setDeferred(null);
    setVisible(false);
  };

  const onDismiss = () => {
    localStorage.setItem("pwaPromptDismissed", "1");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-lg px-4 py-3 flex items-center gap-3">
        <span className="text-sm">Install this app for offline access</span>
        <button
          onClick={onInstall}
          className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90"
        >
          Install
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent hover:text-accent-foreground"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
