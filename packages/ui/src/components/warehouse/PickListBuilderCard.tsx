import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Minus, Plus, Trash2 } from "lucide-react";
import { InventoryEntry, PickListItem, WarehouseRecord, resolveInventoryLocation } from "./types";

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
    onQuantityChange: (pickId: string, nextQty: number) => void;
    onRemoveItem: (pickId: string) => void;
    onConfirm: () => void;
    onDeleteInventory?: (inventoryId: string) => void;
    onUpdateInventory?: (inventoryId: string, quantity: number) => void;
}) {
    const topInventory = [...inventory]
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pick list workflow</CardTitle>
                <CardDescription>
                    Dispatchers build a pull list, stewards confirm to reduce stock and log outflow.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                        Available inventory
                    </h3>
                    {topInventory.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No inventory tracked yet. Log intake to unlock pick lists.
                        </p>
                    ) : (
                        <div className="grid gap-2">
                            {topInventory.map((entry) => {
                                const location = resolveInventoryLocation(entry, warehouses);
                                const pick = pickList.find((item) => item.inventoryId === entry.id);
                                const confirmedPick = confirmedPickLists?.find((item) => item.inventoryId === entry.id);
                                const allocatedQty = (pick?.quantity ?? 0) + (confirmedPick?.quantity ?? 0);
                                const remaining = entry.quantity - allocatedQty;
                                return (
                                    <div
                                        key={entry.id}
                                        className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-lg border p-1 min-h-[60px]"
                                    >
                                        <div className="flex-1 min-w-0 md:w-[33%] p-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex flex-col  gap-2 min-w-0">
                                                    <p className="font-medium text-sm truncate">{entry.itemName}</p>
                                                    <p className="text-xs text-muted-foreground">{entry.sku}</p>
                                                    <p className="text-xs text-muted-foreground">📍 <span className="text-foreground">{location.warehouseName}</span></p>
                                                    <div className="flex items-center gap-2">

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
                                        <div className="flex flex-col items-center justify-between gap-3 md:w-[33%]">
                                            <p className="text-3xl font-semibold">{entry.quantity}</p>
                                            <p className="text-xs text-muted-foreground">in stock</p>
                                        </div>
                                        <div className="flex flex-col items-center justify-between gap-3 md:w-[33%]">
                                            <p className="text-xs text-muted-foreground">Update current stock</p>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {onUpdateInventory && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => onUpdateInventory(entry.id, entry.quantity - 1)}
                                                        className="min-h-[36px] w-9 p-0"
                                                    >
                                                        <Minus className="size-4" />
                                                    </Button>
                                                )}
                                                {onDeleteInventory && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => onDeleteInventory(entry.id)}
                                                        className="min-h-[36px] w-9 p-0"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                )}
                                                {onUpdateInventory && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => onUpdateInventory(entry.id, entry.quantity + 1)}
                                                        className="min-h-[36px] w-9 p-0"
                                                    >
                                                        <Plus className="size-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onAdd(entry)}
                                                    disabled={remaining <= 0}
                                                    className="min-h-[36px] min-w-[60px]"
                                                >
                                                    Add To Pick List
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
                                        className="rounded-lg border p-3 space-y-2 min-h-[180px] flex flex-col items-start justify-between gap-2"
                                    >
                                        <div className="flex flex-col items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm">
                                                    {item.itemName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{item.sku}</p>
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
                                            <div className="flex items-center gap-1 flex-1 w-[200px]">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                                                    disabled={item.quantity <= 1}
                                                    className="h-9 w-9 p-0"
                                                >
                                                    -
                                                </Button>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={maxAvailable}
                                                    value={item.quantity}
                                                    onChange={(event) =>
                                                        onQuantityChange(item.id, Number(event.target.value))
                                                    }
                                                    className="h-9 text-center flex-1 min-w-0"
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => onQuantityChange(item.id, Math.min(maxAvailable, item.quantity + 1))}
                                                    disabled={item.quantity >= maxAvailable}
                                                    className="h-9 w-9 p-0"
                                                >
                                                    +
                                                </Button>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => onRemoveItem(item.id)}
                                                className="flex-shrink-0 min-h-[36px]"
                                            >
                                                Remove
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
        </Card>
    );
}
