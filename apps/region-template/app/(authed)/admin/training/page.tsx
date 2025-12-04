"use client";
import { useEffect, useState } from "react";
import TrainingClient from "@workspace/ui/layout/admin/training/training";
import type {
  AcademyTrainingSession,
  AcademyTrainingSessionParticipant,
} from "@workspace/store/types/academy";
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
    seats:
      typeof row.seats === "object" && row.seats !== null
        ? row.seats
        : { capacity: 0, confirmed: 0, waitlist: 0 },
    timezone: row.timezone ?? undefined,
    relatedTopic: row.related_topic ?? undefined,
    participants: bySession[String(row.id)] ?? [],
  } as AcademyTrainingSession;
}
export default function AdminTrainingPage() {
  const [sessions, setSessions] = useState<AcademyTrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/academy/sessions");
        if (!res.ok) throw new Error("Failed to load sessions");
        const { sessions: sessionsData, participants: participantsData } =
          await res.json();
        if (cancelled) return;
        const bySession: Record<string, AcademyTrainingSessionParticipant[]> =
          {};
        for (const p of participantsData ?? []) {
          const sid = String(p.session_id);
          const sessionParticipants = bySession[sid] ?? (bySession[sid] = []);
          sessionParticipants.push({
            id: String(p.id),
            name: String(p.name ?? ""),
            signalHandle: p.signal_handle ?? undefined,
            understanding: p.understanding ?? "building",
            status: p.status ?? "confirmed",
          });
        }
        const mapped = (sessionsData ?? []).map((row: any) =>
          mapRowToSession(row, bySession),
        );
        setSessions(mapped);
      } catch (e) {
        console.warn("Failed to load admin training sessions", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);
  if (loading) return null; // Or a loading spinner
  return <TrainingClient initialSessions={sessions} />;
}
