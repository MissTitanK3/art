"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";

import { useProfileStore } from "@workspace/store/useProfileStore";
import { slugifyIdentifier } from "@workspace/ui/lib/academy-utils";

import { useIntakeTabState } from "@workspace/ui/components/warehouse/useIntakeTabState";
import { WarehouseDashboardLayout } from "@workspace/ui/components/warehouse/WarehouseDashboardLayout";
import {
    InventoryIntakeValues,
    WarehouseRecord,
    InventoryEntry,
    MovementLogEntry,
    PickListItem,
    OfflineWarehouseState,
    InventorySubmission,
    inventoryIntakeSchema,
    CatalogItem,
    resolveInventoryLocation,
} from "@workspace/ui/components/warehouse/types";

const generateId = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

const STORAGE_KEY = "art.region.warehouse-plans:v2";

export default function WarehouseDashboardDataLayer() {
    const profile = useProfileStore((state) => state.profile);
    const stewardName = profile?.display_name ?? "Unknown steward";
    const [savedWarehouses, setSavedWarehouses] = useState<WarehouseRecord[]>([]);
    const [inventory, setInventory] = useState<InventoryEntry[]>([]);
    const [movementLogs, setMovementLogs] = useState<MovementLogEntry[]>([]);
    const [pickList, setPickList] = useState<PickListItem[]>([]);
    const [confirmedPickLists, setConfirmedPickLists] = useState<PickListItem[]>([]);
    const [isIntakeSheetOpen, setIsIntakeSheetOpen] = useState(false);
    const { intakeTab, handleIntakeTabChange: setIntakeTabMode } =
        useIntakeTabState(inventory.length);
    const [selectedInventoryId, setSelectedInventoryId] = useState<string>("");

    const intakeForm = useForm<InventoryIntakeValues>({
        resolver: zodResolver(inventoryIntakeSchema),
        mode: "onChange",
        defaultValues: {
            warehouseId: "",
            zoneId: "",
            binId: "",
            itemName: "",
            sku: "",
            category: "",
            quantity: 1,
            condition: "sealed",
            expirationDate: undefined,
            notes: "",
        },
    });

    const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/warehouse/data");
                if (!response.ok) {
                    throw new Error("Failed to fetch warehouse data");
                }
                const data = await response.json();

                setSavedWarehouses(data.warehouses || []);
                setInventory(data.inventory || []);
                setMovementLogs(data.movementLogs || []);
                setPickList(data.pickList || []);
                setConfirmedPickLists(data.confirmedPickLists || []);
                setCatalogItems(data.catalogItems || []);
            } catch (error) {
                console.error("Error fetching warehouse data:", error);
                toast.error("Failed to load warehouse data");
            }
        };

        fetchData();
    }, []);

    const handleWarehouseUpdate = async (warehouseId: string, updates: Partial<WarehouseRecord>) => {
        try {
            const response = await fetch(`/api/warehouse/${warehouseId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error("Failed to update warehouse");
            }

            const { warehouse } = await response.json();

            // Update local state with returned warehouse
            setSavedWarehouses((prev) =>
                prev.map((w) => (w.id === warehouseId ? warehouse : w))
            );

            toast.success("Warehouse updated successfully");
        } catch (error) {
            console.error("Error updating warehouse:", error);
            toast.error("Failed to update warehouse");
        }
    };

    const handleIntakeSubmit = async (values: InventoryIntakeValues) => {
        const warehouse = savedWarehouses.find(
            (candidate) => candidate.id === values.warehouseId,
        );
        const zone = warehouse?.zones.find((candidate) => candidate.id === values.zoneId);
        const bin = zone?.bins.find((candidate) => candidate.id === values.binId);
        const now = new Date().toISOString();

        // Optimistic Update
        const submission: InventorySubmission = {
            warehouseId: values.warehouseId,
            zoneId: values.zoneId,
            binId: values.binId,
            itemName: values.itemName,
            sku: values.sku,
            category: values.category,
            condition: values.condition,
            quantity: values.quantity,
            expirationDate: values.expirationDate ?? null,
        };

        setInventory((prev) =>
            mergeInventoryEntries({
                previous: prev,
                submission,
                now,
                createId: generateId,
            }),
        );

        // API Call for DB Update
        try {
            const response = await fetch("/api/warehouse/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Failed to log intake");
            }

            const logEntry: MovementLogEntry = {
                id: generateId(),
                warehouseId: values.warehouseId,
                warehouseName:
                    warehouse?.stewardDisplayName ?? warehouse?.displayName ?? "Unknown warehouse",
                type: "intake",
                sku: values.sku,
                itemName: values.itemName,
                quantity: values.quantity,
                byDisplayName: stewardName,
                createdAt: now,
                notes: values.notes,
                locationLabel: [zone?.name, bin?.label].filter(Boolean).join(" → "),
                zoneId: zone?.id,
                binId: bin?.id,
            };
            setMovementLogs((prev) => [logEntry, ...prev]);

            intakeForm.reset({
                warehouseId: values.warehouseId,
                zoneId: values.zoneId,
                binId: values.binId,
                itemName: "",
                sku: "",
                category: "",
                quantity: 1,
                condition: values.condition,
                expirationDate: undefined,
                notes: "",
            });
            toast.success("Intake logged");
            setIsIntakeSheetOpen(false); // Close sheet after successful submission
        } catch (error) {
            console.error("Error logging intake:", error);
            toast.error("Failed to log intake");
        }
    };

    const handleTabsValueChange = (value: string) => {
        const mode = value === "existing" ? "existing" : "new";
        setIntakeTabMode(mode);
        if (mode === "new") {
            setSelectedInventoryId("");
            return;
        }
        if (inventory.length > 0) {
            const targetEntry =
                inventory.find((entry) => entry.id === selectedInventoryId) || inventory[0];
            if (targetEntry) {
                handleSelectExistingInventory(targetEntry.id);
            }
        }
    };

    useEffect(() => {
        if (selectedInventoryId && !inventory.some((entry) => entry.id === selectedInventoryId)) {
            setSelectedInventoryId("");
        }
    }, [inventory, selectedInventoryId]);

    const handleAddToPickList = async (entry: InventoryEntry) => {
        if (entry.quantity <= 0) {
            toast.error("Nothing available to pick");
            return;
        }

        try {
            const response = await fetch("/api/warehouse/pick-list", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inventoryId: entry.id }),
            });

            if (!response.ok) {
                throw new Error("Failed to add to pick list");
            }

            const { pickListItem } = await response.json();

            const existing = pickList.find((item) => item.inventoryId === entry.id);
            if (existing) {
                setPickList((prev) =>
                    prev.map((item) =>
                        item.inventoryId === entry.id
                            ? { ...item, quantity: pickListItem.quantity }
                            : item,
                    ),
                );
            } else {
                setPickList((prev) => [pickListItem, ...prev]);
            }
            toast.success("Added to pick list");
        } catch (error) {
            console.error("Error adding to pick list:", error);
            toast.error("Failed to add to pick list");
        }
    };

    const handleGenerateSku = () => {
        const itemName = intakeForm.getValues("itemName")?.trim();
        if (!itemName) {
            toast.info("Enter an item name first");
            return;
        }
        const normalized = slugifyIdentifier(itemName);
        if (!normalized) {
            toast.info("Unable to generate SKU from that name");
            return;
        }
        intakeForm.setValue("sku", normalized, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handlePickQuantityChange = async (pickId: string, nextQty: number) => {
        if (Number.isNaN(nextQty) || nextQty < 1) return;

        try {
            const response = await fetch(`/api/warehouse/pick-list/${pickId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: nextQty }),
            });

            if (!response.ok) throw new Error("Failed to update pick quantity");

            const { quantity: finalQty } = await response.json();

            setPickList((prev) =>
                prev.map((item) => item.id === pickId ? { ...item, quantity: finalQty } : item)
            );
        } catch (error) {
            console.error("Error updating pick quantity:", error);
            toast.error("Failed to update quantity");
        }
    };

    const handleRemovePickItem = async (pickId: string) => {
        try {
            const response = await fetch(`/api/warehouse/pick-list/${pickId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to remove pick item");

            setPickList((prev) => prev.filter((item) => item.id !== pickId));
        } catch (error) {
            console.error("Error removing pick item:", error);
            toast.error("Failed to remove item");
        }
    };

    const handleConfirmPickList = async () => {
        if (pickList.length === 0) {
            toast.info("Add at least one item to the pick list");
            return;
        }

        try {
            const response = await fetch("/api/warehouse/pick-list/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pickListIds: pickList.map(p => p.id) }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to confirm pick list");
            }

            const now = new Date().toISOString();

            // Update inventory (remove picked quantities)
            setInventory((prev) =>
                prev.map((entry) => {
                    const pickItem = pickList.find(p => p.inventoryId === entry.id);
                    if (pickItem) {
                        return { ...entry, quantity: entry.quantity - pickItem.quantity, updatedAt: now };
                    }
                    return entry;
                }).filter(entry => entry.quantity > 0)
            );

            // Add movement logs
            const logs: MovementLogEntry[] = pickList.map(pick => {
                const warehouse = savedWarehouses.find(w => w.id === pick.warehouseId);
                const zone = warehouse?.zones.find(z => z.id === pick.zoneId);
                const bin = zone?.bins.find(b => b.id === pick.binId);
                return {
                    id: generateId(),
                    warehouseId: pick.warehouseId,
                    warehouseName: warehouse?.stewardDisplayName || warehouse?.displayName || "Unknown",
                    type: "outflow",
                    sku: pick.sku,
                    itemName: pick.itemName,
                    quantity: pick.quantity,
                    byDisplayName: stewardName,
                    createdAt: now,
                    locationLabel: [zone?.name, bin?.label].filter(Boolean).join(" → "),
                };
            });
            setMovementLogs((prev) => [...logs, ...prev]);

            // Move to confirmed list
            const confirmedItems = pickList.map(item => ({
                ...item,
                confirmed: true,
                confirmedAt: now,
                confirmedBy: profile?.id,
                confirmedByDisplayName: stewardName,
            }));
            setConfirmedPickLists(prev => [...confirmedItems, ...prev]);

            setPickList([]);
            toast.success("Pick list confirmed");
        } catch (error: any) {
            console.error("Error confirming pick list:", error);
            toast.error(error.message || "Failed to confirm pick list");
        }
    };

    const handleUpdateConfirmedPickQuantity = async (pickId: string, quantity: number) => {
        if (Number.isNaN(quantity) || quantity < 1) return;

        try {
            const response = await fetch(`/api/warehouse/pick-list/confirmed/${pickId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update quantity");
            }

            // Find the confirmed pick item for local state update
            const confirmedItem = confirmedPickLists.find(item => item.id === pickId);
            if (!confirmedItem) return;

            const oldQuantity = confirmedItem.quantity;
            const quantityDiff = quantity - oldQuantity;

            // Update confirmed pick list
            setConfirmedPickLists(prev =>
                prev.map(item => item.id === pickId ? { ...item, quantity } : item)
            );

            // Adjust inventory
            setInventory(prev =>
                prev.map(entry =>
                    entry.id === confirmedItem.inventoryId
                        ? { ...entry, quantity: entry.quantity - quantityDiff, updatedAt: new Date().toISOString() }
                        : entry
                ).filter(entry => entry.quantity > 0)
            );

            toast.success("Quantity updated");
        } catch (error: any) {
            console.error("Error updating confirmed pick quantity:", error);
            toast.error(error.message || "Failed to update quantity");
        }
    };

    const handleRemoveConfirmedPickItem = async (pickId: string) => {
        try {
            const response = await fetch(`/api/warehouse/pick-list/confirmed/${pickId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to remove confirmed pick item");

            // Find the confirmed pick item for local state update
            const confirmedItem = confirmedPickLists.find(item => item.id === pickId);
            if (!confirmedItem) return;

            // Return quantity back to inventory
            setInventory(prev =>
                prev.map(entry =>
                    entry.id === confirmedItem.inventoryId
                        ? { ...entry, quantity: entry.quantity + confirmedItem.quantity, updatedAt: new Date().toISOString() }
                        : entry
                )
            );

            setConfirmedPickLists(prev => prev.filter(item => item.id !== pickId));
            toast.success("Item removed and quantity returned to inventory");
        } catch (error) {
            console.error("Error removing confirmed pick item:", error);
            toast.error("Failed to remove item");
        }
    };

    const handleDeleteConfirmedPickList = async (warehouseId: string, confirmedAt: string) => {
        try {
            const target = confirmedPickLists.find(
                (item) => item.warehouseId === warehouseId && item.confirmedAt === confirmedAt
            );
            if (!target?.id) throw new Error("Pick list id not found for delete");

            const response = await fetch(`/api/warehouse/pick-list/confirmed/${target.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete pick list");
            }

            setConfirmedPickLists(prev =>
                prev.filter(item => !(item.warehouseId === warehouseId && item.confirmedAt === confirmedAt))
            );

            toast.success("Confirmed pick list deleted");
        } catch (error: any) {
            console.error("Error deleting confirmed pick list:", error);
            toast.error(error.message || "Failed to delete pick list");
        }
    };

    const handleDeleteInventory = async (inventoryId: string) => {
        try {
            const response = await fetch(`/api/warehouse/inventory/${inventoryId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete inventory");
            }

            setInventory(prev => prev.filter(entry => entry.id !== inventoryId));
            toast.success("Inventory item deleted");
        } catch (error: any) {
            console.error("Error deleting inventory:", error);
            toast.error(error.message || "Failed to delete inventory");
        }
    };

    const handleUpdateInventory = async (inventoryId: string, quantity: number) => {
        try {
            const response = await fetch(`/api/warehouse/inventory/${inventoryId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity }),
            });

            if (!response.ok) throw new Error("Failed to update inventory");

            setInventory(prev =>
                prev.map(entry =>
                    entry.id === inventoryId ? { ...entry, quantity } : entry
                )
            );
            toast.success("Inventory item updated");
        } catch (error) {
            console.error("Error updating inventory:", error);
            toast.error("Failed to update inventory");
        }
    };

    const watchWarehouseId = intakeForm.watch("warehouseId");
    const watchZoneId = intakeForm.watch("zoneId");
    const watchBinId = intakeForm.watch("binId");

    const selectedWarehouse = savedWarehouses.find(
        (warehouse) => warehouse.id === watchWarehouseId,
    );
    const availableZones = selectedWarehouse?.zones ?? [];
    const selectedZone = availableZones.find((zone) => zone.id === watchZoneId);
    const availableBins = selectedZone?.bins ?? [];
    const existingInventoryOptions = useMemo(() => {
        return inventory.map((entry) => {
            const location = resolveInventoryLocation(entry, savedWarehouses);
            return {
                id: entry.id,
                label: `${entry.itemName} (${entry.sku}) — ${location.warehouseName}${location.zoneName ? ` / ${location.zoneName}` : ""
                    }${location.binName ? ` → ${location.binName}` : ""}`,
            };
        });
    }, [inventory, savedWarehouses]);
    const selectedInventoryEntry = useMemo(
        () => inventory.find((entry) => entry.id === selectedInventoryId),
        [inventory, selectedInventoryId],
    );
    const selectedInventoryLocation = selectedInventoryEntry
        ? resolveInventoryLocation(selectedInventoryEntry, savedWarehouses)
        : null;

    const handleSelectExistingInventory = useCallback(
        (inventoryId: string) => {
            setSelectedInventoryId(inventoryId);
            const entry = inventory.find((candidate) => candidate.id === inventoryId);
            if (!entry) return;
            intakeForm.setValue("warehouseId", entry.warehouseId, {
                shouldDirty: true,
                shouldValidate: true,
            });
            intakeForm.setValue("zoneId", entry.zoneId, {
                shouldDirty: true,
                shouldValidate: true,
            });
            intakeForm.setValue("binId", entry.binId, {
                shouldDirty: true,
                shouldValidate: true,
            });
            intakeForm.setValue("itemName", entry.itemName, {
                shouldDirty: true,
                shouldValidate: true,
            });
            intakeForm.setValue("sku", entry.sku, {
                shouldDirty: true,
                shouldValidate: true,
            });
            intakeForm.setValue("category", entry.category, {
                shouldDirty: true,
                shouldValidate: true,
            });
            intakeForm.setValue("condition", entry.condition, {
                shouldDirty: true,
                shouldValidate: true,
            });
        },
        [inventory, intakeForm],
    );

    const handleLoadStandardItem = (
        itemName: string,
        category: string,
        defaultSku?: string,
    ) => {
        setIntakeTabMode("new");
        setSelectedInventoryId("");
        intakeForm.setValue("itemName", itemName, {
            shouldDirty: true,
            shouldValidate: true,
        });
        intakeForm.setValue("category", category, {
            shouldDirty: true,
            shouldValidate: true,
        });
        intakeForm.setValue(
            "sku",
            defaultSku ?? slugifyIdentifier(itemName),
            {
                shouldDirty: true,
                shouldValidate: true,
            },
        );
        toast.success(`Loaded ${itemName}`);
    };

    useEffect(() => {
        if (
            intakeTab === "existing" &&
            inventory.length > 0 &&
            selectedInventoryId === ""
        ) {
            const firstEntry = inventory[0];
            if (firstEntry) {
                handleSelectExistingInventory(firstEntry.id);
            }
        }
    }, [intakeTab, inventory, selectedInventoryId, handleSelectExistingInventory]);

    useEffect(() => {
        if (!selectedWarehouse) {
            if (watchZoneId !== "") {
                intakeForm.setValue("zoneId", "", { shouldValidate: true, shouldDirty: true });
            }
            if (watchBinId !== "") {
                intakeForm.setValue("binId", "", { shouldValidate: true, shouldDirty: true });
            }
            return;
        }
        if (!watchZoneId || !availableZones.some((zone) => zone.id === watchZoneId)) {
            const fallbackZone = availableZones[0];
            if (fallbackZone && fallbackZone.id !== watchZoneId) {
                intakeForm.setValue("zoneId", fallbackZone.id, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
            }
        }
    }, [selectedWarehouse?.id, availableZones, watchZoneId, watchBinId, intakeForm]);

    useEffect(() => {
        if (!selectedZone) {
            if (watchBinId !== "") {
                intakeForm.setValue("binId", "", { shouldValidate: true, shouldDirty: true });
            }
            return;
        }
        if (!watchBinId || !availableBins.some((bin) => bin.id === watchBinId)) {
            const fallbackBin = availableBins[0];
            if (fallbackBin && fallbackBin.id !== watchBinId) {
                intakeForm.setValue("binId", fallbackBin.id, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
            }
        }
    }, [selectedZone?.id, availableBins, watchBinId, intakeForm]);

    const derivedStats = useMemo(() => {
        const totalZones = savedWarehouses.reduce(
            (acc, warehouse) => acc + warehouse.zones.length,
            0,
        );
        const totalBins = savedWarehouses.reduce(
            (acc, warehouse) =>
                acc + warehouse.zones.reduce((zoneAcc, zone) => zoneAcc + zone.bins.length, 0),
            0,
        );
        const coldChainSites = savedWarehouses.filter((warehouse) =>
            warehouse.capabilities.includes("refrigeration"),
        ).length;
        return { totalZones, totalBins, coldChainSites };
    }, [savedWarehouses]);

    return (
        <WarehouseDashboardLayout
            profileDisplayName={profile?.display_name}
            savedWarehouses={savedWarehouses}
            inventory={inventory}
            movementLogs={movementLogs}
            pickList={pickList}
            intakeTab={intakeTab}
            intakeForm={intakeForm}
            derivedStats={derivedStats}
            watchWarehouseId={watchWarehouseId}
            watchZoneId={watchZoneId}
            watchBinId={watchBinId}
            availableZones={availableZones}
            availableBins={availableBins}
            catalogItems={catalogItems}
            isIntakeSheetOpen={isIntakeSheetOpen}
            handleIntakeSubmit={handleIntakeSubmit}
            handleTabsValueChange={handleTabsValueChange}
            handleLoadStandardItem={handleLoadStandardItem}
            handleAddToPickList={handleAddToPickList}
            handleGenerateSku={handleGenerateSku}
            handlePickQuantityChange={handlePickQuantityChange}
            handleRemovePickItem={handleRemovePickItem}
            handleConfirmPickList={handleConfirmPickList}
            handleWarehouseUpdate={handleWarehouseUpdate}
            confirmedPickLists={confirmedPickLists}
            handleUpdateConfirmedPickQuantity={handleUpdateConfirmedPickQuantity}
            handleRemoveConfirmedPickItem={handleRemoveConfirmedPickItem}
            handleDeleteConfirmedPickList={handleDeleteConfirmedPickList}
            handleDeleteInventory={handleDeleteInventory}
            handleUpdateInventory={handleUpdateInventory}
            onIntakeSheetOpenChange={setIsIntakeSheetOpen}
        />
    );
}

// Helpers
function mergeInventoryEntries({
    previous,
    submission,
    now,
    createId,
}: {
    previous: InventoryEntry[];
    submission: InventorySubmission;
    now: string;
    createId: () => string;
}): InventoryEntry[] {
    // Logic to merge inventory
    // If same SKU, same location, same condition, same expiration -> merge
    const existingIndex = previous.findIndex(
        (entry) =>
            entry.warehouseId === submission.warehouseId &&
            entry.zoneId === submission.zoneId &&
            entry.binId === submission.binId &&
            entry.sku === submission.sku &&
            entry.condition === submission.condition &&
            entry.expirationDate === submission.expirationDate,
    );

    if (existingIndex >= 0) {
        const existing = previous[existingIndex];
        if (!existing) return previous;
        const updated: InventoryEntry = {
            ...existing,
            quantity: existing.quantity + submission.quantity,
            updatedAt: now,
        };
        const next = [...previous];
        next[existingIndex] = updated;
        return next;
    }

    const newEntry: InventoryEntry = {
        id: createId(),
        warehouseId: submission.warehouseId,
        zoneId: submission.zoneId,
        binId: submission.binId,
        itemName: submission.itemName,
        sku: submission.sku,
        category: submission.category,
        condition: submission.condition,
        quantity: submission.quantity,
        expirationDate: submission.expirationDate,
        updatedAt: now,
    };
    return [newEntry, ...previous];
}
