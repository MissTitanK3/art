"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  // Start with a stable server/client render; update the real status after mount.
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateStatus = () => setOffline(!navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">
      <div className="flex gap-3">
        <WifiOff className="h-5 w-5 shrink-0" aria-hidden />
        <div className="space-y-1 text-sm leading-relaxed">
          <p className="font-semibold text-amber-900">Offline mode</p>
          <p>
            You can keep using the app while offline. Avoid hard refreshing or closing this tab until
            you are back online.
          </p>
        </div>
      </div>
    </div>
  );
}
