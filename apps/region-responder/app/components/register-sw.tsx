"use client";
import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    const shouldEnableSW =
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ENABLE_SW_DEV === "1";

    if (shouldEnableSW && typeof window !== "undefined" && "serviceWorker" in navigator) {
      const scope = process.env.NEXT_PUBLIC_SW_SCOPE ?? "/region-responder/";
      const swUrl = `${scope.replace(/\/$/, "")}/sw.js`;
      const expectedScope = new URL(scope, window.location.origin).href;

      navigator.serviceWorker
        .register(swUrl, { scope })
        .catch((err) => {
          console.warn("Service worker registration failed:", err);
        });

      // Clean up any registrations that don't match our expected scope (including old root-scoped ones)
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          const scopeMismatch = registration.scope !== expectedScope;

          if (scopeMismatch) {
            registration.unregister().catch(() => undefined);
          }
        });
      });
    }
  }, []);
  return null;
}
