// apps/region-pnw/components/dataLayer/admin/AdminProfilesDataLayer.tsx
import ProfilesClient from "@workspace/ui/layout/admin/profiles/profiles";
import { getProfiles } from "@/lib/dal/admin";
import type { Profile } from "@workspace/store/types/global.ts";

export default async function AdminProfilesDataLayer() {
  // Registered users only (from DB)
  const profilesDb: Profile[] = await getProfiles();
  const registeredOnly = profilesDb.filter((p) => !!p.user_id);
  return <ProfilesClient initialProfiles={registeredOnly} />;
}
