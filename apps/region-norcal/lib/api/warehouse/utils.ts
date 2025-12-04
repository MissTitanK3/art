import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { WarehouseRecord } from "@workspace/ui/patterns/features/warehouse";

export function generateId(): string {
    return crypto.randomUUID();
}
export function normalizeWarehouse(w: any): WarehouseRecord {
    return {
        id: w.id,
        regionId: w.region_id,
        displayName: w.display_name,
        stewardDisplayName: w.display_name,
        regionZone: w.region_zone,
        urbanType: w.urban_type,
        siteType: w.capabilities?.site_type || w.site_type || "home",
        maxCapacityRating: w.max_capacity_rating,
        capabilities: w.capabilities?.flags || [],
        quickNotes: w.capabilities?.quick_note || "",
        visibilityScope: w.visibility_scope || "regional",
        invitedUserIds: w.invited_user_ids || [],
        createdAt: w.created_at,
        zones: w.zones?.map((z: any) => ({
            id: z.id,
            name: z.name,
            sortOrder: z.sort_order,
            bins: z.bins?.map((b: any) => ({
                id: b.id,
                label: b.label,
                sortOrder: b.sort_order,
            })).sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) || [],
        })).sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) || [],
    };
}

export async function getAuthenticatedProfile() {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
        throw new Error("AUTH_REQUIRED");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();

    return { user: userData.user, profile, supabase };
}
