import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { humanize } from "@workspace/ui/lib/utils";
import { InventoryEntry } from "./types";

interface ExistingInventorySelectorProps {
  options: { id: string; label: string }[];
  selectedId: string;
  selectedEntry?: InventoryEntry;
  selectedLocation: {
    warehouseName: string;
    zoneName?: string;
    binName?: string;
  } | null;
  onSelect: (id: string) => void;
}

export function ExistingInventorySelector({
  options,
  selectedId,
  selectedEntry,
  selectedLocation,
  onSelect,
}: ExistingInventorySelectorProps) {
  if (options.length === 0) {
    return (
      <p className="text-xs sm:text-sm text-muted-foreground">
        Select from catalog or existing inventory.
      </p>
    );
  }

  return (
    <>
      <Select value={selectedId} onValueChange={onSelect}>
        <SelectTrigger className="min-h-[44px]">
          <SelectValue placeholder="Select SKU or item" />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {humanize(option.label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedEntry && selectedLocation ? (
        <div className="rounded-lg border p-3 text-xs sm:text-sm">
          <p className="font-semibold">
            {selectedEntry.itemName} ({selectedEntry.sku})
          </p>
          <p className="text-xs text-muted-foreground">
            Category: {selectedEntry.category}
          </p>
          <p className="text-xs text-muted-foreground">
            Available: {selectedEntry.quantity}
          </p>
          <p className="text-xs text-muted-foreground">
            Location: {selectedLocation.warehouseName}
            {selectedLocation.zoneName ? ` / ${selectedLocation.zoneName}` : ""}
            {selectedLocation.binName ? ` → ${selectedLocation.binName}` : ""}
          </p>
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-muted-foreground">
          Select an item to prefill SKU and metadata.
        </p>
      )}
    </>
  );
}
