"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Copy, Trash2, Plus, ChevronDown, ChevronRight, Minus } from "lucide-react";
import { toast } from "sonner";
import { InventoryEntry, PickListItem, WarehouseRecord, resolveInventoryLocation } from "./types";

interface ConfirmedPickListsCardProps {
    confirmedPickLists: PickListItem[];
    warehouses: WarehouseRecord[];
    inventory: InventoryEntry[];
    onQuantityChange: (pickId: string, quantity: number) => void;
    onRemoveItem: (pickId: string) => void;
    onDeleteList: (warehouseId: string, confirmedAt: string) => void;
    onAddItem?: (warehouseId: string, entry: InventoryEntry) => void;
}

export function ConfirmedPickListsCard({
    confirmedPickLists,
    warehouses,
    inventory,
    onQuantityChange,
    onRemoveItem,
    onDeleteList,
    onAddItem,
}: ConfirmedPickListsCardProps) {
    const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set());
    const [pendingUpdates, setPendingUpdates] = useState<Record<string, number>>({});
    const timeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

    // Debounced quantity update
    const debouncedQuantityUpdate = useCallback((pickId: string, quantity: number) => {
        // Clear existing timeout for this item
        if (timeoutRef.current[pickId]) {
            clearTimeout(timeoutRef.current[pickId]);
        }

        // Set new timeout
        timeoutRef.current[pickId] = setTimeout(() => {
            onQuantityChange(pickId, quantity);
            delete timeoutRef.current[pickId];
            setPendingUpdates(prev => {
                const next = { ...prev };
                delete next[pickId];
                return next;
            });
        }, 500); // 500ms debounce
    }, [onQuantityChange]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(timeoutRef.current).forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    const handleQuantityChange = useCallback((pickId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        setPendingUpdates(prev => ({ ...prev, [pickId]: newQuantity }));
        debouncedQuantityUpdate(pickId, newQuantity);
    }, [debouncedQuantityUpdate]);

    // Group by warehouse and confirmation timestamp
    const groupedLists = confirmedPickLists.reduce((acc, item) => {
        const key = `${item.warehouseId}-${item.confirmedAt}`;
        if (!acc[key]) {
            acc[key] = {
                warehouseId: item.warehouseId,
                confirmedAt: item.confirmedAt || "",
                confirmedByDisplayName: item.confirmedByDisplayName || "Unknown",
                items: [],
            };
        }
        acc[key].items.push(item);
        return acc;
    }, {} as Record<string, { warehouseId: string; confirmedAt: string; confirmedByDisplayName: string; items: PickListItem[] }>);

    const toggleExpanded = (key: string) => {
        setExpandedLists(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const copyMessage = (list: { warehouseId: string; confirmedAt: string; confirmedByDisplayName: string; items: PickListItem[] }) => {
        const warehouse = warehouses.find(w => w.id === list.warehouseId);
        const warehouseName = warehouse?.stewardDisplayName || warehouse?.displayName || "Unknown Warehouse";

        // Group items by location
        const itemsByLocation = list.items.reduce((acc, item) => {
            const location = resolveInventoryLocation(
                { warehouseId: item.warehouseId, zoneId: item.zoneId, binId: item.binId } as InventoryEntry,
                warehouses
            );
            const locationKey = `${location.zoneName || "No Zone"} / ${location.binName || "No Bin"}`;
            if (!acc[locationKey]) {
                acc[locationKey] = [];
            }
            acc[locationKey].push(item);
            return acc;
        }, {} as Record<string, PickListItem[]>);

        const date = list.confirmedAt ? new Date(list.confirmedAt).toLocaleString() : "Unknown date";

        let message = `🏭 Warehouse Pickup Request\n\n`;
        message += `Location: ${warehouseName}\n\n`;

        Object.entries(itemsByLocation).forEach(([location, items]) => {
            message += `📍 ${location}\n`;
            items.forEach(item => {
                message += `  • ${item.itemName} (SKU: ${item.sku}) x ${item.quantity}\n`;
            });
            message += `\n`;
        });

        message += `Confirmed: ${date} by ${list.confirmedByDisplayName}`;

        navigator.clipboard.writeText(message);
        toast.success("Pick list message copied to clipboard");
    };

    const groupedListsArray = Object.entries(groupedLists).map(([key, list]) => ({ key, ...list }));

    if (groupedListsArray.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Confirmed Pick Lists</CardTitle>
                    <CardDescription>
                        Manage confirmed pick lists and generate pickup messages for warehouses.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No confirmed pick lists yet. Confirm a pick list to see it here.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Confirmed Pick Lists</CardTitle>
                <CardDescription>
                    Manage confirmed pick lists and generate pickup messages for warehouses.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 ">
                {groupedListsArray.map(list => {
                    const warehouse = warehouses.find(w => w.id === list.warehouseId);
                    const warehouseName = warehouse?.stewardDisplayName || warehouse?.displayName || "Unknown Warehouse";
                    const isExpanded = expandedLists.has(list.key);
                    const date = list.confirmedAt ? new Date(list.confirmedAt).toLocaleString() : "Unknown date";

                    return (
                        <div key={list.key} className="rounded-lg border">
                            {/* Header - Stack on mobile */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleExpanded(list.key)}
                                        className="p-0 h-auto flex-shrink-0"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="size-4" />
                                        ) : (
                                            <ChevronRight className="size-4" />
                                        )}
                                    </Button>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold truncate">{warehouseName}</p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            <span className="truncate">{date}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span className="truncate">by {list.confirmedByDisplayName}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {list.items.length} items
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:flex-shrink-0">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => copyMessage(list)}
                                        className="flex-1 sm:flex-initial"
                                    >
                                        <Copy className="mr-1 size-3" />
                                        <span className="hidden sm:inline">Copy Message</span>
                                        <span className="sm:hidden">Copy</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onDeleteList(list.warehouseId, list.confirmedAt)}
                                        className="flex-shrink-0"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t p-4 space-y-3">
                                    {/* Desktop: Table view */}
                                    <div className="hidden md:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Item</TableHead>
                                                    <TableHead>Location</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {list.items.map(item => {
                                                    const location = resolveInventoryLocation(
                                                        { warehouseId: item.warehouseId, zoneId: item.zoneId, binId: item.binId } as InventoryEntry,
                                                        warehouses
                                                    );
                                                    return (
                                                        <TableRow key={item.id}>
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{item.itemName}</span>
                                                                    <span className="text-xs text-muted-foreground">{item.sku}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                {location.zoneName ? `${location.zoneName} / ` : ""}
                                                                {location.binName || "No Bin"}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            const currentQty = pendingUpdates[item.id] ?? item.quantity;
                                                                            handleQuantityChange(item.id, currentQty - 1);
                                                                        }}
                                                                        disabled={(pendingUpdates[item.id] ?? item.quantity) <= 1}
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <Minus className="size-3" />
                                                                    </Button>
                                                                    <Input
                                                                        type="text"
                                                                        readOnly
                                                                        value={pendingUpdates[item.id] ?? item.quantity}
                                                                        className="w-16 text-center"
                                                                    />
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            const currentQty = pendingUpdates[item.id] ?? item.quantity;
                                                                            handleQuantityChange(item.id, currentQty + 1);
                                                                        }}
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <Plus className="size-3" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => onRemoveItem(item.id)}
                                                                >
                                                                    <Trash2 className="size-3" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile: Card view */}
                                    <div className="md:hidden space-y-3">
                                        {list.items.map(item => {
                                            const location = resolveInventoryLocation(
                                                { warehouseId: item.warehouseId, zoneId: item.zoneId, binId: item.binId } as InventoryEntry,
                                                warehouses
                                            );
                                            return (
                                                <div key={item.id} className="rounded-lg border p-3 space-y-3">
                                                    {/* Item info */}
                                                    <div className="space-y-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-medium text-sm">{item.itemName}</p>
                                                                <p className="text-xs text-muted-foreground">{item.sku}</p>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => onRemoveItem(item.id)}
                                                                className="flex-shrink-0 h-8 w-8 p-0"
                                                            >
                                                                <Trash2 className="size-3" />
                                                            </Button>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            📍 {location.zoneName ? `${location.zoneName} / ` : ""}
                                                            {location.binName || "No Bin"}
                                                        </p>
                                                    </div>

                                                    {/* Quantity controls */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground min-w-[60px]">Quantity:</span>
                                                        <div className="flex items-center gap-1 flex-1">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    const currentQty = pendingUpdates[item.id] ?? item.quantity;
                                                                    handleQuantityChange(item.id, currentQty - 1);
                                                                }}
                                                                disabled={(pendingUpdates[item.id] ?? item.quantity) <= 1}
                                                                className="h-9 w-9 p-0"
                                                            >
                                                                <Minus className="size-4" />
                                                            </Button>
                                                            <Input
                                                                type="text"
                                                                readOnly
                                                                value={pendingUpdates[item.id] ?? item.quantity}
                                                                className="h-9 text-center flex-1 min-w-0"
                                                            />
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    const currentQty = pendingUpdates[item.id] ?? item.quantity;
                                                                    handleQuantityChange(item.id, currentQty + 1);
                                                                }}
                                                                className="h-9 w-9 p-0"
                                                            >
                                                                <Plus className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
