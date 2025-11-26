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

        const { data, error } = await supabase
            .from('academy_instructors')
            .select('*')
            .is('deleted_at', null);

        if (error) throw error;

        return NextResponse.json(data || []);
    } catch (error) {
        return jsonError(error);
    }
}
