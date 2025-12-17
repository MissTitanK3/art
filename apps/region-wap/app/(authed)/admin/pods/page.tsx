import PodsClient from "@workspace/ui/layout/admin/pods/pods";
import { getPods } from "@/lib/dal/admin";

export default async function AdminPodsPage() {
  const { data: pods, count } = await getPods(1, 50);
  return <PodsClient initialPods={pods} totalItems={count} />;
}
