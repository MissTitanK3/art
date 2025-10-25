// apps/region-template/components/dataLayer/admin/AdminDbDataLayer.tsx
import DbClient from "@workspace/ui/layout/admin/db/db";
import { runDbCheck } from "@/lib/dal/admin";

export default async function AdminDbDataLayer() {
  const health = await runDbCheck();
  return <DbClient initialHealth={health} />;
}

