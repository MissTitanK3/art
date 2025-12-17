import TrustClient from "@workspace/ui/layout/admin/trust/trust";
import { getTrustEntries, getProfiles } from "@/lib/dal/admin";

export default async function AdminTrustPage() {
  const [{ data: entries, count }, { data: profiles }] = await Promise.all([
    getTrustEntries(undefined, 1, 50),
    getProfiles(undefined, 1, 1000), // Load enough profiles for mapping names
  ]);
  const nameById = Object.fromEntries(
    profiles.map((p) => [p.id, p.display_name] as const),
  );
  return <TrustClient initialEntries={entries} nameById={nameById} totalItems={count} />;
}
