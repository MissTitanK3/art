"use client";

import * as React from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useProfileStore } from "@/store/useProfileStore";
import type { Profile } from "@/schemas/profiles";

// Debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 500) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function ProfileSyncAgent() {
  const { status, session } = useAuth();
  const setProfile = useProfileStore((s) => s.setProfile);
  const regionId = useProfileStore((s) => s.region_id);
  const sectorCode = useProfileStore((s) => s.sector_code);

  // Load or create profile on auth
  React.useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    let active = true;

    const user = session.user;
    const userId = user.id;

    async function ensureProfile() {
      // Try to fetch existing
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (!active) return;
      if (error) {
        console.warn("profiles select error", error);
      }

      if (!data) {
        // Create minimal profile row
        const display_name =
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          (user.email?.split("@")[0] ?? "Explorer");
        const insert: Profile = {
          id: userId,
          display_name,
          region_id: regionId || "region-pnw",
          sector_code: sectorCode || undefined,
        };
        const { data: created, error: insErr } = await supabase
          .from("profiles")
          .insert(insert)
          .select("*")
          .single();
        if (insErr) {
          console.warn("profiles insert error", insErr);
        }
        if (!active) return;
        setProfile(created ?? insert);
        return;
      }

      // Sync store
      setProfile(data as any);
      try {
        const { dock_lat, dock_lng, dock_radius_km } = (data as any) || {};
        if (Number.isFinite(dock_lat) && Number.isFinite(dock_lng)) {
          useProfileStore
            .getState()
            .setDock(
              dock_lat,
              dock_lng,
              typeof dock_radius_km === "number" ? dock_radius_km : undefined,
            );
        }
      } catch {}
    }

    ensureProfile();

    return () => {
      active = false;
    };
  }, [status, session?.user?.id]);

  // Push local profile changes to Supabase when authenticated
  React.useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const userId = session.user.id;
    const getState = useProfileStore.getState;

    const push = debounce(async () => {
      const s = getState();
      const p = s.profile;
      if (!p) return;
      // Upsert fields we allow clients to change
      const patch = {
        id: userId,
        display_name: p.display_name,
        region_id: p.region_id,
        sector_code: p.sector_code ?? null,
        // include dock fields from top-level store, falling back to profile if present
        dock_lat: s.dock_lat ?? p.dock_lat ?? null,
        dock_lng: s.dock_lng ?? p.dock_lng ?? null,
        dock_radius_km: s.dock_radius_km ?? p.dock_radius_km ?? null,
      };
      const { error } = await supabase
        .from("profiles")
        .upsert(patch, { onConflict: "id" });
      if (error) console.warn("profiles upsert error", error);
    }, 600);

    // Subscribe to store changes; trigger when profile OR dock fields change
    const unsub = useProfileStore.subscribe((state, prevState) => {
      if (
        state.profile !== prevState.profile ||
        state.dock_lat !== prevState.dock_lat ||
        state.dock_lng !== prevState.dock_lng ||
        state.dock_radius_km !== prevState.dock_radius_km
      ) {
        push();
      }
    });
    return () => unsub();
  }, [status, session?.user?.id]);

  return null;
}
