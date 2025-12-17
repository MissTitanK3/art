"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LogoutPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Clear client-side session and local storage
        await signOut();
      } catch {
        /* ignore signOut errors */ void 0;
      }
      try {
        // Also clear server-side Supabase cookies
        await fetch("/sign-out", { method: "GET", cache: "no-store" });
      } catch {
        /* ignore sign-out route errors */ void 0;
      }
      if (!cancelled) router.replace("/sign-in");
    })();
    return () => {
      cancelled = true;
    };
  }, [router, signOut]);

  return null;
}
