// apps/region-template/components/dataLayer/admin/AdminProfilesDataLayer.tsx
import ProfilesClient from "@workspace/ui/layout/admin/profiles/profiles";
import { getPods, getProfiles } from "@/lib/dal/admin";
import type { Profile } from "@workspace/store/types/global.ts";

export default async function AdminProfilesDataLayer() {
  const [profilesDb, pods] = await Promise.all([
    getProfiles(),
    getPods(),
  ]);

  // Collect pod-level roster profiles (may include unregistered users)
  const podProfiles: Profile[] = [];
  for (const pod of pods) {
    for (const entry of pod.team) {
      const p = entry.profile as any;
      const mapped: Profile = {
        id: String(p.id),
        user_id: String(p.user_id ?? ""),
        display_name: String(p.display_name ?? "Unnamed"),
        access_role: p.access_role ?? "team_member",
        field_roles: Array.isArray(p.field_roles) ? p.field_roles : [],
        verified_by: p.verified_by ?? "self",
        affiliation: p.affiliation ?? undefined,
        availability: Boolean(p.availability ?? true),
        contact_signal: p.contact_signal ?? undefined,
        coordination_zone: p.coordination_zone ?? undefined,
        inserted_at: p.inserted_at ?? "",
        coverage_zones: Array.isArray(p.coverage_zones) ? p.coverage_zones : [],
        state: p.state ?? "active",
        weekly_availability: p.weekly_availability ?? undefined,
        self_risk_acknowledged: Boolean(p.self_risk_acknowledged ?? false),
        city: p.city ?? undefined,
        operating_counties: Array.isArray(p.operating_counties) ? p.operating_counties : [],
      };
      podProfiles.push(mapped);
    }
  }

  // Merge DB profiles and pod-level profiles, preferring DB entries on id collisions
  const byId = new Map<string, Profile>();
  for (const p of podProfiles) byId.set(p.id, p);
  for (const p of profilesDb) byId.set(p.id, p);
  const merged = Array.from(byId.values());

  return <ProfilesClient initialProfiles={merged} />;
}
