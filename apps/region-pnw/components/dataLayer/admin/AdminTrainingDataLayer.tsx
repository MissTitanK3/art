// apps/region-pnw/components/dataLayer/admin/AdminTrainingDataLayer.tsx
import TrainingClient from "@workspace/ui/layout/admin/training/training";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";
import type { AcademyTrainingSession, AcademyTrainingSessionParticipant } from "@workspace/store/types/academy";
import { ensureSupabaseEnv } from "@/lib/auth/supabase/utils";

function mapRowToSession(
  row: any,
  bySession: Record<string, AcademyTrainingSessionParticipant[]>,
): AcademyTrainingSession {
  return {
    id: String(row.id),
    classId: row.class_id ? String(row.class_id) : "",
    title: String(row.title ?? "Untitled Session"),
    start: String(row.start),
    end: String(row.end),
    modality: row.modality ?? "online",
    location: row.location ?? undefined,
    meetingUrl: row.meeting_url ?? undefined,
    instructorName: String(row.instructor_name ?? "TBD"),
    instructorType: row.instructor_type ?? "expert",
    status: row.status ?? "scheduled",
    seats: typeof row.seats === "object" && row.seats !== null ? row.seats : { capacity: 0, confirmed: 0, waitlist: 0 },
    timezone: row.timezone ?? undefined,
    relatedTopic: row.related_topic ?? undefined,
    participants: bySession[String(row.id)] ?? [],
  } as AcademyTrainingSession;
}

export default async function AdminTrainingDataLayer() {
  try {
    const env = ensureSupabaseEnv("server");
    const store = await nextCookies().catch(() => null as any);
    const client = createServerClient(env.url, env.anonKey, {
      cookies: {
        getAll() {
          if (!store) return [] as { name: string; value: string }[];
          return store.getAll().map(({ name, value }: { name: string; value: string }) => ({ name, value }));
        },
        setAll(cookies) {
          if (!store) return;
          try {
            cookies.forEach(({ name, value, options }) => {
              store.set(name, value, options as CookieOptions | undefined);
            });
          } catch { /* ignore cookie set errors */ void 0; }
        },
      },
    });

    const [{ data: sessions, error: sErr }, { data: participants, error: pErr }] = await Promise.all([
      client.from("academy_sessions").select("*").order("start", { ascending: true }),
      client.from("academy_participants").select("*"),
    ]);
    if (sErr) throw sErr;
    if (pErr) throw pErr;

    const bySession: Record<string, AcademyTrainingSessionParticipant[]> = {};
    for (const p of participants ?? []) {
      const sid = String(p.session_id);
      if (!bySession[sid]) bySession[sid] = [];
      bySession[sid].push({
        id: String(p.id),
        name: String(p.name ?? ""),
        signalHandle: p.signal_handle ?? undefined,
        understanding: p.understanding ?? "building",
        status: p.status ?? "confirmed",
      });
    }

    const mapped = (sessions ?? []).map((row: any) => mapRowToSession(row, bySession));
    return <TrainingClient initialSessions={mapped} />;
  } catch (e) {
    // Fallback: no data if Supabase not configured
    return <TrainingClient initialSessions={[]} />;
  }
}
