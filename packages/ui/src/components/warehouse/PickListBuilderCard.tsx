import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Minus, Plus, Trash2, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { InventoryEntry, PickListItem, WarehouseRecord, resolveInventoryLocation } from "./types";
import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@workspace/ui/lib/utils";

function DebouncedQuantitySelector({
    value,
    onChange,
    min = 0,
    max,
    disabled,
    className,
    valueClassName,
}: {
    value: number;
    onChange: (value: number) => Promise<void> | void;
    min?: number;
    max?: number;
    disabled?: boolean;
    className?: string;
    valueClassName?: string;
}) {
    const [localValue, setLocalValue] = useState(value);
    const [isSyncing, setIsSyncing] = useState(false);
    const debouncedUpdateRef = useRef<NodeJS.Timeout | null>(null);

    // Sync local value if prop changes externally (and not currently syncing/debouncing)
    useEffect(() => {
        if (!isSyncing && !debouncedUpdateRef.current) {
            setLocalValue(value);
        }
    }, [value, isSyncing]);

    const handleUpdate = (newValue: number) => {
        if (disabled) return;
        if (max !== undefined && newValue > max) return;
        if (newValue < min) return;

        setLocalValue(newValue);

        if (debouncedUpdateRef.current) {
            clearTimeout(debouncedUpdateRef.current);
        }

        debouncedUpdateRef.current = setTimeout(async () => {
            setIsSyncing(true);
            debouncedUpdateRef.current = null;
            try {
                await onChange(newValue);
            } finally {
                setIsSyncing(false);
            }
        }, 800); // 800ms debounce
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <Button
                type="button"
                size="sm"
                variant="default"
                onClick={() => handleUpdate(localValue - 1)}
                disabled={disabled || localValue <= min || isSyncing}
                className="h-9 w-9 p-0"
            >
                <Minus className="size-4" />
            </Button>
            <div className="relative flex items-center justify-center w-16 h-9">
                {isSyncing ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : (
                    <span className={cn("font-semibold text-lg", valueClassName)}>{localValue}</span>
                )}
            </div>
            <Button
                type="button"
                size="sm"
                variant="default"
                onClick={() => handleUpdate(localValue + 1)}
                disabled={disabled || (max !== undefined && localValue >= max) || isSyncing}
                className="h-9 w-9 p-0"
            >
                <Plus className="size-4" />
            </Button>
        </div>
    );
}

export function PickListBuilderCard({
    inventory,
    warehouses,
    pickList,
    confirmedPickLists,
    onAdd,
    onQuantityChange,
    onRemoveItem,
    onConfirm,
    onDeleteInventory,
    onUpdateInventory,
}: {
    inventory: InventoryEntry[];
    warehouses: WarehouseRecord[];
    pickList: PickListItem[];
    confirmedPickLists?: PickListItem[];
    onAdd: (entry: InventoryEntry) => void;
    onQuantityChange: (pickId: string, nextQty: number) => Promise<void> | void;
    onRemoveItem: (pickId: string) => void;
    onConfirm: () => void;
    onDeleteInventory?: (inventoryId: string) => void;
    onUpdateInventory?: (inventoryId: string, quantity: number) => Promise<void> | void;
}) {
    // Filter and pagination state
    const [nameFilter, setNameFilter] = useState("");
    const [warehouseFilter, setWarehouseFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [nameFilter, warehouseFilter]);

    // Compute filtered inventory
    const filteredInventory = useMemo(() => {
        let result = [...inventory];

        // Filter by name (case-insensitive partial match)
        if (nameFilter.trim()) {
            const searchTerm = nameFilter.toLowerCase();
            result = result.filter((entry) =>
                entry.itemName.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by warehouse
        if (warehouseFilter !== "all") {
            result = result.filter((entry) => entry.warehouseId === warehouseFilter);
        }

        // Sort by quantity descending
        result.sort((a, b) => b.quantity - a.quantity);

        return result;
    }, [inventory, nameFilter, warehouseFilter]);

    // Compute pagination
    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedInventory = filteredInventory.slice(startIndex, endIndex);

    // Clear all filters
    const clearFilters = () => {
        setNameFilter("");
        setWarehouseFilter("all");
    };

    const hasActiveFilters = nameFilter.trim() !== "" || warehouseFilter !== "all";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pick list workflow</CardTitle>
                <CardDescription>
                    Dispatchers build a pull list, stewards confirm to reduce stock and log outflow.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Filters Section */}
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Search by item name..."
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="flex-1">
                            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All Warehouses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Warehouses</SelectItem>
                                    {warehouses.map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={warehouse.id}>
                                            {warehouse.stewardDisplayName ?? warehouse.displayName ?? "Unnamed"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {hasActiveFilters && (
                            <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={clearFilters}
                                className="flex items-center gap-2"
                            >
                                <X className="size-4" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                            Available inventory
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredInventory.length)} of {filteredInventory.length}
                        </p>
                    </div>
                    {paginatedInventory.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {inventory.length === 0
                                ? "No inventory tracked yet. Log intake to unlock pick lists."
                                : "No items match your filters."}
                        </p>
                    ) : (
                        <>
                            <div className="flex flex-wrap gap-2">
                                {paginatedInventory.map((entry) => {
                                    const location = resolveInventoryLocation(entry, warehouses);
                                    const pick = pickList.find((item) => item.inventoryId === entry.id);
                                    const confirmedPick = confirmedPickLists?.find((item) => item.inventoryId === entry.id);
                                    const allocatedQty = (pick?.quantity ?? 0) + (confirmedPick?.quantity ?? 0);
                                    const remaining = entry.quantity - allocatedQty;
                                    return (
                                        <div
                                            key={entry.id}
                                            className="flex flex-col w-[220px] h-full items-center justify-between gap-3 rounded-lg border p-1 min-h-[60px]"
                                        >
                                            <div className="flex justify-center min-w-0 p-2 w-full text-center break-words">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex flex-col  gap-2 min-w-0">
                                                        <p className="font-medium text-sm break-words">{entry.itemName}</p>
                                                        <p className="text-muted-foreground">📍 <span className="text-foreground">{location.warehouseName}</span></p>
                                                        <div className="flex items-center gap-2 text-center justify-center">

                                                            <span className="text-xs text-muted-foreground">

                                                                {location.zoneName ? ` ${location.zoneName}` : ""}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">

                                                                {location.binName ? ` → ${location.binName}` : ""}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center justify-between gap-3">
                                                {onUpdateInventory ? (
                                                    <DebouncedQuantitySelector
                                                        value={entry.quantity}
                                                        onChange={(q) => onUpdateInventory(entry.id, q)}
                                                        min={0}
                                                        valueClassName="text-3xl"
                                                    />
                                                ) : (
                                                    <p className="text-3xl font-semibold">{entry.quantity}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground">in stock</p>
                                            </div>
                                            <div className="flex flex-col w-full items-center justify-evenly gap-3">
                                                <hr className="w-full" />
                                                {onDeleteInventory && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => onDeleteInventory(entry.id)}
                                                        className="min-h-[36px]"
                                                    >
                                                        <Trash2 className="size-4" /> Remove From Inventory
                                                    </Button>
                                                )}
                                            </div>
                                            <hr className="w-full" />
                                            <div className="flex items-center align-bottom gap-2 justify-end h-full mb-3">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onAdd(entry)}
                                                    disabled={remaining <= 0}
                                                    className="min-h-[36px] min-w-[60px]"
                                                >
                                                    <Plus className="size-4" /> Add To Pick List
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1"
                                    >
                                        <ChevronLeft className="size-4" />
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-1"
                                    >
                                        Next
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                        Pick list
                    </h3>
                    {pickList.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Add inventory rows to stage a pick list for stewards.
                        </p>
                    ) : (
                        <div className="space-y-2 flex flex-col md:flex-row gap-2 wrap">
                            {pickList.map((item) => {
                                const inventoryRow = inventory.find(
                                    (entry) => entry.id === item.inventoryId,
                                );
                                const location =
                                    inventoryRow && resolveInventoryLocation(inventoryRow, warehouses);
                                const maxAvailable = inventoryRow?.quantity ?? item.quantity;
                                return (
                                    <div
                                        key={item.id}
                                        className="rounded-lg w-[220px] h-full min-h-[180px] border p-3 space-y-2 flex flex-col items-start justify-between gap-2"
                                    >
                                        <div className="flex flex-col items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm">
                                                    {item.itemName}
                                                </p>
                                                {location ? (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        📍 {location.warehouseName}
                                                        {location.zoneName ? ` / ${location.zoneName}` : ""}
                                                        {location.binName ? ` → ${location.binName}` : ""}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center gap-2 w-full">
                                            <hr className="w-full" />
                                            <p className="text-sm">
                                                Quantity Request:
                                            </p>
                                            <DebouncedQuantitySelector
                                                value={item.quantity}
                                                onChange={(q) => onQuantityChange(item.id, q)}
                                                min={1}
                                                max={maxAvailable}
                                                valueClassName="text-xl"
                                                className="w-full justify-center"
                                            />
                                            <hr className="w-full" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => onRemoveItem(item.id)}
                                                className="flex-shrink-0 min-h-[36px]"
                                            >
                                                Remove From Pick List
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex sm:justify-end">
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={pickList.length === 0}
                        className="w-full sm:w-auto min-h-[44px]"
                    >
                        Confirm Pick List
                    </Button>
                </div>
            </CardContent>
        </Card >
    );
}
