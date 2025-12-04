"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { LatLngLiteral } from "leaflet";
import RightSidebar from "@/components/ui/RightSidebar";
import JoinDispatchPanel from "@/components/features/JoinDispatch/JoinDispatchPanel";
import FilterSidebar from "@/components/features/Filters/FilterSidebar";
import FABStack from "@/components/ui/FABStack";
import { useFindMe } from "@/lib/useFindMe";
import FeedDrawer from "@/components/features/ReportFeed/FeedDrawer";
import LocationButton from "@/components/features/Location/LocationButton";
import LocationDrawer, {
  type LocationMode,
} from "@/components/features/Location/LocationDrawer";

const MapWrapper = dynamic(() => import("@/components/map/MapWrapper"), {
  ssr: false,
});

export default function JoinDispatchPage() {
  // Map state
  const [position, setPosition] = useState<LatLngLiteral>({
    lat: 37.7749,
    lng: -122.4194,
  });
  const [zoom, setZoom] = useState(10);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true); // open by default per redesign
  const [panel, setPanel] = useState<"join" | "filters" | "info">("join");
  const [live, setLive] = useState(false);

  // Location UI state
  const [locDrawerOpen, setLocDrawerOpen] = useState(false);
  const [locMode, setLocMode] = useState<LocationMode>("off");
  const [showRadius, setShowRadius] = useState<boolean>(false);
  const [radius, setRadius] = useState<number>(200);

  const { handleFindMe } = useFindMe((coords) => {
    if (Array.isArray(coords)) {
      const [lat, lng] = coords as [number, number];
      setPosition({ lat, lng });
    } else if (
      coords &&
      typeof coords === "object" &&
      "lat" in (coords as any) &&
      "lng" in (coords as any)
    ) {
      setPosition({ lat: (coords as any).lat, lng: (coords as any).lng });
    }
  });

  useEffect(() => {
    // Try to center on user once on load without persisting
    handleFindMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hydrate location preferences on client
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const m = localStorage.getItem("loc_mode") as LocationMode | null;
      if (m === "off" || m === "report" || m === "trusted") setLocMode(m);
      const s = localStorage.getItem("loc_radius_show") === "1";
      setShowRadius(s);
      const r = Number(localStorage.getItem("loc_radius"));
      if (!Number.isNaN(r) && r > 0) setRadius(r);
    } catch (error) {
      console.error("Failed to hydrate saved location preferences", error);
    }
  }, []);

  // Persist location preferences
  useEffect(() => {
    localStorage.setItem("loc_mode", locMode);
  }, [locMode]);
  useEffect(() => {
    localStorage.setItem("loc_radius_show", showRadius ? "1" : "0");
  }, [showRadius]);
  useEffect(() => {
    localStorage.setItem("loc_radius", String(radius));
  }, [radius]);

  const mapContainerClass = useMemo(() => "fixed inset-0 z-[30]", []);

  return (
    <>
      {/* Fullscreen map shell */}
      <div className={mapContainerClass}>
        <div className="absolute inset-0">
          <MapWrapper
            position={position}
            zoom={zoom}
            onZoomChange={setZoom}
            onSelect={(pos) => setPosition(pos)}
            showRadius={showRadius}
            radiusMeters={radius}
          />
        </div>
      </div>

      {/* Bottom report feed drawer (shell) */}
      <FeedDrawer zoom={zoom} openAtZoom={12} />

      {/* Floating action buttons per redesign */}
      <FABStack
        onAddReport={() => {
          // Placeholder: navigate to wizard route (existing)
          window.location.href = "/report/wizard";
        }}
        onFilters={() => {
          setPanel("filters");
          setSidebarOpen(true);
        }}
        onToggleLive={() => setLive((v) => !v)}
        onInfo={() => {
          setPanel("join"); // reuse info -> join for now
          setSidebarOpen(true);
        }}
        liveActive={live}
      />

      {/* Location button and drawer */}
      <LocationButton mode={locMode} onClick={() => setLocDrawerOpen(true)} />
      <LocationDrawer
        isOpen={locDrawerOpen}
        onClose={() => setLocDrawerOpen(false)}
        mode={locMode}
        onChangeMode={async (m) => {
          if (
            m === "trusted" &&
            navigator.permissions &&
            (navigator as any).permissions?.query
          ) {
            try {
              const res = await (navigator as any).permissions.query({
                name: "geolocation",
              });
              if (res.state === "denied") {
                alert("Permission denied by browser. Reverting to Off.");
                setLocMode("off");
                return;
              }
            } catch (error) {
              console.error("Failed to inspect geolocation permissions", error);
            }
          }
          setLocMode(m);
          if (m === "report") {
            // one-time use; could trigger a find on next submission
          }
        }}
        showRadius={showRadius}
        radius={radius}
        onToggleRadius={() => setShowRadius((v) => !v)}
        onErase={async () => {
          try {
            localStorage.removeItem("loc_mode");
            localStorage.removeItem("loc_radius");
            localStorage.removeItem("loc_radius_show");
          } catch (error) {
            console.error("Failed to clear saved location settings", error);
          }
          setLocMode("off");
          setShowRadius(false);
          setRadius(200);
          try {
            if ((navigator as any).permissions?.revoke) {
              await (navigator as any).permissions.revoke({
                name: "geolocation" as PermissionName,
              });
            }
          } catch (error) {
            console.error("Failed to revoke browser geolocation permissions", error);
          }
          alert(
            "Location data erased. Update browser site permissions to fully revoke access if needed.",
          );
        }}
      />

      {/* Right-side contextual panel */}
      <RightSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title={panel === "filters" ? "Filters" : "Join Dispatch"}
      >
        {panel === "filters" ? (
          <FilterSidebar
            onClose={() => setSidebarOpen(false)}
            onApply={() => setSidebarOpen(false)}
          />
        ) : (
          <JoinDispatchPanel />
        )}
      </RightSidebar>
    </>
  );
}
