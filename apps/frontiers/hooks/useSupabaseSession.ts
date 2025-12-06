"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useSupabaseSession() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const [{ data: sessionData }, { data: userData }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser()
      ]);

      if (!mounted) return;

      if (sessionData.session) {
        if (userData.user) {
          sessionData.session.user = userData.user;
        }
        setSession(sessionData.session);
      } else {
        setSession(null);
      }
    }

    hydrate();

    const { data: sub } = supabase.auth.onAuthStateChange((_e: any, s: any) => {
      if (mounted) setSession(s);
    });
    return () => {
      mounted = false;
      try {
        sub.subscription.unsubscribe();
      } catch {}
    };
  }, []);

  return session;
}
