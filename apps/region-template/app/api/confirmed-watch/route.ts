import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { notifyUsers, resolveRecipientsByRoles } from "@/lib/server/notify";

type Direction =
  | "North"
  | "NorthEast"
  | "East"
  | "SouthEast"
  | "South"
  | "SouthWest"
  | "West"
  | "NorthWest";

type ConfirmedWatchPayload = {
  timestamp: string;
  agency_type: string[] | null;
  agency_other: string | null;
  location: { lat: number; lng: number };
  media_url: string | null;
  officer_moving: boolean | null;
  officer_direction: Direction | null;
  lights_on: boolean | null;
  sirens_on: boolean | null;
  vet_method: string | null;
  vet_notes: string | null;
  submitted_by?: string | null;
  test: boolean;
};

// Create a new confirmed watch report in the `wizard` table and notify globally (respecting prefs)
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user)
      return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

    const payload = (await req.json()) as Partial<ConfirmedWatchPayload>;
    const loc = payload?.location as any;
    if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") {
      return NextResponse.json({ error: "INVALID_LOCATION" }, { status: 400 });
    }

    // Resolve profile.id to satisfy potential FK on submitted_by
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    const submitted_by = profileRow?.id ?? null;

    const row = {
      timestamp: payload?.timestamp ?? new Date().toISOString(),
      agency_type: Array.isArray(payload?.agency_type)
        ? payload?.agency_type
        : null,
      agency_other: payload?.agency_other ?? null,
      location: { lat: Number(loc.lat), lng: Number(loc.lng) },
      media_url: payload?.media_url ?? null,
      vet_method: payload?.vet_method ?? null,
      vet_notes: payload?.vet_notes ?? null,
      officer_moving:
        typeof payload?.officer_moving === "boolean"
          ? payload.officer_moving
          : null,
      officer_direction: (payload?.officer_direction ??
        null) as Direction | null,
      lights_on:
        typeof payload?.lights_on === "boolean" ? payload.lights_on : null,
      sirens_on:
        typeof payload?.sirens_on === "boolean" ? payload.sirens_on : null,
      submitted_by,
      test: Boolean(payload?.test ?? false),
      updated_at: new Date().toISOString(),
    } as const;

    const { data: inserted, error } = await supabase
      .from("wizard")
      .insert(row)
      .select("*")
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    // Preference-aware global notification on system channel (watch channel not yet exposed in settings)
    try {
      const recipients = await resolveRecipientsByRoles({
        respectPrefs: true,
        channel: "system",
      });
      if (recipients.length) {
        const title = "New Confirmed Watch Report";
        const agency =
          Array.isArray(inserted?.agency_type) && inserted.agency_type.length
            ? inserted.agency_type.join(", ")
            : undefined;
        await notifyUsers({
          title,
          body: agency ? `Agency: ${agency}` : undefined,
          level: "info",
          channel: "system",
          link: "/watch",
          recipients,
        });
      }
    } catch (e) {
      console.warn("[confirmed-watch] notify exception:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return jsonError(e);
  }
}
