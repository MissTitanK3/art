// apps/region-template/components/dataLayer/admin/AdminDispatchDataLayer.tsx
"use client";

import DispatchClient from "@workspace/ui/layout/admin/dispatch/dispatch";
import { demoDispatches } from "@/data/demoDispatches";
import { DispatchStoreProvider, useDispatchStore } from "@/providers/DispatchStoreProvider";

function AdminDispatchBridge({ items }: { items: any[] }) {
  const updateSubmission = useDispatchStore((s) => s.updateSubmission);
  return (
    <DispatchClient
      initialItems={items}
      onToggleFlag={(id, flagged) => updateSubmission(id, { flagged })}
    />
  );
}

export default function AdminDispatchDataLayer() {
  // In the future, replace with DAL fetch (filters, pagination)
  const items = demoDispatches;
  return (
    <DispatchStoreProvider>
      <AdminDispatchBridge items={items} />
    </DispatchStoreProvider>
  );
}
