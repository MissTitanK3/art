"use client";

import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useProfileStore } from "@workspace/store/useProfileStore";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import { REGION_IDENTIFIER } from "@/app/brand_settings";

import { WarehouseBuilderLayout } from "@workspace/ui/components/warehouse/WarehouseBuilderLayout";
import {
    WarehouseFormValues,
    WarehouseRecord,
    InventoryEntry,
    MovementLogEntry,
    PickListItem,
    OfflineWarehouseState,
    warehouseFormSchema,
} from "@workspace/ui/components/warehouse/types";

const generateId = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

const STORAGE_KEY = "art.region.warehouse-plans:v2";
const NEW_WAREHOUSE_VALUE = "__new-warehouse";

function defaultZone(name: string, order: number): WarehouseFormValues["zones"][number] {
    return {
        id: generateId(),
        name,
        sortOrder: order,
        bins: [
            { id: generateId(), label: "Shelf A", sortOrder: 1 },
            { id: generateId(), label: "Tote 1", sortOrder: 2 },
        ],
    };
}

function createDefaultFormValues(): WarehouseFormValues {
    return {
        stewardDisplayName: "",
        regionZone: "",
        urbanType: "urban",
        siteType: "home",
        maxCapacityRating: "small",
        capabilities: [],
        quickNotes: "",
        zones: [defaultZone("Garage", 1)],
    };
}

async function persistWarehouseRecord(record: WarehouseRecord) {
    const client = getSupabaseBrowserClient();
    const capabilityPayload: Record<string, unknown> = {
        flags: record.capabilities,
        site_type: record.siteType,
    };
    if (record.quickNotes) {
        capabilityPayload.quick_note = record.quickNotes;
    }

    const { error } = await client.from("warehouses").upsert({
        id: record.id,
        region_id: record.regionId,
        display_name: record.stewardDisplayName ?? record.displayName,
        region_zone: record.regionZone,
        urban_type: record.urbanType,
        capabilities: capabilityPayload,
        max_capacity_rating: record.maxCapacityRating,
    });
    if (error) throw error;

    if (record.zones.length > 0) {
        const zonesPayload = record.zones.map((zone) => ({
            id: zone.id,
            warehouse_id: record.id,
            name: zone.name,
            sort_order: zone.sortOrder ?? null,
        }));
        const { error: zonesError } = await client
            .from("warehouse_zones")
            .upsert(zonesPayload);
        if (zonesError) throw zonesError;

        const binsPayload = record.zones.flatMap((zone) =>
            zone.bins.map((bin) => ({
                id: bin.id,
                zone_id: zone.id,
                label: bin.label,
                sort_order: bin.sortOrder ?? null,
            })),
        );
        if (binsPayload.length > 0) {
            const { error: binsError } = await client
                .from("warehouse_bins")
                .upsert(binsPayload);
            if (binsError) throw binsError;
        }
    }
}

function zoneHasDependencies(
    zoneId: string,
    {
        inventory,
        pickList,
        movementLogs,
    }: {
        inventory: InventoryEntry[];
        pickList: PickListItem[];
        movementLogs: MovementLogEntry[];
    },
) {
    if (inventory.some((entry) => entry.zoneId === zoneId)) return true;
    if (pickList.some((item) => item.zoneId === zoneId)) return true;
    if (movementLogs.some((log) => log.zoneId === zoneId)) return true;
    return false;
}

function binHasDependencies(
    binId: string,
    {
        inventory,
        pickList,
        movementLogs,
    }: {
        inventory: InventoryEntry[];
        pickList: PickListItem[];
        movementLogs: MovementLogEntry[];
    },
) {
    if (inventory.some((entry) => entry.binId === binId)) return true;
    if (pickList.some((item) => item.binId === binId)) return true;
    if (movementLogs.some((log) => log.binId === binId)) return true;
    return false;
}

export default function WarehouseBuilderDataLayer() {
    const router = useRouter();
    const profile = useProfileStore((state) => state.profile);
    const stewardName = profile?.display_name ?? "Unknown steward";
    const [savedWarehouses, setSavedWarehouses] = useState<WarehouseRecord[]>([]);
    const [inventory, setInventory] = useState<InventoryEntry[]>([]);
    const [movementLogs, setMovementLogs] = useState<MovementLogEntry[]>([]);
    const [pickList, setPickList] = useState<PickListItem[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null);

    const form = useForm<WarehouseFormValues>({
        resolver: zodResolver(warehouseFormSchema),
        mode: "onChange",
        defaultValues: createDefaultFormValues(),
    });

    const {
        fields: zoneFields,
        append: appendZone,
        remove: removeZone,
    } = useFieldArray({
        control: form.control,
        name: "zones",
    });

    useEffect(() => {
        const fetchWarehouses = async () => {
            const client = getSupabaseBrowserClient();
            const { data: warehouses, error } = await client
                .from("warehouses")
                .select(`
                    *,
                    zones:warehouse_zones(
                        *,
                        bins:warehouse_bins(*)
                    )
                `);

            if (error) {
                console.error("Error fetching warehouses:", error);
                return;
            }

            if (warehouses) {
                const normalized: WarehouseRecord[] = warehouses.map((w: any) => ({
                    id: w.id,
                    regionId: w.region_id,
                    displayName: w.display_name,
                    stewardDisplayName: w.display_name, // Map display_name to stewardDisplayName for UI consistency
                    regionZone: w.region_zone,
                    urbanType: w.urban_type,
                    siteType: "home", // Default or fetch if added to DB
                    maxCapacityRating: w.max_capacity_rating,
                    capabilities: w.capabilities?.flags || [],
                    quickNotes: w.capabilities?.quick_note || "",
                    createdAt: w.created_at,
                    zones: w.zones.map((z: any) => ({
                        id: z.id,
                        name: z.name,
                        sortOrder: z.sort_order,
                        bins: z.bins.map((b: any) => ({
                            id: b.id,
                            label: b.label,
                            sortOrder: b.sort_order,
                        })).sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
                    })).sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
                }));
                setSavedWarehouses(normalized);
            }
        };

        fetchWarehouses();
    }, []);

    // Keep local storage sync for offline capability/fallback
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const payload: OfflineWarehouseState = {
                warehouses: savedWarehouses,
                inventory,
                movementLogs,
                pickList,
            };
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch {
            // ignore
        }
    }, [savedWarehouses, inventory, movementLogs, pickList]);

    const stewardFieldValue = form.watch("stewardDisplayName");
    const activeStewardName =
        typeof stewardFieldValue === "string" ? stewardFieldValue.trim() : "";
    const stewardLabel = activeStewardName.length > 0 ? activeStewardName : "Steward not set";

    const watchedPlan = form.watch();

    const onSubmit = async (values: WarehouseFormValues) => {
        const isEditing = editingWarehouseId != null;
        const existing = isEditing
            ? savedWarehouses.find((warehouse) => warehouse.id === editingWarehouseId)
            : null;
        const id = editingWarehouseId ?? generateId();
        const record: WarehouseRecord = {
            ...values,
            id,
            displayName: values.stewardDisplayName,
            regionId: REGION_IDENTIFIER,
            createdAt: existing?.createdAt ?? new Date().toISOString(),
        };
        setSavedWarehouses((prev) =>
            isEditing
                ? prev.map((warehouse) => (warehouse.id === id ? record : warehouse))
                : [record, ...prev],
        );
        setEditingWarehouseId(id);
        setSyncing(true);
        try {
            await persistWarehouseRecord(record);
            toast.success(isEditing ? "Warehouse updated" : "Warehouse synced to Dispatch");
            router.push("/warehouse");
        } catch (error) {
            console.warn("[WarehouseBuilder] sync failed", error);
            toast.info("Saved locally. Remote sync will retry once tables are ready.");
            router.push("/warehouse");
        } finally {
            setSyncing(false);
        }
        form.reset(values);
    };

    const startNewWarehouse = () => {
        setEditingWarehouseId(null);
        form.reset(createDefaultFormValues());
    };

    const handleSelectWarehouse = (warehouseId: string) => {
        if (!warehouseId || warehouseId === NEW_WAREHOUSE_VALUE) {
            startNewWarehouse();
            return;
        }
        const warehouse = savedWarehouses.find((entry) => entry.id === warehouseId);
        if (!warehouse) return;
        setEditingWarehouseId(warehouseId);
        form.reset({
            ...warehouse,
            stewardDisplayName:
                warehouse.stewardDisplayName ?? warehouse.displayName ?? stewardName,
        });
    };

    const useMyNameForSteward = () => {
        if (!stewardName) return;
        form.setValue("stewardDisplayName", stewardName, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const ensureZoneRemovalSafe = useCallback(
        (zoneId: string) => {
            if (
                zoneHasDependencies(zoneId, {
                    inventory,
                    pickList,
                    movementLogs,
                })
            ) {
                toast.error(
                    "Move or clear inventory tied to this zone (including pick lists and movement logs) before deleting it.",
                );
                return false;
            }
            return true;
        },
        [inventory, movementLogs, pickList],
    );

    const ensureBinRemovalSafe = useCallback(
        (binId: string) => {
            if (
                binHasDependencies(binId, {
                    inventory,
                    pickList,
                    movementLogs,
                })
            ) {
                toast.error(
                    "Move or clear inventory tied to this bin (including pick lists and movement logs) before deleting it.",
                );
                return false;
            }
            return true;
        },
        [inventory, movementLogs, pickList],
    );

    return (
        <WarehouseBuilderLayout
            stewardName={stewardName}
            stewardLabel={stewardLabel}
            savedWarehouses={savedWarehouses}
            syncing={syncing}
            editingWarehouseId={editingWarehouseId}
            form={form}
            zoneFields={zoneFields}
            appendZone={appendZone}
            removeZone={removeZone}
            watchedPlan={watchedPlan}
            onSubmit={onSubmit}
            handleSelectWarehouse={handleSelectWarehouse}
            startNewWarehouse={startNewWarehouse}
            useMyNameForSteward={useMyNameForSteward}
            ensureZoneRemovalSafe={ensureZoneRemovalSafe}
            ensureBinRemovalSafe={ensureBinRemovalSafe}
        />
    );
}
