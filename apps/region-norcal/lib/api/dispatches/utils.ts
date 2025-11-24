import { createSupabaseServerClient } from "@/lib/auth/supabase/server";

// Auth helper: get authenticated user profile for dispatches API routes
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
