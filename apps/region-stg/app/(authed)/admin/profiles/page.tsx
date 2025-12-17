import ProfilesClient from "@workspace/ui/layout/admin/profiles/profiles";
import { getProfiles } from "@/lib/dal/admin";
import type { Profile } from "@workspace/store/types/global.ts";

export default async function AdminProfilesPage() {
  const { data: profilesDb, count } = await getProfiles(undefined, 1, 50);
  return <ProfilesClient initialProfiles={profilesDb} totalItems={count} />;
}
