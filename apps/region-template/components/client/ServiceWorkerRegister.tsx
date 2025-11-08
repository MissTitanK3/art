"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const swUrl = "sw.js"; // relative path supports subpath deployments
      navigator.serviceWorker
        .register(swUrl, { scope: "./" })
        .catch(() => {
          // Silently ignore registration failures
        });
    }
  }, []);

  return null;
}
