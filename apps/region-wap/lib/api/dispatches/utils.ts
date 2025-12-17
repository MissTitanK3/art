import { createSupabaseServerClient } from "@/lib/auth/supabase/server";

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
        .eq("user_id", userData.user.id)
        .maybeSingle();

    if (!profile) {
        // Option: return a dummy profile or throw specific error?
        // Feedback suggested "throw 403 PROFILE_REQUIRED" logic
        throw new Error("PROFILE_REQUIRED");
    }

    return { user: userData.user, profile, supabase };
}
