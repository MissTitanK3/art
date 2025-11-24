"use client";

import { useState } from "react";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from "@workspace/ui/components/drawer";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { WarehouseRecord, capacityOptions, capabilityOptions, zoneSchema, binSchema } from "./types";

type Zone = z.infer<typeof zoneSchema>;
type Bin = z.infer<typeof binSchema>;

interface SavedWarehousesListProps {
    warehouses: WarehouseRecord[];
    onWarehouseUpdate?: (warehouseId: string, updates: Partial<WarehouseRecord>) => void;
}

export function SavedWarehousesList({ warehouses, onWarehouseUpdate }: SavedWarehousesListProps) {
    const [editingWarehouse, setEditingWarehouse] = useState<WarehouseRecord | null>(null);

    const handleEdit = (warehouse: WarehouseRecord) => {
        setEditingWarehouse({ ...warehouse });
    };

    const handleSave = () => {
        if (editingWarehouse && onWarehouseUpdate) {
            onWarehouseUpdate(editingWarehouse.id, editingWarehouse);
            setEditingWarehouse(null);
        }
    };

    const handleAddZone = () => {
        if (editingWarehouse) {
            const newZone: Zone = {
                id: `temp-${Date.now()}`,
                name: "",
                sortOrder: editingWarehouse.zones.length + 1,
                bins: [],
            };
            setEditingWarehouse({
                ...editingWarehouse,
                zones: [...editingWarehouse.zones, newZone],
            });
        }
    };

    const handleRemoveZone = (zoneId: string) => {
        if (editingWarehouse) {
            setEditingWarehouse({
                ...editingWarehouse,
                zones: editingWarehouse.zones.filter((z) => z.id !== zoneId),
            });
        }
    };

    const handleUpdateZone = (zoneId: string, updates: Partial<Zone>) => {
        if (editingWarehouse) {
            setEditingWarehouse({
                ...editingWarehouse,
                zones: editingWarehouse.zones.map((z) => (z.id === zoneId ? { ...z, ...updates } : z)),
            });
        }
    };

    const handleAddBin = (zoneId: string) => {
        if (editingWarehouse) {
            setEditingWarehouse({
                ...editingWarehouse,
                zones: editingWarehouse.zones.map((z) =>
                    z.id === zoneId
                        ? {
                            ...z,
                            bins: [
                                ...z.bins,
                                {
                                    id: `temp-${Date.now()}`,
                                    label: "",
                                    sortOrder: z.bins.length + 1,
                                },
                            ],
                        }
                        : z
                ),
            });
        }
    };

    const handleRemoveBin = (zoneId: string, binId: string) => {
        if (editingWarehouse) {
            setEditingWarehouse({
                ...editingWarehouse,
                zones: editingWarehouse.zones.map((z) =>
                    z.id === zoneId
                        ? {
                            ...z,
                            bins: z.bins.filter((b) => b.id !== binId),
                        }
                        : z
                ),
            });
        }
    };

    const handleUpdateBin = (zoneId: string, binId: string, label: string) => {
        if (editingWarehouse) {
            setEditingWarehouse({
                ...editingWarehouse,
                zones: editingWarehouse.zones.map((z) =>
                    z.id === zoneId
                        ? {
                            ...z,
                            bins: z.bins.map((b) => (b.id === binId ? { ...b, label } : b)),
                        }
                        : z
                ),
            });
        }
    };

    const toggleCapability = (capability: string) => {
        if (editingWarehouse) {
            const hasCapability = editingWarehouse.capabilities.includes(capability);
            setEditingWarehouse({
                ...editingWarehouse,
                capabilities: hasCapability
                    ? editingWarehouse.capabilities.filter((c) => c !== capability)
                    : [...editingWarehouse.capabilities, capability],
            });
        }
    };

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold">Active Warehouses</h2>
                <p className="text-sm text-muted-foreground">
                    Manage warehouse locations, zones, and inventory capabilities.
                </p>
            </div>
            {warehouses.length === 0 ? (
                <Card>
                    <CardContent className="py-6 text-sm text-muted-foreground">
                        No warehouses saved yet. Complete the builder to add the first one.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {warehouses.map((warehouse) => (
                        <Card key={warehouse.id} className="flex flex-col">
                            <CardHeader className="space-y-1">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">
                                        {warehouse.stewardDisplayName ?? warehouse.displayName} —{" "}
                                        {warehouse.regionZone}
                                    </CardTitle>
                                    <Drawer>
                                        <DrawerTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(warehouse)}
                                            >
                                                <Pencil className="mr-1 size-3" />
                                                Edit
                                            </Button>
                                        </DrawerTrigger>
                                        <DrawerContent className="max-w-4xl mx-auto max-h-[90vh] bg-card text-card-foreground">
                                            <DrawerHeader>
                                                <DrawerTitle>Edit Warehouse</DrawerTitle>
                                                <DrawerDescription>
                                                    Update warehouse details, zones, and bins.
                                                </DrawerDescription>
                                            </DrawerHeader>

                                            {editingWarehouse && (
                                                <div className="overflow-y-auto p-4 space-y-4">
                                                    {/* Basic Info */}
                                                    <div className="space-y-3">
                                                        <h3 className="font-semibold">Basic Information</h3>
                                                        <div className="grid gap-3 md:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <Label>Display Name</Label>
                                                                <Input
                                                                    value={editingWarehouse.displayName}
                                                                    onChange={(e) =>
                                                                        setEditingWarehouse({
                                                                            ...editingWarehouse,
                                                                            displayName: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Region/Zone</Label>
                                                                <Input
                                                                    value={editingWarehouse.regionZone}
                                                                    onChange={(e) =>
                                                                        setEditingWarehouse({
                                                                            ...editingWarehouse,
                                                                            regionZone: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Steward Display Name</Label>
                                                                <Input
                                                                    value={editingWarehouse.stewardDisplayName ?? ""}
                                                                    onChange={(e) =>
                                                                        setEditingWarehouse({
                                                                            ...editingWarehouse,
                                                                            stewardDisplayName: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Max Capacity Rating</Label>
                                                                <Select
                                                                    value={editingWarehouse.maxCapacityRating}
                                                                    onValueChange={(value) =>
                                                                        setEditingWarehouse({
                                                                            ...editingWarehouse,
                                                                            maxCapacityRating: value as "small" | "medium" | "large" | "xl",
                                                                        })
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {capacityOptions.map((opt) => (
                                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                                {opt.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Quick Notes</Label>
                                                            <Textarea
                                                                value={editingWarehouse.quickNotes ?? ""}
                                                                onChange={(e) =>
                                                                    setEditingWarehouse({
                                                                        ...editingWarehouse,
                                                                        quickNotes: e.target.value,
                                                                    })
                                                                }
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Capabilities */}
                                                    <div className="space-y-3">
                                                        <h3 className="font-semibold">Capabilities</h3>
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            {capabilityOptions.map((capability) => (
                                                                <div
                                                                    key={capability.value}
                                                                    className="flex items-center space-x-2"
                                                                >
                                                                    <Checkbox
                                                                        id={capability.value}
                                                                        checked={editingWarehouse.capabilities.includes(
                                                                            capability.value
                                                                        )}
                                                                        onCheckedChange={() =>
                                                                            toggleCapability(capability.value)
                                                                        }
                                                                    />
                                                                    <Label htmlFor={capability.value}>
                                                                        {capability.label}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Zones */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="font-semibold">Zones & Bins</h3>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={handleAddZone}
                                                            >
                                                                <Plus className="mr-1 size-3" />
                                                                Add Zone
                                                            </Button>
                                                        </div>
                                                        {editingWarehouse.zones.map((zone, zoneIndex) => (
                                                            <div
                                                                key={zone.id}
                                                                className="rounded-lg border p-3 space-y-3"
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    <Input
                                                                        placeholder="Zone name"
                                                                        value={zone.name}
                                                                        onChange={(e) =>
                                                                            handleUpdateZone(zone.id, {
                                                                                name: e.target.value,
                                                                            })
                                                                        }
                                                                        className="flex-1"
                                                                    />
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="Sort"
                                                                        value={zone.sortOrder ?? ""}
                                                                        onChange={(e) =>
                                                                            handleUpdateZone(zone.id, {
                                                                                sortOrder: Number(e.target.value),
                                                                            })
                                                                        }
                                                                        className="w-20"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        onClick={() => handleRemoveZone(zone.id)}
                                                                    >
                                                                        <Trash2 className="size-4" />
                                                                    </Button>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <Label className="text-xs">Bins</Label>
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => handleAddBin(zone.id)}
                                                                        >
                                                                            <Plus className="mr-1 size-3" />
                                                                            Add Bin
                                                                        </Button>
                                                                    </div>
                                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                                        {zone.bins.map((bin) => (
                                                                            <div
                                                                                key={bin.id}
                                                                                className="flex items-center gap-2"
                                                                            >
                                                                                <Input
                                                                                    placeholder="Bin label"
                                                                                    value={bin.label}
                                                                                    onChange={(e) =>
                                                                                        handleUpdateBin(
                                                                                            zone.id,
                                                                                            bin.id,
                                                                                            e.target.value
                                                                                        )
                                                                                    }
                                                                                    className="flex-1"
                                                                                />
                                                                                <Button
                                                                                    type="button"
                                                                                    size="icon"
                                                                                    variant="ghost"
                                                                                    onClick={() =>
                                                                                        handleRemoveBin(zone.id, bin.id)
                                                                                    }
                                                                                >
                                                                                    <Trash2 className="size-3" />
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <DrawerFooter className="border-t">
                                                <DrawerClose asChild>
                                                    <Button onClick={handleSave} className="w-full">
                                                        Save Changes
                                                    </Button>
                                                </DrawerClose>
                                            </DrawerFooter>
                                        </DrawerContent>
                                    </Drawer>
                                </div>
                                <CardDescription>
                                    {new Date(warehouse.createdAt).toLocaleString()} •{" "}
                                    {capacityOptions.find((opt) => opt.value === warehouse.maxCapacityRating)?.label}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {warehouse.capabilities.length > 0 ? (
                                        warehouse.capabilities.map((capability) => (
                                            <Badge key={capability} variant="secondary">
                                                {capabilityOptions.find((opt) => opt.value === capability)?.label ??
                                                    capability}
                                            </Badge>
                                        ))
                                    ) : (
                                        <Badge variant="outline">No special capabilities</Badge>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {warehouse.zones.map((zone) => (
                                        <div key={zone.id} className="rounded-lg border p-3">
                                            <p className="font-medium">{zone.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {zone.bins.length} bins • Sort {zone.sortOrder ?? "auto"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                {warehouse.quickNotes ? (
                                    <div className="rounded bg-muted p-2 text-xs text-muted-foreground">
                                        <span className="font-semibold">Note:</span> {warehouse.quickNotes}
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </section>
    );
}
