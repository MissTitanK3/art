"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import { toast } from "sonner";

type LazyMapProps = {
  center: [number, number];
  zoom: number;
  lat: number | null;
  lng: number | null;
  open: boolean;
  onSelect: (lat: number, lng: number) => void;
};

type Props = {
  submission: DispatchSubmission;
  onUpdate: (patch: Partial<DispatchSubmission>) => void;
};

export default function DispatchLocationPinSelector({ submission, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [tempLat, setTempLat] = useState<number | null>(null);
  const [tempLng, setTempLng] = useState<number | null>(null);
  const [MapComp, setMapComp] = useState<ComponentType<LazyMapProps> | null>(null);
  const [mapProvider, setMapProvider] = useState<string>(
    typeof navigator !== "undefined" && /iPad|iPhone|Macintosh/.test(navigator.userAgent)
      ? "apple"
      : "google"
  );

  const currentLat = (submission.location as any)?.lat as number | undefined;
  const currentLng = (submission.location as any)?.lng as number | undefined;

  useEffect(() => {
    if (typeof currentLat === "number" && typeof currentLng === "number") {
      setTempLat(currentLat);
      setTempLng(currentLng);
    } else {
      setTempLat(null);
      setTempLng(null);
    }
  }, [currentLat, currentLng, open]);

  // Client-only load of Leaflet map to avoid SSR importing window
  useEffect(() => {
    let mounted = true;
    if (typeof window === "undefined") return;
    import("./LeafletPinMap")
      .then((mod) => {
        if (mounted) setMapComp(() => (mod.default as unknown) as ComponentType<LazyMapProps>);
      })
      .catch(() => {
        // ignore; fallback placeholder will remain
      });
    return () => {
      mounted = false;
    };
  }, []);

  const center = useMemo<[number, number]>(() => {
    if (typeof currentLat === "number" && typeof currentLng === "number") {
      return [currentLat, currentLng];
    }
    // fallback center (SF) if no current point
    return [37.7749, -122.4194];
  }, [currentLat, currentLng]);

  const getExternalMapUrl = (provider: string, lat: number, lng: number) => {
    const z = 16;
    switch (provider) {
      case "apple":
        return `https://maps.apple.com/?ll=${lat},${lng}&q=${lat},${lng}`;
      case "google":
        return `https://maps.google.com/?q=${lat},${lng}`;
      case "osm":
        return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${z}/${lat}/${lng}`;
      case "waze":
        return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
      case "bing":
        return `https://www.bing.com/maps?cp=${lat}~${lng}&lvl=${z}`;
      default:
        return `https://maps.google.com/?q=${lat},${lng}`;
    }
  };

  const handleOpenInMaps = (lat?: number, lng?: number) => {
    const useLat = typeof lat === "number" ? lat : currentLat;
    const useLng = typeof lng === "number" ? lng : currentLng;
    if (typeof useLat !== "number" || typeof useLng !== "number") {
      toast.error("No coordinates to open in maps");
      return;
    }
    const url = getExternalMapUrl(mapProvider, useLat, useLng);
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // no-op
    }
  };

  const handleSave = () => {
    if (typeof tempLat !== "number" || typeof tempLng !== "number") {
      toast.error("Please select a point on the map");
      return;
    }
    // Store a shape that is compatible with our UI and the DB trigger
    // - Keep lat/lng for UI
    // - Also include GeoJSON-like coordinates [lng, lat] for PostGIS trigger
    const location = {
      lat: tempLat,
      lng: tempLng,
      type: "Point",
      coordinates: [tempLng, tempLat],
    } as any;
    onUpdate({ location });
    toast.success("Pin location saved");
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-medium">Pin Location</p>
          <p className="text-xs text-muted-foreground">
            {typeof currentLat === "number" && typeof currentLng === "number"
              ? `Lat ${currentLat.toFixed(5)}, Lng ${currentLng.toFixed(5)}`
              : "No pin set"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <Select value={mapProvider} onValueChange={setMapProvider}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Choose map" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="google">Google Maps</SelectItem>
                <SelectItem value="apple">Apple Maps</SelectItem>
                <SelectItem value="osm">OpenStreetMap</SelectItem>
                <SelectItem value="waze">Waze</SelectItem>
                <SelectItem value="bing">Bing Maps</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="secondary" onClick={() => handleOpenInMaps()} disabled={!(typeof currentLat === "number" && typeof currentLng === "number")}>Open Maps</Button>
          </div>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            Set Pin
          </Button>
        </div>
      </div>

      <Drawer open={open} onOpenChange={setOpen} direction="right" dismissible={false}>
        <DrawerContent className="p-4 max-w-4xl bg-card text-card-foreground">
          <DrawerHeader>
            <DrawerTitle>Select Pin Location</DrawerTitle>
            <DrawerDescription>
              Click on the map to place a pin. Save to apply.
            </DrawerDescription>
          </DrawerHeader>

          <div className="mt-2">
            <div
              className="w-full rounded-md overflow-hidden border"
              style={{ height: "60vh", minHeight: 320 }}
              onPointerDownCapture={(e) => e.stopPropagation()}
              onTouchStartCapture={(e) => e.stopPropagation()}
            >
              {MapComp ? (
                <MapComp
                  center={center}
                  zoom={tempLat && tempLng ? 14 : 4}
                  lat={tempLat}
                  lng={tempLng}
                  open={open}
                  onSelect={(lat: number, lng: number) => { setTempLat(lat); setTempLng(lng); }}
                />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
            </div>
          </div>

          <DrawerFooter>
            <div className="flex-1 flex items-center gap-2 mr-auto">
              <Select value={mapProvider} onValueChange={setMapProvider}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Choose map" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Maps</SelectItem>
                  <SelectItem value="apple">Apple Maps</SelectItem>
                  <SelectItem value="osm">OpenStreetMap</SelectItem>
                  <SelectItem value="waze">Waze</SelectItem>
                  <SelectItem value="bing">Bing Maps</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                onClick={() => handleOpenInMaps(tempLat ?? undefined, tempLng ?? undefined)}
                disabled={!(typeof (tempLat ?? currentLat) === "number" && typeof (tempLng ?? currentLng) === "number")}
              >
                Open Maps
              </Button>
            </div>
            <Button onClick={handleSave}>Save</Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
