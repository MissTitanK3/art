import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { getAuthenticatedProfile, generateId } from "@/lib/api/warehouse/utils";
import type { CreateInventoryRequest } from "@/lib/api/warehouse/types";

export async function POST(req: Request) {
    try {
        const { supabase, profile } = await getAuthenticatedProfile();
        const values: CreateInventoryRequest = await req.json();

        const now = new Date().toISOString();
        const stewardName = profile?.display_name ?? "Unknown steward";

        // Check for existing inventory item
        const { data: existingItems } = await supabase
            .from("warehouse_inventory")
            .select("*")
            .eq("warehouse_id", values.warehouseId)
            .eq("zone_id", values.zoneId)
            .eq("bin_id", values.binId)
            .eq("sku", values.sku)
            .eq("condition", values.condition)
            .eq("expiration_date", values.expirationDate || null);

        const existingItem = existingItems?.[0];

        let inventoryId: string;

        if (existingItem) {
            // Update existing
            const newQuantity = existingItem.quantity + values.quantity;
            const { error } = await supabase
                .from("warehouse_inventory")
                .update({
                    quantity: newQuantity,
                    updated_at: now,
                })
                .eq("id", existingItem.id);

            if (error) throw error;
            inventoryId = existingItem.id;
        } else {
            // Insert new
            inventoryId = generateId();
            const { error } = await supabase
                .from("warehouse_inventory")
                .insert({
                    id: inventoryId,
                    warehouse_id: values.warehouseId,
                    zone_id: values.zoneId,
                    bin_id: values.binId,
                    item_name: values.itemName,
                    sku: values.sku,
                    category: values.category,
                    condition: values.condition,
                    quantity: values.quantity,
                    expiration_date: values.expirationDate,
                    updated_at: now,
                });

            if (error) throw error;
        }

        // Get warehouse name for log
        const { data: warehouse } = await supabase
            .from("warehouses")
            .select("display_name")
            .eq("id", values.warehouseId)
            .single();

        // Create movement log
        const logId = generateId();
        const { error: logError } = await supabase
            .from("warehouse_movement_logs")
            .insert({
                id: logId,
                warehouse_id: values.warehouseId,
                type: "intake",
                sku: values.sku,
                item_name: values.itemName,
                quantity: values.quantity,
                by_display_name: stewardName,
                created_at: now,
                notes: values.notes,
                zone_id: values.zoneId,
                bin_id: values.binId,
            });

        if (logError) throw logError;

        return NextResponse.json({
            success: true,
            inventoryId,
            logId,
        });
    } catch (error) {
        return jsonError(error);
    }
}
