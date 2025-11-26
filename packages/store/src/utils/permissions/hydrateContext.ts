import type { PermissionsContext } from "./types";

// Type-only import to avoid runtime dependency
type SupabaseClient = any;

/**
 * Hydrate a PermissionsContext with user and resource ownership data.
 * 
 * @param supabase - Supabase client
 * @param userId - The authenticated user's auth.uid()
 * @param profileId - The user's profile ID (from profiles.id)
 * @param options - Optional resource ownership data
 * @returns Fully hydrated PermissionsContext
 */
export async function hydratePermissionsContext(
    supabase: SupabaseClient,
    userId: string,
    profileId: string,
    options?: {
        ownerProfileId?: string | null;
        ownerPodIds?: string[];
        ownerOrgIds?: string[];
        invitedUserIds?: string[];
        targetPodId?: string | null;
        targetOrgId?: string | null;
    }
): Promise<PermissionsContext> {
    // Fetch user's pod memberships
    const { data: rosterData } = await supabase
        .from("roster_entries")
        .select("pod_id")
        .eq("profile_id", profileId)
        .in("status", ["active", "lead"])
        .is("deleted_at", null);

    const userPods = rosterData?.map((r: any) => r.pod_id).filter(Boolean) ?? [];

    // Fetch user's organization memberships
    const { data: orgRolesData } = await supabase
        .from("organization_roles")
        .select("org_id")
        .eq("user_id", profileId)
        .is("deleted_at", null);

    const userOrgs = orgRolesData?.map((r: any) => r.org_id).filter(Boolean) ?? [];

    return {
        userId,
        userPods,
        userOrgs,
        ownerProfileId: options?.ownerProfileId ?? undefined,
        ownerPodIds: options?.ownerPodIds ?? [],
        ownerOrgIds: options?.ownerOrgIds ?? [],
        invitedUserIds: options?.invitedUserIds ?? [],
        targetPodId: options?.targetPodId ?? undefined,
        targetOrgId: options?.targetOrgId ?? undefined,
    };
}

/**
 * Fetch resource ownership from an _owners table.
 * 
 * @param supabase - Supabase client
 * @param tableName - Name of the owners table (e.g., 'warehouse_owners', 'dispatch_owners')
 * @param resourceId - The resource ID to fetch owners for
 * @returns Object with ownerProfileId, ownerPodIds, and ownerOrgIds
 */
export async function fetchResourceOwnership(
    supabase: SupabaseClient,
    tableName: string,
    resourceId: string
): Promise<{
    ownerProfileId: string | undefined;
    ownerPodIds: string[];
    ownerOrgIds: string[];
}> {
    const { data: ownersData } = await supabase
        .from(tableName)
        .select("owner_type, owner_id")
        .eq("resource_id", resourceId);

    const ownerProfileId =
        ownersData?.find((o: any) => o.owner_type === "user")?.owner_id ?? undefined;
    const ownerPodIds =
        ownersData?.filter((o: any) => o.owner_type === "pod").map((o: any) => o.owner_id) ??
        [];
    const ownerOrgIds =
        ownersData?.filter((o: any) => o.owner_type === "org").map((o: any) => o.owner_id) ??
        [];

    return { ownerProfileId, ownerPodIds, ownerOrgIds };
}
