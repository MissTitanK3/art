import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { jsonError } from '@/lib/api/responses';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check admin permissions
        const callerProfile = await getProfileByUserId(userData.user.id);
        const callerAccessRole = callerProfile?.access_role as any | undefined;
        const authorized =
            !!callerAccessRole &&
            (regionAdmins.includes(callerAccessRole) ||
                callerAccessRole === 'national_admin'); // Advocacy groups might need national admin? Or just regional.
        // The component checks for ["admin", "regional_admin", "national_admin"]
        // regionAdmins usually includes admin and regional_admin.

        if (!authorized) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('missing_person_records')
            .select(
                [
                    'case_id',
                    'full_name',
                    'detention_datetime',
                    'detention_location',
                    'arresting_agency',
                    'last_known_facility',
                    'last_known_city',
                    'urgent_needs',
                    'last_updated',
                ].join(', ')
            )
            .is('deleted_at', null)
            .order('last_updated', { ascending: false, nullsFirst: false });

        if (error) throw error;

        return NextResponse.json({ records: data || [] });
    } catch (error) {
        return jsonError(error);
    }
}
