import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { getAuthenticatedProfile, normalizeWarehouse } from "@/lib/api/warehouse/utils";
import type { WarehouseDataResponse } from "@/lib/api/warehouse/types";

export async function GET() {
    try {
        const { supabase, profile } = await getAuthenticatedProfile();

        // Fetch all data in parallel
        const [
            { data: warehouses, error: warehouseError },
            { data: invData, error: invError },
            { data: logData, error: logError },
            { data: pickListData, error: pickError },
            { data: catalogData, error: catalogError },
        ] = await Promise.all([
            supabase.from("warehouses").select(`
        *,
        zones:warehouse_zones(
          *,
          bins:warehouse_bins(*)
        )
      `).is("deleted_at", null),
            supabase.from("warehouse_inventory").select("*").is("deleted_at", null),
            supabase.from("warehouse_movement_logs").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
            supabase.from("warehouse_pick_lists").select(`
        *,
        confirmed_by_profile:profiles!warehouse_pick_lists_confirmed_by_fkey(display_name)
      `).is("deleted_at", null),
            supabase.from("warehouse_item_catalog").select("*"),
        ]);

        if (warehouseError) throw warehouseError;
        if (invError) throw invError;
        if (logError) throw logError;
        if (pickError) throw pickError;
        if (catalogError) throw catalogError;

        // Normalize data
        const normalizedWarehouses = warehouses?.map(normalizeWarehouse) || [];

        const inventory = invData?.map((i: any) => ({
            id: i.id,
            warehouseId: i.warehouse_id,
            zoneId: i.zone_id,
            binId: i.bin_id,
            itemName: i.item_name,
            sku: i.sku,
            category: i.category,
            condition: i.condition,
            quantity: i.quantity,
            expirationDate: i.expiration_date,
            updatedAt: i.updated_at,
        })) || [];

        const movementLogs = logData?.map((l: any) => {
            const warehouse = warehouses?.find((w: any) => w.id === l.warehouse_id);
            const warehouseName = warehouse?.steward_display_name || warehouse?.display_name || "Unknown Warehouse";

            return {
                id: l.id,
                warehouseId: l.warehouse_id,
                warehouseName,
                type: l.type,
                sku: l.sku,
                itemName: l.item_name,
                quantity: l.quantity,
                byDisplayName: l.by_display_name,
                createdAt: l.created_at,
                notes: l.notes,
                zoneId: l.zone_id,
                binId: l.bin_id,
            };
        }) || [];

        const pickList = pickListData?.filter((p: any) => !p.confirmed).map((p: any) => ({
            id: p.id,
            inventoryId: p.inventory_id,
            warehouseId: p.warehouse_id,
            zoneId: p.zone_id,
            binId: p.bin_id,
            itemName: p.item_name,
            sku: p.sku,
            quantity: p.quantity,
        })) || [];

        const confirmedPickLists = pickListData?.filter((p: any) => p.confirmed).map((p: any) => ({
            id: p.id,
            inventoryId: p.inventory_id,
            warehouseId: p.warehouse_id,
            zoneId: p.zone_id,
            binId: p.bin_id,
            itemName: p.item_name,
            sku: p.sku,
            quantity: p.quantity,
            confirmed: p.confirmed,
            confirmedAt: p.confirmed_at,
            confirmedBy: p.confirmed_by,
            confirmedByDisplayName: p.confirmed_by_profile?.display_name || "Unknown",
        })) || [];

        const catalogItems = catalogData?.map((c: any) => ({
            sku: c.sku,
            itemName: c.item_name,
            category: c.category,
        })) || [];

        const response: WarehouseDataResponse = {
            warehouses: normalizedWarehouses,
            inventory,
            movementLogs,
            pickList,
            confirmedPickLists,
            catalogItems,
        };

        return NextResponse.json(response);
    } catch (error) {
        return jsonError(error);
    }
}
