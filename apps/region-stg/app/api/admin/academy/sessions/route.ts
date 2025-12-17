import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { jsonError } from '@/lib/api/responses';

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch sessions and participants
        const [
            { data: sessions, error: sErr },
            { data: participants, error: pErr },
        ] = await Promise.all([
            supabase
                .from("academy_sessions")
                .select("*")
                .order("start", { ascending: true }),
            supabase.from("academy_participants").select("*"),
        ]);

        if (sErr) throw sErr;
        if (pErr) throw pErr;

        return NextResponse.json({
            sessions: sessions || [],
            participants: participants || [],
        });
    } catch (error) {
        return jsonError(error);
    }
}
