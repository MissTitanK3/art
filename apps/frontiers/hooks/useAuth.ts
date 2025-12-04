"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<
    | Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]
    | null
  >(null);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setStatus(data.session ? "authenticated" : "unauthenticated");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      setStatus(next ? "authenticated" : "unauthenticated");
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return { session, status };
}
