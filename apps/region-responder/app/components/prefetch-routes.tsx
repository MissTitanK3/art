"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Prefetch critical routes so their JS/data payloads are cached for offline use.
export function PrefetchRoutes() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch top-level routes and representative dynamic paths to warm caches.
    router.prefetch("/intake");
    router.prefetch("/region-response");
    router.prefetch("/intake/example");
    router.prefetch("/region-response/example");
  }, [router]);

  return null;
}
