import TrustClient from "@workspace/ui/layout/admin/trust/trust";
import { getTrustEntries, getProfiles } from "@/lib/dal/admin";

export default async function AdminTrustDataLayer() {
  const [entries, profiles] = await Promise.all([
    getTrustEntries(),
    getProfiles(),
  ]);
  const nameById = Object.fromEntries(
    profiles.map((p) => [p.id, p.display_name] as const),
  );
  return <TrustClient initialEntries={entries} nameById={nameById} />;
}
