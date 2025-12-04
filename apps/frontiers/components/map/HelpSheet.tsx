"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/primitives/button";
import {
  HelpCircle,
  Satellite,
  Map as MapIcon,
  Filter,
  List,
  Anchor,
  LifeBuoy,
  Menu as MenuIcon,
} from "lucide-react";

export function HelpSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full shadow-md"
          aria-label="Help"
          title="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="w-full m-auto max-w-2xl max-h-[80dvh] overflow-auto bg-card/90 backdrop-blur p-6"
      >
        <SheetHeader>
          <SheetTitle>Frontiers Guide</SheetTitle>
        </SheetHeader>
        <div className="mt-3 text-sm space-y-4">
          <p>
            Frontiers is a map-driven exploration experience. Scan your
            surroundings, discover signals, and interact with nearby beacons,
            caches, and assemblies.
          </p>
          <div className="space-y-2">
            <div>
              <span className="font-medium inline-flex items-center gap-2">
                <Satellite className="h-4 w-4" /> Ping
              </span>
              <span className="text-muted-foreground">
                {" "}
                — bottom-center satellite button.
              </span>
              <div>
                Send a scan to fetch nearby signals around your current sector.
              </div>
            </div>
            <div>
              <span className="font-medium inline-flex items-center gap-2">
                <MapIcon className="h-4 w-4" /> Map Options
              </span>
              <span className="text-muted-foreground"> — left panel.</span>
              <div>
                Choose the map style (tiles) and adjust viewing preferences.
              </div>
            </div>
            <div>
              <span className="font-medium inline-flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </span>
              <span className="text-muted-foreground"> — left panel.</span>
              <div>
                Toggle which signal types to show: Beacon, Cache, Assembly.
              </div>
            </div>
            <div>
              <span className="font-medium inline-flex items-center gap-2">
                <List className="h-4 w-4" /> Events
              </span>
              <span className="text-muted-foreground"> — left panel.</span>
              <div>See recent in-world activity and updates as they occur.</div>
            </div>
            <div>
              <span className="font-medium inline-flex items-center gap-2">
                <Anchor className="h-4 w-4" /> Dock Rest
              </span>
              <span className="text-muted-foreground"> — left panel.</span>
              <div>Rest your crew to restore morale and reduce fatigue.</div>
            </div>
            <div>
              <span className="font-medium inline-flex items-center gap-2">
                <LifeBuoy className="h-4 w-4" /> Support
              </span>
              <span className="text-muted-foreground"> — left panel.</span>
              <div>
                Send a support signal to the network to assist operations.
              </div>
            </div>
            <div>
              <span className="font-medium inline-flex items-center gap-2">
                <MenuIcon className="h-4 w-4" /> Menu
              </span>
              <span className="text-muted-foreground"> — left panel.</span>
              <div>
                Navigate to Fleet & Crew, Donation Ledger, Seasons, and Profile;
                sign in/out.
              </div>
            </div>
            <div>
              <span className="font-medium">Status & Location</span>
              <span className="text-muted-foreground"> — top-left card.</span>
              <div>
                Track Ship and Morale. Use the small satellite to center on your
                location.
              </div>
            </div>
            <div>
              <span className="font-medium">Signals</span>
              <span className="text-muted-foreground">
                {" "}
                — glowing rings on the map.
              </span>
              <div>
                Tap a signal to open its repair/puzzle dialog and interact.
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
