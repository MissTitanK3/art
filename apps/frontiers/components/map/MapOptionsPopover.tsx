"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/primitives/popover";
import { Button } from "@workspace/ui/primitives/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Map as MapIcon } from "lucide-react";
import type { TileProvider } from "@/lib/map/tiles";

export function MapOptionsPopover({
  providerId,
  providers,
  setProviderId,
  isMobile,
}: {
  providerId: string;
  providers: ReadonlyArray<TileProvider>;
  setProviderId: (id: string) => void;
  isMobile: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="secondary"
          className="shadow-md"
          aria-label="Map Options"
          title="Map Options"
        >
          <MapIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={isMobile ? "top" : "right"}
        align={isMobile ? "start" : "start"}
        sideOffset={8}
        className="w-[min(100vw-1rem,20rem)] sm:w-[20rem] max-h-[min(70vh,28rem)] overflow-auto"
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Map style
            </label>
            <Select value={providerId} onValueChange={(v) => setProviderId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select map style" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
