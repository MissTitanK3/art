import ProfilesClient from "@workspace/ui/layout/admin/profiles/profiles";
import { getProfiles } from "@/lib/dal/admin";
import type { Profile } from "@workspace/store/types/global.ts";

export default async function AdminProfilesDataLayer() {
  const profilesDb: Profile[] = await getProfiles();
  return <ProfilesClient initialProfiles={profilesDb} />;
}
