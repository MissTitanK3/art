"use client";

import dynamic from "next/dynamic";
import { ToolsLoader } from "@workspace/ui/components/client/Loader";

const CountySelectDataLayer = dynamic(
  () =>
    import("@/components/dataLayer/profile/CountySelectDataLayer").then(
      (m) => m.CountySelectDataLayer
    ),
  {
    ssr: false,
    loading: () => <ToolsLoader label="map" />,
  }
);

export default function ProfileMapPage() {
  return (
    <div className="max-w-4xl mx-auto md:p-8">
      <CountySelectDataLayer />
    </div>
  );
}
