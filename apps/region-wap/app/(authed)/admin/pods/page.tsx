import PodsClient from "@workspace/ui/layout/admin/pods/pods";
import { getPods } from "@/lib/dal/admin";

export default async function AdminPodsPage() {
  const pods = await getPods();
  return <PodsClient initialPods={pods} />;
}
