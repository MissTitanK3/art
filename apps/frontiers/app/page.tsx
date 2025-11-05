"use client"

import dynamic from "next/dynamic"
import { SeasonsRibbon } from "@/components/Seasons"
import { useProfileStore } from "@/store/useProfileStore"

// Fullscreen map is client-only due to Leaflet
const FullScreenMap = dynamic(() => import("@/components/FullScreenMap").then(m => m.FullScreenMap), { ssr: false })

export default function Page() {
  const regionId = useProfileStore((s) => s.region_id || s.profile?.region_id || process.env.NEXT_PUBLIC_REGION_ID || null)
  return (
    <div className="flex flex-col gap-2">
      <SeasonsRibbon regionId={regionId} />
      <FullScreenMap />
    </div>
  )
}
