import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { jsonError } from '@/lib/api/responses';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const { classId } = await params;
        const supabase = await createSupabaseServerClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch class
        const { data: classData, error: classError } = await supabase
            .from('academy_classes')
            .select('*')
            .eq('id', classId)
            .maybeSingle();

        if (classError) throw classError;
        if (!classData) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Fetch sessions
        const { data: sessionsData, error: sessionsError } = await supabase
            .from('academy_sessions')
            .select('*')
            .eq('class_id', classId)
            .order('start', { ascending: true });

        if (sessionsError) throw sessionsError;

        // Fetch participants for these sessions
        const sessionIds = (sessionsData || []).map((s) => s.id);
        let participantsData: any[] = [];
        if (sessionIds.length > 0) {
            const { data: parts, error: partsError } = await supabase
                .from('academy_participants')
                .select('*')
                .in('session_id', sessionIds);

            if (partsError) throw partsError;
            participantsData = parts || [];
        }

        return NextResponse.json({
            class: classData,
            sessions: sessionsData,
            participants: participantsData,
        });
    } catch (error) {
        return jsonError(error);
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const { classId } = await params;
        const supabase = await createSupabaseServerClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error } = await supabase.rpc('safe_delete_academy_class', {
            p_id: classId,
        });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return jsonError(error);
    }
}
