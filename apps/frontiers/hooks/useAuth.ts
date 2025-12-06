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
    
    async function hydrate() {
      const [{ data: sessionData }, { data: userData }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser()
      ]);

      if (!active) return;

      if (sessionData.session) {
         if (userData.user) {
            sessionData.session.user = userData.user;
         }
         setSession(sessionData.session);
         setStatus("authenticated");
      } else {
         setSession(null);
         setStatus("unauthenticated");
      }
    }

    hydrate();

    const { data: sub } = supabase.auth.onAuthStateChange((_event: any, next: any) => {
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
