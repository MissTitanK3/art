import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { jsonError } from '@/lib/api/responses';
import { notifyUsers, resolveRecipientsByRoles } from '@/lib/server/notify';

export async function POST(req: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            id,
            pathwayId,
            pathwayLabel,
            trackLabel,
            variant,
            title,
            description,
            modality,
            instructorType,
            durationHours,
            capacity,
            startDate,
            startTime,
            location,
            meetingUrl,
            notes,
            instructorName,
            sessionsScheduled,
            nextSession,
            status,
            sessions, // Array of sessions
            members, // Array of members (needed for participant names if not provided)
        } = body;

        // 1. Upsert Class
        const classRow = {
            id,
            pathway_id: pathwayId,
            pathway_label: pathwayLabel,
            track_label: trackLabel,
            variant: variant,
            title: title,
            description: description,
            modality: modality,
            instructor_type: instructorType,
            duration_hours: durationHours,
            capacity: capacity,
            start_date: startDate,
            start_time: startTime,
            location: location,
            meeting_url: meetingUrl,
            notes: notes,
            instructor_name: instructorName,
            sessions_scheduled: sessionsScheduled,
            next_session: nextSession,
            status: status,
            updated_at: new Date().toISOString(),
        };

        const { error: classUpsertError } = await supabase
            .from('academy_classes')
            .upsert(classRow);

        if (classUpsertError) throw classUpsertError;

        // 2. Handle Sessions
        if (sessions && Array.isArray(sessions)) {
            // Fetch existing session ids for this class to compute deletions
            const { data: existingSessions, error: fetchSessionsErr } = await supabase
                .from('academy_sessions')
                .select('id')
                .eq('class_id', id);

            if (fetchSessionsErr) console.warn('Failed to read existing sessions', fetchSessionsErr);

            const currentSessionIds = new Set(sessions.map((s: any) => s.id));
            const toDeleteSessions = (existingSessions ?? [])
                .map((r: any) => r.id as string)
                .filter((sid: string) => !currentSessionIds.has(sid));

            if (toDeleteSessions.length > 0) {
                const { error: delErr } = await supabase
                    .from('academy_sessions')
                    .delete()
                    .in('id', toDeleteSessions);
                if (delErr) console.warn('Failed to delete removed sessions', delErr);
            }

            // Upsert sessions
            const sessionRows = sessions.map((s: any) => {
                const start = s.date ? new Date(s.date) : null;
                const end =
                    start && s.durationHours
                        ? new Date(start.getTime() + s.durationHours * 60 * 60 * 1000)
                        : null;
                return {
                    id: s.id,
                    class_id: id,
                    title: s.label ?? null,
                    start: start ? start.toISOString() : null,
                    end: end ? end.toISOString() : null,
                    modality: modality ?? null,
                    location: location ?? null,
                    meeting_url: meetingUrl ?? null,
                    instructor_name: instructorName ?? null,
                    instructor_type: instructorType ?? null,
                    status: null, // as per original code
                    seats: null,
                    timezone: null,
                    related_topic: s.notes ?? null,
                };
            });

            if (sessionRows.length > 0) {
                const { error: upsertErr } = await supabase
                    .from('academy_sessions')
                    .upsert(sessionRows);
                if (upsertErr) console.warn('Failed to upsert sessions', upsertErr);
            }

            // 3. Handle Participants
            const sessionIds = sessions.map((s: any) => s.id);
            if (sessionIds.length > 0) {
                const { data: existingParts, error: fetchPartsErr } = await supabase
                    .from('academy_participants')
                    .select('id, session_id')
                    .in('session_id', sessionIds);

                if (fetchPartsErr) console.warn('Failed to read existing participants', fetchPartsErr);

                const existingPartKey = new Set(
                    (existingParts ?? []).map((r: any) => `${r.session_id}:${r.id}`)
                );
                const desiredPartKey = new Set<string>();
                const participantRows: any[] = [];

                // Build desired rows
                const rosterById = new Map<string, any>(
                    (members ?? []).map((m: any) => [m.id, m])
                );

                for (const s of sessions) {
                    if (!s.participants) continue;
                    for (const p of s.participants) {
                        const pid = `par_${s.id}__mem_${p.memberId}`;
                        desiredPartKey.add(`${s.id}:${pid}`);
                        const member = rosterById.get(p.memberId);
                        participantRows.push({
                            id: pid,
                            session_id: s.id,
                            name: member?.name ?? null,
                            signal_handle: null,
                            understanding: p.understanding ?? null,
                            status: p.present ? 'confirmed' : 'waitlist',
                        });
                    }
                }

                // Compute deletes
                const toDeleteParticipantIds: string[] = [];
                for (const key of existingPartKey) {
                    if (!desiredPartKey.has(key)) {
                        const parts = key.split(':');
                        const pid = parts[1] ?? '';
                        if (pid) toDeleteParticipantIds.push(pid);
                    }
                }

                if (toDeleteParticipantIds.length > 0) {
                    const { error: delPartErr } = await supabase
                        .from('academy_participants')
                        .delete()
                        .in('id', toDeleteParticipantIds);
                    if (delPartErr) console.warn('Failed to delete removed participants', delPartErr);
                }

                if (participantRows.length > 0) {
                    const { error: upsertPartErr } = await supabase
                        .from('academy_participants')
                        .upsert(participantRows);
                    if (upsertPartErr) console.warn('Failed to upsert participants', upsertPartErr);
                }
            }
        }

        // 4. Notifications
        try {
            // We only notify on update here as per original code logic calling /api/academy/notifications with action: 'update'
            // If it's a new class, the UI might handle it differently or we can infer.
            // The original code always sent 'update' action.
            const recipients = await resolveRecipientsByRoles({
                respectPrefs: true,
                channel: 'academy',
            });
            if (recipients.length) {
                await notifyUsers({
                    title: title,
                    body: `Class updated: ${title}`, // Simple body, can be improved
                    level: 'info',
                    channel: 'academy',
                    link: `/academy/class/${id}`,
                    recipients,
                });
            }
        } catch (notifyErr) {
            console.warn('Error sending class update notification', notifyErr);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return jsonError(error);
    }
}
