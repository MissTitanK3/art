"use client";

import DispatchListDataLayer from "@/components/dataLayer/dispatches/DispatchMapDataLayer";

export default function DispatchesPage() {
  return (
    <div className="space-y-4" suppressHydrationWarning>
      <DispatchListDataLayer />
    </div>
  );
}
