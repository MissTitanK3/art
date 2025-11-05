"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { Button } from "@workspace/ui/components/button"
import { Filter } from "lucide-react"
import type { FilterKey } from '@/lib/map/utils'

export function FiltersPopover({
  filters,
  onToggle,
  isMobile,
}: {
  filters: Record<FilterKey, boolean>
  onToggle: (k: FilterKey) => void
  isMobile: boolean
}) {
  const items: FilterKey[] = ['Beacon', 'Cache', 'Assembly']
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="secondary" className="shadow-md" aria-label="Filters" title="Filters">
          <Filter className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={isMobile ? 'top' : 'right'}
        align={isMobile ? 'start' : 'start'}
        sideOffset={8}
        className="w-[min(100vw-1rem,16rem)] sm:w-[16rem] max-h-[min(70vh,24rem)] overflow-auto"
      >
        <div className="flex flex-col gap-2">
          {items.map((k) => (
            <Button
              key={k}
              size="sm"
              variant={filters[k] ? 'secondary' : 'outline'}
              onClick={() => onToggle(k)}
            >
              {k}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
