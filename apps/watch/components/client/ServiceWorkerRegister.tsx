"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("sw.js", { scope: "./" })
        .catch(() => {});
    }
  }, []);

  return null;
}
