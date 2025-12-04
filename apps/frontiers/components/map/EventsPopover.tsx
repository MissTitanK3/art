"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/primitives/popover";
import { Button } from "@workspace/ui/primitives/button";
import { List } from "lucide-react";
import { EventFeed } from "@/components/EventFeed";

export function EventsPopover({ isMobile }: { isMobile: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="secondary"
          className="shadow-md"
          aria-label="Events"
          title="Events"
        >
          <List className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={isMobile ? "top" : "right"}
        align={isMobile ? "start" : "start"}
        sideOffset={8}
        className="w-[min(100vw-1rem,16rem)] sm:w-[16rem] max-h-[min(75vh,calc(100dvh-6rem))] overflow-auto p-2"
      >
        <EventFeed />
      </PopoverContent>
    </Popover>
  );
}
