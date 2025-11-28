import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { notifyUsers, resolveRecipientsByRoles } from "@/lib/server/notify";
import { isDemoMode } from "@/lib/demo/supabaseStub";

// Create a new dispatch submission and notify everyone on the dispatch channel
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user)
      return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

    const payload = await req.json();
    // Minimal shape validation; we trust the client form to provide the full draft
    const submission = {
      id: String(payload?.id ?? crypto.randomUUID()),
      type: payload?.type ?? null,
      location: payload?.location ?? null,
      timestamp: payload?.timestamp ?? new Date().toISOString(),
      date_of_event: payload?.date_of_event ?? null,
      required_roles: Array.isArray(payload?.required_roles)
        ? payload.required_roles
        : null,
      encrypted_payload: payload?.encrypted_payload ?? null,
      auto_delete_after: payload?.auto_delete_after ?? null,
      integrity_hash: payload?.integrity_hash ?? null,
      submitted_by: payload?.submitted_by ?? null,
      source: payload?.source ?? null,
      visibility_radius_km: payload?.visibility_radius_km ?? null,
      status: payload?.status ?? "open",
      assigned_volunteers: Array.isArray(payload?.assigned_volunteers)
        ? payload.assigned_volunteers
        : [],
      required_roles_by_type: payload?.required_roles_by_type ?? null,
      location_label: payload?.location_label ?? null,
      point_of_contact: payload?.point_of_contact ?? null,
      state: payload?.state ?? null,
      intended_action_preset: payload?.intended_action_preset ?? null,
      intended_action_notes: payload?.intended_action_notes ?? null,
      intended_actions: Array.isArray(payload?.intended_actions)
        ? payload.intended_actions
        : null,
      intended_actions_custom: payload?.intended_actions_custom ?? null,
      signal_link: payload?.signal_link ?? null,
      training: Boolean(payload?.training ?? false),
      flagged: Boolean(payload?.flagged ?? false),
      updated_at: new Date().toISOString(),
    } as const;

    const { data, error } = await supabase
      .from("dispatch_submissions")
      .insert(submission)
      .select("id")
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    // Notify all users (respecting prefs) on dispatch channel, link to the submission detail page
    try {
      const recipients = await resolveRecipientsByRoles({
        respectPrefs: true,
        channel: "dispatch",
      });
      if (recipients.length) {
        await notifyUsers({
          title: "New Dispatch Request",
          body: submission.location_label
            ? `Location: ${submission.location_label}`
            : undefined,
          level: "info",
          channel: "dispatch",
          link: `/dispatches/submission/${data.id}`,
          recipients,
        });
      }
    } catch (e) {
      console.warn("[dispatches] notify exception:", e);
    }

    return NextResponse.json({ id: data.id });
  } catch (e: any) {
    return jsonError(e);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (isDemoMode()) {
      // Always return a deterministic demo dispatch so the list has content.
      const now = new Date().toISOString();
      return NextResponse.json([
        {
          id: "demo-dispatch-fixed",
          type: "dispatch",
          location: { lat: 47.6062, lng: -122.3321 },
          location_label: "Demo Plaza Station",
          timestamp: now,
          date_of_event: now,
          status: "open",
          required_roles: ["scout", "dispatcher"],
          point_of_contact: "Demo Coordinator",
          state: "demo",
          updates: [],
          logistics: [],
          training: false,
          flagged: false,
          submitted_by: "demo-user",
          source: "demo",
        },
      ]);
    }

    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("dispatch_submissions")
      .select("*")
      .is("deleted_at", null)
      .order("date_of_event", { ascending: true, nullsFirst: false });

    if (status && status !== "all") query = query.eq("status", status);
    if (type && type !== "all") query = query.eq("type", type);
    if (from) query = query.gte("date_of_event", `${from}T00:00:00.000Z`);
    if (to) query = query.lte("date_of_event", `${to}T23:59:59.999Z`);
    if (q && q.trim().length > 0) {
      const like = `%${q}%`;
      query = query.or(
        `location_label.ilike.${like},state.ilike.${like},intended_action_preset.ilike.${like},intended_action_notes.ilike.${like}`,
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (e: any) {
    return jsonError(e);
  }
}
